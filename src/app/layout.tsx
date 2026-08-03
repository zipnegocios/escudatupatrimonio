import type { Metadata, Viewport } from "next";
import "@/presentation/styles/globals.css";
import { BRAND_NAME } from "@/presentation/constants";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: "Evaluación de programas de ahorro y protección",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
