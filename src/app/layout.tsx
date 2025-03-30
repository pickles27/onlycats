import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnlyCats",
  description: "Only cats allowed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className="px-4 sm:px-12 lg:px-16 pt-14">{children}</div>
        <Toaster />
        <Footer />
      </body>
      <Analytics />
    </html>
  );
}
