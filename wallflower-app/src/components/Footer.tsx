import Link from "next/link";

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
          <span className="font-caveat font-bold" style={{ fontSize: 15, lineHeight: 1.15, color: "#4a3d2c" }}>
            Send
            <br />
            feedback
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
    <footer className="w-full">
      <div className="w-full" style={{ background: "rgba(247, 239, 221, 0.5)" }}>
        <div
          className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8 sm:gap-4 px-8 py-8"
          style={{ maxWidth: 760, margin: "0 auto" }}
        >
          <div className="text-center sm:text-left">
            <Link href="/" className="font-caveat font-bold text-2xl no-underline" style={{ color: "#4a3d2c" }}>
              Wallflower
            </Link>
            <p className="text-xs mt-2" style={{ color: "#a8977a" }}>
              A little garden of notes, revealed all at once.
            </p>
            <Link
              href="/login"
              className="font-nunito font-bold no-underline inline-block mt-4"
              style={{ background: "#6b7d5c", color: "#FBF6E9", borderRadius: 10, padding: "10px 20px", fontSize: 14 }}
            >
              Create an event
            </Link>
            <p className="text-xs mt-4" style={{ color: "#a8977a" }}>
              &copy; 2026 Vidhi Shah &middot; Built with Claude
            </p>
          </div>
          <FeedbackEnvelope />
        </div>
      </div>
    </footer>
  );
}
