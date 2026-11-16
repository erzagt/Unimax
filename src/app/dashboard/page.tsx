import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  ClipboardList,
  FileText,
  Lock,
  LogOut,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import { freeTools } from "@content/tools";
import { site, whatsappLink } from "@content/site";
import { Badge, Button, Card, Container, GlassCard, Heading, IconTile, type Tone } from "@/components/ui";
import { ContentIcon, WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { getSession, type Session } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Личный кабинет — UniPath",
  robots: { index: false, follow: false },
};

const sections: { icon: typeof BookOpen; title: string; tone: Exclude<Tone, "outline"> }[] = [
  { icon: BookOpen, title: "Курсы и расписание", tone: "sat" },
  { icon: ClipboardList, title: "Домашние задания", tone: "ielts" },
  { icon: Trophy, title: "Пробные тесты и прогресс", tone: "ec" },
  { icon: FileText, title: "Эссе с разбором наставника", tone: "essay" },
  { icon: CalendarClock, title: "Дедлайны поступления", tone: "neutral" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-dvh pb-16">
      <Suspense fallback={<Container className="py-10" aria-busy="true" />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

function Header({ session }: { session: Session }) {
  return (
    <header className="border-b border-line">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <form action="/auth/signout" method="post" className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">{session.user.email}</span>
          <Button type="submit" variant="ghost" size="sm" iconLeft={<LogOut className="size-4" aria-hidden="true" />}>
            Выйти
          </Button>
        </form>
      </Container>
    </header>
  );
}

async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const name = session.fullName?.split(" ")[0];
  const hello = name ? `Привет, ${name}!` : "Привет!";

  return (
    <>
      <Header session={session} />
      <Container className="py-10">
        {session.blocked ? (
          <Blocked />
        ) : session.role === "admin" ? (
          <StaffView hello={hello} text="Вы администратор. Управление заявками и пользователями — в админке." admin />
        ) : session.role === "teacher" ? (
          <StaffView hello={hello} text="Кабинет учителя с вашими учениками, расписанием и проверкой работ появится совсем скоро." />
        ) : session.access === "active" ? (
          <StudentView hello={hello} />
        ) : (
          <FreeView hello={hello} />
        )}
      </Container>
    </>
  );
}

/** Аккаунт заблокирован админом. */
function Blocked() {
  return (
    <Card padding="lg" className="max-w-xl">
      <IconTile tone="neutral">
        <ShieldAlert />
      </IconTile>
      <h1 className="mt-6 font-serif text-3xl text-ink">Доступ приостановлен</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Ваш аккаунт временно заблокирован. Если это ошибка — напишите нам, разберёмся.
      </p>
      <Button
        href={site.contacts.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6"
        iconLeft={<WhatsAppIcon className="size-5" />}
      >
        Написать в WhatsApp
      </Button>
    </Card>
  );
}

function StaffView({ hello, text, admin }: { hello: string; text: string; admin?: boolean }) {
  return (
    <>
      <Heading as="h1" title={hello} className="text-4xl sm:text-5xl" />
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{text}</p>
      {admin && (
        <Button href="/admin" className="mt-6" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
          Перейти в админку
        </Button>
      )}
    </>
  );
}

/** Ученик с оплаченным доступом. Наполнение разделов — этап 4. */
function StudentView({ hello }: { hello: string }) {
  return (
    <>
      <Heading as="h1" title={hello} italic="Твой кабинет." className="text-4xl sm:text-5xl" breakBeforeItalic />
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Здесь будут уроки, домашние задания, пробные тесты и эссе. Разделы появятся совсем скоро.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ icon: Icon, title, tone }) => (
          <li key={title}>
            <Card padding="md" className="flex items-center gap-4">
              <IconTile tone={tone}>
                <Icon />
              </IconTile>
              <div>
                <p className="font-medium text-ink">{title}</p>
                <Badge tone="outline" className="mt-1">
                  Скоро
                </Badge>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Бесплатный аккаунт: инструменты + закрытые разделы + запись на курс. */
function FreeView({ hello }: { hello: string }) {
  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="outline">Бесплатный аккаунт</Badge>
          <Heading
            as="h1"
            title={hello}
            italic="Добро пожаловать."
            className="mt-4 text-4xl sm:text-5xl"
            breakBeforeItalic
          />
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            Попробуй бесплатные инструменты, чтобы понять свой уровень. Полный кабинет с уроками и наставником
            откроется после записи на курс.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/#apply" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
            Записаться на пробный урок
          </Button>
          <Button
            href={whatsappLink(`Здравствуйте! Я зарегистрировался в ${site.name} и хочу узнать про курсы.`)}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            iconLeft={<WhatsAppIcon className="size-5" />}
          >
            Спросить в WhatsApp
          </Button>
        </div>
      </div>

      <h2 className="mt-12 text-xs font-medium tracking-[0.16em] text-muted uppercase">Доступно бесплатно</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {freeTools.map((tool) => (
          <li key={tool.id}>
            <Link
              href={tool.href}
              className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              <GlassCard padding="md" className="flex h-full flex-col transition-transform duration-300 group-hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <IconTile tone={tool.tone}>
                    <ContentIcon name={tool.icon} />
                  </IconTile>
                  <ArrowUpRight aria-hidden="true" className="size-5 text-muted" />
                </div>
                <p className="mt-6 font-serif text-xl text-ink">{tool.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tool.meta}</p>
              </GlassCard>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-xs font-medium tracking-[0.16em] text-muted uppercase">Для учеников UniPath</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ icon: Icon, title }) => (
          <li key={title}>
            <Card padding="md" className="flex items-center gap-4 bg-surface/60">
              <IconTile tone="neutral" className="opacity-60">
                <Icon />
              </IconTile>
              <div>
                <p className="font-medium text-muted">{title}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
                  <Lock aria-hidden="true" className="size-3.5" /> Откроется после записи на курс
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
