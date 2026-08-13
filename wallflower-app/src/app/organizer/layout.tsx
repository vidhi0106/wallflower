import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentOrganizer } from "@/lib/wallflower/auth";
import { logout } from "./actions";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/login");

  return (
    <div className="min-h-screen" style={{ background: "#EFEAE0" }}>
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(122,100,70,0.15)" }}
      >
        <Link href="/" className="font-caveat font-bold text-xl" style={{ color: "#4a3d2c" }}>
          Wallflower
        </Link>
        <div className="flex items-center gap-4 text-sm" style={{ color: "#7c6a4e" }}>
          <span>{organizer.email}</span>
          <form action={logout}>
            <button type="submit" className="underline cursor-pointer bg-transparent border-none p-0" style={{ color: "#8a6a45" }}>
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
