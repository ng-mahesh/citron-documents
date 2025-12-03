import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Application Status",
  description:
    "Check real-time status of your share certificate, nomination, or NOC applications. Track your application progress with acknowledgement number.",
  keywords: [
    "track status",
    "application status",
    "check application",
    "acknowledgement number",
    "citron phase 2",
  ],
  openGraph: {
    title: "Track Application Status | Citron Documents",
    description:
      "Check real-time status of your applications. Track share certificate, nomination, and NOC requests easily.",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-status.png`,
        width: 1200,
        height: 630,
        alt: "Track Application Status",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Application Status | Citron Documents",
    description: "Check real-time status of your applications with ease.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-status.png`],
  },
};

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
