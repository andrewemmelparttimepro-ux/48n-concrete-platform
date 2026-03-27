import { promises as fs } from "node:fs";
import path from "node:path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import {
  type AppState,
  type BookingRecord,
  type BookingStatus,
  type LeadRecord,
  type LeadStatus,
  type ManualSlotStatus,
  type ScheduleOverride,
  type SlotKey,
  buildAvailabilityDays,
  createInitialState,
  getImpactedSlotKeys,
  getSlotDefinition,
  sortBookingsForQueue,
} from "@/lib/booking";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_STATE_FILE = process.env.VERCEL
  ? path.join("/tmp", "48n-app-state.json")
  : path.join(DATA_DIR, "app-state.json");
const BLOB_PATH = "48n/app-state.json";

type Snapshot = {
  state: AppState;
  etag?: string;
};

type BookingInput = {
  customerName: string;
  phone: string;
  company?: string;
  location: string;
  roughYardage: number;
  notes?: string;
  requestedDate: string;
  requestedSlotKey: SlotKey;
  source: "web" | "pwa";
  serviceZone?: "minot" | "travel" | "unknown";
  distanceMiles?: number;
  travelBufferMinutes?: number;
};

type LeadInput = {
  customerName: string;
  phone: string;
  email: string;
  company?: string;
  serviceInterest: string;
  message: string;
};

export type PublicBookingStatus = {
  id: string;
  customerName: string;
  status: BookingStatus;
  requestedDate: string;
  requestedSlotLabel: string;
  requestedWindow: string;
  createdAt: string;
  updatedAt: string;
  decisionNote?: string;
  decidedAt?: string;
};

type UpdateResult<T> = {
  state: AppState;
  result: T;
};

function isBlobPreconditionError(error: unknown) {
  if (error instanceof BlobPreconditionFailedError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "BlobPreconditionFailedError" ||
    /precondition failed/i.test(error.message) ||
    /etag mismatch/i.test(error.message)
  );
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureLocalStateFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(LOCAL_STATE_FILE);
  } catch {
    await fs.writeFile(
      LOCAL_STATE_FILE,
      JSON.stringify(createInitialState(), null, 2),
      "utf8",
    );
  }
}

async function readLocalState(): Promise<Snapshot> {
  await ensureLocalStateFile();
  const raw = await fs.readFile(LOCAL_STATE_FILE, "utf8");
  return {
    state: normalizeState(JSON.parse(raw) as AppState),
  };
}

async function writeLocalState(state: AppState) {
  await ensureLocalStateFile();
  await fs.writeFile(LOCAL_STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

async function readBlobState(): Promise<Snapshot> {
  const blob = await get(BLOB_PATH, {
    access: "private",
    useCache: false,
  });

  if (!blob || blob.statusCode !== 200) {
    const initial = createInitialState();
    const created = await put(BLOB_PATH, JSON.stringify(initial, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });

    return {
      state: initial,
      etag: created.etag,
    };
  }

  const raw = await new Response(blob.stream).text();

  return {
    state: normalizeState(JSON.parse(raw) as AppState),
    etag: blob.blob.etag,
  };
}

async function writeBlobState(state: AppState, etag?: string) {
  return put(BLOB_PATH, JSON.stringify(state, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    ifMatch: etag,
  });
}

async function readSnapshot(): Promise<Snapshot> {
  if (hasBlobStorage()) {
    return readBlobState();
  }

  return readLocalState();
}

async function updateState<T>(
  updater: (current: AppState) => Promise<UpdateResult<T>> | UpdateResult<T>,
): Promise<T> {
  if (!hasBlobStorage()) {
    const snapshot = await readLocalState();
    const next = await updater(structuredClone(snapshot.state));
    await writeLocalState(next.state);
    return next.result;
  }

  let lastPreconditionError: unknown = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const snapshot = await readBlobState();
    const next = await updater(structuredClone(snapshot.state));

    try {
      await writeBlobState(next.state, snapshot.etag);
      return next.result;
    } catch (error) {
      if (isBlobPreconditionError(error)) {
        lastPreconditionError = error;

        if (attempt < 5) {
          await wait(120 * (attempt + 1));
          continue;
        }

        break;
      }

      throw error;
    }
  }

  if (isBlobPreconditionError(lastPreconditionError)) {
    const snapshot = await readBlobState();
    const next = await updater(structuredClone(snapshot.state));
    await writeBlobState(next.state);
    return next.result;
  }

  throw new Error("State update failed after multiple retries.");
}

function getQueueLength(bookings: BookingRecord[]) {
  return bookings.filter((entry) => entry.status === "pending").length;
}

function normalizeState(raw: AppState): AppState {
  const initial = createInitialState();

  return {
    version: typeof raw.version === "number" ? raw.version : initial.version,
    settings: {
      ...initial.settings,
      ...raw.settings,
    },
    bookings: Array.isArray(raw.bookings) ? raw.bookings : [],
    leads: Array.isArray(raw.leads) ? raw.leads : [],
    scheduleOverrides: Array.isArray(raw.scheduleOverrides)
      ? raw.scheduleOverrides
      : initial.scheduleOverrides,
  };
}

function getScheduleOverride(state: AppState, date: string) {
  return state.scheduleOverrides.find((entry) => entry.date === date);
}

function upsertOverride(
  state: AppState,
  nextOverride: ScheduleOverride,
  date: string,
) {
  const index = state.scheduleOverrides.findIndex((entry) => entry.date === date);

  if (
    !nextOverride.closedAllDay &&
    !nextOverride.note &&
    Object.keys(nextOverride.slots).length === 0
  ) {
    if (index >= 0) {
      state.scheduleOverrides.splice(index, 1);
    }
    return;
  }

  if (index >= 0) {
    state.scheduleOverrides[index] = nextOverride;
    return;
  }

  state.scheduleOverrides.push(nextOverride);
}

export async function getAppState() {
  const snapshot = await readSnapshot();
  return snapshot.state;
}

export async function getBookingPageData() {
  const state = await getAppState();
  const days = buildAvailabilityDays(state);
  const pending = state.bookings.filter((entry) => entry.status === "pending").length;

  return {
    settings: state.settings,
    days,
    pending,
  };
}

export async function getPortalData() {
  const state = await getAppState();
  const availability = buildAvailabilityDays(state);
  const ordered = sortBookingsForQueue(state.bookings);
  const leads = [...state.leads].sort((left, right) =>
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return {
    settings: state.settings,
    availability,
    bookings: ordered,
    leads,
    newLeads: leads.filter((entry) => entry.status === "new"),
    contactedLeads: leads.filter((entry) => entry.status === "contacted"),
    pendingBookings: ordered.filter((entry) => entry.status === "pending"),
    approvedBookings: ordered.filter((entry) => entry.status === "approved"),
    deniedBookings: ordered.filter((entry) => entry.status === "denied"),
    overrides: [...state.scheduleOverrides].sort((left, right) =>
      left.date.localeCompare(right.date),
    ),
  };
}

export async function createBookingRequest(input: BookingInput) {
  return updateState(async (state) => {
    const availability = buildAvailabilityDays(state);
    const day = availability.find((entry) => entry.date === input.requestedDate);
    const slot = day?.slots.find((entry) => entry.key === input.requestedSlotKey);
    const impactedKeys = getImpactedSlotKeys(
      input.requestedSlotKey,
      input.travelBufferMinutes ?? 0,
    );

    if (!day || !slot) {
      throw new Error("That booking window is not available.");
    }

    const conflictingSlot = day.slots.find(
      (entry) => impactedKeys.includes(entry.key) && !entry.isBookable,
    );

    if (conflictingSlot) {
      throw new Error(
        "That booking window no longer fits once travel time is factored in. Pick another window or call dispatch.",
      );
    }

    const now = new Date().toISOString();
    const record: BookingRecord = {
      id: `48N-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      createdAt: now,
      updatedAt: now,
      status: "pending",
      customerName: input.customerName,
      phone: input.phone,
      company: input.company || undefined,
      location: input.location,
      roughYardage: input.roughYardage,
      notes: input.notes || undefined,
      requestedDate: input.requestedDate,
      requestedSlotKey: input.requestedSlotKey,
      requestedSlotLabel: slot.label,
      requestedWindow: slot.window,
      source: input.source,
      serviceZone: input.serviceZone,
      distanceMiles: input.distanceMiles,
      travelBufferMinutes: input.travelBufferMinutes,
    };

    state.bookings.unshift(record);
    state.version += 1;

    return {
      state,
      result: {
        request: record,
        queuePosition: getQueueLength(state.bookings),
      },
    };
  });
}

export async function createLeadRequest(input: LeadInput) {
  return updateState(async (state) => {
    const now = new Date().toISOString();
    const record: LeadRecord = {
      id: `48NQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      createdAt: now,
      updatedAt: now,
      status: "new",
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      company: input.company || undefined,
      serviceInterest: input.serviceInterest,
      message: input.message,
    };

    state.leads.unshift(record);
    state.version += 1;

    return {
      state,
      result: record,
    };
  });
}

function toPublicBookingStatus(record: BookingRecord): PublicBookingStatus {
  return {
    id: record.id,
    customerName: record.customerName,
    status: record.status,
    requestedDate: record.requestedDate,
    requestedSlotLabel: record.requestedSlotLabel,
    requestedWindow: record.requestedWindow,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    decisionNote: record.decisionNote,
    decidedAt: record.decidedAt,
  };
}

export async function getPublicBookingStatuses(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const state = await getAppState();
  const uniqueIds = [...new Set(ids)];

  return uniqueIds
    .map((id) => state.bookings.find((entry) => entry.id === id))
    .filter((entry): entry is BookingRecord => Boolean(entry))
    .map(toPublicBookingStatus);
}

export async function setBookingDecision(
  bookingId: string,
  status: Extract<BookingStatus, "approved" | "denied">,
  note?: string,
) {
  return updateState(async (state) => {
    const target = state.bookings.find((entry) => entry.id === bookingId);

    if (!target) {
      throw new Error("Booking request not found.");
    }

    target.status = status;
    target.updatedAt = new Date().toISOString();
    target.decidedAt = target.updatedAt;
    target.decisionNote = note || undefined;
    state.version += 1;

    return {
      state,
      result: target,
    };
  });
}

export async function setLeadStatus(leadId: string, status: LeadStatus) {
  return updateState(async (state) => {
    const target = state.leads.find((entry) => entry.id === leadId);

    if (!target) {
      throw new Error("Lead request not found.");
    }

    target.status = status;
    target.updatedAt = new Date().toISOString();
    state.version += 1;

    return {
      state,
      result: target,
    };
  });
}

export async function updateScheduleOverride(input: {
  date: string;
  slotKey?: SlotKey;
  status: ManualSlotStatus | "default";
  note?: string;
  closeDay?: boolean;
}) {
  return updateState(async (state) => {
    const current =
      getScheduleOverride(state, input.date) ?? {
        date: input.date,
        updatedAt: new Date().toISOString(),
        slots: {},
      };

    const nextOverride: ScheduleOverride = {
      ...current,
      updatedAt: new Date().toISOString(),
      note: input.closeDay ? input.note || current.note : current.note,
      closedAllDay: input.closeDay ? true : false,
      slots: { ...current.slots },
    };

    if (!input.closeDay && input.slotKey) {
      if (input.status === "default") {
        delete nextOverride.slots[input.slotKey];
      } else {
        nextOverride.slots[input.slotKey] = {
          status: input.status,
          note: input.note || getSlotDefinition(input.slotKey)?.note,
        };
      }
    }

    if (input.closeDay === false) {
      nextOverride.closedAllDay = false;
      if (input.note) {
        nextOverride.note = input.note;
      }
    }

    upsertOverride(state, nextOverride, input.date);
    state.version += 1;

    return {
      state,
      result: nextOverride,
    };
  });
}

export async function clearScheduleOverride(input: {
  date: string;
  slotKey?: SlotKey;
  clearDay?: boolean;
}) {
  return updateState(async (state) => {
    const current = getScheduleOverride(state, input.date);

    if (!current) {
      return {
        state,
        result: null,
      };
    }

    const nextOverride: ScheduleOverride = {
      ...current,
      updatedAt: new Date().toISOString(),
      slots: { ...current.slots },
    };

    if (input.clearDay) {
      nextOverride.closedAllDay = false;
      nextOverride.note = undefined;
    }

    if (input.slotKey) {
      delete nextOverride.slots[input.slotKey];
    }

    upsertOverride(state, nextOverride, input.date);
    state.version += 1;

    return {
      state,
      result: nextOverride,
    };
  });
}

export async function getAvailabilitySnapshot() {
  const state = await getAppState();
  return buildAvailabilityDays(state);
}