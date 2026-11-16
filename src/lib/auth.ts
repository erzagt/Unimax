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

/** Текущий пользователь и его роль (любая роль) или null. */
export async function getSession(): Promise<{ user: User; role: Role; fullName: string | null } | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  return { user, role: (profile?.role ?? "student") as Role, fullName: profile?.full_name ?? null };
}

/** Куда вести пользователя после входа, если не указано иное. */
export function homeFor(role: Role) {
  return role === "admin" ? "/admin" : "/dashboard";
}

/** Безопасный внутренний путь для редиректа после входа (или null). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
