import { z } from "zod";
import { gradeOptions } from "@content/lead-form";
import { emailField } from "./auth";
import { normalizePhone } from "./lead";

const gradeValues = gradeOptions.map((o) => o.value) as [string, ...string[]];

export const roleSchema = z.enum(["student", "teacher", "admin"], { error: "Выберите роль" });
export const accessSchema = z.enum(["free", "active"], { error: "Выберите доступ" });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Не больше ${max} символов`)
    .transform((v) => v || null);

const optionalPhone = z
  .string()
  .trim()
  .transform((v) => (v ? normalizePhone(v) : null))
  .refine((v) => v === null || (v.length >= 10 && v.length <= 15), "Проверьте номер телефона");

export const inviteSchema = z.object({
  email: emailField,
  fullName: optionalText(80),
  role: roleSchema,
  access: accessSchema,
});

export const profileUpdateSchema = z.object({
  id: z.uuid(),
  fullName: optionalText(80),
  grade: z.union([z.enum(gradeValues), z.literal("")]).transform((v) => v || null),
  phone: optionalPhone,
  parentPhone: optionalPhone,
});

export const roleAccessSchema = z.object({
  id: z.uuid(),
  role: roleSchema,
  access: accessSchema,
});

export const notesSchema = z.object({
  id: z.uuid(),
  notes: z.string().trim().max(5000, "Не больше 5000 символов"),
});

export const convertLeadSchema = z.object({
  leadId: z.uuid(),
  email: emailField,
  access: accessSchema,
});

export const userFiltersSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  role: roleSchema.optional().catch(undefined),
  access: accessSchema.optional().catch(undefined),
  blocked: z.enum(["yes", "no"]).optional().catch(undefined),
});
export type UserFilters = z.output<typeof userFiltersSchema>;
