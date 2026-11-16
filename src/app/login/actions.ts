"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import { homeFor, safeNext, type Role } from "@/lib/auth";
import { clientIp, hashKey, rateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { codeSchema, loginSchema, registerSchema } from "@/lib/validation/auth";

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; notFound?: boolean };

function fieldErrorsOf(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

async function limited(kind: string, email: string, perEmail: number) {
  const ip = await clientIp();
  const [ipOk, emailOk] = await Promise.all([
    rateLimit(`${kind}:ip:${hashKey(ip)}`, 20, 15 * 60),
    rateLimit(`${kind}:email:${hashKey(email)}`, perEmail, 15 * 60),
  ]);
  return !ipOk || !emailOk;
}

const notConfigured: AuthResult = { ok: false, error: "Вход пока не настроен." };

/** Отправить код (и ссылку) на почту — для входа существующего пользователя. */
export async function requestLoginCode(input: { email: string }): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Проверьте email", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  const { email } = parsed.data;

  if (await limited("otp", email, 5)) {
    return { ok: false, error: "Слишком много попыток. Подождите 15 минут." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) {
    // Пользователя нет, а создавать новых при входе нельзя
    if (error.code === "otp_disabled" || error.status === 422 || /signups? not allowed/i.test(error.message)) {
      return { ok: false, notFound: true, error: "Аккаунт с этим email не найден." };
    }
    if (error.status === 429) return { ok: false, error: "Письмо уже отправлено. Подождите минуту и попробуйте снова." };
    console.error("[auth] signInWithOtp:", error.status, error.message);
    return { ok: false, error: "Не удалось отправить письмо. Попробуйте позже." };
  }
  return { ok: true };
}

/** Регистрация ученика: создаёт аккаунт и отправляет код. */
export async function requestRegisterCode(input: {
  email: string;
  fullName: string;
  grade: string;
  consent: boolean;
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Проверьте поля формы", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  }
  const { email, fullName, grade } = parsed.data;

  if (await limited("otp", email, 5)) {
    return { ok: false, error: "Слишком много попыток. Подождите 15 минут." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Метаданные читает триггер handle_new_user (роль всегда student)
    options: { shouldCreateUser: true, data: { full_name: fullName, grade, consent: true } },
  });
  if (error) {
    if (error.status === 429) return { ok: false, error: "Письмо уже отправлено. Подождите минуту и попробуйте снова." };
    console.error("[auth] signUp otp:", error.status, error.message);
    return { ok: false, error: "Не удалось отправить письмо. Попробуйте позже." };
  }
  return { ok: true };
}

async function destination(supabase: SupabaseClient, next: string | null | undefined) {
  const wanted = safeNext(next);
  if (wanted) return wanted;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/login";
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return homeFor((data?.role ?? "student") as Role);
}

/** Проверить код из письма и войти. */
export async function verifyLoginCode(input: { email: string; token: string; next?: string }): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return notConfigured;
  const parsed = codeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Неверный код" };
  const { email, token } = parsed.data;

  if (await limited("verify", email, 10)) {
    return { ok: false, error: "Слишком много попыток. Запросите новый код через 15 минут." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    return { ok: false, error: "Код неверный или устарел. Проверьте письмо или запросите новый код." };
  }
  redirect(await destination(supabase, input.next));
}

/** Вход по кнопке из письма (token_hash). Вызывается кнопкой на /auth/confirm. */
export async function confirmEmailLink(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "email") as EmailOtpType;
  const next = String(formData.get("next") ?? "");
  if (!isSupabaseConfigured() || !tokenHash) redirect("/login?error=link");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) redirect("/login?error=link");
  redirect(await destination(supabase, next));
}
