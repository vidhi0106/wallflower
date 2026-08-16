"use client";

import { useEffect, useRef, useState } from "react";
import { ENVELOPE_COLOR_MAP, type EnvelopeColorId, type FlowerId } from "@/lib/wallflower/catalog";
import { makeStem, tightTransform } from "@/lib/wallflower/bouquet";
import NoteModal from "@/components/NoteModal";

export interface WallSubmission {
  id: string;
  contributorName: string;
  // null when the viewer isn't allowed to read this note yet — the card
  // still renders (envelope, flowers, contributor name) but can't be
  // flipped open.
  noteText: string | null;
  bouquetData: { flowerIds: FlowerId[]; color: EnvelopeColorId };
  updatedAt: string;
}

function lastSeenKey(slug: string) {
  return `wallflower:wall-seen:${slug}`;
}

function submissionStorageKey(slug: string) {
  return `wallflower:submission:${slug}`;
}

// Deterministic (not Math.random()) so a card's tilt/delay stays stable
// across re-renders instead of jittering every time state changes.
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function WallCard({
  submission,
  index,
  onExpand,
}: {
  submission: WallSubmission;
  index: number;
  onExpand: (id: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const noteTextRef = useRef<HTMLDivElement>(null);
  const unlocked = submission.noteText !== null;
  const activeColor = ENVELOPE_COLOR_MAP[submission.bouquetData.color];
  const stems = submission.bouquetData.flowerIds.map((id) => makeStem(id));

  useEffect(() => {
    const el = noteTextRef.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [submission.noteText]);

  const seed = hashString(submission.id);
  const rotation = ((seed % 100) / 100) * 10 - 5; // -5deg .. 5deg, stable per card
  const delay = ((Math.floor(seed / 100) % 60) / 60) * 0.5 + index * 0.03; // staggered + a little randomized

  return (
    <div
      role={unlocked ? "button" : undefined}
      tabIndex={unlocked ? 0 : undefined}
      onClick={unlocked ? () => setFlipped((f) => !f) : undefined}
      onKeyDown={unlocked ? (e) => e.key === "Enter" && setFlipped((f) => !f) : undefined}
      className="wf-envelope"
      style={
        {
          position: "relative",
          height: 225,
          cursor: unlocked ? "pointer" : "default",
          "--wf-rot": `${rotation}deg`,
          "--wf-delay": `${delay}s`,
        } as React.CSSProperties
      }
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: flipped ? 0 : 1,
          transform: flipped ? "scale(0.94)" : "scale(1)",
          pointerEvents: flipped ? "none" : "auto",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        <img src={activeColor.back} alt="" style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 1 }} />
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
                bottom: "54px",
                height: "90px",
                width: "auto",
                transform: `translate(-50%,0) translate(${t.dx * 0.48}px, ${t.dy * 0.48}px) rotate(${t.rot}deg) scale(${t.scale})`,
                transformOrigin: "bottom center",
                zIndex: 2,
                filter: "drop-shadow(0 2px 4px rgba(90,70,40,0.15))",
              }}
            />
          );
        })}
        <div style={{ position: "absolute", left: "50%", bottom: "27px", width: "72%", transform: "translateX(-50%)", zIndex: 3 }}>
          <img src="/envelope2/note.png" alt="" style={{ width: "100%", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", padding: "20% 10% 0", textAlign: "center", overflow: "hidden" }}>
            <div className="font-caveat" style={{ fontSize: 11, lineHeight: 1.2, color: "#4a3d2c" }}>
              From {submission.contributorName}
            </div>
          </div>
        </div>
        <img src={activeColor.front} alt="" style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 4 }} />
      </div>

      {unlocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/envelope2/note-writing-bg.png')",
            backgroundSize: "100% 100%",
            padding: 16,
            opacity: flipped ? 1 : 0,
            transform: flipped ? "scale(1)" : "scale(0.94)",
            pointerEvents: flipped ? "auto" : "none",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          <div className="font-caveat font-bold" style={{ fontSize: 19, color: "#4a3d2c" }}>
            {submission.contributorName}
          </div>
          <div style={{ position: "relative" }}>
            <div
              ref={noteTextRef}
              className="font-caveat"
              style={{ fontSize: 22, color: "#4a3d2c", marginTop: 6, lineHeight: 1.3, maxHeight: 128, overflow: "hidden" }}
            >
              {submission.noteText}
            </div>
            {overflowing && (
              <>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 28,
                    background: "linear-gradient(to bottom, rgba(251,246,233,0), rgba(251,246,233,0.95))",
                    pointerEvents: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand(submission.id);
                  }}
                  className="font-nunito font-bold"
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 0,
                    fontSize: 12,
                    color: "#6b7d5c",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Read more
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCountdown(revealDate: string | null, now: number): string {
  if (!revealDate) return "reveal day";
  const diffMs = Math.max(0, new Date(revealDate).getTime() - now);
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `${days}d ${hours}h ${mins}m`;
}

export default function RevealWall({
  slug,
  recipientName,
  occasionText,
  status,
  revealDate,
  now,
  submissions,
  fullAccess,
}: {
  slug: string;
  recipientName: string;
  occasionText: string;
  status: "collecting" | "revealed";
  revealDate: string | null;
  now: number;
  submissions: WallSubmission[];
  fullAccess: boolean;
}) {
  // A direct ?view=wall link (dashboard's "View Wall" / the recipient link)
  // renders this during SSR too, where window isn't available — only the
  // client-side render (which runs again on hydration) can read localStorage.
  const [newCount] = useState(() => {
    if (status !== "revealed" || typeof window === "undefined") return 0;
    const lastSeen = window.localStorage.getItem(lastSeenKey(slug));
    if (!lastSeen) return 0;
    return submissions.filter((s) => new Date(s.updatedAt).getTime() > Number(lastSeen)).length;
  });

  useEffect(() => {
    if (status !== "revealed") return;
    window.localStorage.setItem(lastSeenKey(slug), String(Date.now()));
  }, [status, slug]);

  // Everyone's server-sent noteText is null except for full-access viewers
  // (organizer/recipient) — a regular contributor unlocks only their own
  // card, by looking up their own submission via the editToken already
  // stashed in localStorage from the builder flow.
  const [ownSubmission, setOwnSubmission] = useState<{ id: string; noteText: string } | null>(null);

  // Which card's "Read more" opened the modal, if any. Navigation only ever
  // moves between notes this viewer can actually read -- a regular
  // contributor with just their own note unlocked has nothing to page to,
  // so the modal simply won't show arrows for them.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (fullAccess || status !== "revealed") return;
    const token = window.localStorage.getItem(submissionStorageKey(slug));
    if (!token) return;
    let cancelled = false;
    fetch(`/api/submissions/${token}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { id: string; noteText: string; status: string } | null) => {
        if (cancelled || !data || data.status !== "approved") return;
        setOwnSubmission({ id: data.id, noteText: data.noteText });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fullAccess, status, slug]);

  const resolvedSubmissions = fullAccess
    ? submissions
    : submissions.map((s) =>
        s.id === ownSubmission?.id ? { ...s, noteText: ownSubmission.noteText } : s
      );

  const readableNotes = resolvedSubmissions
    .filter((s): s is WallSubmission & { noteText: string } => s.noteText !== null)
    .map((s) => ({ id: s.id, contributorName: s.contributorName, noteText: s.noteText }));

  if (status !== "revealed") {
    return (
      <div className="text-center px-8 py-16 flex-1 flex flex-col items-center justify-center">
        <img src="/flowers2/tulip.png" alt="" style={{ height: 70, width: "auto", opacity: 0.9 }} />
        <div className="font-caveat font-bold text-[26px] mt-4" style={{ color: "#4a3d2c" }}>
          Blooming soon
        </div>
        <p className="mt-2.5 text-[16px]" style={{ color: "#7c6a4e", lineHeight: 1.5 }}>
          {recipientName}&rsquo;s garden is still growing. Every bouquet stays tucked away until the
          big reveal.
        </p>
        <div className="font-caveat font-bold text-[22px] mt-5" style={{ color: "#6b7d5c" }}>
          {formatCountdown(revealDate, now)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-10 pt-1.5 flex-1">
      <div className="text-center mt-0.5 mb-4">
        <div className="font-caveat font-bold text-[26px]" style={{ color: "#4a3d2c" }}>
          {recipientName}&rsquo;s Garden
        </div>
        <div className="text-[14px] mt-0.5" style={{ color: "#7c6a4e" }}>
          {occasionText} · {submissions.length} bouquet{submissions.length === 1 ? "" : "s"} tucked in
          {newCount > 0 && (
            <span className="font-nunito font-bold ml-2" style={{ color: "#6b7d5c" }}>
              · {newCount} new
            </span>
          )}
        </div>
      </div>
      {submissions.length === 0 ? (
        <p className="text-center text-[16px] mt-8" style={{ color: "#a8977a" }}>
          No approved bouquets yet. Check back soon.
        </p>
      ) : (
        <div className="wf-wall-grid">
          {resolvedSubmissions.map((s, i) => (
            <WallCard key={s.id} submission={s} index={i} onExpand={setExpandedId} />
          ))}
        </div>
      )}
      {expandedId && (
        <NoteModal
          notes={readableNotes}
          currentId={expandedId}
          onClose={() => setExpandedId(null)}
          onNavigate={setExpandedId}
        />
      )}
    </div>
  );
}
