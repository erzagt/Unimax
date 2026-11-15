import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "dark" | "outline" | "sat" | "ielts" | "ec" | "essay";

const tones: Record<Tone, string> = {
  neutral: "bg-ink/[0.06] text-ink",
  dark: "bg-ink text-white",
  outline: "border border-line-strong text-ink",
  sat: "bg-sat text-sat-ink",
  ielts: "bg-ielts text-ielts-ink",
  ec: "bg-ec text-ec-ink",
  essay: "bg-essay text-essay-ink",
};

type BadgeProps = ComponentProps<"span"> & { tone?: Tone };

/** Небольшая метка-капсула. */
export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}

type IconTileProps = ComponentProps<"span"> & {
  tone?: Exclude<Tone, "outline">;
  size?: "sm" | "md";
};

/** Пастельная плитка для маленькой иконки — единственное место, где есть цвет. */
export function IconTile({ tone = "neutral", size = "md", className, ...rest }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-tile",
        size === "sm" ? "size-8 [&_svg]:size-4" : "size-11 [&_svg]:size-5",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
