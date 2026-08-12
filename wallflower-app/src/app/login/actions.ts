"use server";

import { createMagicLink } from "@/lib/wallflower/auth";
import { getBaseUrl, magicLinkEmail, sendEmail } from "@/lib/wallflower/email";

export type MagicLinkState =
  | { status: "idle" }
  | { status: "sent"; email: string; signInUrl: string }
  | { status: "error"; error: string };

export async function requestMagicLink(
  _prevState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return { status: "error", error: "Enter a valid email address." };
  }

  const link = await createMagicLink(email);
  const path = `/api/auth/verify?token=${link.token}`;
  const url = `${getBaseUrl()}${path}`;

  await sendEmail({ to: link.email, ...magicLinkEmail(url) });

  // The email is for coming back later — hand the link back to the page
  // too so signing in right now doesn't require leaving the tab.
  return { status: "sent", email: link.email, signInUrl: path };
}
