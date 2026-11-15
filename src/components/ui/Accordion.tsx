import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { id: string; question: string; answer: ReactNode };

/**
 * Аккордеон на нативных <details>/<summary>: работает без JS,
 * доступен с клавиатуры и для скринридеров «из коробки».
 */
export function Accordion({ items, className }: { items: readonly AccordionItem[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-line rounded-card border border-line/70 bg-surface shadow-soft", className)}>
      {items.map((item) => (
        <details key={item.id} className="group px-5 sm:px-8">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-medium text-ink sm:py-6 sm:text-lg [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong transition-transform duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-white"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <div className="pb-6 pr-12 text-[15px] leading-relaxed text-muted sm:text-base">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
