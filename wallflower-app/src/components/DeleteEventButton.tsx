"use client";

import { useState, useTransition } from "react";
import Spinner from "@/components/Spinner";

export default function DeleteEventButton({
  eventId,
  submissionCount,
  action,
}: {
  eventId: string;
  submissionCount: number;
  action: (eventId: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await action(eventId);
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-nunito font-bold text-sm"
        style={{
          background: "transparent",
          color: "#b0503f",
          border: "1px solid #b0503f",
          borderRadius: 10,
          padding: "9px 16px",
          cursor: "pointer",
        }}
      >
        Delete event
      </button>
    );
  }

  return (
    <div>
      <p className="text-sm" style={{ color: "#b0503f" }}>
        This permanently deletes the event and all {submissionCount} submission{submissionCount === 1 ? "" : "s"}. This
        can&rsquo;t be undone.
      </p>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="font-nunito font-bold text-sm flex items-center gap-1.5"
          style={{
            background: "#b0503f",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "9px 16px",
            cursor: isPending ? "default" : "pointer",
          }}
        >
          {isPending && <Spinner size={14} />}
          {isPending ? "Deleting…" : "Yes, delete permanently"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="font-nunito font-bold text-sm"
          style={{
            background: "transparent",
            color: "#7c6a4e",
            border: "1px solid rgba(122,100,70,0.3)",
            borderRadius: 10,
            padding: "9px 16px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
