import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "AP Literature Book Matchmaker",
  description: "Take a personality quiz to discover books tailored to your preferences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${lora.variable} font-serif antialiased bg-lw-bg text-lw-text dark:bg-lw-dark-bg dark:text-lw-dark-text`}
      >
        {children}
      </body>
    </html>
  );
}
