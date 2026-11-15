import { ArrowRight, Check } from "lucide-react";
import { packages } from "@content/packages";
import { Badge, Button, Card, Reveal, Section } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Packages() {
  return (
    <Section
      id="packages"
      eyebrow="Пакеты"
      title="Выбери свой"
      italic="темп."
      description="Пакеты собраны под класс ученика. Можно начать с одного года и продлить."
    >
      <ul className="grid gap-4 lg:grid-cols-3 lg:items-stretch lg:gap-5">
        {packages.map((p, i) => {
          const dark = Boolean(p.highlighted);
          return (
            <li key={p.id}>
              <Reveal delay={i * 0.08} className="h-full">
                <Card tone={dark ? "dark" : "light"} padding="lg" className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={cn("text-xs font-medium tracking-[0.16em] uppercase", dark ? "text-white/70" : "text-muted")}>
                      {p.duration}
                    </p>
                    {p.badge && (
                      <Badge tone={dark ? "neutral" : "dark"} className={cn(dark && "bg-white text-ink")}>
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className={cn("mt-4 font-serif text-4xl font-medium", dark ? "text-white" : "text-ink")}>
                    {p.name}
                  </h3>
                  <p className={cn("mt-2 text-[15px]", dark ? "text-white/75" : "text-muted")}>{p.subtitle}</p>

                  <ul className={cn("mt-7 flex flex-col gap-3 border-t pt-6", dark ? "border-white/15" : "border-line")}>
                    {p.features.map((f) => (
                      <li key={f} className={cn("flex gap-3 text-[15px] leading-snug", dark ? "text-white/90" : "text-ink")}>
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-10">
                    <p className={cn("text-3xl font-semibold", dark ? "text-white" : "text-ink")}>{p.price} ₸</p>
                    <p className={cn("mt-1 text-sm", dark ? "text-white/70" : "text-muted")}>{p.priceNote}</p>
                    <Button
                      href="#apply"
                      variant={dark ? "inverse" : "primary"}
                      size="lg"
                      className="mt-6 w-full"
                      icon={<ArrowRight className="size-4" aria-hidden="true" />}
                    >
                      Выбрать<span className="sr-only"> пакет «{p.name}»</span>
                    </Button>
                  </div>
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
