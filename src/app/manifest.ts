import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "48N Pump Booking",
    short_name: "48N Pump",
    id: "/book",
    description:
      "Jobsite-first line pump booking for 48 North Concrete. Pick a window, send rough yardage, and hold it while the schedule is confirmed.",
    start_url: "/book?source=app",
    scope: "/book",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0a0a",
    theme_color: "#d7ff2f",
    categories: ["business", "productivity", "utilities"],
    shortcuts: [
      {
        name: "New Booking",
        short_name: "New Booking",
        description: "Enter the service address and start a new pump request.",
        url: "/book#service-address",
      },
      {
        name: "Pick Spot",
        short_name: "Pick Spot",
        description: "Jump straight to the booking windows.",
        url: "/book#step-2",
      },
      {
        name: "Dispatch",
        short_name: "Dispatch",
        description: "Open the booking page and call dispatch for urgent work.",
        url: "/book#dispatch",
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
}
