"use client";

import { usePwaInstall } from "@/components/use-pwa-install";

export function InstallAppCard() {
  const { installState, isStandalone, promptInstall } = usePwaInstall();

  if (isStandalone) {
    return null;
  }

  return (
    <section className="install-card" id="install-app">
      <div>
        <p className="eyebrow">Save as an app</p>
        <h2 className="subsection-title">Keep pump booking on the home screen</h2>
        <p className="support-copy">
          Repeat pump customers can keep the scheduler handy like an app, check
          openings, send rough yardage, and see request status without waiting
          on callbacks during a pour.
        </p>
      </div>

      {installState === "installed" ? (
        <p className="install-state is-good">
          Installed. This device will open straight into booking.
        </p>
      ) : null}

      {installState === "ready" ? (
        <button className="primary-button" type="button" onClick={() => void promptInstall()}>
          Install Pump Booking
        </button>
      ) : null}

      {installState === "ios" ? (
        <p className="install-state">
          On iPhone, tap Share and then choose Add to Home Screen.
        </p>
      ) : null}

      {installState === "idle" ? (
        <p className="install-state">
          Install support will appear automatically on supported devices.
        </p>
      ) : null}
    </section>
  );
}
