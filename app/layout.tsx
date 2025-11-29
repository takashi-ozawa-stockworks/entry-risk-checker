import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Entry Risk Checker",
  description: "FXエントリー前にリスク管理を確認するツール（USD/JPY）",
};

import { PasscodeProvider } from "@/contexts/PasscodeContext";
import PasscodeLock from "@/components/features/PasscodeLock";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}
      >
        <PasscodeProvider>
          <div className="min-h-screen">{children}</div>
          <PasscodeLock />
        </PasscodeProvider>
      </body>
    </html>
  );
}
