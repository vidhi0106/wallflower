import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full" style={{ borderTop: "1px solid rgba(122,100,70,0.15)" }}>
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col items-center gap-3 text-center">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-nunito font-bold">
          <Link href="/login" style={{ color: "#6b7d5c" }}>
            Create your own event
          </Link>
          <Link href="/" style={{ color: "#6b7d5c" }}>
            What is Wallflower
          </Link>
          <a href="mailto:vidhishah0106@gmail.com?subject=Wallflower%20feedback" style={{ color: "#6b7d5c" }}>
            Send feedback
          </a>
        </div>
        <p className="text-xs" style={{ color: "#a8977a" }}>
          &copy; 2026 Vidhi Shah &middot; Built with Claude
        </p>
      </div>
    </footer>
  );
}
