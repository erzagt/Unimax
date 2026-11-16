import "server-only";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import type { Access, Role } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/** Отправить пользователю письмо с кодом и кнопкой входа (шаблон Magic Link). */
export async function sendLoginEmail(email: string) {
  // Отдельный клиент без cookies, чтобы не трогать сессию админа
  const client = createPlainClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  return error;
}

export async function findProfileIdByEmail(email: string) {
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

type NewAccount = {
  email: string;
  fullName?: string | null;
  grade?: string | null;
  phone?: string | null;
  role: Role;
  access: Access;
  sendEmail: boolean;
};

export type CreateAccountResult =
  | { ok: true; id: string; emailError?: string }
  | { ok: false; error: string; existingId?: string };

/**
 * Создаёт подтверждённый аккаунт (без пароля), выставляет роль и доступ,
 * по желанию отправляет письмо со входом. Только для админских действий.
 */
export async function createAccount(input: NewAccount): Promise<CreateAccountResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: { full_name: input.fullName ?? undefined, grade: input.grade ?? undefined },
  });

  if (error || !data.user) {
    if (error?.code === "email_exists" || /already (been )?registered/i.test(error?.message ?? "")) {
      const existingId = await findProfileIdByEmail(input.email);
      return { ok: false, error: "Пользователь с таким email уже есть.", existingId: existingId ?? undefined };
    }
    console.error("[admin] createUser:", error?.message);
    return { ok: false, error: "Не удалось создать аккаунт." };
  }

  const id = data.user.id;
  // Профиль создаёт триггер (role=student, access=free) — повышаем по выбору админа
  const { error: upErr } = await admin
    .from("profiles")
    .update({ role: input.role, access: input.access, phone: input.phone ?? null })
    .eq("id", id);
  if (upErr) console.error("[admin] profile update after create:", upErr.message);

  if (input.sendEmail) {
    const mailErr = await sendLoginEmail(input.email);
    if (mailErr) return { ok: true, id, emailError: "Аккаунт создан, но письмо не отправилось. Отправьте ссылку из карточки позже." };
  }
  return { ok: true, id };
}

/** Количество админов (защита от удаления/понижения последнего). */
export async function countAdmins() {
  const { count } = await createAdminClient()
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return count ?? 0;
}
