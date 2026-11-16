"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, MailCheck, RotateCw } from "lucide-react";
import { gradeOptions } from "@content/lead-form";
import { Button, Checkbox, Input, Select } from "@/components/ui";
import {
  requestLoginCode,
  requestRegisterCode,
  verifyLoginCode,
  type AuthResult,
} from "@/app/login/actions";

type Mode = "login" | "register";
type Errors = Record<string, string>;

const RESEND_SECONDS = 60;

const urlErrors: Record<string, string> = {
  link: "Ссылка из письма недействительна или устарела. Запросите новую — или введите код из письма.",
};

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-danger/30 bg-surface p-4 text-sm text-danger">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/**
 * Вход и регистрация по email: шаг 1 — данные и отправка письма,
 * шаг 2 — код из письма (или кнопка в письме), повторная отправка, смена email.
 */
export function AuthFlow({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const [step, setStep] = useState<"form" | "code">("form");
  const [values, setValues] = useState({
    email: params.get("email") ?? "",
    fullName: "",
    grade: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(urlErrors[params.get("error") ?? ""] ?? null);
  const [notFound, setNotFound] = useState(false);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();
  const codeRef = useRef<HTMLInputElement>(null);

  // Таймер повторной отправки
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  function applyResult(res: AuthResult, onOk: () => void) {
    if (res.ok) {
      onOk();
      return;
    }
    setErrors(res.fieldErrors ?? {});
    setFormError(res.error);
    setNotFound(Boolean(res.notFound));
  }

  function send(onOk: () => void) {
    setFormError(null);
    setNotFound(false);
    startTransition(async () => {
      const res =
        mode === "login"
          ? await requestLoginCode({ email: values.email })
          : await requestRegisterCode(values);
      applyResult(res, () => {
        setErrors({});
        setCooldown(RESEND_SECONDS);
        onOk();
      });
    });
  }

  function onSubmitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(() => {
      setCode("");
      setStep("code");
    });
  }

  function onSubmitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      // При успехе действие делает redirect и сюда не возвращается
      const res = await verifyLoginCode({ email: values.email, token: code, next });
      if (!res.ok) setFormError(res.error);
    });
  }

  if (step === "code") {
    const mm = Math.floor(cooldown / 60);
    const ss = String(cooldown % 60).padStart(2, "0");
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <MailCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-lg font-medium text-ink">Проверьте почту</p>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">
              Отправили письмо на <span className="font-medium break-all text-ink">{values.email}</span>. Нажмите
              кнопку в письме или введите код:
            </p>
          </div>
        </div>

        <form onSubmit={onSubmitCode} className="flex flex-col gap-4">
          <Input
            ref={codeRef}
            name="code"
            label="Код из письма"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={8}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-14 text-center text-2xl font-semibold tracking-[0.5em]"
          />
          {formError && <Alert>{formError}</Alert>}
          <Button
            type="submit"
            size="lg"
            disabled={pending || code.length < 6}
            icon={
              pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-4" aria-hidden="true" />
              )
            }
          >
            {pending ? "Проверяем…" : "Войти"}
          </Button>
        </form>

        <div className="flex flex-col gap-2 border-t border-line pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending || cooldown > 0}
            onClick={() => send(() => setCode(""))}
            iconLeft={<RotateCw className="size-4" aria-hidden="true" />}
            className="self-start"
          >
            {cooldown > 0 ? `Отправить ещё раз через ${mm}:${ss}` : "Отправить ещё раз"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStep("form");
              setFormError(null);
            }}
            iconLeft={<ArrowLeft className="size-4" aria-hidden="true" />}
            className="self-start"
          >
            Изменить email
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted">Письма нет? Проверьте папку «Спам» или «Промоакции».</p>
      </div>
    );
  }

  const set = (key: keyof typeof values) => (v: string | boolean) => setValues((s) => ({ ...s, [key]: v }));

  return (
    <form onSubmit={onSubmitForm} noValidate className="flex flex-col gap-5">
      {mode === "register" && (
        <>
          <Input
            name="fullName"
            label="Имя и фамилия ученика"
            autoComplete="name"
            placeholder="Например, Алия Нурланова"
            value={values.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
            error={errors.fullName}
          />
          <Select
            name="grade"
            label="Класс"
            options={gradeOptions}
            placeholder="Выберите класс"
            value={values.grade}
            onChange={(e) => set("grade")(e.target.value)}
            error={errors.grade}
          />
        </>
      )}
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => set("email")(e.target.value)}
        error={errors.email}
      />
      {mode === "register" && (
        <Checkbox
          name="consent"
          checked={values.consent}
          onChange={(e) => set("consent")(e.target.checked)}
          error={errors.consent}
          label="Я родитель или законный представитель ученика либо получил(а) их согласие на обработку персональных данных."
        />
      )}

      {formError && (
        <Alert>
          {formError}
          {notFound && (
            <>
              {" "}
              <Link
                href={`/register?email=${encodeURIComponent(values.email)}`}
                className="font-medium underline"
              >
                Зарегистрироваться
              </Link>
            </>
          )}
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        icon={
          pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )
        }
      >
        {pending ? "Отправляем…" : mode === "login" ? "Получить код для входа" : "Зарегистрироваться"}
      </Button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Нет аккаунта?{" "}
            <Link href="/register" className="font-medium text-ink underline underline-offset-4">
              Зарегистрироваться
            </Link>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-ink underline underline-offset-4">
              Войти
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
