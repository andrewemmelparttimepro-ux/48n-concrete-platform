import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getAppState } from "@/lib/store";

const serviceCards = [
  {
    title: "Residential pours",
    body: "Driveways, basements, garage slabs, sidewalks, and home-site placements where access is tight but the job is still straightforward.",
  },
  {
    title: "Commercial placements",
    body: "Retail, industrial, and site concrete where line pumping keeps labor down and placement moving when the truck cannot land exactly where it needs to.",
  },
  {
    title: "Ag and hard-access work",
    body: "Shops, bins, feedlots, walls, and placements where the value is getting concrete where it needs to go without turning the crew into a wheelbarrow team.",
  },
];

const sellingPoints = [
  {
    title: "In-house line pump service",
    body: "When a standard pour is a good fit for the in-house line pump, this is the fastest way to get it into the schedule.",
  },
  {
    title: "Repeat-customer booking without callback chase",
    body: "Pick a window, send rough yardage and job details, and check back later on the same phone to see whether the request was approved.",
  },
  {
    title: "Real approval, not fake instant confirmation",
    body: "The system holds the requested slot while the day gets checked, so customers get a faster process without pretending the schedule confirms itself.",
  },
  {
    title: "Call for anything non-standard",
    body: "Same-day changes, weather shifts, unusual hose runs, and oddball jobs still belong on the phone. The booking tool is for the work that should be easy to place.",
  },
];

const bookingSteps = [
  "Pick the day and time window that fits the pour.",
  "Enter rough yardage, location, and anything important about access.",
  "Send the request and 48 N holds that window while the schedule is checked.",
  "Reopen booking later on the same phone to see whether it was approved or released.",
];

const bookingChecklist = [
  "Rough yardage",
  "Job location",
  "Preferred time window",
  "Access, hose run, or setup notes",
];

const pumpProof = [
  {
    title: "48 N equipment, 48 N scheduling",
    body: "The line-pump side stays inside the same 48 N operation, so good customers are dealing with one company instead of a brand handoff.",
    image: "/media/line-pump-angle.webp",
    alt: "48 North Concrete line pump ready for dispatch",
    badges: ["In-house pump", "Dispatch ready"],
  },
  {
    title: "A cleaner booking path for standard pours",
    body: "The online path is there for work that should be easy to place in the calendar without waiting on a callback while the crew is already on another job.",
    image: "/media/line-pump-branding.webp",
    alt: "48 North Concrete branding on line pumping equipment",
    badges: ["Repeat customers", "Standard pours"],
  },
  {
    title: "Equipment that is maintained in-house",
    body: "A fast booking flow only works if the equipment side is real. Keeping the pump serviced and ready is part of what makes the calendar worth using.",
    image: "/media/line-pump-detail.webp",
    alt: "Detailed view of the 48 North Concrete line pump",
    badges: ["Maintained", "Ready to run"],
  },
];

const faqItems = [
  {
    question: "Is online booking instantly confirmed?",
    answer:
      "No. The requested slot is held while the schedule gets checked. That keeps the process fast without pretending the calendar confirms itself.",
  },
  {
    question: "What fits this booking flow best?",
    answer:
      "Repeat-customer work and standard line-pump jobs that are planned enough to fit a normal opening. Weird or urgent jobs should still be called in.",
  },
  {
    question: "What should I have ready before booking?",
    answer:
      "Rough yardage, location, preferred window, and any notes about access, hose run, slab type, or timing.",
  },
  {
    question: "Can repeat customers save this like an app?",
    answer:
      "Yes. The booking page is installable on supported phones so it can stay on the home screen and open like a jobsite tool.",
  },
];

export const metadata: Metadata = {
  title: "Line Pumping",
  description:
    "In-house concrete line pumping from 48 North Concrete in Minot, ND. Book a pump window online for planned, standard pours without the callback chase.",
  alternates: {
    canonical: "/line-pumping",
  },
  openGraph: {
    title: "Line Pumping | 48 North Concrete",
    description:
      "In-house line pump service with online booking for planned pours. Pick a window, send rough yardage, and hold your spot.",
    images: [
      {
        url: "/media/line-pump-branding.webp",
        width: 1200,
        height: 900,
        alt: "48 North Concrete branded line pump equipment on a jobsite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Line Pumping | 48 North Concrete",
    description:
      "In-house line pump service with online booking. Pick a window, send yardage, done.",
    images: ["/media/line-pump-branding.webp"],
  },
};

export const dynamic = "force-dynamic";

export default async function LinePumpingPage() {
  const { settings } = await getAppState();
  const pumpPhone = settings.contactPhone;
  const pumpPhoneHref = pumpPhone.replace(/\D/g, "");

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Concrete Line Pumping",
    description:
      "In-house line pump service for planned, standard concrete pours with online booking. Serving Minot and western/central North Dakota.",
    provider: {
      "@type": "LocalBusiness",
      name: "48 North Concrete",
      telephone: `+1${pumpPhoneHref}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Minot",
        addressRegion: "ND",
        addressCountry: "US",
      },
    },
    areaServed: settings.territory,
    serviceType: "Concrete Line Pumping",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Line Pump Applications",
      itemListElement: serviceCards.map((card, index) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: card.title,
          description: card.body,
        },
        position: index + 1,
      })),
    },
  };

  return (
    <main className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <SiteHeader active="line-pumping" phone={pumpPhone} />

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">48 N line pumping · {settings.homeBase}</p>
          <div className="hero-copy-main">
            <h1 className="hero-title">
              Line pumping for standard pours.
              <span>Book online when the job fits.</span>
            </h1>
            <p className="hero-body">
              This page is for planned, standard line-pump work. Pick an
              opening online, send rough yardage, and let 48 N check the day
              without forcing a callback chase while the crew is out on another
              pour. If the job is urgent, unusual, or weather-sensitive, call
              dispatch and sort it out directly.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" href="/book">
                Book the Pump
              </Link>
              <a className="secondary-link" href={`tel:${pumpPhoneHref}`}>
                Call Dispatch
              </a>
            </div>
          </div>

          <div className="hero-copy-support">
            <p className="hero-note">
              Use booking when the job fits a normal window. Use the phone when
              the setup is unusual, the schedule is moving, or the pour cannot
              wait.
            </p>

            <div className="signal-strip">
              <span>Line pump only</span>
              <span>Repeat-customer friendly</span>
              <span>Approval queue, not fake instant confirmation</span>
              <span>Saveable as a jobsite app</span>
            </div>
          </div>
        </div>

        <aside className="hero-summary hero-media-card">
          <Image
            alt="48 North Concrete branding on in-house pumping equipment"
            className="hero-media-image"
            height={900}
            priority
            sizes="(max-width: 980px) 100vw, 40vw"
            src="/media/line-pump-branding.webp"
            width={1200}
          />

          <div className="hero-media-copy">
            <p className="summary-label">Service fit</p>
            <h2 className="subsection-title">Get a standard pour into the calendar fast.</h2>
            <p>
              Good customers should be able to check openings, send rough
              yardage, and keep moving without playing phone tag while you are
              out on another pour.
            </p>
          </div>

          <div className="hero-stats-grid">
            <div className="hero-stat">
              <strong>01</strong>
              <span>Pick an opening without waiting on a callback.</span>
            </div>
            <div className="hero-stat">
              <strong>02</strong>
              <span>Send rough yardage and job notes from the same phone.</span>
            </div>
            <div className="hero-stat">
              <strong>03</strong>
              <span>See later whether the slot was approved or released.</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Why line pumping</p>
          <h2 className="section-title">Use the pump when access, labor, and placement speed all matter.</h2>
        </div>

        <div className="principles-grid">
          {sellingPoints.map((item) => (
            <article className="info-card" key={item.title}>
              <p className="eyebrow">{item.title}</p>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Good fit for pumping</p>
          <h2 className="section-title">Use the service where placement matters more than truck access.</h2>
        </div>

        <div className="service-grid">
          {serviceCards.map((service) => (
            <article className="service-card" key={service.title}>
              <p className="service-label">Line pumping</p>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Coverage and prep</p>
          <h2 className="section-title">Bring the basics and the scheduler can make the call fast.</h2>
        </div>

        <div className="coverage-panel">
          <article className="info-card">
            <p className="eyebrow">Coverage</p>
            <h3 className="subsection-title">{settings.homeBase}</h3>
            <p className="support-copy">
              {settings.territory}. The tighter the schedule and the farther the
              drive, the more important it is to get the request in early.
            </p>
            <Image
              alt="Concrete placement by 48 North Concrete on a line pump-supported job"
              className="project-card-image"
              height={900}
              sizes="(max-width: 980px) 100vw, 50vw"
              src="/media/crew-finishing.webp"
              width={1200}
            />
          </article>

          <article className="info-card">
            <p className="eyebrow">Before booking</p>
            <h3 className="subsection-title">What the scheduler needs from you</h3>
            <div className="checklist-grid">
              {bookingChecklist.map((item) => (
                <div className="checklist-card" key={item}>
                  <span className="step-number">OK</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">On the pump side</p>
          <h2 className="section-title">The booking tool works because the equipment and scheduling stay in-house.</h2>
        </div>

        <div className="gallery-grid">
          {pumpProof.map((item) => (
            <article className="project-card" key={item.title}>
              <Image
                alt={item.alt}
                className="project-card-image"
                height={1000}
                sizes="(max-width: 980px) 100vw, 33vw"
                src={item.image}
                width={1600}
              />
              <div className="project-card-copy">
                <div className="project-chip-row">
                  {item.badges.map((badge) => (
                    <span className="project-chip" key={badge}>
                      {badge}
                    </span>
                  ))}
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section booking-band">
        <div className="section-heading">
          <p className="eyebrow">Online booking</p>
          <h2 className="section-title">Pick a window, send rough yardage, and get back to work.</h2>
        </div>

        <div className="steps-grid">
          {bookingSteps.map((step, index) => (
            <article className="step-card" key={step}>
              <span className="step-number">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>

        <div className="cta-band">
          <div>
            <p className="eyebrow">Ready to book?</p>
            <h3>Go straight into the pump calendar.</h3>
            <p>
              Planned work belongs in booking. Urgent work, same-day changes,
              and unusual setups still belong on the phone.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="primary-button" href="/book">
              Open Pump Booking
            </Link>
            <a className="secondary-link" href={`tel:${pumpPhoneHref}`}>
              Call {pumpPhone}
            </a>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Quick answers</p>
          <h2 className="section-title">Simple questions, straight answers.</h2>
        </div>

        <div className="principles-grid">
          {faqItems.map((item) => (
            <article className="info-card" key={item.question}>
              <p className="eyebrow">{item.question}</p>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-copy">
          <span>48 North Concrete</span>
          <span>{settings.homeBase}</span>
          <span>{settings.territory}</span>
          <span>{pumpPhone}</span>
        </div>
      </footer>
    </main>
  );
}