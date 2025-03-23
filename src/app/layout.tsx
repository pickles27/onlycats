import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import "./globals.css";
import clsx from "clsx";

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
      <body className={clsx(inter.className, "px-8 sm:px-12 lg:px-16 pt-8")}>
        <Header />
        {children}
        <Toaster />
        <Footer />
      </body>
      <Analytics />
    </html>
  );
}
