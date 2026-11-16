import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, GlassCard, Heading } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";

/** Общая рамка страниц входа/регистрации. */
export function AuthCard({
  title,
  italic,
  subtitle,
  children,
}: {
  title: string;
  italic: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center py-12">
      <Container className="flex max-w-[480px] flex-col items-center">
        <Logo className="mb-10" />
        <GlassCard padding="lg" className="w-full">
          <Heading as="h1" title={title} italic={italic} className="mb-2 text-4xl" />
          <p className="mb-8 text-[15px] text-muted">{subtitle}</p>
          {children}
        </GlassCard>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> На главную
        </Link>
      </Container>
    </main>
  );
}
