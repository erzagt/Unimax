import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Heading } from "@/components/ui";
import { AdminFrame, type AdminAuth } from "@/components/admin/AdminFrame";
import { AUDIT_LABELS } from "@/lib/admin/audit";
import { ACCESS_LABELS, ROLE_LABELS, type Access, type Role } from "@/lib/auth";
import { formatDate, statusLabel } from "@/lib/leads-format";

export const metadata: Metadata = {
  title: "Журнал — админка UniPath",
  robots: { index: false, follow: false },
};

type LogRow = {
  id: number;
  created_at: string;
  actor_email: string | null;
  action: string;
  target_type: "user" | "lead";
  target_id: string | null;
  target_label: string | null;
  details: Record<string, string>;
};

export default function LogPage() {
  return <AdminFrame active="log" next="/admin/log" render={(auth) => <LogView auth={auth} />} />;
}

function describe(r: LogRow) {
  const d = r.details ?? {};
  if (r.action === "role_change") return `${ROLE_LABELS[d.from as Role] ?? d.from} → ${ROLE_LABELS[d.to as Role] ?? d.to}`;
  if (r.action === "access_change") return `${ACCESS_LABELS[d.from as Access] ?? d.from} → ${ACCESS_LABELS[d.to as Access] ?? d.to}`;
  if (r.action === "lead_status" && d.status) return `статус: ${statusLabel(d.status)}`;
  if (r.action === "invite" && d.role) return `роль: ${ROLE_LABELS[d.role as Role] ?? d.role}`;
  return "";
}

async function LogView({ auth }: { auth: AdminAuth }) {
  const { data, error } = await auth.supabase
    .from("admin_audit_log")
    .select("id, created_at, actor_email, action, target_type, target_id, target_label, details")
    .order("created_at", { ascending: false })
    .limit(300)
    .returns<LogRow[]>();

  return (
    <Container className="max-w-[920px] py-8 sm:py-10">
      <Heading as="h1" title="Журнал" italic="действий." className="text-4xl sm:text-5xl" />
      <p className="mt-3 text-[15px] text-muted">Кто из админов и когда менял роли, доступ, блокировки, удалял аккаунты и заявки. Последние 300 записей.</p>

      {error && (
        <p role="alert" className="mt-8 text-danger">
          Не удалось загрузить журнал: {error.message}
        </p>
      )}
      {data && data.length === 0 && (
        <Card padding="lg" className="mt-8 text-center">
          <p className="text-muted">Записей пока нет.</p>
        </Card>
      )}

      <ol className="mt-8 flex flex-col gap-2">
        {data?.map((r) => {
          const extra = describe(r);
          const label = r.target_label ?? r.target_id ?? "";
          const linkable = r.target_type === "user" && r.action !== "delete_user" && r.target_id;
          return (
            <li key={r.id}>
              <Card padding="sm" className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="shrink-0 text-sm text-muted tabular-nums">{formatDate(r.created_at)}</span>
                <p className="text-[15px] text-ink">
                  <span className="font-medium">{r.actor_email ?? "—"}</span> · {AUDIT_LABELS[r.action] ?? r.action}
                  {label && (
                    <>
                      {": "}
                      {linkable ? (
                        <Link href={`/admin/users/${r.target_id}`} className="underline underline-offset-4">
                          {label}
                        </Link>
                      ) : (
                        <span>{label}</span>
                      )}
                    </>
                  )}
                  {extra && <span className="text-muted"> ({extra})</span>}
                </p>
              </Card>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}
