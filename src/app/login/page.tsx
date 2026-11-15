import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, GlassCard, Heading } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Вход — UniPath",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center py-12">
      <Container className="flex max-w-[480px] flex-col items-center">
        <Logo className="mb-10" />
        <GlassCard padding="lg" className="w-full">
          <Heading as="h1" title="Вход в" italic="кабинет." className="mb-2 text-4xl" />
          <p className="mb-8 text-[15px] text-muted">Пришлём на почту ссылку — пароль не нужен.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </GlassCard>
      </Container>
    </main>
  );
}
