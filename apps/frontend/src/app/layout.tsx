import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "arabic"] });

export const metadata: Metadata = {
  title: "دليل خدمتك - بورتسودان",
  description: "المنصة الموحدة لربط المهنيين والأسر المنتجة في مدينة بورتسودان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
