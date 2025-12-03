import { Metadata } from "next";

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export function generateMetadata({
  title,
  description,
  path,
  image = "/og-image.png",
}: PageMetadata): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
