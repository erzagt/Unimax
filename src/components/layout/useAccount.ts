"use client";

import { useEffect, useState } from "react";

export type AccountState = { signedIn: false } | { signedIn: true; isAdmin: boolean };

/** Есть ли в браузере cookie сессии Supabase (sb-<проект>-auth-token…). */
function hasAuthCookie() {
  return document.cookie.split(";").some((c) => /^\s*sb-[^=]+-auth-token/.test(c));
}

/**
 * Вошёл ли пользователь — для шапки сайта. Лендинг статический, поэтому
 * проверяем в браузере. Клиент Supabase подгружается только при наличии
 * cookie входа, чтобы не утяжелять страницу обычным посетителям.
 */
export function useAccount(): AccountState {
  const [state, setState] = useState<AccountState>({ signedIn: false });

  useEffect(() => {
    if (!hasAuthCookie()) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { getBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getBrowserClient();
      if (!supabase || cancelled) return;

      const check = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!session) return setState({ signedIn: false });
        const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
        if (!cancelled) setState({ signedIn: true, isAdmin: data?.role === "admin" });
      };

      await check();
      const { data } = supabase.auth.onAuthStateChange(() => void check());
      unsubscribe = () => data.subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return state;
}
