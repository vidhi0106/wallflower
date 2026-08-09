"use server";

import { createMagicLink } from "@/lib/wallflower/auth";

export type MagicLinkState =
  | { status: "idle" }
  | { status: "sent"; email: string; devUrl: string }
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
  const devUrl = `/api/auth/verify?token=${link.token}`;

  // No email service wired up yet (that's step 3) — log the link server-side
  // and hand it back to the page so organizers can sign in during development.
  console.log(`[wallflower] magic link for ${link.email}: ${devUrl}`);

  return { status: "sent", email: link.email, devUrl };
}
