import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nomination Form",
  description:
    "Register your nominees for share certificate inheritance. Complete the nomination form online for Citron Phase 2 C & D Co-operative Housing Society.",
  keywords: [
    "nomination form",
    "share certificate nomination",
    "housing society nomination",
    "citron phase 2",
    "nominee registration",
  ],
  openGraph: {
    title: "Nomination Form | Citron Documents",
    description:
      "Register your nominees for share certificate inheritance. Complete the nomination form online with secure document submission.",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-nomination.png`,
        width: 1200,
        height: 630,
        alt: "Nomination Form",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomination Form | Citron Documents",
    description:
      "Register your nominees for share certificate inheritance online.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-nomination.png`],
  },
};

export default function NominationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
