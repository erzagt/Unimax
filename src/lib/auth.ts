import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type Role = "student" | "teacher" | "admin";

export type AuthState =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "forbidden"; user: User }
  | { status: "ok"; user: User; role: Role; supabase: SupabaseClient };

/**
 * Проверяет сессию и роль. Data Access Layer: все страницы и действия
 * админки получают пользователя только через эту функцию.
 * getUser() проверяет токен на сервере Supabase, а не только cookie.
 */
export async function getAuth(required: Role = "admin"): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { status: "unconfigured" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile?.role ?? "student") as Role;
  if (role !== required && role !== "admin") return { status: "forbidden", user };

  return { status: "ok", user, role, supabase };
}

/** Безопасный внутренний путь для редиректа после входа. */
export function safeNext(next: string | null | undefined, fallback = "/admin") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
