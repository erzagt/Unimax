"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { ActionState } from "@/app/admin/users/actions";
import { cn } from "@/lib/utils";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/** Строка статуса под формой: «Сохранено» / ошибка / ссылка. */
export function ActionStatus({ state, pending }: { state: ActionState; pending?: boolean }) {
  if (pending || state.status === "idle" || !state.message) return <span role="status" aria-live="polite" />;
  return (
    <span role="status" aria-live="polite" className={cn("text-sm", state.status === "error" ? "text-danger" : "text-muted")}>
      {state.status === "ok" && <Check aria-hidden="true" className="mr-1 inline size-4" />}
      {state.message}
      {state.href && (
        <>
          {" "}
          <Link href={state.href} className="font-medium text-ink underline underline-offset-4">
            Открыть
          </Link>
        </>
      )}
    </span>
  );
}

/**
 * Простая форма-кнопка для серверного действия: скрытые поля + кнопка.
 * confirmText — спросить подтверждение перед отправкой (удаление и т.п.).
 */
export function ActionForm({
  action,
  fields,
  label,
  variant = "secondary",
  confirmText,
  icon,
  className,
  children,
}: {
  action: Action;
  fields: Record<string, string>;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  confirmText?: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className={cn("flex flex-wrap items-center gap-3", className)}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
      <Button
        type="submit"
        size="sm"
        variant={variant === "danger" ? "secondary" : variant}
        disabled={pending}
        className={cn(variant === "danger" && "border-danger/40 text-danger hover:border-danger")}
        iconLeft={pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : icon}
      >
        {label}
      </Button>
      <ActionStatus state={state} pending={pending} />
    </form>
  );
}
