import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div"> & {
  /** light — белая карточка, dark — чёрная (акцентная). */
  tone?: "light" | "dark";
  padding?: "sm" | "md" | "lg";
};

const paddings = {
  sm: "p-5",
  md: "p-6 sm:p-7",
  lg: "p-7 sm:p-9",
};

/** Белая (или тёмная) карточка с мягкой тенью. */
export function Card({ tone = "light", padding = "md", className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card",
        tone === "light" && "border border-line/70 bg-surface text-ink shadow-soft",
        tone === "dark" && "bg-ink text-white shadow-float",
        paddings[padding],
        className,
      )}
      {...rest}
    />
  );
}

type GlassCardProps = ComponentProps<"div"> & {
  padding?: "none" | "sm" | "md" | "lg";
};

/** Стеклянная карточка (полупрозрачный белый + размытие фона). */
export function GlassCard({ padding = "md", className, ...rest }: GlassCardProps) {
  return (
    <div
      className={cn("glass rounded-card", padding !== "none" && paddings[padding], className)}
      {...rest}
    />
  );
}
