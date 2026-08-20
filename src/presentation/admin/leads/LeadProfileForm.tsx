"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  COB_ACTUAL_LABEL,
  EDAD_RANGO_LABEL,
  ESTATUS_FLAG_LABEL,
  ESTATUS_LABEL,
  FAMILIA_TIPO_LABEL,
  HORIZONTE_LABEL,
  INTENCION_LABEL,
  PLAN_RETIRO_LABEL,
  PREOC_FAMILIA_LABEL,
  PREOC_SALUD_LABEL,
  SALUD_FLAG_LABEL,
  SALUD_LABEL,
} from "@/presentation/admin/leads/lead-labels";
import { Card } from "@/presentation/admin/ui/Card";

interface ProfileFields {
  intencionP: string | null;
  intencionS: string | null;
  horizonte: string | null;
  planRetiro: string | null;
  familiaTipo: string | null;
  preocFamilia: string | null;
  cobActual: string | null;
  preocSalud: string | null;
  edadRango: string | null;
  edadCond: boolean;
  salud: string | null;
  saludFlag: string | null;
  estatus: string | null;
  estatusFlag: string | null;
  estado: string | null;
  timezone: string | null;
  referido: boolean;
  ventanaDisp: string | null;
}

function EnumField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
}) {
  return (
    <div>
      <label className="type-caption mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
      >
        <option value="">—</option>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="type-caption mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
      />
    </div>
  );
}

export function LeadProfileForm({
  leadId,
  profile,
}: {
  leadId: string;
  profile: ProfileFields;
}) {
  const router = useRouter();
  const [fields, setFields] = useState({
    intencionP: profile.intencionP ?? "",
    intencionS: profile.intencionS ?? "",
    horizonte: profile.horizonte ?? "",
    planRetiro: profile.planRetiro ?? "",
    familiaTipo: profile.familiaTipo ?? "",
    preocFamilia: profile.preocFamilia ?? "",
    cobActual: profile.cobActual ?? "",
    preocSalud: profile.preocSalud ?? "",
    edadRango: profile.edadRango ?? "",
    salud: profile.salud ?? "",
    saludFlag: profile.saludFlag ?? "",
    estatus: profile.estatus ?? "",
    estatusFlag: profile.estatusFlag ?? "",
    estado: profile.estado ?? "",
    timezone: profile.timezone ?? "",
    ventanaDisp: profile.ventanaDisp ?? "",
  });
  const [edadCond, setEdadCond] = useState(profile.edadCond);
  const [referido, setReferido] = useState(profile.referido);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_profile",
        intencionP: fields.intencionP || null,
        intencionS: fields.intencionS || null,
        horizonte: fields.horizonte || null,
        planRetiro: fields.planRetiro || null,
        familiaTipo: fields.familiaTipo || null,
        preocFamilia: fields.preocFamilia || null,
        cobActual: fields.cobActual || null,
        preocSalud: fields.preocSalud || null,
        edadRango: fields.edadRango || null,
        edadCond,
        salud: fields.salud || null,
        saludFlag: fields.saludFlag || null,
        estatus: fields.estatus || null,
        estatusFlag: fields.estatusFlag || null,
        estado: fields.estado.trim() || null,
        timezone: fields.timezone.trim() || null,
        referido,
        ventanaDisp: fields.ventanaDisp.trim() || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  };

  return (
    <Card title="Perfil de calificación">
      <p className="-mt-1 mb-3 text-sm text-text-secondary">
        Las respuestas completas del Smart Form — todo editable a mano si hace falta corregir algo.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EnumField label="Intención principal" value={fields.intencionP} onChange={set("intencionP")} options={INTENCION_LABEL} />
        <EnumField label="Intención secundaria" value={fields.intencionS} onChange={set("intencionS")} options={INTENCION_LABEL} />
        <EnumField label="Horizonte" value={fields.horizonte} onChange={set("horizonte")} options={HORIZONTE_LABEL} />
        <EnumField label="Plan de retiro" value={fields.planRetiro} onChange={set("planRetiro")} options={PLAN_RETIRO_LABEL} />
        <EnumField label="Tipo de familia" value={fields.familiaTipo} onChange={set("familiaTipo")} options={FAMILIA_TIPO_LABEL} />
        <EnumField label="Preocupación familiar" value={fields.preocFamilia} onChange={set("preocFamilia")} options={PREOC_FAMILIA_LABEL} />
        <EnumField label="Cobertura actual" value={fields.cobActual} onChange={set("cobActual")} options={COB_ACTUAL_LABEL} />
        <EnumField label="Preocupación de salud" value={fields.preocSalud} onChange={set("preocSalud")} options={PREOC_SALUD_LABEL} />
        <EnumField label="Rango de edad" value={fields.edadRango} onChange={set("edadRango")} options={EDAD_RANGO_LABEL} />
        <EnumField label="Salud" value={fields.salud} onChange={set("salud")} options={SALUD_LABEL} />
        <EnumField label="Flag de salud" value={fields.saludFlag} onChange={set("saludFlag")} options={SALUD_FLAG_LABEL} />
        <EnumField label="Estatus migratorio" value={fields.estatus} onChange={set("estatus")} options={ESTATUS_LABEL} />
        <EnumField label="Flag de estatus" value={fields.estatusFlag} onChange={set("estatusFlag")} options={ESTATUS_FLAG_LABEL} />
        <TextField label="Estado (EE.UU.)" value={fields.estado} onChange={set("estado")} />
        <TextField label="Zona horaria" value={fields.timezone} onChange={set("timezone")} />
        <TextField label="Ventana de disponibilidad" value={fields.ventanaDisp} onChange={set("ventanaDisp")} />

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" checked={edadCond} onChange={(e) => setEdadCond(e.target.checked)} />
          Condicional por edad
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" checked={referido} onChange={(e) => setReferido(e.target.checked)} />
          Referido
        </label>
      </div>

      {saved && <p className="mt-2 text-sm text-success">Guardado.</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 cursor-pointer rounded-lg bg-trust px-4 py-2 text-sm font-medium text-white hover:bg-trust-dark disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar perfil"}
      </button>
    </Card>
  );
}
