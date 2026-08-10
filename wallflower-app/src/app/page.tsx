import HeroEnvelope from "@/components/landing/HeroEnvelope";
import HowItWorks from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: "#EFEAE0", color: "#4a3d2c" }}>
      <header className="w-full flex justify-center px-6 py-6">
        <span className="font-caveat font-bold text-xl">Wallflower</span>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">
        <HeroEnvelope />

        <div className="w-full mt-20 mb-16">
          <HowItWorks />
        </div>
      </main>

      <footer className="w-full text-center px-6 py-6 text-xs" style={{ color: "#a8977a" }}>
        Wallflower
      </footer>
    </div>
  );
}
