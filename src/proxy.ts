import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Обновление сессии Supabase только в разделах, где нужен вход. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register", "/auth/:path*"],
};
