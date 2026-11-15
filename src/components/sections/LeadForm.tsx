"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { gradeOptions, sectionOptions } from "@content/lead-form";
import { site, whatsappLink } from "@content/site";
import { Button, Checkbox, GlassCard, Input, Select, Textarea } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { leadSchema, type Lead } from "@/lib/validation/lead";

type Errors = Partial<Record<keyof Lead, string>>;

function labelOf(options: readonly { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function whatsappText(lead: Lead) {
  const lines = [
    `Здравствуйте! Хочу записаться на пробный урок в ${site.name}.`,
    `Ученик: ${lead.name}`,
    `Класс: ${labelOf(gradeOptions, lead.grade)}`,
    `Направление: ${labelOf(sectionOptions, lead.section)}`,
  ];
  if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
  return lines.join("\n");
}

export function LeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Lead | null>(null);
  // Последние отправленные данные — чтобы «Изменить данные» не стирало форму
  const [draft, setDraft] = useState<Lead | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const result = leadSchema.safeParse({
      name: data.get("name") ?? "",
      phone: data.get("phone") ?? "",
      grade: data.get("grade") ?? "",
      section: data.get("section") ?? "",
      comment: data.get("comment") ?? "",
      consent: data.get("consent") === "on",
    });

    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Lead;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      // Фокус на первое поле с ошибкой
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    // ЭТАП 2: здесь будет отправка в Supabase (таблица leads) через серверный роут.
    setDraft(result.data);
    setSubmitted(result.data);
  }

  if (submitted) {
    return (
      <GlassCard padding="lg" className="text-center" role="status" aria-live="polite">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ink text-white">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <h3 className="mt-6 font-serif text-3xl font-medium text-ink">
          Почти <em>готово!</em>
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Отправьте заявку нам в WhatsApp — сообщение уже заполнено. Мы ответим и подберём время пробного урока.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            href={whatsappLink(whatsappText(submitted))}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            iconLeft={<WhatsAppIcon className="size-5" />}
          >
            Написать в WhatsApp
          </Button>
          <Button variant="ghost" onClick={() => setSubmitted(null)}>
            Изменить данные
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="lg">
      <form ref={formRef} noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
        <Input
          name="name"
          label="Имя ученика"
          autoComplete="name"
          placeholder="Например, Алия"
          defaultValue={draft?.name}
          required
          error={errors.name}
        />
        <Input
          name="phone"
          type="tel"
          inputMode="tel"
          label="Телефон WhatsApp"
          autoComplete="tel"
          placeholder="+7 7__ ___ __ __"
          defaultValue={draft ? `+${draft.phone}` : undefined}
          required
          error={errors.phone}
        />
        <Select
          name="grade"
          label="Класс"
          options={gradeOptions}
          placeholder="Выберите класс"
          defaultValue={draft?.grade ?? ""}
          required
          error={errors.grade}
        />
        <Select
          name="section"
          label="Направление"
          options={sectionOptions}
          placeholder="Выберите направление"
          defaultValue={draft?.section ?? ""}
          required
          error={errors.section}
        />
        <Textarea
          name="comment"
          label="Комментарий"
          optional
          placeholder="Цели, страна, удобное время — всё, что важно"
          maxLength={1000}
          defaultValue={draft?.comment}
          wrapperClassName="sm:col-span-2"
          error={errors.comment}
        />
        <Checkbox
          name="consent"
          wrapperClassName="sm:col-span-2"
          error={errors.consent}
          defaultChecked={Boolean(draft)}
          label="Я родитель или законный представитель ученика либо получил(а) их согласие на обработку персональных данных."
        />
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">Перезвоним или напишем в WhatsApp. Без спама.</p>
          <Button type="submit" size="lg" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
            Записаться бесплатно
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
