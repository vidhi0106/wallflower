"use client";

import { useState } from "react";

export default function CopyRow({ label, value }: { label?: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      {label && (
        <p className="text-[14px] mb-1.5 font-nunito" style={{ color: "#8a7c63" }}>
          {label}
        </p>
      )}
      <div className="flex gap-2">
        <div
          className="flex-1 min-w-0 text-[16px] truncate font-nunito"
          style={{
            background: "#faf7f0",
            border: "1px solid #e8e0cf",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#5c4f38",
          }}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={copy}
          className="font-nunito font-bold text-[16px]"
          style={{
            background: "#5b7553",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
