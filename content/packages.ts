import type { Package } from "./types";

/** Пакеты. Цены и сроки оплаты — ЗАГЛУШКИ. */
export const packages: Package[] = [
  {
    id: "grade-9",
    name: "9 класс",
    subtitle: "Фундамент: язык и первые активности",
    duration: "1 учебный год",
    courseIds: ["ielts", "ec-roadmap"],
    features: ["IELTS: все четыре модуля", "EC Roadmap: карта активностей", "Личный план на 9–10 класс"],
    price: "[ЦЕНА]",
    priceNote: "[ЗАГЛУШКА: за месяц / за курс]",
  },
  {
    id: "grade-10",
    name: "10 класс",
    subtitle: "Результаты: SAT, проект и история",
    duration: "1 учебный год",
    courseIds: ["sat-pro", "project-lab", "storytelling"],
    features: ["SAT Pro: Math + Reading & Writing", "Project Lab: свой проект", "Storytelling: основа для эссе"],
    price: "[ЦЕНА]",
    priceNote: "[ЗАГЛУШКА: за месяц / за курс]",
  },
  {
    id: "full-admission",
    name: "Full Admission",
    subtitle: "Полное сопровождение от 9 класса до подачи",
    duration: "2 года",
    courseIds: ["ielts", "sat-pro", "ec-roadmap", "project-lab", "storytelling", "essay-review"],
    features: [
      "Все курсы: IELTS, SAT Pro, EC Roadmap, Project Lab",
      "Storytelling и Essay Review",
      "Список вузов и стратегия подачи",
      "Контроль дедлайнов до отправки заявок",
    ],
    price: "[ЦЕНА]",
    priceNote: "[ЗАГЛУШКА: за месяц / за курс]",
    highlighted: true,
    badge: "Максимум поддержки",
  },
];
