import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFlow } from "@/components/auth/AuthFlow";

export const metadata: Metadata = {
  title: "Вход — UniPath",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard title="Вход в" italic="кабинет." subtitle="Пришлём на почту код и ссылку для входа — пароль не нужен.">
      <Suspense>
        <AuthFlow key="login" mode="login" />
      </Suspense>
    </AuthCard>
  );
}
