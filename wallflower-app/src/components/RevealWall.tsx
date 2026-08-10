"use client";

import { useEffect, useState } from "react";
import { ENVELOPE_COLOR_MAP, type EnvelopeColorId, type FlowerId } from "@/lib/wallflower/catalog";
import { makeStem, tightTransform } from "@/lib/wallflower/bouquet";

export interface WallSubmission {
  id: string;
  contributorName: string;
  noteText: string;
  bouquetData: { flowerIds: FlowerId[]; color: EnvelopeColorId };
  updatedAt: string;
}

function lastSeenKey(slug: string) {
  return `wallflower:wall-seen:${slug}`;
}

function WallCard({ submission }: { submission: WallSubmission }) {
  const [flipped, setFlipped] = useState(false);
  const activeColor = ENVELOPE_COLOR_MAP[submission.bouquetData.color];
  const stems = submission.bouquetData.flowerIds.map((id) => makeStem(id));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      style={{ position: "relative", height: 225, cursor: "pointer" }}
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
        <div className="font-caveat font-bold" style={{ fontSize: 17, color: "#4a3d2c" }}>
          {submission.contributorName}
        </div>
        <div className="font-caveat" style={{ fontSize: 13, color: "#4a3d2c", marginTop: 6, lineHeight: 1.3, overflow: "hidden" }}>
          {submission.noteText}
        </div>
      </div>
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
}: {
  slug: string;
  recipientName: string;
  occasionText: string;
  status: "collecting" | "revealed";
  revealDate: string | null;
  now: number;
  submissions: WallSubmission[];
}) {
  // RevealWall only ever mounts client-side (the wall tab isn't the default
  // view, so this never renders during SSR) — safe to read localStorage
  // synchronously as the initial state rather than in an effect.
  const [newCount] = useState(() => {
    if (status !== "revealed") return 0;
    const lastSeen = window.localStorage.getItem(lastSeenKey(slug));
    if (!lastSeen) return 0;
    return submissions.filter((s) => new Date(s.updatedAt).getTime() > Number(lastSeen)).length;
  });

  useEffect(() => {
    if (status !== "revealed") return;
    window.localStorage.setItem(lastSeenKey(slug), String(Date.now()));
  }, [status, slug]);

  if (status !== "revealed") {
    return (
      <div className="text-center px-8 py-16 flex-1 flex flex-col items-center justify-center">
        <img src="/flowers2/tulip.png" alt="" style={{ height: 70, width: "auto", opacity: 0.9 }} />
        <div className="font-caveat font-bold text-2xl mt-4" style={{ color: "#4a3d2c" }}>
          Blooming soon
        </div>
        <p className="mt-2.5 text-sm" style={{ color: "#7c6a4e", lineHeight: 1.5 }}>
          {recipientName}&rsquo;s garden is still growing — every bouquet stays tucked away until the
          big reveal.
        </p>
        <div className="font-caveat font-bold text-xl mt-5" style={{ color: "#6b7d5c" }}>
          {formatCountdown(revealDate, now)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-10 pt-1.5 flex-1">
      <div className="text-center mt-0.5 mb-4">
        <div className="font-caveat font-bold text-2xl" style={{ color: "#4a3d2c" }}>
          {recipientName}&rsquo;s Garden
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#7c6a4e" }}>
          {occasionText} · {submissions.length} bouquet{submissions.length === 1 ? "" : "s"} tucked in
          {newCount > 0 && (
            <span className="font-nunito font-bold ml-2" style={{ color: "#6b7d5c" }}>
              · {newCount} new
            </span>
          )}
        </div>
      </div>
      {submissions.length === 0 ? (
        <p className="text-center text-sm mt-8" style={{ color: "#a8977a" }}>
          No approved bouquets yet — check back soon.
        </p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))" }}>
          {submissions.map((s) => (
            <WallCard key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}
