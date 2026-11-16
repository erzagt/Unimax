import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Access, Role } from "@/lib/auth";
import type { UserFilters } from "@/lib/validation/admin";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  access: Access;
  grade: string | null;
  phone: string | null;
  parent_phone: string | null;
  blocked_at: string | null;
  consent_at: string | null;
  created_at: string;
};

export const PROFILE_COLUMNS =
  "id, email, full_name, role, access, grade, phone, parent_phone, blocked_at, consent_at, created_at";

/** Список пользователей с фильтрами (через сессию админа, под RLS). */
export function queryUsers(supabase: SupabaseClient, f: UserFilters, limit = 500) {
  let q = supabase.from("profiles").select(PROFILE_COLUMNS).order("created_at", { ascending: false }).limit(limit);
  if (f.role) q = q.eq("role", f.role);
  if (f.access) q = q.eq("access", f.access);
  if (f.blocked === "yes") q = q.not("blocked_at", "is", null);
  if (f.blocked === "no") q = q.is("blocked_at", null);
  if (f.q) {
    // убираем символы синтаксиса фильтров PostgREST
    const term = f.q.replace(/[%,()*\\]/g, " ").trim();
    if (term) q = q.or(`email.ilike.%${term}%,full_name.ilike.%${term}%,phone.ilike.%${term.replace(/\D/g, "") || term}%`);
  }
  return q.returns<ProfileRow[]>();
}
