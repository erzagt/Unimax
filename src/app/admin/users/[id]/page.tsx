import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, LockOpen, Mail, Trash2 } from "lucide-react";
import { Badge, Button, Card, Container, Heading } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminFrame, type AdminAuth } from "@/components/admin/AdminFrame";
import { accessTone, roleTone } from "@/components/admin/tones";
import { ACCESS_LABELS, ROLE_LABELS } from "@/lib/auth";
import { PROFILE_COLUMNS, type ProfileRow } from "@/lib/admin/user-query";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatPhone, statusLabel } from "@/lib/leads-format";
import { deleteUser, sendLink, setBlocked } from "../actions";
import { NotesForm, ProfileForm, RoleAccessForm } from "./UserForms";

export const metadata: Metadata = {
  title: "Пользователь — админка UniPath",
  robots: { index: false, follow: false },
};

export default function UserPage({ params }: PageProps<"/admin/users/[id]">) {
  return (
    <AdminFrame
      active="users"
      next="/admin/users"
      render={async (auth) => <UserCard auth={auth} id={(await params).id} />}
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding="md">
      <h2 className="mb-5 text-sm font-medium tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </Card>
  );
}

async function UserCard({ auth, id }: { auth: AdminAuth; id: string }) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: u }, { data: note }, { data: leads }, authUser] = await Promise.all([
    auth.supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle<ProfileRow>(),
    auth.supabase.from("profile_admin_notes").select("notes").eq("profile_id", id).maybeSingle(),
    auth.supabase
      .from("leads")
      .select("id, created_at, source, status, section")
      .eq("profile_id", id)
      .order("created_at", { ascending: false }),
    createAdminClient().auth.admin.getUserById(id),
  ]);
  if (!u) notFound();

  const isSelf = u.id === auth.user.id;
  const lastSignIn = authUser.data.user?.last_sign_in_at;

  return (
    <Container className="max-w-[920px] py-8 sm:py-10">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft aria-hidden="true" className="size-4" /> Все пользователи
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading as="h1" title={u.full_name || "Без имени"} className="text-4xl sm:text-5xl" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={roleTone[u.role]}>{ROLE_LABELS[u.role]}</Badge>
            {u.role === "student" && <Badge tone={accessTone[u.access]}>{ACCESS_LABELS[u.access]}</Badge>}
            {u.blocked_at && (
              <Badge tone="neutral" className="text-danger">
                <Lock aria-hidden="true" className="size-3" /> Заблокирован с {formatDate(u.blocked_at)}
              </Badge>
            )}
            {isSelf && <Badge tone="outline">Это вы</Badge>}
          </div>
          <p className="mt-3 text-sm text-muted">
            {u.email} · регистрация {formatDate(u.created_at)} · последний вход{" "}
            {lastSignIn ? formatDate(lastSignIn) : "—"}
            {u.consent_at ? ` · согласие родителя ${formatDate(u.consent_at)}` : ""}
          </p>
        </div>
        {u.phone && (
          <Button
            href={`https://wa.me/${u.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            iconLeft={<WhatsAppIcon className="size-4" />}
          >
            {formatPhone(u.phone)}
          </Button>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Section title="Роль и доступ">
          <RoleAccessForm id={u.id} role={u.role} access={u.access} isSelf={isSelf} />
        </Section>

        <Section title="Данные">
          <ProfileForm
            id={u.id}
            fullName={u.full_name ?? ""}
            grade={u.grade ?? ""}
            phone={u.phone ? `+${u.phone}` : ""}
            parentPhone={u.parent_phone ? `+${u.parent_phone}` : ""}
          />
        </Section>

        <Section title="Заметки">
          <NotesForm id={u.id} notes={note?.notes ?? ""} />
        </Section>

        <Section title="Заявки">
          {leads && leads.length > 0 ? (
            <ul className="flex flex-col gap-2 text-sm">
              {leads.map((l) => (
                <li key={l.id} className="flex flex-wrap gap-2 text-ink">
                  <span>{formatDate(l.created_at)}</span>·<span>{statusLabel(l.status)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Нет связанных заявок.</p>
          )}
        </Section>

        <Section title="Действия">
          <div className="flex flex-col gap-4">
            {u.email && (
              <ActionForm
                action={sendLink}
                fields={{ id: u.id }}
                label="Отправить письмо со входом"
                icon={<Mail className="size-4" aria-hidden="true" />}
              />
            )}
            {!isSelf && (
              <ActionForm
                action={setBlocked}
                fields={{ id: u.id, block: u.blocked_at ? "0" : "1" }}
                label={u.blocked_at ? "Разблокировать" : "Заблокировать вход"}
                icon={
                  u.blocked_at ? (
                    <LockOpen className="size-4" aria-hidden="true" />
                  ) : (
                    <Lock className="size-4" aria-hidden="true" />
                  )
                }
                confirmText={u.blocked_at ? undefined : `Заблокировать ${u.email}? Войти в аккаунт будет нельзя, данные сохранятся.`}
              />
            )}
            {!isSelf && (
              <div className="border-t border-line pt-4">
                <ActionForm
                  action={deleteUser}
                  fields={{ id: u.id }}
                  label="Удалить аккаунт навсегда"
                  variant="danger"
                  icon={<Trash2 className="size-4" aria-hidden="true" />}
                  confirmText={`Удалить аккаунт ${u.email} навсегда? Это нельзя отменить.`}
                />
              </div>
            )}
          </div>
        </Section>
      </div>
    </Container>
  );
}
