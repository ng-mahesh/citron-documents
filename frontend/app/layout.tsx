import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Citron Phase 2 Documents",
    template: "%s | Citron Phase 2 Documents",
  },
  description:
    "Comprehensive document management system for share certificates, nominations, and NOC requests. Streamline your document workflows with ease.",
  keywords: [
    "document management",
    "share certificates",
    "nominations",
    "NOC requests",
    "citron documents",
  ],
  authors: [{ name: "Citron Phase 2 Documents" }],
  creator: "Citron Phase 2 Documents",
  publisher: "Citron Phase 2 Documents",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "Citron Phase 2 Documents",
    description:
      "Comprehensive document management system for share certificates, nominations, and NOC requests. Streamline your document workflows with ease.",
    siteName: "Citron Phase 2 Documents",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-image.png`,
        secureUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Citron Documents - Document Management System",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Citron Phase 2 Documents",
    description:
      "Comprehensive document management system for share certificates, nominations, and NOC requests.",
    images: [
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-image.png`,
    ],
    creator: "@citrondocs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
