import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Supabase-клиент от имени текущего пользователя (cookie-сессия).
 * Все запросы проходят через RLS. Создавать заново на каждый запрос.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Вызов из Server Component: cookies там только читаются.
          // Сессию обновляет proxy.ts, так что это безопасно игнорировать.
        }
      },
    },
  });
}
