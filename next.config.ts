import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  // El binario de ffmpeg-static (usado para convertir notas de voz a
  // OGG/Opus, ver src/infrastructure/media/transcode-to-opus-ogg.ts) es un
  // asset binario, no un require/import que el trace automático del build
  // standalone siga — sin esto, el binario no llega a la imagen de Docker y
  // la conversión falla en producción con ENOENT (mismo tipo de problema
  // que ya tuvimos con el binario nativo de argon2).
  outputFileTracingIncludes: {
    "/api/admin/whatsapp/**": ["./node_modules/ffmpeg-static/**"],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
