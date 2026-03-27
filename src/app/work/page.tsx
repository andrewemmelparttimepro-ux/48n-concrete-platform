import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { WorkCarousel } from "@/components/work-carousel";
import { workSlides } from "@/lib/work-gallery";
import { getAppState } from "@/lib/store";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Photos of real commercial, residential, foundation, and flatwork projects completed by 48 North Concrete in Minot and western North Dakota.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work Gallery | 48 North Concrete",
    description:
      "Real project photos from commercial pads, residential flatwork, foundations, and finish work across western North Dakota.",
    images: [
      {
        url: "/media/commercial-aerial.webp",
        width: 1800,
        height: 1200,
        alt: "Aerial view of a commercial concrete project by 48 North Concrete",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work Gallery | 48 North Concrete",
    description:
      "Real project photos — commercial, residential, foundations, and finish work out of Minot, ND.",
    images: ["/media/commercial-aerial.webp"],
  },
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const { settings } = await getAppState();

  return (
    <main className="site-shell">
      <SiteHeader active="work" phone={settings.contactPhone} />

      <section className="content-section work-page-hero">
        <div className="section-heading">
          <p className="eyebrow">48 N work gallery</p>
          <h1 className="section-title">Concrete, foundations, flatwork, and finish work without the extra noise.</h1>
          <p className="support-copy work-page-copy">
            This page is just the work. Let the gallery roll, click through the
            shots, and use the photos to judge the crew.
          </p>
        </div>

        <WorkCarousel
          ctaHref="/#contact"
          ctaLabel="Get a Quote"
          items={workSlides}
          variant="page"
        />
      </section>
    </main>
  );
}
