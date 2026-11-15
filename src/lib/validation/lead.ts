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
