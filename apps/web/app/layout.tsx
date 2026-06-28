import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medical AI Reporting Prototype",
  description: "Prototype dashboard for consultation transcription and AI-assisted report generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

