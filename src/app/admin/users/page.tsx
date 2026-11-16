import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Download, Lock, Search } from "lucide-react";
import { Badge, Button, Card, Container, Heading, Input, Select } from "@/components/ui";
import { accessTone, roleTone } from "@/components/admin/tones";
import { AdminFrame, type AdminAuth } from "@/components/admin/AdminFrame";
import { ACCESS_LABELS, ROLE_LABELS } from "@/lib/auth";
import { queryUsers } from "@/lib/admin/user-query";
import { formatDate, gradeLabel } from "@/lib/leads-format";
import { userFiltersSchema, type UserFilters } from "@/lib/validation/admin";
import { InviteForm } from "./InviteForm";

export const metadata: Metadata = {
  title: "Пользователи — админка UniPath",
  robots: { index: false, follow: false },
};

const toOptions = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));

export default function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <AdminFrame
      active="users"
      next="/admin/users"
      render={async (auth) => <UsersView auth={auth} filters={userFiltersSchema.parse(await searchParams)} />}
    />
  );
}

function qs(filters: UserFilters) {
  const s = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
  return s ? `?${s}` : "";
}

async function UsersView({ auth, filters }: { auth: AdminAuth; filters: UserFilters }) {
  const { data: users, error } = await queryUsers(auth.supabase, filters);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Heading as="h1" title="Пользователи" italic={`· ${users?.length ?? 0}`} className="text-4xl sm:text-5xl" />
        <Button
          href={`/admin/users/export${qs(filters)}`}
          download
          variant="secondary"
          iconLeft={<Download className="size-4" aria-hidden="true" />}
        >
          Экспорт CSV
        </Button>
      </div>

      <Card padding="sm" className="mt-8">
        <h2 className="mb-4 text-sm font-medium tracking-wide text-muted uppercase">Пригласить по email</h2>
        <InviteForm />
      </Card>

      <Card padding="sm" className="mt-4">
        <form method="get" action="/admin/users" className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end">
          <Input name="q" label="Поиск" placeholder="Имя, email или телефон" defaultValue={filters.q ?? ""} />
          <Select name="role" label="Роль" options={[{ value: "", label: "Все" }, ...toOptions(ROLE_LABELS)]} defaultValue={filters.role ?? ""} />
          <Select name="access" label="Доступ" options={[{ value: "", label: "Все" }, ...toOptions(ACCESS_LABELS)]} defaultValue={filters.access ?? ""} />
          <Select
            name="blocked"
            label="Статус"
            options={[
              { value: "", label: "Все" },
              { value: "no", label: "Активные" },
              { value: "yes", label: "Заблокированные" },
            ]}
            defaultValue={filters.blocked ?? ""}
          />
          <div className="flex gap-2">
            <Button type="submit" className="h-12" iconLeft={<Search className="size-4" aria-hidden="true" />}>
              Найти
            </Button>
            {hasFilters && (
              <Button href="/admin/users" variant="ghost" className="h-12">
                Сбросить
              </Button>
            )}
          </div>
        </form>
      </Card>

      {error && (
        <p role="alert" className="mt-8 text-danger">
          Не удалось загрузить пользователей: {error.message}
        </p>
      )}
      {users && users.length === 0 && (
        <Card padding="lg" className="mt-8 text-center">
          <p className="text-muted">{hasFilters ? "Никого не нашли." : "Пользователей пока нет."}</p>
        </Card>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {users?.map((u) => (
          <li key={u.id}>
            <Link
              href={`/admin/users/${u.id}`}
              className="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <Card padding="sm" className="flex items-center gap-4 transition-colors group-hover:border-line-strong">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{u.full_name || "Без имени"}</p>
                    <Badge tone={roleTone[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                    {u.role === "student" && <Badge tone={accessTone[u.access]}>{ACCESS_LABELS[u.access]}</Badge>}
                    {u.blocked_at && (
                      <Badge tone="neutral" className="text-danger">
                        <Lock aria-hidden="true" className="size-3" /> Заблокирован
                      </Badge>
                    )}
                    {u.id === auth.user.id && <Badge tone="outline">Это вы</Badge>}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">
                    {u.email}
                    {u.grade ? ` · ${gradeLabel(u.grade)}` : ""} · с {formatDate(u.created_at).slice(0, 10)}
                  </p>
                </div>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
