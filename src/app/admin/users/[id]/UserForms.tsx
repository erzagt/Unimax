"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { gradeOptions } from "@content/lead-form";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { ActionStatus } from "@/components/admin/ActionForm";
import { saveNotes, updateProfile, updateRoleAccess, type ActionState } from "../actions";

const roleOptions = [
  { value: "student", label: "Ученик" },
  { value: "teacher", label: "Учитель" },
  { value: "admin", label: "Админ" },
];
const accessOptions = [
  { value: "free", label: "Бесплатный" },
  { value: "active", label: "Ученик (оплачен)" },
];

function Submit({ pending, label = "Сохранить" }: { pending: boolean; label?: string }) {
  return (
    <Button
      type="submit"
      variant="secondary"
      disabled={pending}
      className="h-12"
      iconLeft={pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : undefined}
    >
      {label}
    </Button>
  );
}

export function RoleAccessForm({ id, role, access, isSelf }: { id: string; role: string; access: string; isSelf: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateRoleAccess, { status: "idle" });
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="id" value={id} />
      <Select
        name="role"
        id="user-role"
        label="Роль"
        options={roleOptions}
        defaultValue={role}
        hint={isSelf ? "Свою роль админа снять нельзя" : undefined}
      />
      <Select
        name="access"
        id="user-access"
        label="Доступ к кабинету"
        options={accessOptions}
        defaultValue={access}
        hint="«Ученик» открывает курсы, домашку и расписание"
      />
      <Submit pending={pending} />
      <div className="sm:col-span-3">
        <ActionStatus state={state} pending={pending} />
      </div>
    </form>
  );
}

export function ProfileForm({
  id,
  fullName,
  grade,
  phone,
  parentPhone,
}: {
  id: string;
  fullName: string;
  grade: string;
  phone: string;
  parentPhone: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfile, { status: "idle" });
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={id} />
      <Input name="fullName" id="user-name" label="Имя и фамилия" defaultValue={fullName} error={e.fullName} />
      <Select
        name="grade"
        id="user-grade"
        label="Класс"
        options={[{ value: "", label: "Не указан" }, ...gradeOptions]}
        defaultValue={grade}
        error={e.grade}
      />
      <Input name="phone" id="user-phone" type="tel" label="Телефон ученика" placeholder="+7 7__ ___ __ __" defaultValue={phone} error={e.phone} />
      <Input
        name="parentPhone"
        id="user-parent-phone"
        type="tel"
        label="Телефон родителя"
        placeholder="+7 7__ ___ __ __"
        defaultValue={parentPhone}
        error={e.parentPhone}
      />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Submit pending={pending} />
        <ActionStatus state={state} pending={pending} />
      </div>
    </form>
  );
}

export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveNotes, { status: "idle" });
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <Textarea
        name="notes"
        id="user-notes"
        label="Заметки админа"
        hint="Видны только админам. Например: оплатил до 1 марта, предпочитает вечерние уроки."
        defaultValue={notes}
        maxLength={5000}
        rows={4}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Submit pending={pending} />
        <ActionStatus state={state} pending={pending} />
      </div>
    </form>
  );
}
