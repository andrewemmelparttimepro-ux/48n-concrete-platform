"use client";

import { useEffect, useRef, useState } from "react";
import {
  type ServiceAddressMeta,
  writeStoredServiceAddress,
} from "@/lib/service-address";

const DEFAULT_MAP_SRC =
  "https://www.google.com/maps?hl=en&ie=UTF8&ll=47.5515,-100.5294&z=6&t=m&output=embed";

type BookingLocationStepProps = {
  homeBase: string;
  territory: string;
};

type LookupState = "idle" | "typing" | "checking" | "ready" | "error";

function buildMapSrc(details: ServiceAddressMeta | null) {
  if (!details?.lat || !details?.lng) {
    return DEFAULT_MAP_SRC;
  }

  return `https://www.google.com/maps?hl=en&ie=UTF8&ll=${details.lat},${details.lng}&q=${details.lat},${details.lng}&z=10&t=m&output=embed`;
}

export function BookingLocationStep({
  homeBase,
  territory,
}: BookingLocationStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [details, setDetails] = useState<ServiceAddressMeta | null>(null);
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    writeStoredServiceAddress(null);

    if (window.matchMedia("(pointer: fine)").matches) {
      const frame = window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });

      return () => {
        window.cancelAnimationFrame(frame);

        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }

        if (highlightTimeoutRef.current) {
          window.clearTimeout(highlightTimeoutRef.current);
        }
      };
    }

    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  function guideToStepTwo() {
    const stepTwo = document.getElementById("step-2");

    if (!stepTwo) {
      return;
    }

    stepTwo.classList.add("is-guided");
    stepTwo.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      stepTwo.classList.remove("is-guided");
    }, 1800);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lookupState === "checking") {
      return;
    }

    const trimmed = zipCode.trim();

    if (!/^\d{5}$/.test(trimmed)) {
      setLookupState("error");
      setErrorMessage("Enter a 5-digit North Dakota ZIP, then hit Enter.");
      setDetails(null);
      writeStoredServiceAddress(null);
      return;
    }

    setLookupState("checking");
    setErrorMessage(null);

    const search = new URLSearchParams({
      address: trimmed,
    });

    const response = await fetch(`/api/geocode?${search.toString()}`, {
      cache: "no-store",
    }).catch(() => null);

    if (!response?.ok) {
      const nextError =
        response?.status === 404
          ? "Could not find that North Dakota ZIP. Check it and hit Enter again."
          : "Could not check that ZIP yet. Hit Enter again in a second.";
      const fallback = {
        address: trimmed,
        zone: "unknown",
        travelNote: nextError,
      } satisfies ServiceAddressMeta;

      setDetails(fallback);
      setLookupState("error");
      setErrorMessage(nextError);
      writeStoredServiceAddress(null);
      return;
    }

    const nextDetails = (await response.json()) as ServiceAddressMeta;
    setDetails(nextDetails);
    setLookupState("ready");
    writeStoredServiceAddress(nextDetails);

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      guideToStepTwo();
    }, 1000);
  }

  function getHelperCopy() {
    if (lookupState === "checking") {
      return "Checking the service ZIP now. That tells the scheduler whether travel changes the blockout.";
    }

    if (lookupState === "ready" && details) {
      return details.zone === "minot"
        ? "ZIP locked in. Standard Minot blockout stays the same. Step 2 is ready."
        : "ZIP locked in. Travel time is being added there and back, and Step 2 is ready.";
    }

    if (lookupState === "error" && errorMessage) {
      return errorMessage;
    }

    if (lookupState === "typing") {
      return "Type the 5-digit service ZIP, then hit Enter to initiate.";
    }

    if (details?.travelNote) {
      return details.travelNote;
    }

    return "Enter the 5-digit service ZIP first. Minot ZIPs keep the normal blockout. Outside Minot adds travel time there and back.";
  }

  const isMapRevealMode = lookupState === "checking" || lookupState === "ready";

  return (
    <section className="booking-map-stage booking-location-step" id="service-address">
      <div
        className={`booking-map-frame booking-map-frame-interactive ${
          isMapRevealMode ? "is-revealed" : ""
        }`}
      >
        <iframe
          className="booking-map-embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={buildMapSrc(details)}
          title="Google map showing North Dakota coverage"
        />

        <div className="booking-map-ui">
          <span className="booking-map-badge">North Dakota coverage</span>
          <form className="booking-map-input-panel" onSubmit={handleSubmit}>
            <p className="eyebrow">Step 1</p>
            <p className="booking-map-step-title">Enter service ZIP</p>
            <label
              className={`booking-map-input-shell ${zipCode ? "has-value" : "is-empty"}`}
            >
              <span className="sr-only">Enter service ZIP code</span>
              <input
                autoComplete="postal-code"
                className="booking-map-input"
                inputMode="numeric"
                maxLength={5}
                pattern="[0-9]{5}"
                placeholder=""
                ref={inputRef}
                type="text"
                value={zipCode}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                onChange={(event) => {
                  const nextZip = event.target.value.replace(/\D/g, "").slice(0, 5);
                  const nextLookupState = nextZip ? "typing" : "idle";

                  setZipCode(nextZip);

                  if (!details || details.address !== nextZip) {
                    setDetails(null);
                    setLookupState(nextLookupState);
                    setErrorMessage(null);
                    writeStoredServiceAddress(null);
                  }
                }}
              />
            </label>

            <div className="booking-map-actions">
              <button className="primary-button booking-map-submit" type="submit">
                {lookupState === "checking" ? "Checking ZIP..." : "Initiate ZIP Check"}
              </button>
            </div>
            <p className="booking-map-enter-note">Type ZIP, hit Enter to initiate.</p>
          </form>
        </div>
      </div>

      {isMapRevealMode ? null : (
        <>
          <p className="booking-map-caption">
            <strong>{homeBase}</strong> {territory}
          </p>
          <p className="booking-map-helper">{getHelperCopy()}</p>
        </>
      )}
    </section>
  );
}
