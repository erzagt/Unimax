import { NextResponse } from "next/server";
import { insertLead } from "@/lib/leads";
import { clientIp, hashKey, rateLimit } from "@/lib/rate-limit";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { leadRequestSchema } from "@/lib/validation/lead";

type ApiResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fail(status: number, error: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json<ApiResult>({ ok: false, error, fieldErrors }, { status });
}

/** Приём заявки с лендинга и из бесплатных инструментов. */
export async function POST(request: Request) {
  if (!isServiceRoleConfigured()) {
    return fail(503, "Приём заявок временно недоступен. Напишите нам в WhatsApp.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Некорректный запрос.");
  }

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return fail(400, "Проверьте поля формы.", fieldErrors);
  }
  const lead = parsed.data;

  // Ловушка для ботов: делаем вид, что всё хорошо, но ничего не сохраняем.
  if (lead.website) {
    return NextResponse.json<ApiResult>({ ok: true });
  }

  // Лимиты: с одного IP — 5 заявок за 10 минут, на один телефон — 3 в сутки.
  const ip = await clientIp();
  const [ipOk, phoneOk] = await Promise.all([
    rateLimit(`lead:ip:${hashKey(ip)}`, 5, 10 * 60),
    rateLimit(`lead:phone:${hashKey(lead.phone)}`, 3, 24 * 60 * 60),
  ]);
  if (!ipOk || !phoneOk) {
    return fail(429, "Слишком много заявок. Попробуйте позже или напишите нам в WhatsApp.");
  }

  try {
    await insertLead(lead);
  } catch (err) {
    console.error("[leads] не удалось сохранить заявку:", err);
    return fail(500, "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в WhatsApp.");
  }

  return NextResponse.json<ApiResult>({ ok: true });
}
