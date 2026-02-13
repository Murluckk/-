import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "14k | Click the Pill",
  description: "Click the 14k pill. Earn points. Join the movement.",
  openGraph: {
    title: "14k | Click the Pill",
    description: "Click the 14k pill. Earn points. Join the movement.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "14k | Click the Pill",
    description: "Click the 14k pill. Earn points. Join the movement.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
