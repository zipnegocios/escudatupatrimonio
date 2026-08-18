import type { QualificationProfile } from "@/core/entities/qualification-profile";

export interface SubmitLeadInput {
  sessionId: string;
  utmCampaign: string | null;
  profile: QualificationProfile;
}

// No lanza: una falla de red acá nunca debe frenar el flujo del formulario,
// solo se pierde la persistencia (el prospecto sigue viendo la evaluación).
export async function submitLead(input: SubmitLeadInput): Promise<{ leadId: string } | null> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "leadId" in data &&
      typeof (data as { leadId: unknown }).leadId === "string"
    ) {
      return { leadId: (data as { leadId: string }).leadId };
    }
    return null;
  } catch {
    return null;
  }
}
