import "server-only";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const AUDIT_LABELS: Record<string, string> = {
  invite: "Пригласил пользователя",
  role_change: "Сменил роль",
  access_change: "Сменил доступ",
  block: "Заблокировал",
  unblock: "Разблокировал",
  delete_user: "Удалил аккаунт",
  update_profile: "Изменил данные профиля",
  notes: "Обновил заметки",
  send_link: "Отправил ссылку для входа",
  lead_status: "Изменил заявку",
  lead_delete: "Удалил заявку",
  lead_convert: "Создал аккаунт из заявки",
};

/**
 * Запись в журнал действий админов. Пишется через service role;
 * ошибка записи не должна ломать само действие — только логируем.
 */
export async function audit(
  actor: User,
  action: keyof typeof AUDIT_LABELS,
  target: { type: "user" | "lead"; id: string; label?: string | null },
  details: Record<string, unknown> = {},
) {
  const { error } = await createAdminClient()
    .from("admin_audit_log")
    .insert({
      actor_id: actor.id,
      actor_email: actor.email ?? null,
      action,
      target_type: target.type,
      target_id: target.id,
      target_label: target.label?.slice(0, 200) ?? null,
      details,
    });
  if (error) console.error("[audit] не удалось записать:", error.message);
}
