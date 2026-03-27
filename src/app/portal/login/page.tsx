import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export const metadata: Metadata = {
  title: "Portal Login",
  description: "Access the 48 North Concrete pump booking queue and schedule controls.",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function PortalLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="portal-login-shell">
      <section className="portal-login-card">
        <LogoMark />
        <div className="section-heading">
          <p className="eyebrow">Owner access</p>
          <h1 className="section-title">Queue and schedule portal</h1>
          <p className="support-copy">
            Approve requests, deny conflicts, and block out your calendar before
            a customer ever gets left guessing.
          </p>
        </div>

        <form action="/api/admin/login" className="portal-login-form" method="POST">
          <label className="field">
            <span>Passcode</span>
            <input
              autoComplete="current-password"
              className="text-input"
              name="passcode"
              required
              type="password"
            />
          </label>

          {params.error ? (
            <p className="status-message is-error">
              The passcode did not match.
            </p>
          ) : null}

          <button className="primary-button" type="submit">
            Open Portal
          </button>
        </form>

        <Link className="secondary-link" href="/">
          Back to site
        </Link>
      </section>
    </main>
  );
}
