"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ToggleSwitch({
  checked: initialChecked,
  action,
}: {
  checked: boolean;
  action: (next: boolean) => Promise<void>;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !checked;
    setChecked(next);
    startTransition(async () => {
      await action(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      disabled={isPending}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "none",
        padding: 2,
        background: checked ? "#5b7553" : "#d8d0bd",
        cursor: isPending ? "default" : "pointer",
        opacity: isPending ? 0.7 : 1,
        transition: "background 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: checked ? "flex-end" : "flex-start",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}
