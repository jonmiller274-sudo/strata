import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Strata — Interactive Strategy Artifacts",
  description:
    "Build once, deliver as link, video, or PDF. Turn strategic content into polished, interactive artifacts in minutes.",
  openGraph: {
    title: "Strata — Interactive Strategy Artifacts",
    description:
      "Build once, deliver as link, video, or PDF. Turn strategic content into polished, interactive artifacts in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
