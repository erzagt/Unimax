import { NextResponse, type NextRequest } from "next/server";
import { getSession, homeFor } from "@/lib/auth";

/** «Мой кабинет»: ведёт вошедшего пользователя в его раздел, остальных — на вход. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  const dest = session ? homeFor(session.role) : "/login";
  return NextResponse.redirect(new URL(dest, request.nextUrl.origin));
}
