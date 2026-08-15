"use client";

import { useEffect, useRef } from "react";

export interface ModalNote {
  id: string;
  contributorName: string;
  noteText: string;
}

function ArrowButton({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      style={{
        position: "absolute",
        [side]: 16,
        top: "50%",
        transform: "translateY(-50%)",
        background: "rgba(255,255,255,0.9)",
        border: "none",
        borderRadius: "50%",
        width: 44,
        height: 44,
        fontSize: 22,
        color: "#4a3d2c",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

export default function NoteModal({
  notes,
  currentId,
  onClose,
  onNavigate,
}: {
  notes: ModalNote[];
  currentId: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const index = notes.findIndex((n) => n.id === currentId);
  const note = notes[index];
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < notes.length - 1;
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(notes[index - 1].id);
      if (e.key === "ArrowRight" && hasNext) onNavigate(notes[index + 1].id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, hasPrev, hasNext, notes, onClose, onNavigate]);

  if (!note) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Note from ${note.contributorName}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(40,32,20,0.55)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {hasPrev && <ArrowButton side="left" label="Previous note" onClick={() => onNavigate(notes[index - 1].id)} />}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          overflowY: "auto",
          backgroundImage: "url('/envelope2/note-writing-bg.png')",
          backgroundSize: "100% 100%",
          borderRadius: 12,
          padding: "40px 32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="font-nunito"
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 24,
            lineHeight: 1,
            color: "#7c6a4e",
          }}
        >
          ×
        </button>
        <div className="font-caveat font-bold" style={{ fontSize: 22, color: "#4a3d2c" }}>
          {note.contributorName}
        </div>
        <div
          className="font-caveat"
          style={{ fontSize: 24, color: "#4a3d2c", marginTop: 12, lineHeight: 1.45, whiteSpace: "pre-wrap" }}
        >
          {note.noteText}
        </div>
      </div>

      {hasNext && <ArrowButton side="right" label="Next note" onClick={() => onNavigate(notes[index + 1].id)} />}
    </div>
  );
}
