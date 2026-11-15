import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const shades = ["bg-line", "bg-line-strong", "bg-subtle", "bg-muted"];

/**
 * Стопка круглых аватаров. Пока реальных фото нет — серые кружки
 * (заглушка); позже сюда можно передать src фотографий.
 */
export function AvatarStack({ count = 4, withPlus = true, className }: { count?: number; withPlus?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center", className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "-ml-2 size-9 rounded-full border-2 border-surface first:ml-0",
            "bg-gradient-to-br from-white/40 to-transparent",
            shades[i % shades.length],
          )}
        />
      ))}
      {withPlus && (
        <span className="-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-surface bg-surface text-ink shadow-soft">
          <Plus className="size-4" />
        </span>
      )}
    </div>
  );
}
