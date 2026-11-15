import type { Mentor } from "./types";

/**
 * Наставники. Имена, баллы/вузы и фото — ЗАГЛУШКИ.
 * Фото класть в /public/mentors/<id>.jpg и указывать путь в photo.
 */
export const mentors: Mentor[] = [
  { id: "mentor-sat", name: "[Имя]", direction: "sat", credential: "[балл/вуз]", photo: null },
  { id: "mentor-ielts", name: "[Имя]", direction: "ielts", credential: "[балл/вуз]", photo: null },
  { id: "mentor-ec", name: "[Имя]", direction: "ec", credential: "[балл/вуз]", photo: null },
  { id: "mentor-essay", name: "[Имя]", direction: "essay", credential: "[балл/вуз]", photo: null },
];
