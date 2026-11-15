import { gradeOptions, sectionOptions } from "@content/lead-form";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/validation/lead";

/** Подписи для значений из таблицы leads (админка, CSV). */
export const gradeLabel = (v: string) => gradeOptions.find((o) => o.value === v)?.label ?? v;
export const sectionLabel = (v: string) => sectionOptions.find((o) => o.value === v)?.label ?? v;
export const sourceLabel = (v: string) => LEAD_SOURCES[v as keyof typeof LEAD_SOURCES] ?? v;
export const statusLabel = (v: string) => LEAD_STATUSES[v as keyof typeof LEAD_STATUSES] ?? v;

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Almaty",
});
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

/** +7 707 669 15 09 */
export function formatPhone(digits: string) {
  const m = digits.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+7 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
}
