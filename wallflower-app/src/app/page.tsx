import Link from "next/link";

const decorStems = [
  { src: "/flowers2/lavender.png", dx: -34, dy: -60, rot: -8, scale: 0.95 },
  { src: "/flowers2/poppy.png", dx: 0, dy: -78, rot: 0, scale: 1 },
  { src: "/flowers2/daisy-pink.png", dx: 34, dy: -58, rot: 9, scale: 0.9 },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: "#EFEAE0", color: "#4a3d2c" }}>
      <header className="w-full flex justify-center px-6 py-6">
        <span className="font-caveat font-bold text-xl">Wallflower</span>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center px-6" style={{ maxWidth: 440, margin: "0 auto" }}>
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
            src="/envelope2/envelope-front.png"
            alt=""
            style={{ position: "absolute", left: "50%", bottom: 0, width: "100%", transform: "translateX(-50%)", zIndex: 3 }}
          />
        </div>

        <h1 className="font-caveat font-bold text-3xl text-center mt-6">A garden of notes, tucked away for the big day</h1>
        <p className="text-sm text-center mt-3" style={{ color: "#7c6a4e", lineHeight: 1.6 }}>
          Everyone who loves them builds a little bouquet, tucks it into an envelope, and writes a
          note. It all stays hidden until you reveal it — one combined garden, all at once.
        </p>

        <Link
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
        </Link>

        <p className="text-xs text-center mt-4" style={{ color: "#a8977a" }}>
          Already have a link from a friend? Use the one they shared with you to add your own
          bouquet.
        </p>
      </main>

      <footer className="w-full text-center px-6 py-6 text-xs" style={{ color: "#a8977a" }}>
        Wallflower
      </footer>
    </div>
  );
}
