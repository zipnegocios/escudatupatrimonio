import { z } from "zod";
import { submitQualificationProfile } from "@/core/use-cases/leads/submit-qualification-profile";
import { leadRepository } from "@/infrastructure/container";

// Mismos literales que QualificationProfile (src/core/entities/qualification-profile.ts).
// Se validan acá porque este endpoint es público — lo llama el navegador del
// prospecto, no un cliente de confianza.
const qualificationProfileSchema = z.object({
  intencionP: z.enum(["AHORRO_RETIRO", "PROTECCION_FAM", "SALUD_EMERGENCIA"]).nullable(),
  intencionS: z.enum(["AHORRO_RETIRO", "PROTECCION_FAM", "SALUD_EMERGENCIA"]).nullable(),
  horizonte: z.enum(["CORTO", "MEDIO", "LARGO", "ABIERTO"]).nullable(),
  planRetiro: z.enum(["TIENE", "INICIANDO", "NINGUNO"]).nullable(),
  familiaTipo: z.enum(["HIJOS_PEQ", "HIJOS_ADULT", "PAREJA", "AMBOS", "OTROS"]).nullable(),
  preocFamilia: z.enum(["INGRESOS", "DEUDAS", "EDUCACION", "ESTILO"]).nullable(),
  cobActual: z.enum(["NINGUNO", "PARCIAL", "MEJORAR"]).nullable(),
  preocSalud: z.enum(["HOSPITAL", "INGRESOS_S", "GASTOS", "CARGA"]).nullable(),
  edadRango: z.enum(["18_35", "36_50", "51_60", "61_70"]).nullable(),
  edadCond: z.boolean(),
  salud: z
    .enum(["EXCELENTE", "MUY_BIEN", "COND_MENOR", "EN_TRATAMIENTO", "NO_COMENTA"])
    .nullable(),
  saludFlag: z.enum(["MENOR", "TRATAMIENTO", "NO_COMENTA"]).nullable(),
  estatus: z.enum(["CIUDADANO", "RESIDENTE", "EN_PROCESO", "ITIN", "OTRO"]).nullable(),
  estatusFlag: z.enum(["EN_PROCESO", "ITIN"]).nullable(),
  estado: z.string().nullable(),
  timezone: z.string().nullable(),
  referido: z.boolean(),
  priority: z.enum(["INMEDIATO", "PROGRAMADO"]).nullable(),
  ventanaDisp: z.string().nullable(),
  nombre: z.string().nullable(),
  telefono: z.string().nullable(),
  canal: z.enum(["WHATSAPP", "LLAMADA", "WA_PRIMERO"]),
});

const submitLeadSchema = z.object({
  sessionId: z.string().min(1),
  utmCampaign: z.string().nullable(),
  profile: qualificationProfileSchema,
});

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = submitLeadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const lead = await submitQualificationProfile(
    { leadRepository },
    {
      sessionId: parsed.data.sessionId,
      utmCampaign: parsed.data.utmCampaign,
      profile: parsed.data.profile,
    },
  );

  return Response.json({ ok: true, leadId: lead.id });
}
