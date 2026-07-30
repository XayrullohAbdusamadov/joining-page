import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic-ext"],
});

export const metadata: Metadata = {
  title: "Tizim - Zamonaviy va Xavfsiz Shaxsiy Platforma",
  description: "Sizning barcha ma'lumotlaringizni boshqarish uchun xavfsiz va minimalistik shaxsiy platforma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
