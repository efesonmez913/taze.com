import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taze — Yerel Üretici Tüketici Platformu",
  description:
    "Çevrendeki üreticileri keşfet, bugün ne ürettiklerini gör. Taze ile üretici ve tüketici doğrudan buluşur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
