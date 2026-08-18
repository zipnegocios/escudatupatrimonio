import { desc, eq } from "drizzle-orm";
import type {
  LeadListFilter,
  LeadRepository,
  LeadWithProfile,
  SaveLeadInput,
  UpdateLeadFieldsInput,
  UpdateQualificationProfileInput,
} from "@/core/ports/lead-repository";
import { db } from "@/infrastructure/database/db";
import {
  leads,
  qualificationProfiles,
  type Lead,
  type QualificationProfileRow,
} from "@/infrastructure/database/schema";

export class DrizzleLeadRepository implements LeadRepository {
  async save(input: SaveLeadInput): Promise<Lead> {
    return db.transaction(async (tx) => {
      const [lead] = await tx
        .insert(leads)
        .values({
          sessionId: input.sessionId,
          nombre: input.profile.nombre,
          telefono: input.profile.telefono,
          canal: input.profile.canal,
          priority: input.profile.priority,
          utmCampaign: input.utmCampaign,
        })
        .onConflictDoUpdate({
          target: leads.sessionId,
          set: {
            nombre: input.profile.nombre,
            telefono: input.profile.telefono,
            canal: input.profile.canal,
            priority: input.profile.priority,
            utmCampaign: input.utmCampaign,
            updatedAt: new Date(),
          },
        })
        .returning();

      await tx
        .insert(qualificationProfiles)
        .values({
          leadId: lead.id,
          intencionP: input.profile.intencionP,
          intencionS: input.profile.intencionS,
          horizonte: input.profile.horizonte,
          planRetiro: input.profile.planRetiro,
          familiaTipo: input.profile.familiaTipo,
          preocFamilia: input.profile.preocFamilia,
          cobActual: input.profile.cobActual,
          preocSalud: input.profile.preocSalud,
          edadRango: input.profile.edadRango,
          edadCond: input.profile.edadCond,
          salud: input.profile.salud,
          saludFlag: input.profile.saludFlag,
          estatus: input.profile.estatus,
          estatusFlag: input.profile.estatusFlag,
          estado: input.profile.estado,
          timezone: input.profile.timezone,
          referido: input.profile.referido,
          ventanaDisp: input.profile.ventanaDisp,
          tags: input.tags,
          rawProfile: input.profile,
        })
        .onConflictDoUpdate({
          target: qualificationProfiles.leadId,
          set: {
            intencionP: input.profile.intencionP,
            intencionS: input.profile.intencionS,
            horizonte: input.profile.horizonte,
            planRetiro: input.profile.planRetiro,
            familiaTipo: input.profile.familiaTipo,
            preocFamilia: input.profile.preocFamilia,
            cobActual: input.profile.cobActual,
            preocSalud: input.profile.preocSalud,
            edadRango: input.profile.edadRango,
            edadCond: input.profile.edadCond,
            salud: input.profile.salud,
            saludFlag: input.profile.saludFlag,
            estatus: input.profile.estatus,
            estatusFlag: input.profile.estatusFlag,
            estado: input.profile.estado,
            timezone: input.profile.timezone,
            referido: input.profile.referido,
            ventanaDisp: input.profile.ventanaDisp,
            tags: input.tags,
            rawProfile: input.profile,
          },
        });

      return lead;
    });
  }

  async findById(id: string): Promise<LeadWithProfile | null> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    if (!lead) return null;

    const [profile] = await db
      .select()
      .from(qualificationProfiles)
      .where(eq(qualificationProfiles.leadId, id))
      .limit(1);

    return { lead, profile: profile ?? null };
  }

  async list(filter?: LeadListFilter): Promise<Lead[]> {
    const query = db.select().from(leads).orderBy(desc(leads.createdAt));
    if (filter?.status) {
      return query.where(eq(leads.status, filter.status));
    }
    return query;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await db.update(leads).set({ status, updatedAt: new Date() }).where(eq(leads.id, id));
  }

  async updateLeadFields(id: string, input: UpdateLeadFieldsInput): Promise<Lead> {
    const [row] = await db
      .update(leads)
      .set({
        nombre: input.nombre,
        telefono: input.telefono,
        canal: input.canal,
        priority: input.priority,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return row;
  }

  async updateQualificationProfile(
    leadId: string,
    input: UpdateQualificationProfileInput,
  ): Promise<QualificationProfileRow> {
    const [row] = await db
      .update(qualificationProfiles)
      .set(input)
      .where(eq(qualificationProfiles.leadId, leadId))
      .returning();
    return row;
  }
}
