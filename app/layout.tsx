import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elora Beauty | Colombo Premium Multi-Branch Beauty Parlour",
  description:
    "Elora Beauty Parlour Colombo. Luxury multi-branch salon offering professional hair, nails, makeup, skin care, and bridal styling.",
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
