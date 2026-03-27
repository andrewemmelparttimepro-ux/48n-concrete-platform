import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { type AvailabilityDay, getStatusLabel, getStatusTone } from "@/lib/booking";
import { getPortalData } from "@/lib/store";
import { LogoMark } from "@/components/logo-mark";

export const metadata: Metadata = {
  title: "Portal",
  description: "Review booking requests and manage the 48 North Concrete pump calendar.",
};

function formatPortalTimestamp(value: string) {
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

function DayStatusEditor({ day }: { day: AvailabilityDay }) {
  return (
    <article className="portal-day-card">
      <div className="portal-day-header">
        <div>
          <p className="eyebrow">Schedule control</p>
          <h2 className="subsection-title">
            {day.weekday} {day.label}
          </h2>
        </div>
        {day.isClosed ? (
          <span className="slot-badge is-full">Closed all day</span>
        ) : null}
      </div>

      <div className="portal-slot-list">
        {day.slots.map((slot) => (
          <div className="portal-slot-row" key={slot.id}>
            <div>
              <strong>{slot.label}</strong>
              <span>{slot.window}</span>
              <small>{slot.note}</small>
            </div>
            <span className={`slot-badge ${getStatusTone(slot.status)}`}>
              {getStatusLabel(slot.status)}
            </span>
          </div>
        ))}
      </div>

      <div className="portal-tools-grid">
        <form action="/api/admin/schedule" className="portal-mini-form" method="POST">
          <input name="mode" type="hidden" value="slot" />
          <input name="date" type="hidden" value={day.date} />

          <label className="field">
            <span>Slot</span>
            <select className="text-input" name="slotKey">
              <option value="early">Early Crew</option>
              <option value="midday">Midday Window</option>
              <option value="afternoon">Afternoon Slot</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select className="text-input" name="status">
              <option value="open">Open</option>
              <option value="limited">Limited</option>
              <option value="full">Full</option>
              <option value="default">Default</option>
            </select>
          </label>

          <label className="field field-full">
            <span>Note</span>
            <input className="text-input" name="note" type="text" />
          </label>

          <button className="secondary-link" type="submit">
            Save Slot
          </button>
        </form>

        <form action="/api/admin/schedule" className="portal-mini-form" method="POST">
          <input name="mode" type="hidden" value="day" />
          <input name="date" type="hidden" value={day.date} />

          <label className="field field-full">
            <span>Block whole day note</span>
            <input
              className="text-input"
              name="note"
              placeholder="Out pumping all day, maintenance, weather hold..."
              type="text"
            />
          </label>

          <div className="mini-actions">
            <button className="secondary-link" type="submit">
              Close Day
            </button>
          </div>
        </form>

        <form action="/api/admin/schedule" className="portal-mini-form" method="POST">
          <input name="mode" type="hidden" value="clear-day" />
          <input name="date" type="hidden" value={day.date} />
          <button className="secondary-link" type="submit">
            Reopen Day
          </button>
        </form>
      </div>
    </article>
  );
}

type PortalPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
};

export default async function PortalPage({ searchParams }: PortalPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const {
    settings,
    availability,
    newLeads,
    contactedLeads,
    pendingBookings,
    approvedBookings,
    deniedBookings,
    overrides,
  } = await getPortalData();

  return (
    <main className="portal-shell">
      <header className="site-header portal-header">
        <LogoMark compact />
        <div className="header-actions">
          <span className="portal-pill">{settings.homeBase}</span>
          <form action="/api/admin/logout" method="POST">
            <button className="secondary-link" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>

      <section className="portal-hero">
        <div className="hero-copy">
          <p className="eyebrow">Booking operations</p>
          <h1 className="hero-title">
            Approve the queue.
            <span>Control the calendar.</span>
          </h1>
          <p className="hero-body">
            This is the dispatch side for public pump requests, schedule
            blocks, and the day-to-day calendar behind the booking page.
          </p>
          {params.updated ? (
            <p className="status-message is-success">Changes saved.</p>
          ) : null}
          {params.error ? (
            <p className="status-message is-error">
              Something did not save correctly.
            </p>
          ) : null}
        </div>

        <div className="portal-summary-grid">
          <article className="info-card">
            <p className="eyebrow">Pending</p>
            <h2 className="portal-count">{pendingBookings.length}</h2>
          </article>
          <article className="info-card">
            <p className="eyebrow">Approved</p>
            <h2 className="portal-count">{approvedBookings.length}</h2>
          </article>
          <article className="info-card">
            <p className="eyebrow">Denied</p>
            <h2 className="portal-count">{deniedBookings.length}</h2>
          </article>
          <article className="info-card">
            <p className="eyebrow">New leads</p>
            <h2 className="portal-count">{newLeads.length}</h2>
          </article>
        </div>
      </section>

      <section className="portal-grid">
        <div className="portal-column">
          <section className="portal-section">
            <div className="section-heading">
              <p className="eyebrow">Pending requests</p>
              <h2 className="section-title">Approval queue</h2>
            </div>

            {pendingBookings.length === 0 ? (
              <article className="info-card">
                <p>No pending requests right now.</p>
              </article>
            ) : (
              pendingBookings.map((booking) => (
                <article className="portal-request-card" key={booking.id}>
                  <div className="portal-request-top">
                    <div>
                      <p className="eyebrow">{booking.id}</p>
                      <h3>{booking.customerName}</h3>
                    </div>
                    <span className="slot-badge is-held">Pending</span>
                  </div>

                  <div className="portal-request-grid">
                    <p>
                      <strong>Requested:</strong> {booking.requestedDate} ·{" "}
                      {booking.requestedSlotLabel}
                    </p>
                    <p>
                      <strong>Yardage:</strong> {booking.roughYardage}
                    </p>
                    <p>
                      <strong>Phone:</strong> {booking.phone}
                    </p>
                    <p>
                      <strong>Location:</strong> {booking.location}
                    </p>
                    {booking.company ? (
                      <p>
                        <strong>Company:</strong> {booking.company}
                      </p>
                    ) : null}
                    {booking.notes ? (
                      <p className="portal-note">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    ) : null}
                  </div>

                  <form
                    action={`/api/admin/bookings/${booking.id}/decision`}
                    className="portal-decision-form"
                    method="POST"
                  >
                    <label className="field field-full">
                      <span>Decision note</span>
                      <input className="text-input" name="note" type="text" />
                    </label>
                    <div className="mini-actions">
                      <button
                        className="primary-button"
                        name="status"
                        type="submit"
                        value="approved"
                      >
                        Approve
                      </button>
                      <button
                        className="secondary-link"
                        name="status"
                        type="submit"
                        value="denied"
                      >
                        Deny
                      </button>
                    </div>
                  </form>
                </article>
              ))
            )}
          </section>

          <section className="portal-section">
            <div className="section-heading">
              <p className="eyebrow">Recent outcomes</p>
              <h2 className="section-title">Approved and denied</h2>
            </div>

            <div className="portal-history-grid">
              <div className="portal-history-column">
                <h3>Approved</h3>
                {approvedBookings.slice(0, 6).map((booking) => (
                  <article className="info-card" key={booking.id}>
                    <p>
                      <strong>{booking.customerName}</strong>
                    </p>
                    <p>
                      {booking.requestedDate} · {booking.requestedSlotLabel}
                    </p>
                  </article>
                ))}
              </div>

              <div className="portal-history-column">
                <h3>Denied</h3>
                {deniedBookings.slice(0, 6).map((booking) => (
                  <article className="info-card" key={booking.id}>
                    <p>
                      <strong>{booking.customerName}</strong>
                    </p>
                    <p>
                      {booking.requestedDate} · {booking.requestedSlotLabel}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="portal-section">
            <div className="section-heading">
              <p className="eyebrow">Website leads</p>
              <h2 className="section-title">Quote requests</h2>
            </div>

            {newLeads.length === 0 ? (
              <article className="info-card">
                <p>No new quote requests right now.</p>
              </article>
            ) : (
              newLeads.map((lead) => (
                <article className="portal-request-card" key={lead.id}>
                  <div className="portal-request-top">
                    <div>
                      <p className="eyebrow">{lead.id}</p>
                      <h3>{lead.customerName}</h3>
                    </div>
                    <span className="slot-badge is-held">New lead</span>
                  </div>

                  <div className="portal-request-grid">
                    <p>
                      <strong>Service:</strong> {lead.serviceInterest}
                    </p>
                    <p>
                      <strong>Received:</strong> {formatPortalTimestamp(lead.createdAt)}
                    </p>
                    <p>
                      <strong>Phone:</strong> {lead.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {lead.email}
                    </p>
                    {lead.company ? (
                      <p>
                        <strong>Company:</strong> {lead.company}
                      </p>
                    ) : null}
                    <p className="portal-note">
                      <strong>Message:</strong> {lead.message}
                    </p>
                  </div>

                  <form
                    action={`/api/admin/leads/${lead.id}/status`}
                    className="portal-decision-form"
                    method="POST"
                  >
                    <input name="status" type="hidden" value="contacted" />
                    <div className="mini-actions">
                      <button className="secondary-link" type="submit">
                        Mark Contacted
                      </button>
                    </div>
                  </form>
                </article>
              ))
            )}

            {contactedLeads.length > 0 ? (
              <div className="portal-history-grid">
                <div className="portal-history-column">
                  <h3>Recently contacted</h3>
                  {contactedLeads.slice(0, 6).map((lead) => (
                    <article className="info-card" key={lead.id}>
                      <p>
                        <strong>{lead.customerName}</strong>
                      </p>
                      <p>
                        {lead.serviceInterest} · {formatPortalTimestamp(lead.updatedAt)}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="portal-column">
          <section className="portal-section">
            <div className="section-heading">
              <p className="eyebrow">Overrides</p>
              <h2 className="section-title">Current schedule blocks</h2>
            </div>

            {overrides.length === 0 ? (
              <article className="info-card">
                <p>No manual overrides in place.</p>
              </article>
            ) : (
              overrides.map((override) => (
                <article className="info-card" key={override.date}>
                  <p>
                    <strong>{override.date}</strong>
                  </p>
                  <p>{override.closedAllDay ? "Closed all day" : "Slot override"}</p>
                  {override.note ? <p>{override.note}</p> : null}
                </article>
              ))
            )}
          </section>

          <section className="portal-section">
            <div className="section-heading">
              <p className="eyebrow">Calendar</p>
              <h2 className="section-title">Next openings</h2>
            </div>

            <div className="portal-day-list">
              {availability.slice(0, 6).map((day) => (
                <DayStatusEditor day={day} key={day.id} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
