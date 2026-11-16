import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { site } from "@content/site";
import { Button, Container } from "@/components/ui";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { Logo } from "./Logo";

const { contacts } = site;

export function Footer() {
  return (
    <footer className="px-gutter pb-gutter sm:px-4 sm:pb-4">
      <div className="rounded-panel bg-ink text-white">
        <Container className="py-14 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div className="max-w-sm">
              <Logo inverse />
              <p className="mt-5 text-[15px] leading-relaxed text-white/70">{site.description}</p>
              <Button
                href={contacts.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="inverse"
                className="mt-8"
                iconLeft={<WhatsAppIcon className="size-5" />}
              >
                Написать в WhatsApp
              </Button>
            </div>

            <nav aria-label="Разделы сайта">
              <p className="text-xs font-medium tracking-[0.16em] text-white/60 uppercase">Разделы</p>
              <ul className="mt-5 flex flex-col gap-3">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-[15px] text-white/85 hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/#faq" className="text-[15px] text-white/85 hover:text-white">
                    Вопросы
                  </Link>
                </li>
                <li>
                  <Link href={site.login.href} className="text-[15px] text-white/85 hover:text-white">
                    Личный кабинет
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-white/60 uppercase">Контакты</p>
              <ul className="mt-5 flex flex-col gap-4 text-[15px] text-white/85">
                <li>
                  <a href={contacts.phoneHref} className="inline-flex items-center gap-3 hover:text-white">
                    <Phone aria-hidden="true" className="size-4" />
                    {contacts.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={contacts.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 hover:text-white"
                  >
                    <WhatsAppIcon className="size-4" />
                    WhatsApp
                  </a>
                </li>
                <li>
                  {contacts.instagramHref ? (
                    <a
                      href={contacts.instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 hover:text-white"
                    >
                      <InstagramIcon className="size-4" />
                      {contacts.instagramHandle}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-3">
                      <InstagramIcon className="size-4" />
                      {contacts.instagramHandle}
                    </span>
                  )}
                </li>
                <li>
                  {contacts.emailHref ? (
                    <a href={contacts.emailHref} className="inline-flex items-center gap-3 hover:text-white">
                      <Mail aria-hidden="true" className="size-4" />
                      {contacts.email}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-3">
                      <Mail aria-hidden="true" className="size-4" />
                      {contacts.email}
                    </span>
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-sm text-white/60 sm:flex-row sm:justify-between">
            <p>© {site.name}. Все права защищены.</p>
            <p>Поступление без паники.</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
