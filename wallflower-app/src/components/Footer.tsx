import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full" style={{ background: "#f7efdd", borderTop: "1px solid rgba(122,100,70,0.15)" }}>
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
        <div>
          <Link href="/" className="font-caveat font-bold text-2xl no-underline" style={{ color: "#4a3d2c" }}>
            Wallflower
          </Link>
          <p className="text-xs mt-2 max-w-[220px]" style={{ color: "#a8977a", lineHeight: 1.6 }}>
            A little garden of notes, hidden until the big reveal.
          </p>
        </div>
        <nav className="flex flex-col gap-2.5 text-sm font-nunito font-bold sm:items-end">
          <Link href="/login" style={{ color: "#6b7d5c" }}>
            Create your own event
          </Link>
          <a href="mailto:vidhishah0106@gmail.com?subject=Wallflower%20feedback" style={{ color: "#6b7d5c" }}>
            Send feedback
          </a>
        </nav>
      </div>
      <div style={{ borderTop: "1px solid rgba(122,100,70,0.12)" }}>
        <p className="max-w-3xl mx-auto px-6 py-4 text-xs text-center sm:text-left" style={{ color: "#a8977a" }}>
          &copy; 2026 Vidhi Shah &middot; Built with Claude
        </p>
      </div>
    </footer>
  );
}
