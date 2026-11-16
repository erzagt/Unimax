import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { Badge, Button, Card, Container } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";
import { getAuth, type AuthState } from "@/lib/auth";
import { cn } from "@/lib/utils";

export type AdminTab = "leads" | "users" | "log";
export type AdminAuth = Extract<AuthState, { status: "ok" }>;

const tabs: { id: AdminTab; label: string; href: string }[] = [
  { id: "leads", label: "Заявки", href: "/admin" },
  { id: "users", label: "Пользователи", href: "/admin/users" },
  { id: "log", label: "Журнал", href: "/admin/log" },
];

function AdminHeader({ email, active }: { email?: string; active: AdminTab }) {
  return (
    <header className="border-b border-line bg-canvas/80">
      <Container className="flex flex-col gap-3 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge tone="outline">Админка</Badge>
          </div>
          {email && (
            <form action="/auth/signout" method="post" className="sm:hidden">
              <Button type="submit" variant="ghost" size="sm" iconLeft={<LogOut className="size-4" aria-hidden="true" />}>
                Выйти
              </Button>
            </form>
          )}
        </div>
        {email && (
          <nav aria-label="Разделы админки" className="-mx-1 overflow-x-auto">
            <ul className="flex gap-1 rounded-full border border-line bg-surface/70 p-1">
              {tabs.map((t) => (
                <li key={t.id}>
                  <Link
                    href={t.href}
                    aria-current={t.id === active ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-colors",
                      t.id === active ? "bg-ink text-white" : "text-ink hover:bg-canvas",
                    )}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {email && (
          <form action="/auth/signout" method="post" className="hidden items-center gap-3 sm:flex">
            <span className="hidden text-sm text-muted lg:inline">{email}</span>
            <Button type="submit" variant="ghost" size="sm" iconLeft={<LogOut className="size-4" aria-hidden="true" />}>
              Выйти
            </Button>
          </form>
        )}
      </Container>
    </header>
  );
}

function AdminSkeleton() {
  return (
    <Container className="py-10" aria-busy="true">
      <div className="h-10 w-48 animate-pulse rounded-full bg-line" />
      <div className="mt-8 h-64 animate-pulse rounded-card bg-line/60" />
    </Container>
  );
}

function Message({ title, text }: { title: string; text: ReactNode }) {
  return (
    <Container className="py-10">
      <Card padding="lg" className="max-w-2xl">
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        <div className="mt-3 text-[15px] leading-relaxed text-muted">{text}</div>
      </Card>
    </Container>
  );
}

type Render = (auth: AdminAuth) => Promise<ReactNode> | ReactNode;

async function Gate({ active, render, next }: { active: AdminTab; render: Render; next: string }) {
  const auth = await getAuth("admin");
  if (auth.status === "anonymous") redirect(`/login?next=${encodeURIComponent(next)}`);
  if (auth.status === "unconfigured") {
    return (
      <>
        <AdminHeader active={active} />
        <Message
          title="Supabase не подключён"
          text="Заполните переменные Supabase в .env.local или в настройках Vercel (см. supabase/README.md)."
        />
      </>
    );
  }
  if (auth.status === "forbidden") {
    return (
      <>
        <AdminHeader active={active} email={auth.user.email} />
        <Message title="Нет доступа" text="У этого аккаунта нет роли администратора." />
      </>
    );
  }
  return (
    <>
      <AdminHeader active={active} email={auth.user.email} />
      {await render(auth)}
    </>
  );
}

/** Рамка страницы админки: проверка роли, шапка с вкладками, стриминг контента. */
export function AdminFrame({ active, next, render }: { active: AdminTab; next: string; render: Render }) {
  return (
    <main className="min-h-dvh pb-16">
      <Suspense fallback={<AdminSkeleton />}>
        <Gate active={active} render={render} next={next} />
      </Suspense>
    </main>
  );
}
