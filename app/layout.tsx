import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iPhone 17 Pro — Thin as a thought.",
  description: "A cinematic iPhone 17 Pro product launch experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
