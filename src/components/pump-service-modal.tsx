"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function PumpServiceModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="secondary-link pump-service-trigger"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Pump Service Details
      </button>

      {isOpen ? (
        <div
          aria-labelledby="pump-service-title"
          aria-modal="true"
          className="pump-service-modal"
          role="dialog"
        >
          <button
            aria-label="Close pump service details"
            className="pump-service-overlay"
            type="button"
            onClick={() => setIsOpen(false)}
          />

          <div className="pump-service-panel">
            <div className="pump-service-header">
              <p className="eyebrow">Pump service details</p>
              <button
                aria-label="Close pump service details"
                className="pump-service-close"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            <h3 className="subsection-title" id="pump-service-title">
              Built to keep your crew on your work.
            </h3>

            <div className="pump-service-copy">
              <p>
                We always bring <strong>2 guys</strong>. No sacrificing your crew.
              </p>
              <p>Setup and ready when mud shows up.</p>
              <p>
                The answer is always <strong>&quot;yes&quot;</strong> then honest open{" "}
                <Link className="pump-service-pricing-link" href="/book/pricing">
                  pricing
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
