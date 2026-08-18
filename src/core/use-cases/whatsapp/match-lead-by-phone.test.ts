import { describe, expect, it } from "vitest";
import { matchLeadByPhone } from "@/core/use-cases/whatsapp/match-lead-by-phone";
import type { Lead, LeadRepository, LeadListFilter, SaveLeadInput } from "@/core/ports/lead-repository";

function buildLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    sessionId: "session-1",
    nombre: "Prueba",
    telefono: "5551234567",
    canal: "WHATSAPP",
    priority: null,
    status: "NEW",
    utmCampaign: null,
    source: "smart-form",
    ghlContactId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

class StubLeadRepository implements LeadRepository {
  constructor(private readonly leads: Lead[]) {}
  async save(_input: SaveLeadInput): Promise<Lead> {
    throw new Error("no usado en este test");
  }
  async findById(): Promise<null> {
    return null;
  }
  async list(_filter?: LeadListFilter): Promise<Lead[]> {
    return this.leads;
  }
  async updateStatus(): Promise<void> {}
  async updateLeadFields(): Promise<Lead> {
    throw new Error("no usado en este test");
  }
  async updateQualificationProfile(): Promise<never> {
    throw new Error("no usado en este test");
  }
}

describe("matchLeadByPhone", () => {
  it("matchea por los últimos 8 dígitos aunque falte el código de país", async () => {
    const leadRepository = new StubLeadRepository([buildLead({ telefono: "5551234567" })]);
    const leadId = await matchLeadByPhone({ leadRepository }, "15551234567@s.whatsapp.net");
    expect(leadId).toBe("lead-1");
  });

  it("no matchea si el teléfono no coincide", async () => {
    const leadRepository = new StubLeadRepository([buildLead({ telefono: "5551234567" })]);
    const leadId = await matchLeadByPhone({ leadRepository }, "19998887777@s.whatsapp.net");
    expect(leadId).toBeNull();
  });

  it("devuelve null si el lead no tiene teléfono guardado", async () => {
    const leadRepository = new StubLeadRepository([buildLead({ telefono: null })]);
    const leadId = await matchLeadByPhone({ leadRepository }, "15551234567@s.whatsapp.net");
    expect(leadId).toBeNull();
  });
});
