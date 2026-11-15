import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";
import { LEAD_COLUMNS, type LeadRow } from "@/lib/leads";
import { formatDate, gradeLabel, sectionLabel, sourceLabel, statusLabel } from "@/lib/leads-format";
import { leadFiltersSchema } from "@/lib/validation/lead";

/** Ячейка CSV: кавычки + защита от формул в Excel (=, +, -, @). */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Выгрузка заявок в CSV (с текущими фильтрами). Только для админа. */
export async function GET(request: NextRequest) {
  const auth = await getAuth("admin");
  if (auth.status !== "ok") {
    return new NextResponse("Нет доступа", { status: auth.status === "anonymous" ? 401 : 403 });
  }

  const filters = leadFiltersSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  let query = auth.supabase.from("leads").select(LEAD_COLUMNS).order("created_at", { ascending: false }).limit(10000);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.section) query = query.eq("section", filters.section);
  if (filters.source) query = query.eq("source", filters.source);

  const { data, error } = await query.returns<LeadRow[]>();
  if (error) {
    console.error("[admin] export:", error.message);
    return new NextResponse("Ошибка выгрузки", { status: 500 });
  }

  const header = ["Дата", "Имя", "Телефон", "Класс", "Направление", "Источник", "Статус", "Комментарий", "Заметки"];
  const rows = data.map((l) =>
    [
      formatDate(l.created_at),
      l.name,
      `+${l.phone}`,
      gradeLabel(l.grade),
      sectionLabel(l.section),
      sourceLabel(l.source),
      statusLabel(l.status),
      l.comment,
      l.notes,
    ]
      .map(cell)
      .join(";"),
  );
  // BOM + «;» — чтобы Excel с русской локалью открыл файл без настроек
  const csv = "﻿" + [header.map(cell).join(";"), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="unipath-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
