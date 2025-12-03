import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Certificate Application",
  description:
    "Apply for your share certificate online. Submit your application for Citron Phase 2 C & D Co-operative Housing Society share certificate with easy document upload.",
  keywords: [
    "share certificate",
    "housing society",
    "cooperative society",
    "citron phase 2",
    "application form",
  ],
  openGraph: {
    title: "Share Certificate Application | Citron Documents",
    description:
      "Apply for your share certificate online. Quick and simple application process with document upload.",
    type: "website",
    images: [
      {
        url: "/og-share-certificate.png",
        width: 1200,
        height: 630,
        alt: "Share Certificate Application",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Certificate Application | Citron Documents",
    description:
      "Apply for your share certificate online. Quick and simple application process.",
  },
};

export default function ShareCertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
