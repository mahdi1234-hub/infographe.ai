import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "infographe.ai — chat that draws",
  description:
    "An AI agent that converses with you and generates professional infographics inline — powered by Cerebras Llama 3.1 8B and @antv/infographic.",
  openGraph: {
    title: "infographe.ai",
    description:
      "Chat that draws. Mountains, pyramids, funnels, timelines and 270+ more infographic templates, generated live.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="grain antialiased">{children}</body>
    </html>
  );
}
