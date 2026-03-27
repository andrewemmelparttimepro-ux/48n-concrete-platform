import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export const metadata: Metadata = {
  title: "Pump Pricing",
  description:
    "Simple honest line pump pricing from 48 North Concrete.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PumpPricingPage() {
  return (
    <main className="pricing-shell">
      <header className="site-header pricing-header">
        <LogoMark compact />
        <div className="header-actions">
          <Link className="secondary-link booking-header-link" href="/">
            Back to 48 N
          </Link>
        </div>
      </header>

      <section className="pricing-hero">
        <p className="eyebrow">Pump pricing</p>
        <h1 className="hero-title pricing-title">
          Simple honest <span>pricing.</span>
        </h1>
        <div className="pricing-lines">
          <p>
            <strong>$300/hr</strong> port to port.
          </p>
          <p>
            <strong>$5</strong> per yard poured.
          </p>
        </div>
        <p className="pricing-note">
          We&apos;re asked to do some pretty crazy stuff. Some jobs will require
          custom pricing, but you already know that.
        </p>
      </section>
    </main>
  );
}
