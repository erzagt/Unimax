import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

/** Supabase-клиент для браузера (публичный ключ, сессия из cookies). */
export function getBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  client ??= createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
