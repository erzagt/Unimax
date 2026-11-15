"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { sendMagicLink, type LoginState } from "./actions";

const errors: Record<string, string> = {
  link: "Ссылка недействительна или устарела. Запросите новую.",
};

export function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });
  const linkError = errors[params.get("error") ?? ""];

  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-ink text-white">
          <MailCheck aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-6 text-lg font-medium text-ink">Проверьте почту</p>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          Если этот email есть в системе, мы отправили на него ссылку для входа. Она действует ограниченное время.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={params.get("next") ?? ""} />
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        required
        error={state.status === "error" ? state.message : linkError}
      />
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        icon={pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
      >
        {pending ? "Отправляем…" : "Получить ссылку для входа"}
      </Button>
    </form>
  );
}
