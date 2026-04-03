import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { QuoteRequestForm } from "@/components/quote-request-form";
import { SiteHeader } from "@/components/site-header";
import { WorkCarousel } from "@/components/work-carousel";
import { getAppState } from "@/lib/store";
import { workSlides } from "@/lib/work-gallery";

const officePhone = "(701) 833-9083";
const officeEmail = "48northconcrete@gmail.com";

const serviceCards = [
  {
    label: "Commercial",
    title: "Retail, site, and production concrete",
    body: "Slabs, pads, walls, and commercial placements that need clean placement, dependable finish work, and a crew that can stay on schedule.",
  },
  {
    label: "Residential",
    title: "Foundations, garages, driveways, and home flatwork",
    body: "Basements, garage slabs, sidewalks, patios, and exterior flatwork handled with the same discipline as bigger concrete jobs.",
  },
  {
    label: "Foundations + ICF",
    title: "Foundation packages built for North Dakota weather",
    body: "Footings, walls, ICF systems, and structural work planned around freeze-thaw reality, access, and timing instead of brochure talk.",
  },
  {
    label: "Finish + Decorative",
    title: "Finish-driven work that still has to hold up",
    body: "Floor slabs, broom finishes, stamped surfaces, colored concrete, and cleanup-focused pours where the finished surface matters.",
  },
];

const operatingPoints = [
  {
    title: "The same crew places it and finishes it.",
    body: "From foundations and walls to slabs and exterior flatwork, the job still has to look right after the trucks leave and the forms come off.",
  },
  {
    title: "North Dakota timing changes the job.",
    body: "Cold weather, thaw cycles, access, batch plant timing, and crew sequencing all change the work here. 48 N plans around that instead of pretending every pour is the same.",
  },
  {
    title: "One concrete company, with pumping when it fits.",
    body: "Commercial work, residential work, foundations, flatwork, and specialty scopes stay inside one company. Planned line-pump pours just have their own faster booking path.",
  },
];

const capabilitySignals = [
  "Commercial + residential concrete",
  "Foundations + ICF",
  "Flatwork + finish",
  "North Dakota ready",
];

export const metadata: Metadata = {
  title: "48 North Concrete",
  description:
    "Commercial and residential concrete placing, finishing, foundations, flatwork, ICF, decorative work, and line pumping out of Minot, North Dakota.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings } = await getAppState();
  const officePhoneHref = officePhone.replace(/\D/g, "");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.48nconcrete.com/#business",
    name: "48 North Concrete",
    description:
      "Commercial and residential concrete placing, finishing, foundations, decorative work, winter concrete services, and line pumping out of Minot, North Dakota.",
    url: "https://www.48nconcrete.com",
    telephone: `+1${officePhoneHref}`,
    email: officeEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Minot",
      addressRegion: "ND",
      postalCode: "58701",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 48.2325,
      longitude: -101.2963,
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 48.2325,
        longitude: -101.2963,
      },
      geoRadius: "150 mi",
    },
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "06:30",
        closes: "17:00",
      },
    ],
    image: "/media/concrete-hero.webp",
    serviceType: [
      "Commercial Concrete",
      "Residential Concrete",
      "Foundations",
      "ICF Construction",
      "Flatwork",
      "Decorative Concrete",
      "Concrete Finishing",
      "Concrete Line Pumping",
      "Winter Concrete Services",
    ],
  };

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@id": "https://www.48nconcrete.com/#business" },
    name: "Concrete Placing and Finishing",
    description:
      "Full-scope commercial and residential concrete services including foundations, flatwork, ICF, decorative work, and in-house line pumping.",
    areaServed: settings.territory,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Concrete Services",
      itemListElement: serviceCards.map((card, index) => ({
        "@type": "OfferCatalog",
        name: card.label,
        description: card.body,
        position: index + 1,
      })),
    },
  };

  return (
    <main className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />

      <SiteHeader phone={officePhone} />

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">48 North Concrete · {settings.homeBase}</p>
          <div className="hero-copy-main">
            <h1 className="hero-title">
              Concrete that shows up ready.
              <span>Finished right.</span>
            </h1>
            <p className="hero-body">
              48 N handles the bigger part of the work under one roof:
              commercial concrete, residential concrete, foundations, ICF,
              flatwork, and finish-driven placements out of Minot. When access
              gets tight on a planned pour, the same company can also bring the
              in-house line pump.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#contact">
                Get a Quote
              </a>
              <Link className="secondary-link" href="/work">
                See the Work
              </Link>
            </div>
          </div>

          <div className="hero-copy-support">
            <p className="hero-note">
              Call <a href={`tel:${officePhoneHref}`}>{officePhone}</a> for
              bids, walkthroughs, foundations, flatwork, decorative work,
              commercial scopes, and specialty placements. Planned line-pump
              pours have their own page and booking path.
            </p>

            <div className="signal-strip">
              {capabilitySignals.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
            </div>
          </div>
        </div>

        <aside className="hero-summary hero-media-card">
          <Image
            alt="Crew member finishing a concrete slab for 48 North Concrete"
            className="hero-media-image"
            height={1200}
            priority
            sizes="(max-width: 980px) 100vw, 40vw"
            src="/media/concrete-hero.webp"
            width={1800}
          />

          <div className="hero-media-copy">
            <p className="summary-label">Main scopes</p>
            <h2 className="subsection-title">Commercial. Residential. Specialty concrete.</h2>
            <p>
              The core business is still concrete work first: foundations,
              flatwork, finish work, ICF, and harder-to-fit placements handled
              by one crew that knows the local conditions.
            </p>
          </div>

          <div className="hero-stats-grid">
            <div className="hero-stat">
              <strong>Commercial</strong>
              <span>Retail pads, slabs, site work, walls, and production pours that need schedule control.</span>
            </div>
            <div className="hero-stat">
              <strong>Residential</strong>
              <span>Foundations, basements, garages, driveways, patios, and exterior flatwork handled clean.</span>
            </div>
            <div className="hero-stat">
              <strong>Specialty</strong>
              <span>ICF, decorative, winter, and access-sensitive pours with the line pump ready when it fits.</span>
            </div>
            <Link className="hero-stat hero-stat-action" href="/book">
              <p className="hero-stat-kicker">Need line pumping?</p>
              <strong>Book the Pump</strong>
              <span>Planned pours can go straight into the quick-book flow without chasing a callback.</span>
            </Link>
          </div>
        </aside>
      </section>

      <section className="content-section" id="services">
        <div className="section-heading">
          <p className="eyebrow">What 48 N does</p>
          <h2 className="section-title">From foundations to finished flatwork, the core work stays under one roof.</h2>
        </div>

        <div className="service-grid core-service-grid">
          {serviceCards.map((service) => (
            <article className="service-card" key={service.title}>
              <p className="service-label">{service.label}</p>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" id="work">
        <div className="section-heading work-section-heading">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="section-title">Use real work to judge the crew.</h2>
          </div>
          <Link className="secondary-link" href="/work">
            Open Full Gallery
          </Link>
        </div>

        <WorkCarousel ctaHref="/work" ctaLabel="Open Full Gallery" items={workSlides} />
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Why 48 N</p>
          <h2 className="section-title">Customers keep calling back for a few simple reasons.</h2>
        </div>

        <div className="principles-grid principles-grid-home">
          {operatingPoints.map((item) => (
            <article className="info-card" key={item.title}>
              <p className="eyebrow">{item.title}</p>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="cta-band">
          <div>
            <p className="eyebrow">Need line pumping?</p>
            <h3>Planned line-pump pours have their own quick-book path.</h3>
            <p>
              Keep general concrete work on the main quote path. Use the
              in-house line pump page when the job is planned, standard, and
              access is the real issue.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="primary-button" href="/line-pumping">
              Go to Line Pumping
            </Link>
            <Link className="secondary-link" href="/book">
              Book the Pump
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section" id="contact">
        <div className="section-heading">
          <p className="eyebrow">Contact 48 N</p>
          <h2 className="section-title">Start with the right conversation and the right next step.</h2>
        </div>

        <div className="coverage-panel">
          <article className="info-card contact-card">
            <p className="eyebrow">General concrete work</p>
            <h3 className="subsection-title">Commercial, residential, flatwork, finish, and specialty jobs</h3>
            <div className="contact-list">
              <a href={`tel:${officePhoneHref}`}>{officePhone}</a>
              <a href={`mailto:${officeEmail}`}>{officeEmail}</a>
            </div>
            <p className="support-copy">
              Use this path for bids, walkthroughs, foundations, flatwork,
              decorative work, commercial scopes, and anything that needs a
              real project conversation.
            </p>
          </article>

          <article className="info-card contact-card">
            <p className="eyebrow">Where 48 N works</p>
            <h3 className="subsection-title">Based in {settings.homeBase}, working across {settings.territory}</h3>
            <div className="contact-list">
              <span>{settings.homeBase}</span>
              <span>{settings.territory}</span>
            </div>
            <p className="support-copy">
              The farther the drive and the tighter the schedule, the more the
              details matter up front. Get the quote request in early and the
              crew can sort out scope, timing, and access before pour day.
            </p>
          </article>
        </div>

        <QuoteRequestForm officePhone={officePhone} />
      </section>

      <footer className="site-footer">
        <div className="footer-copy">
          <span>48 North Concrete</span>
          <span>{settings.homeBase}</span>
          <span>{settings.territory}</span>
          <span>{officePhone}</span>
        </div>
      </footer>
    </main>
  );
}
