import { z } from "zod";
import { gradeOptions } from "@content/lead-form";

const gradeValues = gradeOptions.map((o) => o.value) as [string, ...string[]];

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Введите корректный email").max(254, "Слишком длинный email"));

/** Вход: только email. */
export const loginSchema = z.object({
  email: emailField,
});

/** Регистрация ученика. */
export const registerSchema = z.object({
  email: emailField,
  fullName: z.string().trim().min(2, "Укажите имя и фамилию ученика").max(80, "Слишком длинное имя"),
  grade: z.enum(gradeValues, { error: "Выберите класс" }),
  consent: z.literal(true, { error: "Нужно согласие родителя или законного представителя" }),
});

/** Код из письма (Supabase: 6 цифр по умолчанию, допускаем до 8). */
export const codeSchema = z.object({
  email: emailField,
  token: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{6,8}$/, "Код — это 6 цифр из письма")),
});

export type RegisterInput = z.input<typeof registerSchema>;
