"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import { site } from "@content/site";
import { Button, Container } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAccount } from "./useAccount";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const account = useAccount();
  const accountLink = account.signedIn
    ? { href: "/auth/home", label: account.isAdmin ? "Админка" : "Кабинет" }
    : { href: site.login.href, label: site.login.label };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onResize = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-canvas/80 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Основное меню" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-surface/70 p-1 shadow-soft">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-full px-4 py-2 text-sm text-ink transition-colors hover:bg-canvas"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            href={accountLink.href}
            variant={account.signedIn ? "secondary" : "ghost"}
            size="sm"
            iconLeft={<UserRound className="size-4" aria-hidden="true" />}
            className="hidden sm:inline-flex"
          >
            {accountLink.label}
          </Button>
          <Button href={site.cta.href} size="sm" icon={<ArrowUpRight className="size-4" aria-hidden="true" />} className="hidden sm:inline-flex">
            {site.cta.label}
          </Button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <div
        id="mobile-menu"
        hidden={!open}
        className={cn("border-t border-line bg-canvas lg:hidden")}
      >
        <Container className="py-4">
          <nav aria-label="Мобильное меню">
            <ul className="flex flex-col">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-4 font-serif text-2xl text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Button
            href={site.cta.href}
            onClick={() => setOpen(false)}
            className="mt-6 w-full"
            size="lg"
            icon={<ArrowUpRight className="size-4" aria-hidden="true" />}
          >
            {site.cta.label}
          </Button>
          <Button
            href={accountLink.href}
            variant="secondary"
            onClick={() => setOpen(false)}
            className="mt-3 w-full"
            size="lg"
            iconLeft={<UserRound className="size-4" aria-hidden="true" />}
          >
            {accountLink.label}
          </Button>
        </Container>
      </div>
    </header>
  );
}
