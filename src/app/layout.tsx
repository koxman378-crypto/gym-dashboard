"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/src/store/provider";
import { AppLayout } from "@/src/components/layout/AppLayout";
import { TokenRefreshProvider } from "@/src/components/auth/TokenRefreshProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <TokenRefreshProvider />
          <AppLayout>{children}</AppLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
