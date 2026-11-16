import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthCard } from "@/components/auth/AuthCard";
import { confirmEmailLink } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Подтверждение входа — UniPath",
  robots: { index: false, follow: false },
};

/**
 * Страница из письма. Вход подтверждается кнопкой (POST), а не сразу при
 * открытии ссылки: почтовые сканеры открывают ссылки заранее и иначе
 * «съедали» бы одноразовый токен.
 */
export default function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  return (
    <AuthCard title="Подтвердите" italic="вход." subtitle="Нажмите кнопку, чтобы войти в UniPath.">
      <Suspense>
        <ConfirmForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function ConfirmForm({ searchParams }: { searchParams: PageProps<"/auth/confirm">["searchParams"] }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  return (
    <form action={confirmEmailLink} className="flex flex-col gap-4">
      <input type="hidden" name="token_hash" value={one(sp.token_hash)} />
      <input type="hidden" name="type" value={one(sp.type) || "email"} />
      <input type="hidden" name="next" value={one(sp.next)} />
      <Button type="submit" size="lg" icon={<ArrowRight className="size-4" aria-hidden="true" />}>
        Войти в кабинет
      </Button>
    </form>
  );
}
