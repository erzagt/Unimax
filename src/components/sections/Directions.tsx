import { ArrowRight } from "lucide-react";
import { directions } from "@content/directions";
import { Badge, Button, Card, IconTile, Reveal, Section } from "@/components/ui";
import { ContentIcon } from "@/components/icons";

export function Directions() {
  return (
    <Section
      id="directions"
      eyebrow="4 направления"
      title="Всё, что смотрит"
      italic="приёмная комиссия."
      description="Баллы открывают дверь, активности и эссе показывают, кто ты. Готовим ко всему — отдельно или пакетом."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5">
        {directions.map((d, i) => (
          <li key={d.id}>
            <Reveal delay={(i % 2) * 0.08} className="h-full">
              <Card padding="lg" className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <IconTile tone={d.id}>
                    <ContentIcon name={d.icon} />
                  </IconTile>
                  <Badge tone="outline">{d.goal}</Badge>
                </div>
                <h3 className="mt-6 font-serif text-3xl font-medium text-ink">{d.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{d.description}</p>

                <div className="mt-6 border-t border-line pt-5">
                  <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">Курсы внутри</p>
                  <ul className="mt-3 flex flex-col gap-3">
                    {d.courses.map((c) => (
                      <li key={c.id} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                        <span className="font-medium text-ink">{c.title}</span>
                        <span className="text-sm text-muted">— {c.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
                  <p className="text-ink">
                    <span className="text-sm text-muted">от </span>
                    <span className="text-xl font-semibold">{d.priceFrom} ₸</span>
                  </p>
                  <Button href="#apply" variant="secondary" size="sm" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
                    Записаться<span className="sr-only"> на {d.short}</span>
                  </Button>
                </div>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
