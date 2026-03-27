import type { Metadata } from "next";
import Link from "next/link";
import { BookingAppShell } from "@/components/booking-app-shell";
import { BookingLocationStep } from "@/components/booking-location-step";
import { BookRequestForm } from "@/components/book-request-form";
import { InstallAppCard } from "@/components/install-app-card";
import { LogoMark } from "@/components/logo-mark";
import { PumpServiceModal } from "@/components/pump-service-modal";
import { getBookingPageData } from "@/lib/store";

const bookingPrep = [
  "Rough yardage",
  "Service ZIP",
  "Best time window",
  "Access or setup notes",
];

export const metadata: Metadata = {
  title: "Book the Pump",
  description:
    "Book a line pump window from 48 North Concrete. Enter your service ZIP, pick an open day, send rough yardage, and hold your spot while the schedule is confirmed.",
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Book the Pump | 48 North Concrete",
    description:
      "Pick a pump window, send rough yardage, and hold your spot. Online booking for planned, standard pours.",
    images: [
      {
        url: "/media/pump-truck.webp",
        width: 1200,
        height: 900,
        alt: "48 North Concrete pump truck ready for dispatch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book the Pump | 48 North Concrete",
    description:
      "Pick a window, send yardage, done. Online pump booking from 48 North Concrete in Minot, ND.",
    images: ["/media/pump-truck.webp"],
  },
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const { days, pending, settings } = await getBookingPageData();
  const pumpPhoneHref = settings.contactPhone.replace(/\D/g, "");

  return (
    <main className="booking-shell">
      <header className="site-header booking-header" id="dispatch">
        <LogoMark compact />
        <div className="header-actions">
          <a className="secondary-link booking-header-link" href={`tel:${pumpPhoneHref}`}>
            Call Dispatch
          </a>
          <Link className="secondary-link booking-header-link booking-back-link" href="/">
            Back to 48 N
          </Link>
        </div>
      </header>

      <section className="booking-intro">
        <div className="section-heading">
          <p className="eyebrow">48 N line pump booking</p>
          <h1 className="hero-title">
            Pick your spot.
            <span>Send rough yardage. Done.</span>
          </h1>
          <p className="hero-body">
            Enter the service ZIP, choose an open day, then send rough
            yardage and job details. 48 N holds that window while the schedule
            is checked, and the status stays visible on this phone after it is
            sent. Same-day changes, odd access, and urgent jobs still belong on
            the phone.
          </p>
          <p className="hero-note booking-intro-note">
            Request sent, window held, confirmed or released.
            {" "}
            {pending} request{pending === 1 ? "" : "s"} waiting for review right now.
          </p>
        </div>

        <BookingLocationStep
          homeBase={settings.homeBase}
          territory={settings.territory}
        />
      </section>

      <BookingAppShell contactPhone={settings.contactPhone} />

      <BookRequestForm days={days} contactPhone={settings.contactPhone} />

      <section className="content-section booking-support-section">
        <article className="booking-support-panel">
          <div className="section-heading">
            <p className="eyebrow">Before you send it</p>
            <h2 className="subsection-title">Bring the four basics and the scheduler can move fast.</h2>
            <p className="support-copy">
              Standard windows move quickest when the day, yardage, ZIP,
              and access notes are clear up front. If the setup is strange or
              the day is moving, skip the form and call dispatch.
            </p>
          </div>

          <div className="booking-prep-grid">
            {bookingPrep.map((item) => (
              <div className="checklist-card" key={item}>
                <span className="step-number">OK</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="booking-support-actions">
            <a className="primary-button" href={`tel:${pumpPhoneHref}`}>
              Call Dispatch
            </a>
            <PumpServiceModal />
          </div>

          <div className="booking-support-video-stage">
            <div aria-hidden="true" className="booking-support-video-backdrop" />

            <div className="booking-support-video-frame">
              <video
                aria-label="48 North Concrete line pump in use on a jobsite"
                autoPlay
                className="booking-support-video"
                loop
                muted
                playsInline
                poster="/media/line-pump-in-use-poster.jpg"
                preload="metadata"
              >
                <source src="/media/line-pump-in-use.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </article>
      </section>

      <InstallAppCard />
    </main>
  );
}
