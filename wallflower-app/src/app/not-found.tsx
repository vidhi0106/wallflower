import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ color: "#4a3d2c" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/flowers2/tulip.png" alt="" style={{ height: 70, width: "auto", opacity: 0.9 }} />
      <h1 className="font-caveat font-bold text-3xl mt-4">This garden doesn&rsquo;t exist</h1>
      <p className="mt-2.5 text-sm max-w-sm" style={{ color: "#7c6a4e", lineHeight: 1.6 }}>
        The link you followed might be mistyped, or the event may have been removed.
      </p>
      <Link
        href="/"
        className="font-nunito font-bold mt-6 no-underline"
        style={{ background: "#6b7d5c", color: "#FBF6E9", borderRadius: 10, padding: "12px 22px", fontSize: 15 }}
      >
        Back to Wallflower
      </Link>
    </div>
  );
}
