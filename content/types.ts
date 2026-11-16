/**
 * Типы контента лендинга. Когда перенесём данные в Supabase (этап 5),
 * таблицы будут повторять эти формы.
 */

export type DirectionId = "sat" | "ielts" | "ec" | "essay";

/** Ключ иконки из lucide-react (сопоставление — в src/components/icons.tsx). */
export type IconKey =
  | "sat"
  | "ielts"
  | "ec"
  | "essay"
  | "route"
  | "sparkles"
  | "pen"
  | "timer"
  | "target";

export type Course = {
  id: string;
  title: string;
  /** Для кого курс */
  audience: string;
  /** Длительность и формат */
  format: string;
  /** Цена «от», ₸ */
  price: number;
  /** За что цена: «в месяц», «за курс», «разово», «за эссе» */
  priceUnit: string;
};

export type Direction = {
  id: DirectionId;
  short: string; // «SAT»
  title: string; // «Подготовка к SAT»
  icon: IconKey;
  heroLabel: string; // подпись на карточке в hero
  goal: string; // «Цель 1400+»
  description: string;
  courses: Course[];
};

export type RouteStep = {
  id: string;
  period: string;
  title: string;
  points: string[];
};

export type Mentor = {
  id: string;
  name: string; // ЗАГЛУШКА
  direction: DirectionId;
  credential: string; // балл / вуз — ЗАГЛУШКА
  photo: string | null; // путь в /public или null
};

export type FaqItem = { id: string; question: string; answer: string };

export type FreeTool = {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: IconKey;
  tone: DirectionId;
  meta: string;
};
