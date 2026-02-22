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
  title: "Simon Amor",
  description: "London based designer and Co-Founder of Sling Money. Previously building at Spotify, Monzo, Google and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/images/project2.png" as="image" />
        <link rel="preload" href="/images/project3.png" as="image" />
        <link rel="preload" href="/images/project4.png" as="image" />
        <link rel="preload" href="/posters/project1.png" as="image" />
      </head>
      <body className={`${inter.className} ${robotoMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
