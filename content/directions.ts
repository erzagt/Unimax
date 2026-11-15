import type { Direction } from "./types";

/**
 * 4 направления и курсы внутри них.
 * Цены — ЗАГЛУШКИ. Состав курсов — черновик, проверить и поправить.
 */
export const directions: Direction[] = [
  {
    id: "sat",
    short: "SAT",
    title: "Подготовка к SAT",
    icon: "sat",
    heroLabel: "SAT",
    goal: "Цель 1400+",
    description:
      "Math и Reading & Writing в цифровом формате. Разбираем все типы заданий, учимся распределять время и регулярно пишем пробные тесты.",
    courses: [
      { id: "sat-pro", title: "SAT Pro", description: "Полный курс Math + Reading & Writing" },
      { id: "sat-mocks", title: "Пробные тесты", description: "Полные пробники с разбором ошибок" },
    ],
    priceFrom: "[ЦЕНА]",
  },
  {
    id: "ielts",
    short: "IELTS",
    title: "Подготовка к IELTS",
    icon: "ielts",
    heroLabel: "IELTS",
    goal: "Цель 7.0+",
    description:
      "Все четыре части экзамена: Listening, Reading, Writing и Speaking. Ставим академический английский, который пригодится и в эссе, и в учёбе.",
    courses: [
      { id: "ielts", title: "IELTS", description: "Четыре модуля экзамена с нуля до цели" },
      { id: "ielts-writing", title: "Writing-разборы", description: "Проверка Task 1 и Task 2 с комментариями" },
    ],
    priceFrom: "[ЦЕНА]",
  },
  {
    id: "ec",
    short: "EC",
    title: "Внеклассные активности",
    icon: "ec",
    heroLabel: "EC",
    goal: "Свой проект",
    description:
      "Выстраиваем активности, которые складываются в историю, а не в список: олимпиады, волонтёрство, исследования и собственный проект.",
    courses: [
      { id: "ec-roadmap", title: "EC Roadmap", description: "Карта активностей под твои цели и вузы" },
      { id: "project-lab", title: "Project Lab", description: "Свой проект от идеи до результата" },
    ],
    priceFrom: "[ЦЕНА]",
  },
  {
    id: "essay",
    short: "Эссе",
    title: "Эссе и мотивационные письма",
    icon: "essay",
    heroLabel: "Эссе",
    goal: "Твоя история",
    description:
      "Помогаем найти свою историю, выстроить структуру и сохранить живой голос. Пишет ученик — мы даём подробную обратную связь.",
    courses: [
      { id: "storytelling", title: "Storytelling", description: "Поиск истории, структура, первые черновики" },
      { id: "essay-review", title: "Essay Review", description: "Разбор Personal Statement и Supplements" },
    ],
    priceFrom: "[ЦЕНА]",
  },
];

export const directionById = Object.fromEntries(directions.map((d) => [d.id, d])) as Record<
  Direction["id"],
  Direction
>;
