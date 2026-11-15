import Link from "next/link";
import { site } from "@content/site";
import { cn } from "@/lib/utils";

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — на главную`}
      className={cn("inline-flex items-start text-xl font-semibold tracking-tight", inverse ? "text-white" : "text-ink", className)}
    >
      {site.logo}
      <span aria-hidden="true" className="ml-px text-sm leading-none font-medium">
        °
      </span>
    </Link>
  );
}
