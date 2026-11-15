import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Горизонтальный контейнер с отступами по краям. */
export function Container({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-gutter sm:px-6 lg:px-8", className)} {...rest} />;
}

type HeadingProps = {
  /** Обычная часть заголовка. */
  title: string;
  /** Ключевое слово/фраза курсивом (вторая часть заголовка). */
  italic?: string;
  /** Перенос курсивной части на новую строку. */
  breakBeforeItalic?: boolean;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
};

/** Serif-заголовок с курсивной второй частью. */
export function Heading({ title, italic, breakBeforeItalic, as: Tag = "h2", id, className }: HeadingProps) {
  return (
    <Tag id={id} className={cn("font-serif font-medium tracking-[-0.02em] text-balance text-ink", className)}>
      {title}
      {italic && (
        <>
          {breakBeforeItalic ? <br /> : " "}
          <em className="italic">{italic}</em>
        </>
      )}
    </Tag>
  );
}

type SectionProps = Omit<ComponentProps<"section">, "title"> & {
  eyebrow?: string;
  title?: string;
  italic?: string;
  description?: ReactNode;
  align?: "center" | "left";
  /** Дополнительный элемент справа от заголовка (на десктопе). */
  aside?: ReactNode;
  containerClassName?: string;
};

/** Секция страницы: надзаголовок, заголовок, описание и контент. */
export function Section({
  eyebrow,
  title,
  italic,
  description,
  align = "center",
  aside,
  className,
  containerClassName,
  children,
  ...rest
}: SectionProps) {
  const headingId = rest.id ? `${rest.id}-title` : undefined;
  return (
    <section aria-labelledby={title ? headingId : undefined} className={cn("py-section lg:py-section-lg", className)} {...rest}>
      <Container className={containerClassName}>
        {title && (
          <div
            className={cn(
              "mb-10 flex flex-col gap-6 lg:mb-14",
              align === "center" && "items-center text-center",
              aside && "lg:flex-row lg:items-end lg:justify-between lg:text-left",
            )}
          >
            <div className={cn("flex max-w-2xl flex-col gap-4", align === "center" && !aside && "items-center")}>
              {eyebrow && (
                <p className="flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-muted uppercase">
                  <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
                  {eyebrow}
                </p>
              )}
              <Heading id={headingId} title={title} italic={italic} className="text-4xl leading-[1.05] sm:text-5xl" />
              {description && <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
            </div>
            {aside}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
