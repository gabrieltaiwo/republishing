import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Republishing Factory — Editorial & Production Dashboard",
  description:
    "End-to-end production pipeline monitor for public-domain annotated editions (Gates 1–6, OCR proofing, apparatus, and KDP readiness).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-dvh antialiased selection:bg-amber-900/15 selection:text-amber-950"
      >
        {children}
      </body>
    </html>
  );
}
