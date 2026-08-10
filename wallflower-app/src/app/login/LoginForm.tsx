"use client";

import { useActionState } from "react";
import { requestMagicLink, type MagicLinkState } from "./actions";

const initialState: MagicLinkState = { status: "idle" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(requestMagicLink, initialState);

  return (
    <div className="w-full max-w-sm mx-auto px-6 py-16">
      <h1 className="font-caveat font-bold text-3xl text-center" style={{ color: "#4a3d2c" }}>
        Organizer sign in
      </h1>
      <p className="text-sm text-center mt-2" style={{ color: "#7c6a4e" }}>
        Enter your email and we&rsquo;ll send you a sign-in link.
      </p>

      {state.status === "sent" ? (
        <div className="mt-8 text-sm" style={{ color: "#4a3d2c" }}>
          <p>
            A sign-in link was sent to <strong>{state.email}</strong>.
          </p>
          {state.devUrl && (
            <>
              <p className="mt-3" style={{ color: "#7c6a4e" }}>
                No email provider is configured in this environment, so here&rsquo;s the link
                directly:
              </p>
              <a
                href={state.devUrl}
                className="block mt-3 break-all underline"
                style={{ color: "#6b7d5c" }}
              >
                {state.devUrl}
              </a>
            </>
          )}
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
