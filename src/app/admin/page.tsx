import type { Metadata } from "next";
import Link from "next/link";
import { Download, MessageCircle, Phone, Trash2, UserRound } from "lucide-react";
import { sectionOptions } from "@content/lead-form";
import { Badge, Button, Card, Container, Heading, Select, type Tone } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminFrame, type AdminAuth } from "@/components/admin/AdminFrame";
import { LEAD_COLUMNS, type LeadRow } from "@/lib/leads";
import { formatDate, formatPhone, gradeLabel, sectionLabel, sourceLabel } from "@/lib/leads-format";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  leadFiltersSchema,
  type LeadFilters,
  type LeadStatus,
} from "@/lib/validation/lead";
import { LeadEditor } from "./LeadEditor";
import { LeadAccountForm } from "./LeadAccountForm";
import { deleteLead } from "./users/actions";

export const metadata: Metadata = {
  title: "Заявки — админка UniPath",
  robots: { index: false, follow: false },
};

const statusTone: Record<LeadStatus, Tone> = {
  new: "dark",
  contacted: "essay",
  trial: "sat",
  paid: "ielts",
  lost: "neutral",
};

const toOptions = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <AdminFrame
      active="leads"
      next="/admin"
      render={async (auth) => <LeadsView supabase={auth.supabase} filters={leadFiltersSchema.parse(await searchParams)} />}
    />
  );
}

function exportHref(filters: LeadFilters) {
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
  return `/admin/leads/export${qs ? `?${qs}` : ""}`;
}

async function LeadsView({
  supabase,
  filters,
}: {
  supabase: AdminAuth["supabase"];
  filters: LeadFilters;
}) {
  let query = supabase.from("leads").select(`${LEAD_COLUMNS}, profile_id`).order("created_at", { ascending: false }).limit(500);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.section) query = query.eq("section", filters.section);
  if (filters.source) query = query.eq("source", filters.source);

  const [{ data: leads, error }, { data: allStatuses }] = await Promise.all([
    query.returns<(LeadRow & { profile_id: string | null })[]>(),
    supabase.from("leads").select("status").returns<{ status: LeadStatus }[]>(),
  ]);

  const counts = Object.fromEntries(Object.keys(LEAD_STATUSES).map((s) => [s, 0])) as Record<LeadStatus, number>;
  allStatuses?.forEach((r) => (counts[r.status] += 1));
  const total = allStatuses?.length ?? 0;
  const hasFilters = Boolean(filters.status || filters.section || filters.source);

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading as="h1" title="Заявки" italic={`· ${total}`} className="text-4xl sm:text-5xl" />
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Количество заявок по статусам">
            {(Object.keys(LEAD_STATUSES) as LeadStatus[]).map((s) => (
              <li key={s}>
                <Link href={`/admin?status=${s}`} className="rounded-full focus-visible:outline-2 focus-visible:outline-ink">
                  <Badge tone={statusTone[s]}>
                    {LEAD_STATUSES[s]}: {counts[s]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Button
          href={exportHref(filters)}
          variant="secondary"
          iconLeft={<Download className="size-4" aria-hidden="true" />}
          download
        >
          Экспорт CSV
        </Button>
      </div>

      {/* Фильтры: обычная GET-форма, работает и без JS */}
      <Card padding="sm" className="mt-8">
        <form method="get" action="/admin" className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <Select
            name="status"
            label="Статус"
            options={[{ value: "", label: "Все" }, ...toOptions(LEAD_STATUSES)]}
            defaultValue={filters.status ?? ""}
          />
          <Select
            name="section"
            label="Направление"
            options={[{ value: "", label: "Все" }, ...sectionOptions]}
            defaultValue={filters.section ?? ""}
          />
          <Select
            name="source"
            label="Источник"
            options={[{ value: "", label: "Все" }, ...toOptions(LEAD_SOURCES)]}
            defaultValue={filters.source ?? ""}
          />
          <div className="flex gap-2">
            <Button type="submit" className="h-12">
              Применить
            </Button>
            {hasFilters && (
              <Button href="/admin" variant="ghost" className="h-12">
                Сбросить
              </Button>
            )}
          </div>
        </form>
      </Card>

      {error && (
        <p role="alert" className="mt-8 text-danger">
          Не удалось загрузить заявки: {error.message}
        </p>
      )}

      {leads && leads.length === 0 && (
        <Card padding="lg" className="mt-8 text-center">
          <p className="text-muted">{hasFilters ? "По этим фильтрам заявок нет." : "Заявок пока нет."}</p>
        </Card>
      )}

      <ul className="mt-8 flex flex-col gap-4">
        {leads?.map((lead) => (
          <li key={lead.id}>
            <Card padding="md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-ink">{lead.name}</h2>
                    <Badge tone={statusTone[lead.status]}>{LEAD_STATUSES[lead.status]}</Badge>
                    <Badge tone="outline">{sourceLabel(lead.source)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(lead.created_at)} · {gradeLabel(lead.grade)} · {sectionLabel(lead.section)}
                  </p>
                  {lead.comment && (
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed whitespace-pre-line text-ink">{lead.comment}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    href={`https://wa.me/${lead.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    iconLeft={<WhatsAppIcon className="size-4" />}
                  >
                    {formatPhone(lead.phone)}
                  </Button>
                  <Button
                    href={`tel:+${lead.phone}`}
                    size="sm"
                    variant="secondary"
                    iconLeft={<Phone className="size-4" aria-hidden="true" />}
                  >
                    Позвонить
                  </Button>
                </div>
              </div>
              <div className="mt-5 border-t border-line pt-5">
                <LeadEditor id={lead.id} status={lead.status} notes={lead.notes} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {lead.profile_id ? (
                  <Button
                    href={`/admin/users/${lead.profile_id}`}
                    variant="ghost"
                    size="sm"
                    iconLeft={<UserRound className="size-4" aria-hidden="true" />}
                  >
                    Аккаунт ученика
                  </Button>
                ) : (
                  <details className="group w-full rounded-2xl border border-line px-4 py-3 sm:w-auto sm:min-w-[60%] [&[open]]:w-full">
                    <summary className="cursor-pointer list-none text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                      <UserRound aria-hidden="true" className="mr-2 inline size-4" />
                      Создать аккаунт ученика
                    </summary>
                    <div className="mt-4">
                      <LeadAccountForm leadId={lead.id} />
                    </div>
                  </details>
                )}
                <ActionForm
                  action={deleteLead}
                  fields={{ id: lead.id }}
                  label="Удалить заявку"
                  variant="danger"
                  icon={<Trash2 className="size-4" aria-hidden="true" />}
                  confirmText={`Удалить заявку «${lead.name}» навсегда?`}
                />
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {leads && leads.length === 500 && (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <MessageCircle aria-hidden="true" className="size-4" /> Показаны последние 500 заявок. Используйте фильтры
          или экспорт CSV.
        </p>
      )}
    </Container>
  );
}
