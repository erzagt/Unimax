import type { Tone } from "@/components/ui";
import type { Access, Role } from "@/lib/auth";

export const roleTone: Record<Role, Tone> = { admin: "dark", teacher: "essay", student: "neutral" };
export const accessTone: Record<Access, Tone> = { active: "ielts", free: "outline" };
