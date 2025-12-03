import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NOC Request",
  description:
    "Request No Objection Certificate for flat transfer or sale. Submit your NOC request online for Citron Phase 2 C & D Co-operative Housing Society.",
  keywords: [
    "NOC request",
    "no objection certificate",
    "flat transfer NOC",
    "housing society NOC",
    "citron phase 2",
  ],
  openGraph: {
    title: "NOC Request | Citron Documents",
    description:
      "Request No Objection Certificate for flat transfer or sale. Quick online NOC application process.",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-noc.png`,
        width: 1200,
        height: 630,
        alt: "NOC Request",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOC Request | Citron Documents",
    description:
      "Request No Objection Certificate for flat transfer or sale online.",
    images: [
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-noc.png`,
    ],
  },
};

export default function NOCRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
