import { NextResponse } from "next/server";

const MINOT_CENTER = {
  lat: 48.2325,
  lng: -101.2963,
};

const MINOT_STANDARD_RADIUS_MILES = 15;

function haversineMiles(
  firstLat: number,
  firstLng: number,
  secondLat: number,
  secondLng: number,
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(secondLat - firstLat);
  const deltaLng = toRadians(secondLng - firstLng);
  const start = toRadians(firstLat);
  const end = toRadians(secondLat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(start) * Math.cos(end) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();
  const zip = address?.replace(/\D/g, "").slice(0, 5);

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: "Enter a 5-digit service ZIP." },
      { status: 422 },
    );
  }

  const search = new URL("https://nominatim.openstreetmap.org/search");
  search.searchParams.set("format", "jsonv2");
  search.searchParams.set("limit", "1");
  search.searchParams.set("countrycodes", "us");
  search.searchParams.set("q", `${zip} North Dakota`);

  const response = await fetch(search, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "48NorthConcreteBooking/1.0",
    },
    next: { revalidate: 0 },
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.json(
      { error: "Could not check that service ZIP yet." },
      { status: 502 },
    );
  }

  const matches = (await response.json().catch(() => null)) as
    | Array<{
        lat?: string;
        lon?: string;
        display_name?: string;
      }>
    | null;

  const first = matches?.[0];
  const lat = Number(first?.lat);
  const lng = Number(first?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Could not pin that ZIP on the map." },
      { status: 404 },
    );
  }

  const distanceMiles = haversineMiles(MINOT_CENTER.lat, MINOT_CENTER.lng, lat, lng);
  const isStandardMinotBlockout = distanceMiles <= MINOT_STANDARD_RADIUS_MILES;

  return NextResponse.json({
    address: zip,
    displayName: first?.display_name ?? zip,
    lat,
    lng,
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    travelBufferMinutes: isStandardMinotBlockout
      ? 0
      : Math.ceil((distanceMiles / 55) * 60),
    zone: isStandardMinotBlockout ? "minot" : "travel",
    travelNote: isStandardMinotBlockout
      ? "Minot ZIP or just outside city limits. Standard blockout stays the same."
      : "Outside Minot. Travel time will be added there and back when this window is reviewed.",
  });
}
