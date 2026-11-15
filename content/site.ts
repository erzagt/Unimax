/**
 * Общие данные сайта: контакты, навигация, тексты hero.
 * Всё в квадратных скобках — ЗАГЛУШКА, заменить реальными данными.
 */

const WHATSAPP_NUMBER = "77076691509";

export const site = {
  name: "UniPath",
  logo: "UniPath",
  description:
    "Подготовка учеников 9–10 классов к поступлению в зарубежные вузы: SAT, IELTS, внеклассные активности и эссе.",

  contacts: {
    phoneDisplay: "+7 707 669 15 09",
    phoneHref: "tel:+77076691509",
    whatsappNumber: WHATSAPP_NUMBER,
    whatsappHref: `https://wa.me/${WHATSAPP_NUMBER}`,
    instagramHandle: "[ЗАГЛУШКА: @instagram]",
    instagramHref: null as string | null, // например "https://instagram.com/unipath"
    email: "[ЗАГЛУШКА: email]",
    emailHref: null as string | null, // например "mailto:hello@unipath.kz"
    city: "[ЗАГЛУШКА: город]",
  },

  nav: [
    { label: "Направления", href: "/#directions" },
    { label: "Бесплатно", href: "/#free" },
    { label: "Пакеты", href: "/#packages" },
    { label: "Наставники", href: "/#mentors" },
  ],

  cta: { label: "Пробный урок", href: "/#apply" },

  hero: {
    title: "Твой путь в топ-вуз",
    italic: "начинается в 9 классе.",
    subtitle:
      "Готовим к SAT, IELTS, внеклассным активностям и эссе по понятному плану — с наставником на каждом шаге, от 9 класса до подачи заявок.",
    primary: { label: "Записаться бесплатно", href: "#apply" },
    secondary: { label: "Пройти мини-тест SAT", href: "/tools/sat-mini" },
    badge: "ПОСТУПЛЕНИЕ БЕЗ ПАНИКИ • ",
    leftCard: { title: "Превращаем цель в план.", text: "Шаг за шагом — от 9 класса до подачи." },
    rightCard: { title: "Наставник всегда рядом.", text: "Честная обратная связь по каждой работе." },
    studentsCount: "[N]", // ЗАГЛУШКА: реальное число учеников
    studentsLabel: "учеников готовятся с нами",
    tagline: ["Меньше стресса.", "Больше офферов."],
  },
} as const;

/** Ссылка на WhatsApp с предзаполненным текстом. */
export function whatsappLink(text: string) {
  return `${site.contacts.whatsappHref}?text=${encodeURIComponent(text)}`;
}
