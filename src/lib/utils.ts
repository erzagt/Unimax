import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Склеивает классы Tailwind и убирает конфликтующие. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Строка — заглушка вида «[...]», которую нужно заменить реальными данными. */
export function isPlaceholder(value: string | null | undefined) {
  return !value || /^\[.*\]$/.test(value.trim());
}
