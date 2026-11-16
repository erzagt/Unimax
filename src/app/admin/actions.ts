"use server";

import { refresh } from "next/cache";
import { getAuth } from "@/lib/auth";
import { audit } from "@/lib/admin/audit";
import { leadUpdateSchema } from "@/lib/validation/lead";

export type UpdateLeadState = { status: "idle" | "saved" | "error"; message?: string };

/** Смена статуса и заметки заявки. Проверка роли — внутри (не доверяем UI). */
export async function updateLead(_prev: UpdateLeadState, formData: FormData): Promise<UpdateLeadState> {
  const auth = await getAuth("admin");
  if (auth.status !== "ok") return { status: "error", message: "Нет доступа" };

  const parsed = leadUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { id, status, notes } = parsed.data;
  const { error } = await auth.supabase.from("leads").update({ status, notes }).eq("id", id);
  if (error) {
    console.error("[admin] updateLead:", error.message);
    return { status: "error", message: "Не удалось сохранить" };
  }

  await audit(auth.user, "lead_status", { type: "lead", id }, { status });
  refresh();
  return { status: "saved" };
}
