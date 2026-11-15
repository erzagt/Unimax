import { z } from "zod";
import { gradeOptions, sectionOptions } from "@content/lead-form";

const gradeValues = gradeOptions.map((o) => o.value) as [string, ...string[]];
const sectionValues = sectionOptions.map((o) => o.value) as [string, ...string[]];

/**
 * Приводит телефон к виду 7XXXXXXXXXX (Казахстан/Россия) или к цифрам
 * с кодом страны для других номеров. 8XXXXXXXXXX → 7XXXXXXXXXX.
 */
export function normalizePhone(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("7")) digits = `7${digits}`;
  return digits;
}

/** Схема заявки — общая для клиента (UX) и сервера (этап 2). */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя ученика")
    .max(80, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((v) => v.length >= 10 && v.length <= 15, "Проверьте номер WhatsApp"),
  grade: z.enum(gradeValues, { error: "Выберите класс" }),
  section: z.enum(sectionValues, { error: "Выберите направление" }),
  comment: z.string().trim().max(1000, "Не больше 1000 символов").optional().default(""),
  consent: z.literal(true, { error: "Нужно согласие родителя или законного представителя" }),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

/** Откуда пришла заявка: лендинг или бесплатные инструменты (этап 3). */
export const LEAD_SOURCES = {
  landing: "Лендинг",
  "essay-check": "Проверка эссе",
  "sat-mini": "Мини-тест SAT",
  chances: "Калькулятор шансов",
} as const;
export type LeadSource = keyof typeof LEAD_SOURCES;

/** Статусы заявки в CRM. */
export const LEAD_STATUSES = {
  new: "Новая",
  contacted: "Связались",
  trial: "Пробный урок",
  paid: "Оплатил",
  lost: "Отказ",
} as const;
export type LeadStatus = keyof typeof LEAD_STATUSES;

const sourceValues = Object.keys(LEAD_SOURCES) as [LeadSource, ...LeadSource[]];
const statusValues = Object.keys(LEAD_STATUSES) as [LeadStatus, ...LeadStatus[]];

/** Тело запроса POST /api/leads: заявка + источник + поле-ловушка для ботов. */
export const leadRequestSchema = leadSchema.extend({
  source: z.enum(sourceValues).optional().default("landing"),
  // honeypot: скрытое поле, люди его не видят и не заполняют
  website: z.string().max(200).optional().default(""),
});
export type LeadRequest = z.input<typeof leadRequestSchema>;

/** Изменение заявки в админке. */
export const leadUpdateSchema = z.object({
  id: z.uuid(),
  status: z.enum(statusValues),
  notes: z.string().trim().max(5000, "Заметка слишком длинная"),
});

/** Фильтры списка заявок в админке (из searchParams). */
export const leadFiltersSchema = z.object({
  status: z.enum(statusValues).optional().catch(undefined),
  section: z.enum(sectionValues).optional().catch(undefined),
  source: z.enum(sourceValues).optional().catch(undefined),
});
export type LeadFilters = z.output<typeof leadFiltersSchema>;
