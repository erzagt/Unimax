import type { Direction } from "./types";

/**
 * 4 направления и курсы внутри них.
 * Цены утверждены (ноябрь 2026) — нижняя граница вилки, показываются как «от».
 * Групповые занятия — в потоках до 15–20 учеников.
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
      {
        id: "sat-intensive",
        title: "SAT Intensive",
        audience: "Знаешь базу и сдаёшь через 1–2 месяца",
        format: "1 месяц · 4–5 занятий в неделю · пробник каждую неделю",
        price: 85000,
        priceUnit: "за курс",
      },
      {
        id: "sat-pro",
        title: "SAT Pro",
        audience: "С нуля или со средней базы",
        format: "2 месяца · Math + Reading & Writing · 3 занятия в неделю · пробник раз в 2 недели",
        price: 60000,
        priceUnit: "в месяц",
      },
    ],
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
      {
        id: "ielts-base",
        title: "IELTS Base",
        audience: "Уровень B1 → цель 6.0–6.5",
        format: "3 месяца · 3 занятия в неделю",
        price: 55000,
        priceUnit: "в месяц",
      },
      {
        id: "ielts-7",
        title: "IELTS 7.0+",
        audience: "Уже есть 6.0+, нужен рывок",
        format: "1,5 месяца · 4 занятия в неделю · упор на Writing и Speaking",
        price: 75000,
        priceUnit: "в месяц",
      },
    ],
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
      {
        id: "ec-roadmap",
        title: "EC Roadmap",
        audience: "Карта активностей на 1–2 года под твои цели",
        format: "3 встречи 1-на-1 с наставником",
        price: 45000,
        priceUnit: "разово",
      },
      {
        id: "project-lab",
        title: "Project Lab",
        audience: "Свой проект от идеи до результата",
        format: "3 месяца · 2 встречи 1-на-1 в месяц + групповые воркшопы",
        price: 40000,
        priceUnit: "в месяц",
      },
    ],
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
      {
        id: "storytelling",
        title: "Storytelling",
        audience: "Найти свою историю и написать первый черновик",
        format: "1 месяц · 4–6 занятий",
        price: 60000,
        priceUnit: "за курс",
      },
      {
        id: "essay-review",
        title: "Essay Review",
        audience: "Разбор Personal Statement и Supplements",
        format: "2 раунда правок на каждое эссе",
        price: 15000,
        priceUnit: "за эссе",
      },
    ],
  },
];

export const directionById = Object.fromEntries(directions.map((d) => [d.id, d])) as Record<
  Direction["id"],
  Direction
>;
