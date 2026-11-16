import { ArrowRight, Users } from "lucide-react";
import { directions } from "@content/directions";
import { Badge, Button, Card, IconTile, Reveal, Section } from "@/components/ui";
import { ContentIcon } from "@/components/icons";

const money = new Intl.NumberFormat("ru-RU");

export function Directions() {
  return (
    <Section
      id="directions"
      eyebrow="4 направления · 8 курсов"
      title="Всё, что смотрит"
      italic="приёмная комиссия."
      description="Баллы открывают дверь, активности и эссе показывают, кто ты. Выбирай курс под свою задачу — можно несколько."
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

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {d.courses.map((c) => (
                    <li key={c.id} className="rounded-2xl border border-line bg-canvas/50 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="text-base font-semibold text-ink">{c.title}</p>
                        <p className="text-ink">
                          <span className="text-sm text-muted">от </span>
                          <span className="font-semibold">{money.format(c.price)} ₸</span>
                          <span className="text-sm text-muted"> {c.priceUnit}</span>
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-ink">{c.audience}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{c.format}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex justify-end">
                  <Button href="#apply" variant="secondary" size="sm" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
                    Записаться<span className="sr-only"> на {d.short}</span>
                  </Button>
                </div>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted">
        <Users aria-hidden="true" className="size-4 shrink-0" />
        Все занятия онлайн. SAT, IELTS и Storytelling — в потоках до 15–20 учеников; EC Roadmap, Project Lab и Essay Review — индивидуально с наставником.
      </p>
    </Section>
  );
}
