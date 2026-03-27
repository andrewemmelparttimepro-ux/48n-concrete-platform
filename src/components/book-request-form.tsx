"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AvailabilityDay } from "@/lib/booking";
import {
  getFirstBookableSlot,
  getImpactedSlotKeys,
  getStatusLabel,
  getStatusTone,
} from "@/lib/booking";
import {
  type ServiceAddressMeta,
  SERVICE_ADDRESS_EVENT,
} from "@/lib/service-address";

const PROFILE_STORAGE_KEY = "48n-booking-profile";
const REQUESTS_STORAGE_KEY = "48n-booking-requests";
const MAX_RECENT_REQUESTS = 4;
const REQUEST_ID_PATTERN = /^48N-[A-Z0-9]{6}$/;

type BookRequestFormProps = {
  days: AvailabilityDay[];
  contactPhone: string;
};

type SubmissionState = {
  requestId: string;
  queuePosition: number;
  scheduledFor: string;
};

type RecentRequestStatus = {
  id: string;
  customerName: string;
  status: "pending" | "approved" | "denied";
  requestedDate: string;
  requestedSlotLabel: string;
  requestedWindow: string;
  updatedAt: string;
  decisionNote?: string;
};

type FormValues = {
  customerName: string;
  phone: string;
  company: string;
  location: string;
  roughYardage: string;
  notes: string;
  rememberProfile: boolean;
};

function findSelectedSlot(days: AvailabilityDay[], dayId: string, slotId: string) {
  const day = days.find((entry) => entry.id === dayId) ?? days[0];
  const slot = day?.slots.find((entry) => entry.id === slotId) ?? null;
  return { day, slot };
}

function getRecentRequestStatusLabel(status: RecentRequestStatus["status"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "denied":
      return "Denied";
    case "pending":
    default:
      return "Pending";
  }
}

function getRecentRequestStatusTone(status: RecentRequestStatus["status"]) {
  switch (status) {
    case "approved":
      return "is-open";
    case "denied":
      return "is-full";
    case "pending":
    default:
      return "is-held";
  }
}

function getRecentRequestMessage(request: RecentRequestStatus) {
  switch (request.status) {
    case "approved":
      return "Approved. That window is locked into the 48 N pump schedule.";
    case "denied":
      return "Denied. That opening is back on the calendar, so pick another window if needed.";
    case "pending":
    default:
      return "Still waiting for review. 48 N is holding that window while the schedule gets checked.";
  }
}

function formatRecentRequestTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function readStoredRequestIds() {
  try {
    const raw = window.localStorage.getItem(REQUESTS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .filter((entry) => REQUEST_ID_PATTERN.test(entry))
      .slice(0, MAX_RECENT_REQUESTS);
  } catch {
    window.localStorage.removeItem(REQUESTS_STORAGE_KEY);
    return [];
  }
}

function slotFitsAddress(
  day: AvailabilityDay | undefined,
  requestedSlotKey: AvailabilityDay["slots"][number]["key"],
  travelBufferMinutes: number,
) {
  if (!day) {
    return false;
  }

  const impactedKeys = getImpactedSlotKeys(requestedSlotKey, travelBufferMinutes);

  return impactedKeys.every((key) => {
    const slot = day.slots.find((entry) => entry.key === key);
    return Boolean(slot?.isBookable);
  });
}

function findFirstAddressFit(days: AvailabilityDay[], travelBufferMinutes: number) {
  for (const day of days) {
    const slot = day.slots.find(
      (entry) => entry.isBookable && slotFitsAddress(day, entry.key, travelBufferMinutes),
    );

    if (slot) {
      return { day, slot };
    }
  }

  return null;
}

export function BookRequestForm({ days, contactPhone }: BookRequestFormProps) {
  const router = useRouter();
  const firstBookable = getFirstBookableSlot(days);
  const [selectedDayId, setSelectedDayId] = useState(firstBookable?.day.id ?? days[0]?.id);
  const [selectedSlotId, setSelectedSlotId] = useState(
    firstBookable?.slot.id ?? days[0]?.slots[0]?.id,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmissionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [recentRequestIds, setRecentRequestIds] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readStoredRequestIds(),
  );
  const [recentRequests, setRecentRequests] = useState<RecentRequestStatus[]>([]);
  const [serviceAddress, setServiceAddress] = useState<ServiceAddressMeta | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    customerName: "",
    phone: "",
    company: "",
    location: "",
    roughYardage: "",
    notes: "",
    rememberProfile: true,
  });

  useEffect(() => {
    let frame = 0;

    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);

      if (!raw) {
        return;
      }

      const stored = JSON.parse(raw) as Partial<FormValues>;
      frame = window.requestAnimationFrame(() => {
        setFormValues((current) => ({
          ...current,
          customerName: stored.customerName || "",
          phone: stored.phone || "",
          company: stored.company || "",
          rememberProfile: true,
        }));
      });
    } catch {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    }

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    if (recentRequestIds.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadRecentRequests() {
      const search = new URLSearchParams();

      for (const id of recentRequestIds) {
        search.append("id", id);
      }

      const response = await fetch(`/api/bookings/status?${search.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const body = (await response.json()) as {
        requests?: RecentRequestStatus[];
      };

      if (cancelled || !body.requests) {
        return;
      }

      const ordered = recentRequestIds
        .map((id) => body.requests?.find((entry) => entry.id === id))
        .filter((entry): entry is RecentRequestStatus => Boolean(entry));

      setRecentRequests(ordered);
    }

    loadRecentRequests().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [recentRequestIds]);

  useEffect(() => {
    function handleServiceAddressUpdate(event: Event) {
      const detail = (event as CustomEvent<ServiceAddressMeta | null>).detail;
      setServiceAddress(detail);
      setFormValues((current) => ({
        ...current,
        location: detail?.address ?? "",
      }));
    }

    window.addEventListener(
      SERVICE_ADDRESS_EVENT,
      handleServiceAddressUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        SERVICE_ADDRESS_EVENT,
        handleServiceAddressUpdate as EventListener,
      );
    };
  }, []);

  const selected = findSelectedSlot(days, selectedDayId, selectedSlotId);
  const selectedDay = selected.day;
  const selectedSlot = selected.slot;
  const hasServiceAddress = /^\d{5}$/.test(formValues.location.trim());
  const travelBufferMinutes = serviceAddress?.travelBufferMinutes ?? 0;
  const firstAddressFit = hasServiceAddress
    ? findFirstAddressFit(days, travelBufferMinutes)
    : null;

  function handleDayChange(dayId: string) {
    setSelectedDayId(dayId);
    const nextDay = days.find((entry) => entry.id === dayId);
    const nextSlot =
      nextDay?.slots.find(
        (entry) => entry.isBookable && slotFitsAddress(nextDay, entry.key, travelBufferMinutes),
      ) ?? nextDay?.slots[0];

    if (nextSlot) {
      setSelectedSlotId(nextSlot.id);
    }
  }

  function handleValueChange<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  useEffect(() => {
    if (!hasServiceAddress) {
      return;
    }

    if (
      selectedDay &&
      selectedSlot &&
      selectedSlot.isBookable &&
      slotFitsAddress(selectedDay, selectedSlot.key, travelBufferMinutes)
    ) {
      return;
    }

    if (firstAddressFit) {
      const frame = window.requestAnimationFrame(() => {
        setSelectedDayId(firstAddressFit.day.id);
        setSelectedSlotId(firstAddressFit.slot.id);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }
  }, [
    firstAddressFit,
    hasServiceAddress,
    selectedDay,
    selectedSlot,
    travelBufferMinutes,
  ]);

  function persistProfile() {
    if (!formValues.rememberProfile) {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        customerName: formValues.customerName,
        phone: formValues.phone,
        company: formValues.company,
      }),
    );
  }

  function rememberRecentRequest(requestId: string) {
    const nextIds = [requestId, ...recentRequestIds.filter((entry) => entry !== requestId)].slice(
      0,
      MAX_RECENT_REQUESTS,
    );

    window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(nextIds));
    setRecentRequestIds(nextIds);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.location.trim()) {
      setError("Enter the 5-digit service ZIP first.");
      return;
    }

    if (!selectedDay || !selectedSlot) {
      setError("Pick a day and slot before sending the request.");
      return;
    }

    if (
      !selectedSlot.isBookable ||
      !slotFitsAddress(selectedDay, selectedSlot.key, travelBufferMinutes)
    ) {
      setError("That slot no longer fits once travel time is factored in. Pick another window.");
      return;
    }

    setError(null);
    setSuccess(null);
    persistProfile();

    startTransition(async () => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: formValues.customerName,
          phone: formValues.phone,
          company: formValues.company,
          location: formValues.location,
          roughYardage: formValues.roughYardage,
          notes: formValues.notes,
          requestedDate: selectedDay.date,
          requestedSlotKey: selectedSlot.key,
          source:
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone
              ? "pwa"
              : "web",
          serviceZone: serviceAddress?.zone ?? "unknown",
          distanceMiles: serviceAddress?.distanceMiles,
          travelBufferMinutes,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "The request did not send. Try again.");
        return;
      }

      const body = (await response.json()) as SubmissionState;
      setSuccess(body);
      rememberRecentRequest(body.requestId);
      setFormValues((current) => ({
        ...current,
        customerName: current.rememberProfile ? current.customerName : "",
        phone: current.rememberProfile ? current.phone : "",
        company: current.rememberProfile ? current.company : "",
        location: current.location,
        roughYardage: "",
        notes: "",
      }));
      router.refresh();
    });
  }

  return (
    <div className="booking-grid">
      <section className="booking-card" id="step-2">
        <div className="section-heading">
          <p className="eyebrow">Step 2</p>
          <h2 className="subsection-title">Pick a spot from the calendar</h2>
          <p className="support-copy">
            Open means you can request it. Held means somebody already sent a request for that window.
            {hasServiceAddress
              ? " The ZIP in Step 1 is already being factored in."
              : " Enter the service ZIP in Step 1 first."}
          </p>
        </div>

        <div className="day-picker" role="tablist" aria-label="Available days">
          {days.map((day) => (
            <button
              key={day.id}
              aria-selected={day.id === selectedDayId}
              className={`day-chip ${day.id === selectedDayId ? "is-selected" : ""}`}
              role="tab"
              type="button"
              onClick={() => handleDayChange(day.id)}
            >
              <span>{day.weekday}</span>
              <strong>{day.label}</strong>
            </button>
          ))}
        </div>

        <div className="slot-grid">
          {selectedDay?.slots.map((slot) => {
            const disabled =
              !hasServiceAddress ||
              !slot.isBookable ||
              !slotFitsAddress(selectedDay, slot.key, travelBufferMinutes);
            const isSelected = slot.id === selectedSlotId;
            const slotNote =
              hasServiceAddress &&
              slot.isBookable &&
              !slotFitsAddress(selectedDay, slot.key, travelBufferMinutes)
                ? "Travel time from this ZIP pushes into another blocked shift."
                : slot.note;

            return (
              <button
                key={slot.id}
                className={`slot-button ${isSelected ? "is-selected" : ""}`}
                disabled={disabled}
                type="button"
                onClick={() => setSelectedSlotId(slot.id)}
              >
                <span className={`slot-badge ${getStatusTone(slot.status)}`}>
                  {getStatusLabel(slot.status)}
                </span>
                <strong>{slot.label}</strong>
                <span>{slot.window}</span>
                <small>{slotNote}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="booking-card booking-card-accent" id="step-3">
        <div className="section-heading">
          <p className="eyebrow">Step 3</p>
          <h2 className="subsection-title">Send rough yardage and job details</h2>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="field">
              <span>Name</span>
              <input
                className="text-input"
                name="customerName"
                required
                type="text"
                value={formValues.customerName}
                onChange={(event) => handleValueChange("customerName", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Phone</span>
              <input
                className="text-input"
                name="phone"
                required
                type="tel"
                value={formValues.phone}
                onChange={(event) => handleValueChange("phone", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Company</span>
              <input
                className="text-input"
                name="company"
                type="text"
                value={formValues.company}
                onChange={(event) => handleValueChange("company", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Rough Yardage</span>
              <input
                className="text-input"
                name="roughYardage"
                placeholder="Example: 32"
                required
                type="number"
                value={formValues.roughYardage}
                onChange={(event) => handleValueChange("roughYardage", event.target.value)}
              />
            </label>

            <div className="queue-panel field-full booking-address-summary">
              <p className="queue-label">Service ZIP</p>
              <strong>{formValues.location || "Enter the service ZIP in Step 1."}</strong>
              <span>
                {serviceAddress?.travelNote ??
                  "Minot ZIPs keep the normal blockout. Outside Minot adds travel time there and back."}
              </span>
            </div>

            <label className="field field-full">
              <span>Notes</span>
              <textarea
                className="textarea"
                name="notes"
                placeholder="Access, pump distance, slab type, batch plant timing, or anything that matters."
                rows={4}
                value={formValues.notes}
                onChange={(event) => handleValueChange("notes", event.target.value)}
              />
            </label>
          </div>

          <label className="remember-toggle">
            <input
              checked={formValues.rememberProfile}
              type="checkbox"
              onChange={(event) =>
                handleValueChange("rememberProfile", event.target.checked)
              }
            />
            <span>Remember my contact info on this device</span>
          </label>

          <div className="queue-panel">
            <p className="queue-label">Selected window</p>
            <strong>
              {selectedDay?.weekday} {selectedDay?.label} · {selectedSlot?.label}
            </strong>
            <span>{selectedSlot?.window}</span>
            <p className="secondary-note">
              48 N holds this window while the schedule gets checked. If it is
              approved, it is yours. If not, the opening goes back on the
              calendar.
            </p>
          </div>

          <div id="request-status" />

          {error ? <p className="status-message is-error">{error}</p> : null}

          {success ? (
            <div className="status-message is-success">
              <strong>Request sent.</strong>
              <span>
                {success.scheduledFor} · Ref {success.requestId}
              </span>
              <span>48 N is holding that window while the schedule is checked. Reopen booking on this phone to see the latest status.</span>
            </div>
          ) : null}

          {recentRequests.length > 0 ? (
            <section className="request-status-section" aria-live="polite">
              <div className="section-heading request-status-heading">
                <p className="queue-label">Recent requests on this phone</p>
                <strong>Open this page any time to see whether each request is pending, approved, or denied.</strong>
              </div>

              <div className="request-status-list">
                {recentRequests.map((request) => (
                  <article className="request-status-card" key={request.id}>
                    <div className="request-status-top">
                      <div>
                        <p className="request-status-id">{request.id}</p>
                        <strong>
                          {request.requestedDate} · {request.requestedSlotLabel}
                        </strong>
                      </div>
                      <span
                        className={`slot-badge ${getRecentRequestStatusTone(request.status)}`}
                      >
                        {getRecentRequestStatusLabel(request.status)}
                      </span>
                    </div>
                    <p className="request-status-copy">
                      {getRecentRequestMessage(request)}
                    </p>
                    {request.decisionNote ? (
                      <p className="request-status-note">
                        <strong>Decision note:</strong> {request.decisionNote}
                      </p>
                    ) : null}
                    <p className="request-status-meta">
                      {request.customerName} · {request.requestedWindow} · Updated{" "}
                      {formatRecentRequestTime(request.updatedAt)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="submit-row">
            <button className="primary-button" disabled={isPending} type="submit">
              {isPending ? "Sending..." : "Send Request"}
            </button>
            <a className="secondary-link" href={`tel:${contactPhone.replace(/\D/g, "")}`}>
              Need it faster? Call dispatch
            </a>
          </div>
        </form>
      </section>
    </div>
  );
}
