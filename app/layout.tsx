import { Mona_Sans } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "../components/ClientLayout";

export const metadata: Metadata = {
  title: "VoiceAgent",
  description: "An AI-powered platform for voice device control and automation",
};

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
       <body className={`${monaSans.className} antialiased pattern`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}