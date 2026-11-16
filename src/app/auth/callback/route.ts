import { NextResponse, type NextRequest } from "next/server";
import { homeFor, safeNext, type Role } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Старый формат ссылок (PKCE ?code=...). Новые письма ведут на /auth/confirm,
 * но этот обработчик оставлен для совместимости.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");

  if (tokenHash) {
    // Ссылка нового формата — показываем страницу подтверждения
    const confirm = new URL("/auth/confirm", url.origin);
    url.searchParams.forEach((v, k) => confirm.searchParams.set(k, v));
    return NextResponse.redirect(confirm);
  }

  const supabase = await createClient();
  const { error } = code ? await supabase.auth.exchangeCodeForSession(code) : { error: true };
  if (error) return NextResponse.redirect(new URL("/login?error=link", url.origin));

  let dest = safeNext(url.searchParams.get("next"));
  if (!dest) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = user
      ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : { data: null };
    dest = homeFor((data?.role ?? "student") as Role);
  }
  return NextResponse.redirect(new URL(dest, url.origin));
}
