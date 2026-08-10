"use client";

import { useState } from "react";

export default function ShareLink({
  url,
  recipientName,
  occasionText,
}: {
  url: string;
  recipientName: string;
  occasionText: string;
}) {
  const defaultMessage = `Add a note for ${recipientName}’s ${occasionText}: ${url}`;
  const [message, setMessage] = useState(defaultMessage);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  async function copy(text: string, mark: (v: boolean) => void) {
    await navigator.clipboard.writeText(text);
    mark(true);
    setTimeout(() => mark(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2 mt-3" style={{ maxWidth: 420 }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full text-sm"
        style={{
          border: "1px solid rgba(122,100,70,0.3)",
          borderRadius: 8,
          padding: "8px 10px",
          color: "#4a3d2c",
          background: "#FBF6E9",
          resize: "none",
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => copy(message, setCopiedMessage)}
          className="font-nunito font-bold text-xs"
          style={{
            background: "#6b7d5c",
            color: "#FBF6E9",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          {copiedMessage ? "Copied!" : "Copy message"}
        </button>
        <button
          type="button"
          onClick={() => copy(url, setCopiedLink)}
          className="font-nunito font-bold text-xs"
          style={{
            background: "transparent",
            color: "#7c6a4e",
            border: "1px solid rgba(122,100,70,0.3)",
            borderRadius: 8,
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          {copiedLink ? "Copied!" : "Copy link only"}
        </button>
        {message !== defaultMessage && (
          <button
            type="button"
            onClick={() => setMessage(defaultMessage)}
            className="font-nunito text-xs"
            style={{ background: "transparent", border: "none", textDecoration: "underline", color: "#a8977a", cursor: "pointer" }}
          >
            Reset to suggested text
          </button>
        )}
      </div>
    </div>
  );
}
