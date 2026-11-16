import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_LABELS, getAuth, ROLE_LABELS } from "@/lib/auth";
import { queryUsers } from "@/lib/admin/user-query";
import { formatDate, gradeLabel } from "@/lib/leads-format";
import { userFiltersSchema } from "@/lib/validation/admin";

function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Выгрузка пользователей в CSV (с текущими фильтрами). Только для админа. */
export async function GET(request: NextRequest) {
  const auth = await getAuth("admin");
  if (auth.status !== "ok") {
    return new NextResponse("Нет доступа", { status: auth.status === "anonymous" ? 401 : 403 });
  }
  const filters = userFiltersSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const { data, error } = await queryUsers(auth.supabase, filters, 10000);
  if (error) return new NextResponse("Ошибка выгрузки", { status: 500 });

  const header = ["Имя", "Email", "Роль", "Доступ", "Класс", "Телефон", "Телефон родителя", "Заблокирован", "Согласие", "Регистрация"];
  const rows = data.map((u) =>
    [
      u.full_name ?? "",
      u.email ?? "",
      ROLE_LABELS[u.role],
      ACCESS_LABELS[u.access],
      u.grade ? gradeLabel(u.grade) : "",
      u.phone ? `+${u.phone}` : "",
      u.parent_phone ? `+${u.parent_phone}` : "",
      u.blocked_at ? "да" : "",
      u.consent_at ? formatDate(u.consent_at) : "",
      formatDate(u.created_at),
    ]
      .map(cell)
      .join(";"),
  );
  const csv = "﻿" + [header.map(cell).join(";"), ...rows].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="unipath-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
