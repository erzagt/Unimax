import { ArrowRight, Play } from "lucide-react";
import { site } from "@content/site";
import { AvatarStack, Button, Container, Heading, IconTile } from "@/components/ui";
import { ContentIcon, SparkStar } from "@/components/icons";
import { cn } from "@/lib/utils";
import { AdmissionPuzzle } from "./AdmissionPuzzle";

const { hero } = site;

function RotatingBadge({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-28", className)} role="img" aria-label="Поступление без паники">
      <svg viewBox="0 0 100 100" className="size-full animate-spin-slow" aria-hidden="true">
        <defs>
          <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-ink text-[10.5px] font-medium">
          <textPath href="#badge-circle" textLength="236" lengthAdjust="spacing">
            {hero.badge}
          </textPath>
        </text>
      </svg>
      <SparkStar className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-ink" />
    </div>
  );
}

/** Тонкие линии от боковых карточек к кольцу (десктоп). */
function ConnectorLines() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden size-full xl:block"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M120 455 C 120 600, 250 640, 345 655"
        stroke="currentColor"
        className="text-ink/25"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M885 525 C 885 640, 780 690, 660 690"
        stroke="currentColor"
        className="text-ink/25"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <Container className="relative pt-10 sm:pt-14 lg:pt-16">
        <ConnectorLines />

        {/* Вращающийся бейдж */}
        <RotatingBadge className="absolute top-6 right-4 hidden xl:block" />

        {/* Боковые белые карточки (десктоп) */}
        <div className="absolute top-[24%] left-4 hidden w-56 -rotate-3 rounded-card bg-surface p-6 shadow-float xl:block">
          <IconTile tone="neutral" size="sm" className="mb-5">
            <ContentIcon name="route" />
          </IconTile>
          <p className="text-lg leading-snug font-medium text-ink">{hero.leftCard.title}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{hero.leftCard.text}</p>
        </div>
        <div className="absolute top-[32%] right-4 hidden w-56 rotate-3 rounded-card bg-surface p-6 shadow-float xl:block">
          <AvatarStack count={3} className="mb-5" />
          <p className="text-lg leading-snug font-medium text-ink">{hero.rightCard.title}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{hero.rightCard.text}</p>
        </div>

        {/* Текст */}
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <Heading
            as="h1"
            id="hero-title"
            title={hero.title}
            italic={hero.italic}
            breakBeforeItalic
            className="text-[2.6rem] leading-[1] tracking-[-0.035em] sm:text-6xl lg:text-[5.25rem] lg:leading-[0.98]"
          />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{hero.subtitle}</p>
          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button href={hero.primary.href} size="lg" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
              {hero.primary.label}
            </Button>
            <Button
              href={hero.secondary.href}
              size="lg"
              variant="secondary"
              iconLeft={
                <span className="flex size-6 items-center justify-center rounded-full bg-ink text-white">
                  <Play className="size-3 fill-current" aria-hidden="true" />
                </span>
              }
            >
              {hero.secondary.label}
            </Button>
          </div>
        </div>

        {/* Сцена: пазл поступления */}
        <div className="relative mx-auto mt-8 max-w-[640px] pb-10 lg:mt-4 lg:pb-20">
          {/* На телефоне пазл шире экрана: поле деталей занимает всю ширину, края с выпавшими деталями обрезаются */}
          <AdmissionPuzzle className="relative left-1/2 w-[120vw] max-w-none -translate-x-1/2 sm:static sm:w-full sm:translate-x-0" />

          {/* Нижние подписи (десктоп) */}
          <div className="absolute bottom-16 left-[-38%] hidden xl:block">
            <span aria-hidden="true" className="mb-4 block h-px w-8 bg-line-strong" />
            <p className="text-[15px] leading-snug text-muted">
              <span className="font-semibold text-ink">{hero.studentsCount}</span> {hero.studentsLabel}
            </p>
            <AvatarStack count={4} className="mt-4" />
          </div>
          <div className="absolute right-[-38%] bottom-20 hidden xl:block">
            <SparkStar className="mb-6 ml-10 size-6 text-ink" />
            <div className="flex items-start gap-4">
              <span aria-hidden="true" className="mt-3 block h-px w-8 bg-line-strong" />
              <p className="text-[15px] leading-snug text-muted">
                {hero.tagline[0]}
                <br />
                {hero.tagline[1]}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Нижние подписи для экранов уже 1280px */}
      <div className="relative z-10 xl:hidden">
        <Container className="flex flex-col gap-6 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <div className="flex items-center gap-4">
            <AvatarStack count={4} />
            <p className="text-sm leading-snug text-muted">
              <span className="font-semibold text-ink">{hero.studentsCount}</span> {hero.studentsLabel}
            </p>
          </div>
          <p className="flex items-center gap-3 text-sm text-muted">
            <SparkStar className="size-4 text-ink" />
            {hero.tagline.join(" ")}
          </p>
        </Container>
      </div>
    </section>
  );
}
