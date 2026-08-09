import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { consumeMagicLink, createSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/wallflower/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) redirect("/login");

  const organizer = await consumeMagicLink(token);
  if (!organizer) redirect("/login?error=expired");

  const session = await createSession(organizer.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, {
    ...SESSION_COOKIE_OPTIONS,
    expires: session.expiresAt,
  });

  redirect("/organizer");
}
