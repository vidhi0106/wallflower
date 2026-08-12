"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ENVELOPE_COLORS,
  ENVELOPE_COLOR_MAP,
  FLOWERS,
  MAX_STEMS,
  type EnvelopeColorId,
  type FlowerId,
} from "@/lib/wallflower/catalog";
import { makeStem, tightTransform, type Stem } from "@/lib/wallflower/bouquet";
import RevealWall, { type WallSubmission } from "@/components/RevealWall";

export interface BouquetBuilderEvent {
  slug: string;
  recipientName: string;
  occasionText: string;
  revealDate: string | null;
  status: "collecting" | "revealed";
}

interface SubmissionRecord {
  editToken: string;
  contributorName: string;
  contributorEmail: string;
  noteText: string;
  bouquetData: { flowerIds: FlowerId[]; color: EnvelopeColorId };
  status: "pending" | "approved" | "denied";
  denyNote: string | null;
}

function storageKey(slug: string) {
  return `wallflower:submission:${slug}`;
}

function formatCountdown(revealDate: string | null, now: number): string {
  if (!revealDate) return "reveal day";
  const diffMs = Math.max(0, new Date(revealDate).getTime() - now);
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `${days}d ${hours}h ${mins}m`;
}

export default function BouquetBuilder({
  event,
  wallSubmissions,
  fullAccess,
  initialView = "builder",
}: {
  event: BouquetBuilderEvent;
  wallSubmissions: WallSubmission[];
  fullAccess: boolean;
  initialView?: "builder" | "wall";
}) {
  const [view, setView] = useState<"builder" | "wall">(initialView);
  const [stems, setStems] = useState<Stem[]>([]);
  const [color, setColor] = useState<EnvelopeColorId>("blue");
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [mode, setMode] = useState<"building" | "sealed">("building");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // A private edit link (from the confirmation/deny email) takes priority
    // over localStorage so it works from any device, not just the browser
    // that originally submitted.
    const fromUrl = new URLSearchParams(window.location.search).get("edit");
    const token = fromUrl ?? window.localStorage.getItem(storageKey(event.slug));
    if (!token) return;
    let cancelled = false;
    fetch(`/api/submissions/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: SubmissionRecord) => {
        if (cancelled) return;
        setSubmission(data);
        setColor(data.bouquetData.color);
        setStems(data.bouquetData.flowerIds.map((id) => makeStem(id)));
        setNote(data.noteText);
        setName(data.contributorName);
        setEmail(data.contributorEmail);
        setMode("sealed");
        window.localStorage.setItem(storageKey(event.slug), data.editToken);
        if (fromUrl) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      })
      .catch(() => {
        if (cancelled) return;
        window.localStorage.removeItem(storageKey(event.slug));
      });
    return () => {
      cancelled = true;
    };
  }, [event.slug]);

  const activeColor = ENVELOPE_COLOR_MAP[color];
  const canSend = stems.length > 0 && note.trim().length > 0 && name.trim().length > 0 && email.trim().length > 0;
  const countdownText = useMemo(() => formatCountdown(event.revealDate, now), [event.revealDate, now]);

  function addFlower(id: FlowerId) {
    if (stems.length >= MAX_STEMS) return;
    setStems((prev) => [...prev, makeStem(id)]);
  }

  function clearAll() {
    setStems([]);
  }

  async function submit() {
    if (!canSend || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.slug}/submissions`, {
        method: submission ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editToken: submission?.editToken,
          contributorName: name.trim(),
          contributorEmail: email.trim(),
          noteText: note.trim(),
          color,
          flowerIds: stems.map((s) => s.flowerId),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong sending your bouquet.");
      }
      const data: SubmissionRecord = await res.json();
      window.localStorage.setItem(storageKey(event.slug), data.editToken);
      setSubmission(data);
      setMode("sealed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  function editNote() {
    setMode("building");
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: "#f7efdd", color: "#4a3d2c" }}>
      <div className="wf-shell w-full flex flex-col">
        <div className="text-center px-6 pt-6 pb-1">
          <div className="font-caveat font-bold text-[26px]" style={{ color: "#4a3d2c" }}>
            For {event.recipientName}&rsquo;s {event.occasionText}
          </div>
        </div>

        <div className="flex justify-center gap-2 px-6 pt-0.5 pb-2.5">
          <button
            onClick={() => setView("builder")}
            className="font-nunito font-bold text-xs"
            style={{
              border: "none",
              borderRadius: 999,
              padding: "7px 16px",
              background: view === "builder" ? "#6b7d5c" : "rgba(122,100,70,0.1)",
              color: view === "builder" ? "#FBF6E9" : "#7c6a4e",
              cursor: "pointer",
            }}
          >
            Add a Bouquet
          </button>
          <button
            onClick={() => setView("wall")}
            className="font-nunito font-bold text-xs"
            style={{
              border: "none",
              borderRadius: 999,
              padding: "7px 16px",
              background: view === "wall" ? "#6b7d5c" : "rgba(122,100,70,0.1)",
              color: view === "wall" ? "#FBF6E9" : "#7c6a4e",
              cursor: "pointer",
            }}
          >
            Reveal Wall
          </button>
        </div>

        {view === "wall" && (
          <RevealWall
            slug={event.slug}
            recipientName={event.recipientName}
            occasionText={event.occasionText}
            status={event.status}
            revealDate={event.revealDate}
            now={now}
            submissions={wallSubmissions}
            fullAccess={fullAccess}
          />
        )}

        {view === "builder" && (
        <div className="wf-builder-grid flex flex-col flex-1">
          <div className="wf-envelope-col">
            <div className="text-center text-xs px-6 pb-1" style={{ color: "#a8977a" }}>
              Choose your envelope color
            </div>
            <div className="flex gap-2.5 justify-center px-6 pb-2">
              {ENVELOPE_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  aria-label={c.label}
                  disabled={mode === "sealed"}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: c.swatch,
                    border: color === c.id ? "2px solid #4a3d2c" : "2px solid rgba(122,100,70,0.25)",
                    cursor: mode === "sealed" ? "default" : "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            <div className="relative w-full mx-auto" style={{ maxWidth: 320, height: 460, marginTop: -10 }}>
              <img
                src={activeColor.back}
                alt=""
                style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 1 }}
              />

              {stems.map((st, i) => {
                const t = tightTransform(st, i, stems.length);
                return (
                  <img
                    key={st.uid}
                    src={st.src}
                    alt=""
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: "110px",
                      height: "185px",
                      width: "auto",
                      transform: `translate(-50%,0) translate(${t.dx}px, ${t.dy}px) rotate(${t.rot}deg) scale(${t.scale})`,
                      transformOrigin: "bottom center",
                      zIndex: 2,
                      filter: "drop-shadow(0 4px 6px rgba(90,70,40,0.15))",
                      transition: "transform 0.5s cubic-bezier(.3,.7,.2,1)",
                    }}
                  />
                );
              })}

              <div style={{ position: "absolute", left: "50%", bottom: "56px", width: "72%", transform: "translateX(-50%)", zIndex: 3 }}>
                <img src="/envelope2/note.png" alt="" style={{ width: "100%", display: "block" }} />
                {mode === "sealed" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      justifyContent: "center",
                      padding: "20% 14% 0",
                      textAlign: "center",
                      overflow: "hidden",
                    }}
                  >
                    <div className="font-caveat" style={{ fontSize: 20, lineHeight: 1.35, color: "#4a3d2c" }}>
                      From {name}
                    </div>
                  </div>
                )}
              </div>

              <img
                src={activeColor.front}
                alt=""
                style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 4 }}
              />

              {stems.length === 0 && mode === "building" && (
                <div
                  className="font-caveat"
                  style={{ position: "absolute", left: 0, right: 0, bottom: 180, textAlign: "center", color: "#a8977a", fontSize: 18, zIndex: 5 }}
                >
                  tap flowers below to begin
                </div>
              )}
            </div>
          </div>

          <div className="wf-form-col flex flex-col flex-1">
            {mode === "building" && (
              <>
                <div className="flex justify-between px-6 pt-2 pb-0.5 text-xs mx-auto w-full box-border" style={{ maxWidth: 320, color: "#7c6a4e" }}>
                  <span>
                    {stems.length} / {MAX_STEMS} stems
                  </span>
                  <button onClick={clearAll} className="bg-transparent border-none underline p-0 cursor-pointer" style={{ color: "#8a6a45", fontSize: 12 }}>
                    clear
                  </button>
                </div>

                <div className="flex gap-2.5 overflow-x-auto px-6 py-1 pb-4">
                  {FLOWERS.map((f) => {
                    const disabled = stems.length >= MAX_STEMS;
                    return (
                      <button
                        key={f.id}
                        onClick={() => addFlower(f.id)}
                        disabled={disabled}
                        style={{
                          background: "#FBF6E9",
                          border: "1px solid rgba(122,100,70,0.2)",
                          borderRadius: 10,
                          padding: "8px 6px",
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.4 : 1,
                          flex: "0 0 auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img src={f.src} alt={f.label} style={{ height: 44, width: "auto", pointerEvents: "none" }} />
                      </button>
                    );
                  })}
                </div>

                <div className="mx-6 mb-2" style={{ height: 1, background: "rgba(122,100,70,0.15)" }} />

                <div className="px-6 pt-2">
                  <div
                    style={{
                      backgroundImage: "url('/envelope2/note-writing-bg.png')",
                      backgroundSize: "100% 100%",
                      padding: "20px 20px 16px",
                    }}
                  >
                    <div className="font-caveat" style={{ fontSize: 19, color: "#7c6a4e", marginBottom: 4 }}>
                      To {event.recipientName},
                    </div>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Write your note here..."
                      className="font-caveat"
                      style={{
                        width: "100%",
                        minHeight: 150,
                        border: "none",
                        outline: "none",
                        resize: "none",
                        background: "transparent",
                        fontSize: 19,
                        lineHeight: "30px",
                        color: "#4a3d2c",
                        padding: 0,
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="font-caveat"
                      style={{
                        width: "100%",
                        border: "none",
                        borderBottom: "1px solid rgba(122,100,70,0.35)",
                        background: "transparent",
                        padding: "8px 2px",
                        fontSize: 19,
                        outline: "none",
                        color: "#4a3d2c",
                        marginTop: 6,
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      type="email"
                      className="font-caveat"
                      style={{
                        width: "100%",
                        border: "none",
                        borderBottom: "1px solid rgba(122,100,70,0.35)",
                        background: "transparent",
                        padding: "8px 2px",
                        fontSize: 19,
                        outline: "none",
                        color: "#4a3d2c",
                        marginTop: 6,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                {error && (
                  <div className="px-6 pt-3 text-sm" style={{ color: "#b0503f" }}>
                    {error}
                  </div>
                )}
              </>
            )}

            {mode === "sealed" && submission?.status === "denied" ? (
              <div className="text-center px-8 py-9">
                <div className="font-caveat font-bold text-2xl" style={{ color: "#b0503f" }}>
                  Needs a small change
                </div>
                {submission.denyNote && (
                  <p className="mt-2.5 text-sm" style={{ color: "#7c6a4e", lineHeight: 1.5 }}>
                    &ldquo;{submission.denyNote}&rdquo;
                  </p>
                )}
                <p className="mt-2.5 text-sm" style={{ color: "#7c6a4e", lineHeight: 1.5 }}>
                  Edit your bouquet below and send it again.
                </p>
              </div>
            ) : (
              mode === "sealed" && (
                <div className="text-center px-8 py-9">
                  <div className="font-caveat font-bold text-2xl" style={{ color: "#6b7d5c" }}>
                    Sealed &amp; sent
                  </div>
                  <p className="mt-2.5 text-sm" style={{ color: "#7c6a4e", lineHeight: 1.5 }}>
                    Your note will be delivered to {event.recipientName} in {countdownText}.
                  </p>
                </div>
              )
            )}

            <div className="flex-1" style={{ minHeight: 16 }} />
            <div
              className="sticky bottom-0 px-6"
              style={{ background: "linear-gradient(to top, #F7EFDD 65%, rgba(247,239,221,0))", paddingTop: 18, paddingBottom: 22 }}
            >
              {mode === "building" && (
                <button
                  onClick={submit}
                  disabled={!canSend || sending}
                  className="w-full font-nunito font-bold"
                  style={{
                    background: canSend && !sending ? "#6b7d5c" : "#c9c2ac",
                    color: "#FBF6E9",
                    border: "none",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 15,
                    cursor: canSend && !sending ? "pointer" : "not-allowed",
                  }}
                >
                  {sending ? "Sending…" : submission ? "Save changes" : "Send bouquet"}
                </button>
              )}
              {mode === "sealed" && (
                <button
                  onClick={editNote}
                  className="w-full font-nunito font-bold"
                  style={{
                    background: "transparent",
                    color: "#6b7d5c",
                    border: "1px solid #6b7d5c",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Edit your note
                </button>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
