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
  title: {
    default: "Citron Phase 2 Documents",
    template: "%s | Citron Phase 2 Documents",
  },
  description: "Comprehensive document management system for share certificates, nominations, and NOC requests. Streamline your document workflows with ease.",
  keywords: ["document management", "share certificates", "nominations", "NOC requests", "citron documents"],
  authors: [{ name: "Citron Phase 2 Documents" }],
  creator: "Citron Phase 2 Documents",
  publisher: "Citron Phase 2 Documents",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Citron Phase 2 Documents",
    description: "Comprehensive document management system for share certificates, nominations, and NOC requests. Streamline your document workflows with ease.",
    siteName: "Citron Phase 2 Documents",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Citron Documents - Document Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Citron Phase 2 Documents",
    description: "Comprehensive document management system for share certificates, nominations, and NOC requests.",
    images: ["/og-image.png"],
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
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
