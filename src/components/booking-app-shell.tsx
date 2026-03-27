"use client";

import { usePwaInstall } from "@/components/use-pwa-install";

type BookingAppShellProps = {
  contactPhone: string;
};

export function BookingAppShell({ contactPhone }: BookingAppShellProps) {
  const { installState, isStandalone, promptInstall } = usePwaInstall();
  const phoneHref = contactPhone.replace(/\D/g, "");

  function renderInstallBlock() {
    if (installState === "ready") {
      return (
        <button className="primary-button" type="button" onClick={() => void promptInstall()}>
          Install App
        </button>
      );
    }

    if (installState === "ios") {
      return (
        <p className="booking-app-note">
          On iPhone, tap Share and choose Add to Home Screen.
        </p>
      );
    }

    if (isStandalone) {
      return (
        <p className="booking-app-note booking-app-note-good">
          Installed on this phone. Open it like a jobsite tool.
        </p>
      );
    }

    return (
      <p className="booking-app-note">
        Install support will appear automatically on supported phones.
      </p>
    );
  }

  return (
    <>
      <section className="booking-app-shell">
        <div className="booking-app-header">
          <div>
            <p className="eyebrow">Mobile booking app</p>
            <h2 className="subsection-title">Keep the pump scheduler one tap away.</h2>
          </div>
          {renderInstallBlock()}
        </div>

        <div className="booking-app-grid">
          <a className="booking-app-action" href="#service-address">
            <span>Step 1</span>
            <strong>Address</strong>
          </a>
          <a className="booking-app-action" href="#step-2">
            <span>Step 2</span>
            <strong>Pick spot</strong>
          </a>
          <a className="booking-app-action" href="#step-3">
            <span>Step 3</span>
            <strong>Send details</strong>
          </a>
          <a className="booking-app-action" href={`tel:${phoneHref}`}>
            <span>Dispatch</span>
            <strong>Call now</strong>
          </a>
        </div>
      </section>

      <nav className="booking-mobile-dock" aria-label="Pump booking quick actions">
        <a className="booking-mobile-dock-link" href="#service-address">
          <span>Step 1</span>
          <strong>Address</strong>
        </a>
        <a className="booking-mobile-dock-link" href="#step-2">
          <span>Step 2</span>
          <strong>Spot</strong>
        </a>
        <a className="booking-mobile-dock-link" href="#step-3">
          <span>Step 3</span>
          <strong>Details</strong>
        </a>
        <a className="booking-mobile-dock-link" href={`tel:${phoneHref}`}>
          <span>Dispatch</span>
          <strong>Call</strong>
        </a>
      </nav>
    </>
  );
}
