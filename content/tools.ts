import type { FreeTool } from "./types";

/** Бесплатные инструменты (лид-магниты). Сами инструменты — этап 3. */
export const freeTools: FreeTool[] = [
  {
    id: "essay-check",
    href: "/tools/essay-check",
    title: "ИИ-проверка эссе",
    description:
      "Оценки по структуре, истории, языку и теме, сильные стороны и конкретные улучшения. Без переписывания — только обратная связь.",
    icon: "pen",
    tone: "essay",
    meta: "До 650 слов",
  },
  {
    id: "sat-mini",
    href: "/tools/sat-mini",
    title: "Мини-тест SAT",
    description: "20 оригинальных вопросов в стиле SAT: Math и Reading & Writing. В конце — ориентировочный диапазон балла.",
    icon: "timer",
    tone: "sat",
    meta: "25 минут",
  },
  {
    id: "chances",
    href: "/tools/chances",
    title: "Калькулятор шансов",
    description: "Введи баллы, GPA и активности — получи список вузов «мечта / реально / надёжно». Это оценка, а не гарантия.",
    icon: "target",
    tone: "ec",
    meta: "5 минут",
  },
];
