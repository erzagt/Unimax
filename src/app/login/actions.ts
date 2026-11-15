"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { safeNext } from "@/lib/auth";
import { clientIp, hashKey, rateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

const schema = z.object({
  email: z.email("Введите корректный email").max(254),
  next: z.string().max(200).optional(),
});

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Отправляет ссылку для входа (magic link). Новых пользователей не создаёт. */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Вход пока не настроен: Supabase не подключён." };
  }

  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    next: String(formData.get("next") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Проверьте email" };
  }
  const { email, next } = parsed.data;

  const ip = await clientIp();
  const [ipOk, emailOk] = await Promise.all([
    rateLimit(`login:ip:${hashKey(ip)}`, 10, 15 * 60),
    rateLimit(`login:email:${hashKey(email)}`, 3, 15 * 60),
  ]);
  if (!ipOk || !emailOk) {
    return { status: "error", message: "Слишком много попыток. Подождите 15 минут." };
  }

  const supabase = await createClient();
  const redirectTo = `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  });

  // Не сообщаем, есть ли такой пользователь: ответ одинаковый.
  if (error && error.status !== 400 && error.status !== 422) {
    console.error("[login] signInWithOtp:", error.message);
    return { status: "error", message: "Не удалось отправить письмо. Попробуйте позже." };
  }
  return { status: "sent" };
}
