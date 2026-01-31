import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Twin Resume | Portfolio",
  description:
    "ロボットSIシミュレーターとしてのポートフォリオ。C++ WebAssemblyによる逆運動学・軌道生成、3Dピック&プレースシミュレーション。",
  keywords: [
    "Robot System Integration",
    "Digital Twin",
    "WebAssembly",
    "React Three Fiber",
    "Motion Planning",
  ],
  openGraph: {
    title: "Digital Twin Resume | Portfolio",
    description: "ロボットSIシミュレーターとしてのポートフォリオ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
