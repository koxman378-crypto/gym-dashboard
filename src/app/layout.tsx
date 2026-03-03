"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/src/store/provider";
import { AppLayout } from "@/src/components/layout/AppLayout";
import { TokenRefreshProvider } from "@/src/components/auth/TokenRefreshProvider";
import { ThemeProvider } from "@/src/components/theme/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReduxProvider>
            <TokenRefreshProvider />
            <AppLayout>{children}</AppLayout>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
