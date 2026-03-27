import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "48 North Concrete",
    template: "%s | 48 North Concrete",
  },
  alternates: {
    canonical: "/",
  },
  description:
    "Commercial and residential concrete placing, finishing, foundations, flatwork, specialty work, and line pumping out of Minot, North Dakota.",
  applicationName: "48N Line Pump Booking",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "48N Line Pump Booking",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "48 North Concrete",
    description:
      "Commercial and residential concrete, flatwork, foundations, specialty work, and in-house line pumping out of Minot, North Dakota.",
    siteName: "48 North Concrete",
    type: "website",
    images: [
      {
        url: "/media/concrete-hero.webp",
        width: 1800,
        height: 1200,
        alt: "48 North Concrete slab finishing work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "48 North Concrete",
    description:
      "Commercial and residential concrete work with in-house line pumping and online booking for planned pours.",
    images: ["/media/concrete-hero.webp"],
  },
  icons: {
    icon: "/48n-icon-192.png",
    apple: "/48n-apple-touch.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#d7ff2f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
