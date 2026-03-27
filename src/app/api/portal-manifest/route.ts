import { NextResponse } from "next/server";

export function GET() {
  const manifest = {
    name: "48N Dispatch Portal",
    short_name: "48N Dispatch",
    id: "/portal",
    description:
      "Approve pump requests, manage the schedule, and control the 48 North Concrete booking calendar.",
    start_url: "/portal?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0a0a",
    theme_color: "#d7ff2f",
    categories: ["business", "productivity"],
    shortcuts: [
      {
        name: "Approval Queue",
        short_name: "Queue",
        description: "Jump straight to pending booking requests.",
        url: "/portal",
      },
      {
        name: "Login",
        short_name: "Login",
        description: "Log into the dispatch portal.",
        url: "/portal/login",
      },
    ],
    icons: [
      {
        src: "/48n-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/48n-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/48n-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
