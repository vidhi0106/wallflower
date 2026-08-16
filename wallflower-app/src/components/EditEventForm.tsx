"use client";

import { useActionState, useState } from "react";
import type { UpdateEventState } from "@/app/organizer/actions";
import SubmitButton from "@/components/SubmitButton";

const initialState: UpdateEventState = { status: "idle" };

function toDatetimeLocalValue(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const inputStyle = {
  border: "1px solid rgba(122,100,70,0.35)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 16,
  outline: "none",
  color: "#3e3428",
  background: "#faf7f0",
};

export default function EditEventForm({
  action,
  recipientName,
  occasionText,
  revealDate,
}: {
  action: (prevState: UpdateEventState, formData: FormData) => Promise<UpdateEventState>;
  recipientName: string;
  occasionText: string;
  revealDate: Date | null;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-nunito font-bold text-[16px]"
        style={{ background: "transparent", color: "#3e3428", border: "none", padding: 0, cursor: "pointer" }}
      >
        {open ? "Hide edit form" : "Edit event details"}
      </button>
      {open && (
        <form action={formAction} className="flex flex-col gap-3 mt-4 max-w-sm">
          <label className="text-[14px] font-nunito" style={{ color: "#8a7c63" }}>
            Recipient name
            <input name="recipientName" defaultValue={recipientName} required style={{ ...inputStyle, width: "100%", marginTop: 4 }} />
          </label>
          <label className="text-[14px] font-nunito" style={{ color: "#8a7c63" }}>
            Occasion
            <input name="occasionText" defaultValue={occasionText} required style={{ ...inputStyle, width: "100%", marginTop: 4 }} />
          </label>
          <label className="text-[14px] font-nunito" style={{ color: "#8a7c63" }}>
            Reveal date (optional)
            <input
              type="datetime-local"
              name="revealDate"
              defaultValue={toDatetimeLocalValue(revealDate)}
              style={{ ...inputStyle, width: "100%", marginTop: 4 }}
            />
          </label>
          {state.status === "error" && (
            <p className="text-[16px]" style={{ color: "#b0503f" }}>
              {state.error}
            </p>
          )}
          {state.status === "saved" && (
            <p className="text-[16px]" style={{ color: "#5b7553" }}>
              Saved.
            </p>
          )}
          <SubmitButton
            pendingLabel="Saving…"
            className="font-nunito font-bold text-[16px] self-start"
            style={{ background: "#5b7553", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px" }}
          >
            Save changes
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
