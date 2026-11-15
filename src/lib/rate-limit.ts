import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Засчитывает обращение по ключу. Возвращает true, если лимит не превышен.
 * Счётчики хранятся в Postgres (таблица rate_limits), поэтому работают
 * на всех серверных инстансах Vercel.
 *
 * При ошибке БД пропускаем запрос (fail-open), чтобы не терять заявки,
 * но пишем ошибку в лог.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  try {
    const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data === true;
  } catch (err) {
    console.error("[rate-limit] ошибка, запрос пропущен:", err);
    return true;
  }
}

/** Хэш, чтобы не хранить IP и телефоны в открытом виде в таблице лимитов. */
export function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

/** IP клиента (на Vercel — первый адрес из x-forwarded-for). */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
