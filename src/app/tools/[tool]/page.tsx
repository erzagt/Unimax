import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { freeTools } from "@content/tools";
import { site } from "@content/site";
import { Badge, Button, Container, GlassCard, Heading, IconTile } from "@/components/ui";
import { ContentIcon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * ВРЕМЕННАЯ страница-заглушка для бесплатных инструментов.
 * На этапе 3 заменяется реальными страницами /tools/essay-check, /tools/sat-mini, /tools/chances.
 */

export function generateStaticParams() {
  return freeTools.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[tool]">): Promise<Metadata> {
  const { tool } = await params;
  const item = freeTools.find((t) => t.id === tool);
  return { title: item ? `${item.title} — ${site.name}` : site.name };
}

export default async function ToolPlaceholderPage({ params }: PageProps<"/tools/[tool]">) {
  const { tool } = await params;
  const item = freeTools.find((t) => t.id === tool);
  if (!item) notFound();

  return (
    <>
      <Navbar />
      <main className="py-section lg:py-section-lg">
        <Container className="max-w-[720px]">
          <GlassCard padding="lg" className="text-center">
            <IconTile tone={item.tone} className="mx-auto">
              <ContentIcon name={item.icon} />
            </IconTile>
            <Badge tone="outline" className="mt-6">
              Скоро
            </Badge>
            <Heading as="h1" title={item.title} className="mt-4 text-4xl sm:text-5xl" />
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">{item.description}</p>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted">
              Инструмент появится совсем скоро. А пока можно записаться на бесплатный пробный урок.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/#apply">Записаться бесплатно</Button>
              <Button href="/" variant="secondary" iconLeft={<ArrowLeft className="size-4" aria-hidden="true" />}>
                На главную
              </Button>
            </div>
          </GlassCard>
        </Container>
      </main>
      <Footer />
    </>
  );
}
