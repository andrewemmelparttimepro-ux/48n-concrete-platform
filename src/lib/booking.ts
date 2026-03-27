export const SLOT_DEFINITIONS = [
  {
    key: "early",
    label: "Early Crew",
    window: "6:30 AM to 9:00 AM",
    note: "Best for first pours and tight jobsite timing.",
    startMinutes: 6 * 60 + 30,
    endMinutes: 9 * 60,
  },
  {
    key: "midday",
    label: "Midday Window",
    window: "9:30 AM to 12:30 PM",
    note: "Good for standard pours with normal setup time.",
    startMinutes: 9 * 60 + 30,
    endMinutes: 12 * 60 + 30,
  },
  {
    key: "afternoon",
    label: "Afternoon Slot",
    window: "1:00 PM to 4:30 PM",
    note: "Works well when the batch plant or crew runs later.",
    startMinutes: 13 * 60,
    endMinutes: 16 * 60 + 30,
  },
] as const;

export type SlotKey = (typeof SLOT_DEFINITIONS)[number]["key"];
export type ManualSlotStatus = "open" | "limited" | "full";
export type SlotStatus = ManualSlotStatus | "held" | "closed";
export type BookingStatus = "pending" | "approved" | "denied";
export type LeadStatus = "new" | "contacted";

export type AvailabilitySlot = {
  id: string;
  key: SlotKey;
  date: string;
  label: string;
  window: string;
  note: string;
  status: SlotStatus;
  isBookable: boolean;
  pendingCount: number;
  approvedCount: number;
};

export type AvailabilityDay = {
  id: string;
  date: string;
  weekday: string;
  label: string;
  note?: string;
  isClosed: boolean;
  slots: AvailabilitySlot[];
};

export type BookingRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: BookingStatus;
  customerName: string;
  phone: string;
  company?: string;
  location: string;
  roughYardage: number;
  notes?: string;
  requestedDate: string;
  requestedSlotKey: SlotKey;
  requestedSlotLabel: string;
  requestedWindow: string;
  source: "web" | "pwa";
  serviceZone?: "minot" | "travel" | "unknown";
  distanceMiles?: number;
  travelBufferMinutes?: number;
  decisionNote?: string;
  decidedAt?: string;
};

export type ScheduleOverride = {
  date: string;
  closedAllDay?: boolean;
  note?: string;
  updatedAt: string;
  slots: Partial<
    Record<
      SlotKey,
      {
        status: ManualSlotStatus;
        note?: string;
      }
    >
  >;
};

export type LeadRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  customerName: string;
  phone: string;
  email: string;
  company?: string;
  serviceInterest: string;
  message: string;
};

export type AppState = {
  version: number;
  settings: {
    calendarDays: number;
    slotCapacity: number;
    contactPhone: string;
    homeBase: string;
    territory: string;
  };
  bookings: BookingRecord[];
  leads: LeadRecord[];
  scheduleOverrides: ScheduleOverride[];
};

function atLocalMidday(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function toIsoDate(date: Date) {
  return atLocalMidday(date).toISOString().slice(0, 10);
}

export function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function skipClosedDays(date: Date) {
  const normalized = atLocalMidday(date);

  while (normalized.getDay() === 0) {
    normalized.setDate(normalized.getDate() + 1);
  }

  return normalized;
}

export function getNextWorkDays(days: number) {
  const today = skipClosedDays(new Date());
  const entries: Date[] = [];
  let cursor = atLocalMidday(today);

  while (entries.length < days) {
    const current = skipClosedDays(cursor);
    entries.push(current);
    cursor = addDays(current, 1);
  }

  return entries;
}

export function getSlotDefinition(slotKey: SlotKey) {
  return SLOT_DEFINITIONS.find((slot) => slot.key === slotKey);
}

export function getImpactedSlotKeys(
  requestedSlotKey: SlotKey,
  travelBufferMinutes = 0,
) {
  const requested = getSlotDefinition(requestedSlotKey);

  if (!requested) {
    return [requestedSlotKey];
  }

  const occupiedStart = requested.startMinutes - travelBufferMinutes;
  const occupiedEnd = requested.endMinutes + travelBufferMinutes;

  return SLOT_DEFINITIONS.filter(
    (slot) =>
      occupiedStart < slot.endMinutes && occupiedEnd > slot.startMinutes,
  ).map((slot) => slot.key);
}

function resolveBaseStatus(
  override: ScheduleOverride | undefined,
  slotKey: SlotKey,
): ManualSlotStatus {
  return override?.slots[slotKey]?.status ?? "open";
}

function resolveBaseNote(override: ScheduleOverride | undefined, slotKey: SlotKey) {
  return override?.slots[slotKey]?.note ?? getSlotDefinition(slotKey)?.note ?? "";
}

export function buildAvailabilityDays(state: AppState, days = state.settings.calendarDays) {
  const dates = getNextWorkDays(days);

  return dates.map((date) => {
    const isoDate = toIsoDate(date);
    const override = state.scheduleOverrides.find((entry) => entry.date === isoDate);

    const slots = SLOT_DEFINITIONS.map((slot) => {
      const matchingBookings = state.bookings.filter(
        (entry) =>
          entry.requestedDate === isoDate &&
          getImpactedSlotKeys(
            entry.requestedSlotKey,
            entry.travelBufferMinutes ?? 0,
          ).includes(slot.key),
      );
      const pendingCount = matchingBookings.filter(
        (entry) => entry.status === "pending",
      ).length;
      const approvedCount = matchingBookings.filter(
        (entry) => entry.status === "approved",
      ).length;
      const baseStatus = resolveBaseStatus(override, slot.key);
      const baseNote = resolveBaseNote(override, slot.key);

      let status: SlotStatus = baseStatus;

      if (override?.closedAllDay) {
        status = "closed";
      } else if (approvedCount >= state.settings.slotCapacity || baseStatus === "full") {
        status = "full";
      } else if (pendingCount >= state.settings.slotCapacity) {
        status = "held";
      }

      return {
        id: `${isoDate}-${slot.key}`,
        key: slot.key,
        date: isoDate,
        label: slot.label,
        window: slot.window,
        note: override?.closedAllDay
          ? override.note || "This day is blocked out."
          : baseNote,
        status,
        isBookable: status === "open" || status === "limited",
        pendingCount,
        approvedCount,
      } satisfies AvailabilitySlot;
    });

    return {
      id: isoDate,
      date: isoDate,
      weekday: formatWeekday(date),
      label: formatDayLabel(date),
      note: override?.note,
      isClosed: Boolean(override?.closedAllDay),
      slots,
    } satisfies AvailabilityDay;
  });
}

export function getFirstBookableSlot(days: AvailabilityDay[]) {
  for (const day of days) {
    const slot = day.slots.find((entry) => entry.isBookable);

    if (slot) {
      return { day, slot };
    }
  }

  return null;
}

export function getStatusLabel(status: SlotStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "limited":
      return "Limited";
    case "held":
      return "Held";
    case "full":
      return "Full";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export function getStatusTone(status: SlotStatus) {
  switch (status) {
    case "open":
      return "is-open";
    case "limited":
      return "is-limited";
    case "held":
      return "is-held";
    case "full":
      return "is-full";
    case "closed":
      return "is-closed";
    default:
      return "";
  }
}

export function sortBookingsForQueue(bookings: BookingRecord[]) {
  return [...bookings].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export function createInitialState(): AppState {
  const tomorrow = addDays(skipClosedDays(new Date()), 1);
  const dayAfterTomorrow = addDays(skipClosedDays(new Date()), 2);

  return {
    version: 1,
    settings: {
      calendarDays: 10,
      slotCapacity: 1,
      contactPhone: "(701) 833-4375",
      homeBase: "Minot, North Dakota",
      territory: "Serving Minot, western and central North Dakota jobs",
    },
    bookings: [],
    leads: [],
    scheduleOverrides: [
      {
        date: toIsoDate(tomorrow),
        updatedAt: new Date().toISOString(),
        slots: {
          midday: {
            status: "limited",
            note: "Crew overlap window. Call if timing is tight.",
          },
        },
      },
      {
        date: toIsoDate(dayAfterTomorrow),
        updatedAt: new Date().toISOString(),
        slots: {
          afternoon: {
            status: "full",
            note: "Afternoon already committed on the current schedule.",
          },
        },
      },
    ],
  };
}