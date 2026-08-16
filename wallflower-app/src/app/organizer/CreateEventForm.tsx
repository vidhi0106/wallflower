"use client";

import { useActionState } from "react";
import { createEvent, type CreateEventState } from "./actions";

const initialState: CreateEventState = { status: "idle" };

const inputStyle = {
  border: "1px solid rgba(122,100,70,0.35)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 17,
  outline: "none",
  color: "#4a3d2c",
  background: "#FBF6E9",
};

export default function CreateEventForm() {
  const [state, formAction, pending] = useActionState(createEvent, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 max-w-sm">
      <label className="text-[16px]" style={{ color: "#7c6a4e" }}>
        Recipient name
        <input name="recipientName" required style={{ ...inputStyle, width: "100%", marginTop: 4 }} />
      </label>
      <label className="text-[16px]" style={{ color: "#7c6a4e" }}>
        Occasion
        <input name="occasionText" required placeholder="e.g. 18th Birthday" style={{ ...inputStyle, width: "100%", marginTop: 4 }} />
      </label>
      <label className="text-[16px]" style={{ color: "#7c6a4e" }}>
        Reveal date (optional)
        <input type="datetime-local" name="revealDate" style={{ ...inputStyle, width: "100%", marginTop: 4 }} />
      </label>
      {state.status === "error" && (
        <p className="text-[16px]" style={{ color: "#b0503f" }}>
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
          padding: 12,
          fontSize: 17,
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.7 : 1,
          alignSelf: "flex-start",
        }}
      >
        {pending ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
