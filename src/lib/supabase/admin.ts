import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * Клиент с service role: обходит RLS. ТОЛЬКО для сервера и только там,
 * где ввод уже провалидирован (создание заявок, rate limit).
 */
let client: SupabaseClient | null = null;

export function isServiceRoleConfigured() {
  return Boolean(supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Новые ключи Supabase (sb_secret_…) не являются JWT и должны передаваться
 * только в заголовке apikey. supabase-js для REST дублирует ключ в
 * Authorization: Bearer — убираем этот дубль, оставляя apikey.
 */
function secretKeyFetch(key: string): typeof fetch {
  if (!key.startsWith("sb_secret_")) return fetch;
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    return fetch(input, { ...init, headers });
  };
}

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) {
    throw new Error("Supabase service role не настроен: нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY");
  }
  client ??= createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: secretKeyFetch(key) },
  });
  return client;
}
