import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "inverse" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-soft hover:bg-ink-soft focus-visible:outline-ink",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink focus-visible:outline-ink",
  inverse: "bg-surface text-ink hover:bg-canvas focus-visible:outline-white",
  ghost: "text-ink hover:bg-ink/5 focus-visible:outline-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Иконка справа от текста (например, стрелка). */
  icon?: ReactNode;
  /** Иконка слева от текста. */
  iconLeft?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<"a">, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

/**
 * Кнопка-капсула. С `href` рендерится как ссылка (<Link> для внутренних путей,
 * <a> для внешних), без него — как настоящая <button>.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", icon, iconLeft, className, children } = props;
  const classes = buttonClasses(variant, size, className);
  const content = (
    <>
      {iconLeft}
      <span>{children}</span>
      {icon}
    </>
  );

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, size: _s, icon: _i, iconLeft: _il, className: _c, children: _ch, href, ...rest } = props;
    // Внешние ссылки и скачивание файлов — обычный <a> (без prefetch от <Link>)
    const isExternal = /^(https?:|mailto:|tel:)/.test(href) || rest.download !== undefined;
    if (isExternal) {
      return (
        <a href={href} className={classes} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, icon: _i, iconLeft: _il, className: _c, children: _ch, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
