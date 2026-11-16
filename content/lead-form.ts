/** Варианты для формы заявки. */
export const gradeOptions = [
  { value: "8", label: "8 класс" },
  { value: "9", label: "9 класс" },
  { value: "10", label: "10 класс" },
  { value: "11", label: "11 класс" },
  { value: "other", label: "Другое" },
] as const;

export const sectionOptions = [
  { value: "sat", label: "SAT" },
  { value: "ielts", label: "IELTS" },
  { value: "ec", label: "EC — внеклассные активности" },
  { value: "essay", label: "Эссе" },
  { value: "package", label: "Несколько направлений" },
  { value: "unknown", label: "Пока не знаю" },
] as const;
