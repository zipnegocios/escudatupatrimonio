# syntax=docker/dockerfile:1

# ---- deps: instala dependencias en una capa cacheable ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compila el build standalone de Next.js ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-arg opcional, NO runtime env var: Next.js evalúa NEXT_PUBLIC_* en
# este paso (RUN npm run build), no cuando el contenedor final arranca, así
# que una variable de entorno seteada en EasyPanel para el servicio en
# runtime NO llega hasta acá — tiene que pasarse como build-arg del build
# de Docker. Si el panel usado no soporta build-args, esta variable queda
# vacía y TestimonialCard bloquea los testimonios placeholder por defecto
# (comportamiento seguro — ver src/presentation/components/TestimonialCard.tsx).
# Nunca setear a "preview" en el build que sirve el dominio real de producción.
ARG NEXT_PUBLIC_DEPLOY_ENV
ENV NEXT_PUBLIC_DEPLOY_ENV=$NEXT_PUBLIC_DEPLOY_ENV
# Valores dummy SOLO para el build: `next build` importa los route handlers
# para analizarlos, y esos importan src/infrastructure/config/env.ts, que
# valida process.env al cargarse. No hay Postgres en el build ni estas
# variables sobreviven a esta etapa — el runner recibe las reales de EasyPanel.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build
ENV SESSION_SECRET=build-time-placeholder-secret
RUN npm run build
RUN npm run build:migrate

# ---- runner: imagen final mínima, solo lo necesario para servir ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ffmpeg real de los repos de Alpine (musl) — el binario que descarga
# ffmpeg-static por npm está compilado para glibc y falla en este entorno
# (mismo tipo de incompatibilidad que ya tuvimos con el binario nativo de
# argon2). Se usa para convertir audio a OGG/Opus antes de mandar notas de
# voz por WhatsApp — ver src/infrastructure/media/transcode-to-opus-ogg.ts.
RUN apk add --no-cache ffmpeg

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/migrate.cjs ./migrate.cjs
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

USER nextjs

# EasyPanel inyecta PORT en runtime; 3000 es el valor por defecto de Next.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# Las migraciones corren antes de servir: si fallan, `&&` corta y el
# contenedor muere en vez de arrancar contra un esquema desactualizado.
CMD ["sh", "-c", "node migrate.cjs && node server.js"]
