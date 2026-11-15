"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button, Select, Textarea } from "@/components/ui";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validation/lead";
import { updateLead, type UpdateLeadState } from "./actions";

const statusOptions = Object.entries(LEAD_STATUSES).map(([value, label]) => ({ value, label }));

/** Форма смены статуса и заметки для одной заявки. */
export function LeadEditor({ id, status, notes }: { id: string; status: LeadStatus; notes: string }) {
  const [state, action, pending] = useActionState<UpdateLeadState, FormData>(updateLead, { status: "idle" });

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
      <input type="hidden" name="id" value={id} />
      <Select id={`status-${id}`} name="status" label="Статус" options={statusOptions} defaultValue={status} />
      <Textarea
        id={`notes-${id}`}
        name="notes"
        label="Заметки"
        defaultValue={notes}
        maxLength={5000}
        rows={1}
        className="min-h-12"
        placeholder="Например: перезвонить в субботу"
      />
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          variant="secondary"
          disabled={pending}
          className="h-12"
          iconLeft={pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : undefined}
        >
          Сохранить
        </Button>
        <span role="status" aria-live="polite" className="text-sm">
          {state.status === "saved" && !pending && (
            <span className="inline-flex items-center gap-1 text-muted">
              <Check aria-hidden="true" className="size-4" /> Сохранено
            </span>
          )}
          {state.status === "error" && <span className="text-danger">{state.message}</span>}
        </span>
      </div>
    </form>
  );
}
