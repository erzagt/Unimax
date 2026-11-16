import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BookOpen, CalendarClock, ClipboardList, FileText, LogOut, Trophy } from "lucide-react";
import { Badge, Button, Card, Container, Heading, IconTile } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Личный кабинет — UniPath",
  robots: { index: false, follow: false },
};

const soon = [
  { icon: BookOpen, title: "Курсы и расписание", tone: "sat" as const },
  { icon: ClipboardList, title: "Домашние задания", tone: "ielts" as const },
  { icon: Trophy, title: "Пробные тесты и прогресс", tone: "ec" as const },
  { icon: FileText, title: "Эссе с разбором", tone: "essay" as const },
  { icon: CalendarClock, title: "Дедлайны поступления", tone: "neutral" as const },
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

/** ВРЕМЕННАЯ страница кабинета. Полноценный кабинет — этап 4. */
async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const name = session.fullName?.split(" ")[0];

  return (
    <>
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
      <Container className="py-10">
        <Heading as="h1" title={name ? `Привет, ${name}!` : "Привет!"} italic="Кабинет готовится." className="text-4xl sm:text-5xl" breakBeforeItalic />
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          Аккаунт создан. Совсем скоро здесь появится всё для подготовки — а пока наставник свяжется с вами по
          поводу пробного урока.
        </p>
        {session.role === "admin" && (
          <Button href="/admin" className="mt-6">
            Перейти в админку
          </Button>
        )}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {soon.map(({ icon: Icon, title, tone }) => (
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
      </Container>
    </>
  );
}
