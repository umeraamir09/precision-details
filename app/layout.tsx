import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/footer/Footer";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FB6703',
};

export const metadata: Metadata = {
  title: {
    default: "Precision Details | Premium Car Detailing Services",
    template: "%s | Precision Details"
  },
  description: "Professional car detailing services delivering showroom-quality results. Interior & exterior detailing, ceramic coating, paint correction. Book your appointment today!",
  keywords: ["car detailing", "auto detailing", "ceramic coating", "paint correction", "interior detailing", "exterior detailing", "Glen Ellyn", "Chicago car detailing"],
  authors: [{ name: "Precision Details" }],
  creator: "Precision Details",
  publisher: "Precision Details",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://precisiondetails.co',
    siteName: 'Precision Details',
    title: 'Precision Details | Premium Car Detailing Services',
    description: 'Professional car detailing services delivering showroom-quality results. Book your appointment today!',
    images: [
      {
        url: '/bg-hero.png',
        width: 1200,
        height: 630,
        alt: 'Precision Details Car Detailing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precision Details | Premium Car Detailing Services',
    description: 'Professional car detailing services delivering showroom-quality results.',
    images: ['/bg-hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-primary dark antialiased min-h-svh flex flex-col">
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
