import "server-only";
import type { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { leadRequestSchema, LeadStatus } from "@/lib/validation/lead";

/** Заявка как она хранится в таблице public.leads. */
export type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  grade: string;
  section: string;
  comment: string;
  source: string;
  status: LeadStatus;
  notes: string;
  consent_at: string;
};

export const LEAD_COLUMNS =
  "id, created_at, updated_at, name, phone, grade, section, comment, source, status, notes, consent_at";

type ValidLead = z.output<typeof leadRequestSchema>;

/**
 * Сохраняет уже провалидированную заявку. Используется лендингом
 * и бесплатными инструментами (этап 3). Вставка идёт через service role,
 * потому что у anon нет прав на insert в leads (см. миграцию).
 */
export async function insertLead(lead: ValidLead) {
  const { error } = await createAdminClient()
    .from("leads")
    .insert({
      name: lead.name,
      phone: lead.phone,
      grade: lead.grade,
      section: lead.section,
      comment: lead.comment,
      source: lead.source,
      consent_at: new Date().toISOString(),
    });
  if (error) throw error;
}
