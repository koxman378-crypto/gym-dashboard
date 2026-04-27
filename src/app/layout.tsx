import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ReduxProvider } from "@/src/store/provider";
import { AppLayout } from "@/src/components/layout/AppLayout";
import { LanguageProvider } from "@/src/components/language/LanguageContext";
import { Toaster } from "sonner";

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
        suppressHydrationWarning
      >
        <LanguageProvider>
          <ReduxProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster position="top-center" richColors closeButton />
          </ReduxProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
