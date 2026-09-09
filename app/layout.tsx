import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://simonamor.design"),
  title: "Simon Amor",
  openGraph: { title: "Simon Amor — Design & experiments", images: [{ url: "/social-card.png", width: 1200, height: 630 }] },
  description: "London-based designer and Co-Founder of Morse. Previously building at Spotify, Monzo, Google and more.",
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
      </body>
    </html>
  );
}
