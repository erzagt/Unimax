import Image from "next/image";
import { UserRound } from "lucide-react";
import { mentors } from "@content/mentors";
import { directionById } from "@content/directions";
import { Badge, Card, Reveal, Section } from "@/components/ui";

export function Mentors() {
  return (
    <Section
      id="mentors"
      eyebrow="Наставники"
      title="Наставник на каждом"
      italic="направлении."
      description="SAT, IELTS, внеклассные активности и эссе ведут разные специалисты — каждый в своей теме."
    >
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {mentors.map((m, i) => {
          const direction = directionById[m.direction];
          return (
            <li key={m.id}>
              <Reveal delay={i * 0.06} className="h-full">
                <Card padding="sm" className="h-full">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-line to-line-strong">
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={`${m.name}, наставник по ${direction.short}`}
                        fill
                        sizes="(min-width: 1024px) 270px, 50vw"
                        className="object-cover grayscale"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
                        <UserRound aria-hidden="true" className="size-12" strokeWidth={1.2} />
                        <span className="px-2 text-center text-xs">[ЗАГЛУШКА: фото]</span>
                      </div>
                    )}
                    <Badge tone={direction.id} className="absolute top-3 left-3">
                      {direction.short}
                    </Badge>
                  </div>
                  <div className="px-1 pt-4 pb-1 sm:pt-5">
                    <h3 className="font-serif text-lg font-medium text-ink sm:text-xl">{m.name}</h3>
                    <p className="mt-1 text-[13px] leading-snug text-muted sm:text-sm">{direction.title}</p>
                    <p className="mt-3 text-sm font-medium text-ink">{m.credential}</p>
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
