"use client";

import { useEffect, useState, useTransition } from "react";

const PROFILE_STORAGE_KEY = "48n-quote-profile";

const serviceOptions = [
  "Commercial concrete",
  "Residential concrete",
  "Foundations / ICF",
  "Flatwork / decorative",
  "Line pumping",
  "Winter / specialty work",
  "Other",
];

type QuoteRequestFormProps = {
  officePhone: string;
};

type FormValues = {
  customerName: string;
  phone: string;
  email: string;
  company: string;
  serviceInterest: string;
  message: string;
  rememberProfile: boolean;
};

type SubmissionState = {
  leadId: string;
};

export function QuoteRequestForm({ officePhone }: QuoteRequestFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmissionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formValues, setFormValues] = useState<FormValues>({
    customerName: "",
    phone: "",
    email: "",
    company: "",
    serviceInterest: serviceOptions[0],
    message: "",
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
          email: stored.email || "",
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

  function handleValueChange<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

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
        email: formValues.email,
        company: formValues.company,
      }),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    persistProfile();

    startTransition(async () => {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: formValues.customerName,
          phone: formValues.phone,
          email: formValues.email,
          company: formValues.company,
          serviceInterest: formValues.serviceInterest,
          message: formValues.message,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "The quote request did not send. Try again.");
        return;
      }

      const body = (await response.json()) as SubmissionState;
      setSuccess(body);
      setFormValues((current) => ({
        ...current,
        customerName: current.rememberProfile ? current.customerName : "",
        phone: current.rememberProfile ? current.phone : "",
        email: current.rememberProfile ? current.email : "",
        company: current.rememberProfile ? current.company : "",
        serviceInterest: serviceOptions[0],
        message: "",
      }));
    });
  }

  return (
    <section className="booking-card booking-card-accent quote-form-card">
      <div className="section-heading">
        <p className="eyebrow">Quote request</p>
        <h2 className="subsection-title">Send the project basics and get the conversation started</h2>
        <p className="support-copy">
          Use this for commercial work, residential projects, flatwork,
          foundations, or a full-scope quote. Planned pump scheduling still
          belongs in the booking tool.
        </p>
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
            <span>Email</span>
            <input
              className="text-input"
              name="email"
              required
              type="email"
              value={formValues.email}
              onChange={(event) => handleValueChange("email", event.target.value)}
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
            <span>Work type</span>
            <select
              className="text-input"
              name="serviceInterest"
              value={formValues.serviceInterest}
              onChange={(event) => handleValueChange("serviceInterest", event.target.value)}
            >
              {serviceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field field-full">
            <span>Project details</span>
            <textarea
              className="textarea"
              name="message"
              placeholder="Scope, timing, location, approximate size, access, and anything else that matters."
              required
              rows={5}
              value={formValues.message}
              onChange={(event) => handleValueChange("message", event.target.value)}
            />
          </label>
        </div>

        <label className="remember-toggle">
          <input
            checked={formValues.rememberProfile}
            type="checkbox"
            onChange={(event) => handleValueChange("rememberProfile", event.target.checked)}
          />
          <span>Remember my contact info on this device</span>
        </label>

        {error ? <p className="status-message is-error">{error}</p> : null}

        {success ? (
          <div className="status-message is-success">
            <strong>Quote request sent.</strong>
            <span>Ref {success.leadId}</span>
            <span>48 N can follow up from the phone and email you sent here.</span>
          </div>
        ) : null}

        <div className="submit-row">
          <button className="primary-button" disabled={isPending} type="submit">
            {isPending ? "Sending..." : "Send Quote Request"}
          </button>
          <a className="secondary-link" href={`tel:${officePhone.replace(/\D/g, "")}`}>
            Prefer to call? {officePhone}
          </a>
        </div>
      </form>
    </section>
  );
}
