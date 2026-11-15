import { Check } from "lucide-react";
import { route } from "@content/route";
import { GlassCard, Reveal, Section } from "@/components/ui";

export function RouteTimeline() {
  return (
    <Section
      id="route"
      eyebrow="Маршрут"
      title="Два года до оффера —"
      italic="без авралов."
      description="Каждый этап закрывает свою задачу. К 11 классу у ученика готовы баллы, активности и история для эссе."
    >
      <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {/* Линия таймлайна */}
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-[1.15rem] w-px bg-line-strong md:hidden" />
        <span aria-hidden="true" className="absolute top-[1.15rem] right-0 left-0 hidden h-px bg-line-strong lg:block" />

        {route.map((step, i) => (
          <li key={step.id} className="relative pl-12 md:pl-0">
            <Reveal delay={i * 0.08}>
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 flex size-[2.3rem] items-center justify-center rounded-full border border-line-strong bg-surface text-sm font-medium text-ink md:relative md:mb-5"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <GlassCard padding="md" className="h-full rounded-[1.5rem]">
                <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">{step.period}</p>
                <h3 className="mt-2 font-serif text-2xl font-medium text-ink">{step.title}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {step.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[15px] leading-snug text-muted">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink" />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
