"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { audit } from "@/lib/admin/audit";
import { countAdmins, createAccount, sendLoginEmail } from "@/lib/admin/users";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  convertLeadSchema,
  inviteSchema,
  notesSchema,
  profileUpdateSchema,
  roleAccessSchema,
} from "@/lib/validation/admin";

export type ActionState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Ссылка на созданного/найденного пользователя */
  href?: string;
};

const NO_ACCESS: ActionState = { status: "error", message: "Нет доступа" };
const BAN_FOREVER = "876000h"; // ~100 лет

function fieldErrorsOf(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

async function requireAdmin() {
  const auth = await getAuth("admin");
  return auth.status === "ok" ? auth : null;
}

async function profileLabel(id: string) {
  const { data } = await createAdminClient().from("profiles").select("email, full_name").eq("id", id).maybeSingle();
  return data ? [data.full_name, data.email].filter(Boolean).join(" · ") : id;
}

// ---------------------------------------------------------------------------
// Пользователи
// ---------------------------------------------------------------------------

/** Пригласить пользователя по email: создать аккаунт и отправить письмо со входом. */
export async function inviteUser(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const parsed = inviteSchema.safeParse({
    email: fd.get("email") ?? "",
    fullName: fd.get("fullName") ?? "",
    role: fd.get("role"),
    access: fd.get("access"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Проверьте поля", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  }
  const v = parsed.data;

  const res = await createAccount({ ...v, sendEmail: true });
  if (!res.ok) {
    return {
      status: "error",
      message: res.error,
      href: res.existingId ? `/admin/users/${res.existingId}` : undefined,
    };
  }
  await audit(auth.user, "invite", { type: "user", id: res.id, label: v.email }, { role: v.role, access: v.access });
  refresh();
  return {
    status: "ok",
    message: res.emailError ?? `Готово: ${v.email} получит письмо со входом.`,
    href: `/admin/users/${res.id}`,
  };
}

/** Имя, класс, телефоны. */
export async function updateProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const parsed = profileUpdateSchema.safeParse({
    id: fd.get("id"),
    fullName: fd.get("fullName") ?? "",
    grade: fd.get("grade") ?? "",
    phone: fd.get("phone") ?? "",
    parentPhone: fd.get("parentPhone") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "Проверьте поля", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  }
  const { id, fullName, grade, phone, parentPhone } = parsed.data;
  const { error } = await auth.supabase
    .from("profiles")
    .update({ full_name: fullName, grade, phone, parent_phone: parentPhone })
    .eq("id", id);
  if (error) return { status: "error", message: "Не удалось сохранить" };

  await audit(auth.user, "update_profile", { type: "user", id, label: await profileLabel(id) });
  refresh();
  return { status: "ok", message: "Сохранено" };
}

/** Роль и доступ к кабинету. Себя понизить нельзя. */
export async function updateRoleAccess(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const parsed = roleAccessSchema.safeParse({ id: fd.get("id"), role: fd.get("role"), access: fd.get("access") });
  if (!parsed.success) return { status: "error", message: "Некорректные данные" };
  const { id, role, access } = parsed.data;

  const { data: before } = await auth.supabase.from("profiles").select("role, access").eq("id", id).maybeSingle();
  if (!before) return { status: "error", message: "Пользователь не найден" };

  if (id === auth.user.id && role !== "admin") {
    return { status: "error", message: "Нельзя снять роль админа с самого себя." };
  }
  if (before.role === "admin" && role !== "admin" && (await countAdmins()) <= 1) {
    return { status: "error", message: "Это последний админ — сначала назначьте другого." };
  }

  const { error } = await auth.supabase.from("profiles").update({ role, access }).eq("id", id);
  if (error) return { status: "error", message: "Не удалось сохранить" };

  const label = await profileLabel(id);
  if (before.role !== role) await audit(auth.user, "role_change", { type: "user", id, label }, { from: before.role, to: role });
  if (before.access !== access) await audit(auth.user, "access_change", { type: "user", id, label }, { from: before.access, to: access });
  refresh();
  return { status: "ok", message: "Сохранено" };
}

/** Заметки админа (ученику не видны). */
export async function saveNotes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const parsed = notesSchema.safeParse({ id: fd.get("id"), notes: String(fd.get("notes") ?? "") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Ошибка" };
  const { id, notes } = parsed.data;

  const { error } = await auth.supabase
    .from("profile_admin_notes")
    .upsert({ profile_id: id, notes, updated_at: new Date().toISOString() });
  if (error) return { status: "error", message: "Не удалось сохранить" };

  await audit(auth.user, "notes", { type: "user", id, label: await profileLabel(id) });
  refresh();
  return { status: "ok", message: "Сохранено" };
}

/** Заблокировать / разблокировать вход. Данные не удаляются. */
export async function setBlocked(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const id = String(fd.get("id") ?? "");
  const block = fd.get("block") === "1";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { status: "error", message: "Некорректные данные" };
  if (id === auth.user.id) return { status: "error", message: "Нельзя заблокировать самого себя." };

  const admin = createAdminClient();
  const { error: banErr } = await admin.auth.admin.updateUserById(id, { ban_duration: block ? BAN_FOREVER : "none" });
  if (banErr) {
    console.error("[admin] ban:", banErr.message);
    return { status: "error", message: "Не удалось изменить блокировку" };
  }
  await admin.from("profiles").update({ blocked_at: block ? new Date().toISOString() : null }).eq("id", id);

  await audit(auth.user, block ? "block" : "unblock", { type: "user", id, label: await profileLabel(id) });
  refresh();
  return { status: "ok", message: block ? "Аккаунт заблокирован" : "Аккаунт разблокирован" };
}

/** Удалить аккаунт навсегда. Заявки остаются (связь обнуляется). */
export async function deleteUser(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const id = String(fd.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { status: "error", message: "Некорректные данные" };
  if (id === auth.user.id) return { status: "error", message: "Нельзя удалить самого себя." };

  const label = await profileLabel(id);
  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  if (error) {
    console.error("[admin] deleteUser:", error.message);
    return { status: "error", message: "Не удалось удалить аккаунт" };
  }
  await audit(auth.user, "delete_user", { type: "user", id, label });
  redirect("/admin/users");
}

/** Отправить письмо со входом ещё раз. */
export async function sendLink(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const id = String(fd.get("id") ?? "");
  const { data } = await createAdminClient().from("profiles").select("email").eq("id", id).maybeSingle();
  if (!data?.email) return { status: "error", message: "У пользователя нет email" };

  const err = await sendLoginEmail(data.email);
  if (err) {
    return {
      status: "error",
      message: err.status === 429 ? "Письмо недавно отправлялось — подождите минуту." : "Не удалось отправить письмо",
    };
  }
  await audit(auth.user, "send_link", { type: "user", id, label: data.email });
  return { status: "ok", message: `Письмо отправлено на ${data.email}` };
}

// ---------------------------------------------------------------------------
// Заявки
// ---------------------------------------------------------------------------

/** Создать аккаунт ученика из заявки (имя, класс, телефон переносятся). */
export async function convertLead(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const parsed = convertLeadSchema.safeParse({
    leadId: fd.get("leadId"),
    email: fd.get("email") ?? "",
    access: fd.get("access") ?? "free",
  });
  if (!parsed.success) {
    return { status: "error", message: "Проверьте поля", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  }
  const { leadId, email, access } = parsed.data;

  const admin = createAdminClient();
  const { data: lead } = await admin.from("leads").select("name, grade, phone, profile_id").eq("id", leadId).maybeSingle();
  if (!lead) return { status: "error", message: "Заявка не найдена" };
  if (lead.profile_id) return { status: "error", message: "У этой заявки уже есть аккаунт.", href: `/admin/users/${lead.profile_id}` };

  const res = await createAccount({
    email,
    fullName: lead.name,
    grade: ["8", "9", "10", "11"].includes(lead.grade) ? lead.grade : null,
    phone: lead.phone,
    role: "student",
    access,
    sendEmail: true,
  });

  // Если аккаунт с таким email уже есть — просто привязываем заявку к нему
  const profileId = res.ok ? res.id : res.existingId;
  if (!profileId) return { status: "error", message: res.ok ? "Ошибка" : res.error };

  await admin.from("leads").update({ profile_id: profileId }).eq("id", leadId);
  await audit(auth.user, "lead_convert", { type: "lead", id: leadId, label: `${lead.name} → ${email}` }, { access });
  refresh();

  if (!res.ok) {
    return { status: "ok", message: "Такой аккаунт уже был — заявка привязана к нему.", href: `/admin/users/${profileId}` };
  }
  return {
    status: "ok",
    message: res.emailError ?? `Аккаунт создан, письмо отправлено на ${email}.`,
    href: `/admin/users/${profileId}`,
  };
}

/** Удалить заявку навсегда. */
export async function deleteLead(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const auth = await requireAdmin();
  if (!auth) return NO_ACCESS;

  const id = String(fd.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { status: "error", message: "Некорректные данные" };

  const { data: lead } = await auth.supabase.from("leads").select("name, phone").eq("id", id).maybeSingle();
  const { error } = await auth.supabase.from("leads").delete().eq("id", id);
  if (error) return { status: "error", message: "Не удалось удалить" };

  await audit(auth.user, "lead_delete", { type: "lead", id, label: lead ? `${lead.name} · +${lead.phone}` : id });
  refresh();
  return { status: "ok", message: "Заявка удалена" };
}
