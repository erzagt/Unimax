"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { ActionStatus } from "@/components/admin/ActionForm";
import { inviteUser, type ActionState } from "./actions";

const roleOptions = [
  { value: "student", label: "Ученик" },
  { value: "teacher", label: "Учитель" },
  { value: "admin", label: "Админ" },
];
const accessOptions = [
  { value: "free", label: "Бесплатный" },
  { value: "active", label: "Ученик (оплачен)" },
];

/** Пригласить по email: аккаунт создаётся сразу, человеку приходит письмо со входом. */
export function InviteForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(inviteUser, { status: "idle" });
  return (
    <form action={action} className="grid gap-4 md:grid-cols-[1.4fr_1.2fr_1fr_1fr_auto] md:items-end">
      <Input name="email" id="invite-email" type="email" label="Email" placeholder="teacher@example.com" error={state.fieldErrors?.email} />
      <Input name="fullName" id="invite-name" label="Имя" optional placeholder="Имя Фамилия" error={state.fieldErrors?.fullName} />
      <Select name="role" id="invite-role" label="Роль" options={roleOptions} defaultValue="teacher" />
      <Select name="access" id="invite-access" label="Доступ" options={accessOptions} defaultValue="free" />
      <Button
        type="submit"
        disabled={pending}
        className="h-12"
        iconLeft={pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
      >
        Пригласить
      </Button>
      <div className="md:col-span-5">
        <ActionStatus state={state} pending={pending} />
      </div>
    </form>
  );
}
