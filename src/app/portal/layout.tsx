import type { Viewport } from "next";
import { PortalPwaRegister } from "@/components/portal-pwa-register";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0a0a",
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link rel="manifest" href="/api/portal-manifest" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="apple-mobile-web-app-title" content="48N Dispatch" />
      <PortalPwaRegister />
      {children}
    </>
  );
}
