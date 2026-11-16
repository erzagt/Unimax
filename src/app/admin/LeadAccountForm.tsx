"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { ActionStatus } from "@/components/admin/ActionForm";
import { convertLead, type ActionState } from "./users/actions";

const accessOptions = [
  { value: "free", label: "Бесплатный доступ" },
  { value: "active", label: "Ученик (оплачен)" },
];

/** Создать аккаунт ученика из заявки: нужен только email. */
export function LeadAccountForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(convertLead, { status: "idle" });
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_220px_auto] sm:items-end">
      <input type="hidden" name="leadId" value={leadId} />
      <Input
        id={`lead-email-${leadId}`}
        name="email"
        type="email"
        label="Email ученика"
        placeholder="student@example.com"
        autoComplete="off"
        error={state.fieldErrors?.email}
      />
      <Select id={`lead-access-${leadId}`} name="access" label="Доступ" options={accessOptions} defaultValue="free" />
      <Button
        type="submit"
        disabled={pending}
        className="h-12"
        iconLeft={pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
      >
        Создать аккаунт
      </Button>
      <div className="sm:col-span-3">
        <ActionStatus state={state} pending={pending} />
      </div>
    </form>
  );
}
