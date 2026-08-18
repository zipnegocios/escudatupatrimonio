import { z } from "zod";
import { currentUser } from "@/infrastructure/auth/current-user";
import { leadRepository } from "@/infrastructure/container";

const updateLeadSchema = z.object({
  action: z.literal("update_lead"),
  nombre: z.string().nullable(),
  telefono: z.string().nullable(),
  canal: z.enum(["WHATSAPP", "LLAMADA", "WA_PRIMERO"]).nullable(),
  priority: z.enum(["INMEDIATO", "PROGRAMADO"]).nullable(),
  status: z.enum([
    "NEW",
    "CONTACTED",
    "SCHEDULED",
    "QUALIFIED",
    "DISQUALIFIED",
    "CLOSED_WON",
    "CLOSED_LOST",
  ]),
});

const updateProfileSchema = z.object({
  action: z.literal("update_profile"),
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
  ventanaDisp: z.string().nullable(),
});

const patchSchema = z.union([updateLeadSchema, updateProfileSchema]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  if (parsed.data.action === "update_lead") {
    const { action: _action, ...fields } = parsed.data;
    const lead = await leadRepository.updateLeadFields(id, fields);
    return Response.json({ ok: true, lead });
  }

  const { action: _action, ...profileFields } = parsed.data;
  const profile = await leadRepository.updateQualificationProfile(id, profileFields);
  return Response.json({ ok: true, profile });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  const result = await leadRepository.findById(id);
  if (!result) {
    return Response.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
  }

  return Response.json({ ok: true, lead: result.lead, profile: result.profile });
}
