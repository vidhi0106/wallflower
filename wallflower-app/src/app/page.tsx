import Link from "next/link";
import HeroEnvelope from "@/components/landing/HeroEnvelope";
import HowItWorks from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center" style={{ color: "#4a3d2c" }}>
      <header className="w-full flex justify-center px-6 py-6">
        <Link href="/" className="font-caveat font-bold text-[22px] no-underline" style={{ color: "#4a3d2c" }}>
          Wallflower
        </Link>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">
        <HeroEnvelope />

        <div className="w-full mt-20 mb-16">
          <HowItWorks />
        </div>
      </main>
    </div>
  );
}
