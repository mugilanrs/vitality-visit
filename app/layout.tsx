import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TCS Campus — Interactive 2.5D Map",
  description:
    "A digital architectural exhibition of the TCS campus — explore the site through a cinematic 2.5D journey.",
};

export const viewport = {
  themeColor: "#eaf0f6",
  width: "device-width",
  initialScale: 1,
  // Ensure iOS Safari lets us paint under the notch/home-bar so the campus
  // occupies the full display; env(safe-area-inset-*) is then honoured by
  // the UI (header, agenda cards) to keep controls clear of hardware chrome.
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#eaf0f6] text-slate-900">{children}</body>
    </html>
  );
}
