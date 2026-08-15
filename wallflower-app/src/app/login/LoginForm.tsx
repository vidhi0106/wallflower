"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestMagicLink, type MagicLinkState } from "./actions";

const initialState: MagicLinkState = { status: "idle" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(requestMagicLink, initialState);

  return (
    <div className="w-full max-w-sm mx-auto px-6 py-16">
      <Link href="/" className="font-nunito text-xs no-underline" style={{ color: "#a8977a" }}>
        ← Back
      </Link>
      <h1 className="font-caveat font-bold text-3xl text-center mt-6" style={{ color: "#4a3d2c" }}>
        Organizer sign in
      </h1>
      <p className="text-sm text-center mt-2" style={{ color: "#7c6a4e" }}>
        Enter your email and we&rsquo;ll send you a sign-in link.
      </p>

      {state.status === "sent" ? (
        <div className="mt-8 text-sm" style={{ color: "#4a3d2c" }}>
          <a
            href={state.signInUrl}
            className="block text-center font-nunito font-bold"
            style={{
              background: "#6b7d5c",
              color: "#FBF6E9",
              borderRadius: 10,
              padding: 14,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Continue to Wallflower
          </a>
          <p className="mt-4 text-center" style={{ color: "#7c6a4e" }}>
            We also emailed a copy to <strong>{state.email}</strong> so you can get back in later.
          </p>
        </div>
      ) : (
        <form action={formAction} className="mt-8 flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            style={{
              border: "1px solid rgba(122,100,70,0.35)",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 15,
              outline: "none",
              color: "#4a3d2c",
              background: "#FBF6E9",
            }}
          />
          {state.status === "error" && (
            <p className="text-sm" style={{ color: "#b0503f" }}>
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="font-nunito font-bold"
            style={{
              background: "#6b7d5c",
              color: "#FBF6E9",
              border: "none",
              borderRadius: 10,
              padding: 14,
              fontSize: 15,
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}
    </div>
  );
}
