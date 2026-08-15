import type { Metadata } from "next";
import { Caveat, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import { getBaseUrl } from "@/lib/wallflower/email";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Wallflower",
  description: "Build a bouquet and tuck a note into the garden.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${caveat.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
