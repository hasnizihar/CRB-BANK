import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CRB Management System | Kattankudy MPCS Limited",
  description:
    "Cooperative Rural Bank Management System for Kattankudy MPCS Limited. Digitalized banking operations for savings, loans, deposits, and financial management.",
  keywords: ["CRB", "Cooperative Rural Bank", "Kattankudy", "MPCS", "Banking"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
