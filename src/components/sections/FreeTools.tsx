import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { freeTools } from "@content/tools";
import { Badge, GlassCard, IconTile, Reveal, Section } from "@/components/ui";
import { ContentIcon } from "@/components/icons";

export function FreeTools() {
  return (
    <Section
      id="free"
      eyebrow="Бесплатно"
      title="Начни прямо сейчас —"
      italic="бесплатно."
      description="Три инструмента, чтобы понять свой уровень и следующий шаг. Без регистрации."
    >
      <ul className="grid gap-4 md:grid-cols-3 lg:gap-5">
        {freeTools.map((tool, i) => (
          <li key={tool.id}>
            <Reveal delay={i * 0.08} className="h-full">
              <Link
                href={tool.href}
                className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <GlassCard padding="lg" className="flex h-full flex-col transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <IconTile tone={tool.tone}>
                      <ContentIcon name={tool.icon} />
                    </IconTile>
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface transition-colors group-hover:bg-ink group-hover:text-white"
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <h3 className="mt-8 font-serif text-2xl font-medium text-ink">{tool.title}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{tool.description}</p>
                  <Badge tone="neutral" className="mt-6 self-start">
                    {tool.meta}
                  </Badge>
                </GlassCard>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
