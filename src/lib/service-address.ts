export const SERVICE_ADDRESS_STORAGE_KEY = "48n-booking-service-address";
export const SERVICE_ADDRESS_EVENT = "48n:service-address-updated";

export type ServiceAddressZone = "minot" | "travel" | "unknown";

export type ServiceAddressMeta = {
  address: string;
  displayName?: string;
  zone: ServiceAddressZone;
  distanceMiles?: number;
  travelBufferMinutes?: number;
  lat?: number;
  lng?: number;
  travelNote?: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function parseStoredServiceAddress(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAddressMeta>;

    if (typeof parsed.address !== "string") {
      return null;
    }

    return {
      address: parsed.address,
      displayName:
        typeof parsed.displayName === "string" ? parsed.displayName : undefined,
      zone:
        parsed.zone === "minot" || parsed.zone === "travel"
          ? parsed.zone
          : "unknown",
      distanceMiles: isFiniteNumber(parsed.distanceMiles)
        ? parsed.distanceMiles
        : undefined,
      travelBufferMinutes: isFiniteNumber(parsed.travelBufferMinutes)
        ? parsed.travelBufferMinutes
        : undefined,
      lat: isFiniteNumber(parsed.lat) ? parsed.lat : undefined,
      lng: isFiniteNumber(parsed.lng) ? parsed.lng : undefined,
      travelNote:
        typeof parsed.travelNote === "string" ? parsed.travelNote : undefined,
    } satisfies ServiceAddressMeta;
  } catch {
    return null;
  }
}

export function readStoredServiceAddress() {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredServiceAddress(
    window.localStorage.getItem(SERVICE_ADDRESS_STORAGE_KEY),
  );
}

export function writeStoredServiceAddress(details: ServiceAddressMeta | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!details || !details.address.trim()) {
    window.localStorage.removeItem(SERVICE_ADDRESS_STORAGE_KEY);
  } else {
    window.localStorage.setItem(
      SERVICE_ADDRESS_STORAGE_KEY,
      JSON.stringify(details),
    );
  }

  window.dispatchEvent(
    new CustomEvent<ServiceAddressMeta | null>(SERVICE_ADDRESS_EVENT, {
      detail: details,
    }),
  );
}
