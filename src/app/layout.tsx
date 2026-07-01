import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Analytics } from "@/components/analytics/Analytics";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Baeco Hospitality",
    template: "%s — Baeco Hospitality",
  },
  description: "Ospitalitate discretă, standard de lux.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${manrope.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-midnight text-ivory antialiased">
        {children}
        <Analytics />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
