import type { Metadata } from "next";
import {Outfit, Playfair_Display} from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
  display: "optional",
});

export const metadata: Metadata = {
  title: "Elora Beauty | Colombo Premium Multi-Branch Beauty Parlour",
  description:
    "Elora Beauty Parlour Colombo. Luxury multi-branch salon offering professional hair, nails, makeup, skin care, and bridal styling.",
  applicationName: "Elora Beauty",
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#1a1a1a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
