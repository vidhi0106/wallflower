import Link from "next/link";

const LEFT_FLOWERS = [
  { src: "/flowers2/lavender.png", offset: -4, height: 92, rot: -9 },
  { src: "/flowers2/daisy-pink.png", offset: 26, height: 68, rot: 7 },
  { src: "/flowers2/poppy.png", offset: 48, height: 78, rot: -4 },
];

const RIGHT_FLOWERS = [
  { src: "/flowers2/hollyhock-pink.png", offset: -4, height: 96, rot: 8 },
  { src: "/flowers2/daisy-yellow.png", offset: 28, height: 66, rot: -7 },
  { src: "/flowers2/marigold-orange.png", offset: 50, height: 76, rot: 5 },
];

function FooterFlowers({ side, flowers }: { side: "left" | "right"; flowers: typeof LEFT_FLOWERS }) {
  const containerStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    width: 130,
    height: 100,
    pointerEvents: "none",
    ...(side === "left" ? { left: 0 } : { right: 0 }),
  };

  return (
    <div className="hidden sm:block" style={containerStyle}>
      {flowers.map((f) => {
        const imgStyle: React.CSSProperties = {
          position: "absolute",
          bottom: -6,
          height: f.height,
          width: "auto",
          transform: `rotate(${f.rot}deg)`,
          transformOrigin: "bottom center",
          filter: "drop-shadow(0 4px 6px rgba(90,70,40,0.18))",
          ...(side === "left" ? { left: f.offset } : { right: f.offset }),
        };
        return <img key={f.src} src={f.src} alt="" style={imgStyle} />;
      })}
    </div>
  );
}

function FeedbackEnvelope() {
  return (
    <a
      href="mailto:vidhishah0106@gmail.com?subject=Wallflower%20feedback"
      aria-label="Send feedback"
      className="wf-footer-envelope"
      style={{ position: "relative", display: "block", width: 92, height: 70, "--wf-rot": "-7deg" } as React.CSSProperties}
    >
      <img
        src="/envelope2/envelope-back.png"
        alt=""
        style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 1 }}
      />
      <div style={{ position: "absolute", left: "50%", bottom: 32, width: "80%", transform: "translateX(-50%)", zIndex: 2 }}>
        <img src="/envelope2/note.png" alt="" style={{ width: "100%", display: "block" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            padding: "16% 6% 0",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <span className="font-caveat font-bold" style={{ fontSize: 15, lineHeight: 1.15, color: "#4a3d2c", whiteSpace: "nowrap" }}>
            Send feedback
          </span>
        </div>
      </div>
      <img
        src="/envelope2/envelope-front.png"
        alt=""
        style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 3 }}
      />
    </a>
  );
}

export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{ position: "relative", background: "#f7efdd", borderTop: "1px solid rgba(122,100,70,0.15)", overflow: "visible" }}
    >
      <FooterFlowers side="left" flowers={LEFT_FLOWERS} />
      <FooterFlowers side="right" flowers={RIGHT_FLOWERS} />
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-end justify-start gap-6">
        <div>
          <Link href="/" className="font-caveat font-bold text-2xl no-underline" style={{ color: "#4a3d2c" }}>
            Wallflower
          </Link>
          <p className="text-xs mt-2 whitespace-nowrap" style={{ color: "#a8977a" }}>
            A little garden of notes, revealed all at once.
          </p>
          <Link
            href="/login"
            className="font-nunito font-bold no-underline inline-block mt-4"
            style={{ background: "#6b7d5c", color: "#FBF6E9", borderRadius: 10, padding: "10px 20px", fontSize: 14 }}
          >
            Create an event
          </Link>
        </div>
        <FeedbackEnvelope />
      </div>
      <div style={{ borderTop: "1px solid rgba(122,100,70,0.12)" }}>
        <p className="max-w-3xl mx-auto px-6 py-4 text-xs text-center" style={{ color: "#a8977a" }}>
          &copy; 2026 Vidhi Shah &middot; Built with Claude
        </p>
      </div>
    </footer>
  );
}
