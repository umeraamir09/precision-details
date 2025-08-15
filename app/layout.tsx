import type { Metadata } from "next";
import {  Poppins, Sora} from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/footer/Footer";

const sora = Sora({
  weight: "800",
  style: "normal",
  variable: "--font-sora",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: "400",
  style: "normal",
  variable: "--font-poppins",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Precision Details",
  description: "Affordable Car Detailing Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${poppins.variable} font-primary dark antialiased min-h-svh flex flex-col`}>
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
