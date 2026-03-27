# Technical Architecture

## Frontend

- Framework: Next.js 16 App Router
- Language: TypeScript
- Hosting target: Netlify
- Routing split:
  - `/`: marketing homepage
  - `/book`: installable booking experience

## Why this stack

- It supports a strong marketing site and app-like booking flow in one codebase.
- Netlify supports the deployment model well.
- Route handlers give a clean path for availability and booking APIs.
- The booking experience can be promoted to a PWA without requiring the whole marketing site to behave like an app.

## PWA scope

- Manifest start URL: `/book`
- Scope: `/book`
- Standalone display mode
- Service worker caches the booking shell and static assets
- Install affordance lives on the booking page

## Recommended production data layer

This implementation uses Vercel Blob for deployed persistence and a local JSON file during development.

Recommended:

- Vercel Blob for the current deployed queue state
- Local JSON file fallback for development
- Vercel for frontend hosting
- Owner auth for queue review
- Calendar sync layer later if you want Google or Outlook integration

## Core entities

- `customers`
  - name
  - phone
  - company
  - preferred locations
- `booking_requests`
  - requested date
  - requested slot
  - rough yardage
  - location
  - notes
  - status: pending, approved, denied, expired
- `availability_blocks`
  - date
  - start time
  - end time
  - source: manual, approved booking, calendar sync
- `decision_log`
  - request id
  - action
  - actor
  - timestamp
  - reason

## Current implementation notes

- Public booking creates a pending hold on a slot.
- Pending holds remove that slot from public availability.
- Approving a request turns the slot into a full booking.
- Denying a request reopens the slot.
- Manual overrides allow slot-level status changes and whole-day closures.
- Owner access is protected by a passcode-backed cookie session.

## Workflow

1. Customer opens `/book`.
2. Customer sees available or limited windows.
3. Customer selects a slot and submits rough yardage plus location.
4. Request is stored as `pending`.
5. That time window is temporarily held from double-booking rules.
6. Owner approves or denies from an internal queue.
7. Customer receives final confirmation or rejection.

## Next implementation steps

1. Replace mock availability with database-backed availability.
2. Build owner queue pages with approve and deny actions.
3. Add login and access control for queue management.
4. Add confirmation notifications by SMS or email.
5. Add repeat-customer shortcuts such as saved contact data and recent job locations.

## Deployment model

- Keep the current production site live.
- Use this rebuild as a separate preview workflow.
- Cut over on Netlify only after the booking flow is reliable enough for daily customer use.
