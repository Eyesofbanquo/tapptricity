import type { Metadata } from "next";
import { Spectral } from "next/font/google";
import "./globals.css";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Apptricity Guide",
  description: "Interactive step-by-step guides for Apptricity procedures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spectral.variable} font-serif antialiased bg-snow text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
