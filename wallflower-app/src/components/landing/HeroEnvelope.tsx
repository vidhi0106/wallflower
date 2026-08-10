"use client";

import { useState } from "react";
import { ENVELOPE_COLOR_MAP, type EnvelopeColorId } from "@/lib/wallflower/catalog";

interface StemSpec {
  src: string;
  dx: number;
  dy: number;
  rot: number;
  scale: number;
}

interface ExampleNote {
  id: string;
  occasion: string;
  color: EnvelopeColorId;
  from: string;
  message: string;
  stems: StemSpec[];
}

const EXAMPLE_NOTES: ExampleNote[] = [
  {
    id: "birthday",
    occasion: "Birthday",
    color: "pink",
    from: "Priya",
    message: "Happy birthday! Hope your day is as wonderful as you are.",
    stems: [
      { src: "/flowers2/daisy-pink.png", dx: -8, dy: -30, rot: -6, scale: 0.85 },
      { src: "/flowers2/poppy.png", dx: 9, dy: -34, rot: 7, scale: 0.85 },
    ],
  },
  {
    id: "congrats",
    occasion: "Congratulations",
    color: "green",
    from: "Sam",
    message: "Congrats on the huge milestone — so proud of you.",
    stems: [{ src: "/flowers2/marigold-orange.png", dx: 0, dy: -34, rot: 0, scale: 0.95 }],
  },
  {
    id: "get-well",
    occasion: "Get Well Soon",
    color: "blue",
    from: "Alex",
    message: "Sending you strength and comfort. Feel better soon.",
    stems: [{ src: "/flowers2/lavender.png", dx: 0, dy: -34, rot: 0, scale: 0.95 }],
  },
  {
    id: "new-baby",
    occasion: "New Baby",
    color: "cream",
    from: "Jordan",
    message: "Wishing you all the joy this little one brings!",
    stems: [
      { src: "/flowers2/daisy-yellow.png", dx: -8, dy: -30, rot: -5, scale: 0.85 },
      { src: "/flowers2/cluster-pink-a.png", dx: 9, dy: -32, rot: 6, scale: 0.8 },
    ],
  },
  {
    id: "thank-you",
    occasion: "Thank You",
    color: "green",
    from: "Morgan",
    message: "Thank you for always showing up for me. It means everything.",
    stems: [{ src: "/flowers2/hollyhock-pink.png", dx: 0, dy: -34, rot: 0, scale: 0.95 }],
  },
  {
    id: "just-because",
    occasion: "Just Because",
    color: "pink",
    from: "Riley",
    message: "No reason needed — just thinking of you today.",
    stems: [{ src: "/flowers2/tulip.png", dx: 0, dy: -34, rot: 0, scale: 0.95 }],
  },
];

function NoteCard({ note }: { note: ExampleNote }) {
  const [flipped, setFlipped] = useState(false);
  const color = ENVELOPE_COLOR_MAP[note.color];

  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      aria-label={`${note.occasion} note from ${note.from}${flipped ? ", showing message" : ""}`}
      className="landing-note-card"
      style={{ border: "none", padding: 0, background: "none", cursor: "pointer" }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "148 / 190" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: flipped ? 0 : 1,
            transform: flipped ? "scale(0.94)" : "scale(1)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <img
            src={color.back}
            alt=""
            style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 1 }}
          />
          {note.stems.map((s, i) => (
            <img
              key={i}
              src={s.src}
              alt=""
              style={{
                position: "absolute",
                left: "50%",
                bottom: "44%",
                height: "38%",
                width: "auto",
                transform: `translate(-50%,0) translate(${s.dx}px, ${s.dy}px) rotate(${s.rot}deg) scale(${s.scale})`,
                transformOrigin: "bottom center",
                zIndex: 2,
                filter: "drop-shadow(0 2px 4px rgba(90,70,40,0.15))",
              }}
            />
          ))}
          <div style={{ position: "absolute", left: "50%", bottom: "22%", width: "72%", transform: "translateX(-50%)", zIndex: 3 }}>
            <img src="/envelope2/note.png" alt="" style={{ width: "100%", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", padding: "22% 8% 0", textAlign: "center" }}>
              <span className="font-caveat font-bold" style={{ fontSize: 11, lineHeight: 1.15, color: "#4a3d2c" }}>
                {note.occasion}
              </span>
            </div>
          </div>
          <img
            src={color.front}
            alt=""
            style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 4 }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            backgroundImage: "url('/envelope2/note-writing-bg.png')",
            backgroundSize: "100% 100%",
            padding: "12% 10%",
            opacity: flipped ? 1 : 0,
            transform: flipped ? "scale(1)" : "scale(0.94)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p className="font-caveat" style={{ fontSize: 13, lineHeight: 1.25, color: "#4a3d2c", margin: 0 }}>
            {note.message}
          </p>
          <p className="font-caveat font-bold" style={{ fontSize: 12, color: "#6b7d5c", marginTop: 6 }}>
            — {note.from}
          </p>
        </div>
      </div>
    </button>
  );
}

const decorStems = [
  { src: "/flowers2/lavender.png", dx: -34, dy: -60, rot: -8, scale: 0.95 },
  { src: "/flowers2/poppy.png", dx: 0, dy: -78, rot: 0, scale: 1 },
  { src: "/flowers2/daisy-pink.png", dx: 34, dy: -58, rot: 9, scale: 0.9 },
];

export default function HeroEnvelope() {
  const left = EXAMPLE_NOTES.slice(0, 3);
  const right = EXAMPLE_NOTES.slice(3);

  return (
    <div className="landing-hero">
      <div className="landing-notes-col">
        {left.map((n) => (
          <NoteCard key={n.id} note={n} />
        ))}
      </div>

      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 160, height: 130 }}>
          <img
            src="/envelope2/envelope-back.png"
            alt=""
            style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 1 }}
          />
          {decorStems.map((s) => (
            <img
              key={s.src}
              src={s.src}
              alt=""
              style={{
                position: "absolute",
                left: "50%",
                bottom: 40,
                height: 78,
                width: "auto",
                transform: `translate(-50%,0) translate(${s.dx}px, ${s.dy}px) rotate(${s.rot}deg) scale(${s.scale})`,
                transformOrigin: "bottom center",
                zIndex: 2,
                filter: "drop-shadow(0 3px 5px rgba(90,70,40,0.15))",
              }}
            />
          ))}
          <img
            src="/envelope2/note.png"
            alt=""
            style={{ position: "absolute", left: "50%", bottom: 16, width: "62%", transform: "translateX(-50%)", zIndex: 3 }}
          />
          <img
            src="/envelope2/envelope-front.png"
            alt=""
            style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 4 }}
          />
        </div>

        <h1 className="font-caveat font-bold text-3xl text-center mt-6">
          A garden of notes, tucked away for the big day
        </h1>
        <p className="text-sm text-center mt-3" style={{ color: "#7c6a4e", lineHeight: 1.6, maxWidth: 360 }}>
          Everyone who loves them builds a little bouquet, tucks it into an envelope, and writes a
          note. It all stays hidden until you reveal it — one combined garden, all at once.
        </p>

        <a
          href="/login"
          className="font-nunito font-bold mt-8 text-center no-underline"
          style={{
            display: "block",
            width: "100%",
            maxWidth: 280,
            background: "#6b7d5c",
            color: "#FBF6E9",
            borderRadius: 10,
            padding: 14,
            fontSize: 15,
          }}
        >
          Create an event
        </a>

        <p className="text-xs text-center mt-4" style={{ color: "#a8977a" }}>
          Already have a link from a friend? Use the one they shared with you to add your own
          bouquet.
        </p>
      </div>

      <div className="landing-notes-col">
        {right.map((n) => (
          <NoteCard key={n.id} note={n} />
        ))}
      </div>
    </div>
  );
}
