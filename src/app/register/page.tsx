import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFlow } from "@/components/auth/AuthFlow";

export const metadata: Metadata = {
  title: "Регистрация — UniPath",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Создать"
      italic="аккаунт."
      subtitle="Личный кабинет ученика: уроки, домашние задания, пробные тесты и эссе."
    >
      <Suspense>
        <AuthFlow key="register" mode="register" />
      </Suspense>
    </AuthCard>
  );
}
