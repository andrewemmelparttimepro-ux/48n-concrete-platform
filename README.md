# 48 North Concrete Platform

Mobile-first consolidation for 48 North Concrete, developed in isolation while the current production sites stay live.

## Priorities

- Sell the service in the first mobile screen.
- Keep the high-vis neon yellow-green because it has a jobsite purpose.
- Turn pump booking into the core repeat-customer tool.
- Make the booking side installable as a PWA for repeat customers.
- Queue requests for approval instead of pretending the calendar is instantly confirmed.

## Current foundation

- `src/app/page.tsx`: marketing homepage direction
- `src/app/book/page.tsx`: booking-first PWA shell
- `src/app/portal/page.tsx`: owner queue and schedule portal
- `src/app/api/availability/route.ts`: public availability feed
- `src/app/api/bookings/route.ts`: booking request creation
- `src/app/manifest.ts`: booking-focused web app manifest
- `public/sw.js`: service worker for the booking shell
- `docs/rebuild-brief.md`: product direction
- `docs/technical-architecture.md`: implementation direction

## Required environment variables

- `FORTY8N_ADMIN_PASSCODE`: owner portal passcode
- `FORTY8N_SESSION_SECRET`: cookie signing secret
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for deployed persistence

The app still accepts the old Prairie env var names as fallback during transition.

If `BLOB_READ_WRITE_TOKEN` is not set, local development falls back to `data/app-state.json`.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Deployment note

This workspace is intentionally separate from the live site. The current plan is to keep the existing Netlify site live, review this rebuild independently, and cut over only when the replacement is ready.
