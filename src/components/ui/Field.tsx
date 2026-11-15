import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-2xl border border-line-strong bg-surface px-4 text-[15px] text-ink placeholder:text-muted/80 transition-colors hover:border-ink/50 focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-[invalid=true]:border-danger";

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Обёртка поля: label сверху, подсказка и ошибка снизу. */
function FieldShell({ id, label, hint, error, optional, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> · необязательно</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type BaseFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
};

export type InputProps = BaseFieldProps & Omit<ComponentProps<"input">, "name">;

export function Input({ name, label, hint, error, optional, wrapperClassName, id, className, ...rest }: InputProps) {
  const fieldId = id ?? `field-${name}`;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <input
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(control, "h-12", className)}
        {...rest}
      />
    </FieldShell>
  );
}

export type TextareaProps = BaseFieldProps & Omit<ComponentProps<"textarea">, "name">;

export function Textarea({ name, label, hint, error, optional, wrapperClassName, id, className, ...rest }: TextareaProps) {
  const fieldId = id ?? `field-${name}`;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <textarea
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(control, "min-h-28 resize-y py-3", className)}
        {...rest}
      />
    </FieldShell>
  );
}

export type SelectOption = { value: string; label: string };

export type SelectProps = BaseFieldProps &
  Omit<ComponentProps<"select">, "name"> & {
    options: readonly SelectOption[];
    placeholder?: string;
  };

export function Select({
  name,
  label,
  hint,
  error,
  optional,
  wrapperClassName,
  id,
  className,
  options,
  placeholder,
  ...rest
}: SelectProps) {
  const fieldId = id ?? `field-${name}`;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <div className="relative">
        <select
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, hint, error)}
          className={cn(control, "h-12 appearance-none pr-11", className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldShell>
  );
}

export type CheckboxProps = Omit<ComponentProps<"input">, "name" | "type"> & {
  name: string;
  label: ReactNode;
  error?: string;
  wrapperClassName?: string;
};

export function Checkbox({ name, label, error, wrapperClassName, id, className, ...rest }: CheckboxProps) {
  const fieldId = id ?? `field-${name}`;
  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn("mt-0.5 size-5 shrink-0 cursor-pointer rounded-md accent-ink", className)}
          {...rest}
        />
        <label htmlFor={fieldId} className="cursor-pointer text-sm leading-relaxed text-muted">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
