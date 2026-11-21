import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthSession } from "@/components/navigation/AuthSession";
import { Toaster } from "@/components/ui/toaster";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMJV Youth Festival 2026 · Official Registration Portal",
  description:
    "Official sports & cultural fest registration portal for SMJV Youth Festival 2026 — Shri Mahavira Jaina Vidyalaya, Vadodara. Register, verify and generate your official tournament ID pass.",
  keywords: [
    "SMJV Youth Festival 2026",
    "SMJV",
    "Shri Mahavira Jaina Vidyalaya",
    "Vadodara",
    "sports fest",
    "cultural fest",
    "registration",
  ],
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
};

export const viewport: Viewport = {
  themeColor: "#FBF8F1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anton.variable} ${inter.variable} ${jetMono.variable} font-sans antialiased bg-fest-bg text-fest-white min-h-[100dvh] relative overflow-x-hidden`}
      >
        {/* ── Persistent cinematic video background & glassmorphic atmospheric layers ── */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover scale-[2.85] origin-center sm:scale-100"
          >
            <source src="/BG_Video.mp4" type="video/mp4" />
            <source src="/BG_Video.MP4" type="video/mp4" />
            <source src="/rule-books-and-schedules/BG_Video.mp4" type="video/mp4" />
          </video>

          {/* Luminous veil to maintain optimal readability for typography & glassmorphism cards */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/20 to-white/35 backdrop-blur-[0.5px]" />

          {/* Dynamic colorful glowing glass orbs to add fest color refraction into the stadium lights */}
          <div className="absolute -left-20 -top-20 h-[55vw] w-[55vw] max-h-[650px] max-w-[650px] rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/15 to-rose-400/10 blur-[85px]" />
          <div className="absolute -right-24 top-[10%] h-[50vw] w-[50vw] max-h-[600px] max-w-[600px] rounded-full bg-gradient-to-bl from-teal-500/20 via-cyan-400/15 to-sky-500/10 blur-[85px]" />
          <div className="absolute left-[20%] top-[35%] h-[45vw] w-[45vw] max-h-[550px] max-w-[550px] rounded-full bg-gradient-to-tr from-orange-400/20 via-yellow-300/15 to-amber-400/10 blur-[95px]" />

          {/* Ambient fine grid overlay that provides subtle optical texture through frosted glass */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(#1C2438 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 min-h-[100dvh]">
          {children}
        </div>
        <AuthSession />
        <Toaster />
      </body>
    </html>
  );
}
