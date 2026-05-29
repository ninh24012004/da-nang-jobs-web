import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import HeaderWrapper from "@/components/layout/candidate/HeaderWrapper";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Đà Nẵng Job",
  description: "Tìm kiếm việc làm tại Đà Nẵng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <HeaderWrapper />
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={2000}
        />
      </body>
    </html>
  );
}
