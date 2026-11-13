import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl, description } from "@/lib/portfolio";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Simon Amor — Product designer & co-founder of Morse", template: "%s | Simon Amor" },
  description,
  verification: { google: "1kTJuSpi1oh4AlocO9oSacD5I-iCt_ehaL_gL_QRMiI" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", url: "/", siteName: "Simon Amor", title: "Simon Amor — Product designer & co-founder of Morse", description,
    images: [{ url: "/social-card.png", width: 1200, height: 630, alt: "Simon Amor — Design and experiments" }],
  },
  twitter: { card: "summary_large_image", title: "Simon Amor — Product designer", description, images: ["/social-card.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${robotoMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
