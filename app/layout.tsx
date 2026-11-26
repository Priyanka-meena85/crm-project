import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { FloatingGoldDots, MarqueeStrip } from "@/components/BoutiqueEffects";

export const metadata: Metadata = {
  title: "Priya Boutique CRM — Nathdwara",
  description: "Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ivory font-sans text-charcoal antialiased selection:bg-maroon selection:text-white">
        <Providers>
          <FloatingGoldDots />
          <MarqueeStrip />
          <div className="relative z-10 min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
