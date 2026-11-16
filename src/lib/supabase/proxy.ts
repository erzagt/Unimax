import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Обновляет cookie-сессию Supabase на каждом запросе к защищённым разделам.
 * Вызывается из src/proxy.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Важно: getUser() запускает обновление токена при необходимости.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Уже вошли — форма входа/регистрации не нужна, ведём в свой раздел
  const path = request.nextUrl.pathname;
  if (user && (path === "/login" || path === "/register")) {
    const redirect = NextResponse.redirect(new URL("/auth/home", request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  return response;
}
