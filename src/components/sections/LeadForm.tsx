"use client";

import { useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";
import { gradeOptions, sectionOptions } from "@content/lead-form";
import { site, whatsappLink } from "@content/site";
import { Button, Checkbox, GlassCard, Input, Select, Textarea } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { leadSchema, type Lead, type LeadSource } from "@/lib/validation/lead";

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

type ApiResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function LeadForm({ source = "landing" }: { source?: LeadSource }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState<Lead | null>(null);

  function showErrors(next: Errors) {
    setErrors(next);
    // Фокус на первое поле с ошибкой
    const first = Object.keys(next)[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const data = new FormData(e.currentTarget);
    const raw = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      grade: String(data.get("grade") ?? ""),
      section: String(data.get("section") ?? ""),
      comment: String(data.get("comment") ?? ""),
      consent: data.get("consent") === "on",
    };

    // Проверка в браузере — только для удобства, главная проверка на сервере.
    const result = leadSchema.safeParse(raw);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Lead;
        next[key] ??= issue.message;
      }
      showErrors(next);
      return;
    }

    setErrors({});
    setFormError(null);
    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...raw, source, website: String(data.get("website") ?? "") }),
      });
      const json = (await res.json().catch(() => null)) as ApiResult | null;
      if (!res.ok || !json?.ok) {
        const err = json && !json.ok ? json : null;
        if (err?.fieldErrors) showErrors(err.fieldErrors as Errors);
        setFormError(err?.error ?? "Не удалось отправить заявку. Попробуйте ещё раз.");
        return;
      }
      setSubmitted(result.data);
    } catch {
      setFormError("Нет соединения. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <GlassCard padding="lg" className="text-center" role="status" aria-live="polite">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ink text-white">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <h3 className="mt-6 font-serif text-3xl font-medium text-ink">
          Спасибо, <em>заявка отправлена!</em>
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Мы свяжемся с вами в WhatsApp и подберём время пробного урока. Хотите быстрее — напишите нам сами, сообщение
          уже заполнено.
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            href={whatsappLink(whatsappText(submitted))}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            iconLeft={<WhatsAppIcon className="size-5" />}
          >
            Написать в WhatsApp
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="lg">
      <form ref={formRef} noValidate onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
        {/* Ловушка для ботов: скрыта от людей и скринридеров */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <Input name="website" label="Сайт" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <Input
          name="name"
          label="Имя ученика"
          autoComplete="name"
          placeholder="Например, Алия"
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
          required
          error={errors.phone}
        />
        <Select
          name="grade"
          label="Класс"
          options={gradeOptions}
          placeholder="Выберите класс"
          defaultValue=""
          required
          error={errors.grade}
        />
        <Select
          name="section"
          label="Направление"
          options={sectionOptions}
          placeholder="Выберите направление"
          defaultValue=""
          required
          error={errors.section}
        />
        <Textarea
          name="comment"
          label="Комментарий"
          optional
          placeholder="Цели, страна, удобное время — всё, что важно"
          maxLength={1000}
          wrapperClassName="sm:col-span-2"
          error={errors.comment}
        />
        <Checkbox
          name="consent"
          wrapperClassName="sm:col-span-2"
          error={errors.consent}
          label="Я родитель или законный представитель ученика либо получил(а) их согласие на обработку персональных данных."
        />
        {formError && (
          <div role="alert" className="flex gap-3 rounded-2xl border border-danger/30 bg-surface p-4 text-sm text-danger sm:col-span-2">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              {formError}{" "}
              <a href={site.contacts.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                Открыть WhatsApp
              </a>
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">Перезвоним или напишем в WhatsApp. Без спама.</p>
          <Button
            type="submit"
            size="lg"
            disabled={sending}
            aria-busy={sending}
            icon={
              sending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-4" aria-hidden="true" />
              )
            }
          >
            {sending ? "Отправляем…" : "Записаться бесплатно"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
