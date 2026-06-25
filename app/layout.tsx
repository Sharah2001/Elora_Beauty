import type { Metadata } from "next";
import {JetBrains_Mono, Outfit, Playfair_Display} from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

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
      <body className={`${outfit.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
