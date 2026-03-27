import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

type SiteHeaderProps = {
  active?: "line-pumping" | "work";
  phone: string;
};

export function SiteHeader({ active, phone }: SiteHeaderProps) {
  const phoneHref = phone.replace(/\D/g, "");
  const primaryHref = active === "line-pumping" ? "/book" : "/#contact";
  const primaryLabel = active === "line-pumping" ? "Book the Pump" : "Get a Quote";
  const phoneLabel = active === "line-pumping" ? "Call Dispatch" : "Call Office";

  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="48 North Concrete home">
        <LogoMark compact />
      </Link>

      <nav className="header-links" aria-label="Primary navigation">
        <Link className="header-link" href="/#services">
          Services
        </Link>
        <Link className={`header-link ${active === "work" ? "is-active" : ""}`} href="/work">
          Work
        </Link>
        <Link className={`header-link ${active === "line-pumping" ? "is-active" : ""}`} href="/line-pumping">
          Line Pumping
        </Link>
        <Link className="header-link" href="/#contact">
          Contact
        </Link>
      </nav>

      <div className="header-actions">
        <Link className="primary-button" href={primaryHref}>
          {primaryLabel}
        </Link>
        <a className="secondary-link" href={`tel:${phoneHref}`}>
          {phoneLabel}
        </a>
      </div>
    </header>
  );
}
