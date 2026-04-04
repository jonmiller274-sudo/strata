import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Strata — Interactive Strategy Artifacts",
    template: "%s | Strata",
  },
  description:
    "Turn strategic content into interactive, shareable artifacts — in minutes, not days. No slides. No coding. Just a link.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://strata-lake-delta.vercel.app"
  ),
  openGraph: {
    title: "Strata — Interactive Strategy Artifacts",
    description:
      "Turn strategic content into interactive, shareable artifacts — in minutes, not days. No slides. No coding. Just a link.",
    type: "website",
    siteName: "Strata",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strata — Interactive Strategy Artifacts",
    description:
      "Turn strategic content into interactive, shareable artifacts — in minutes, not days.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
