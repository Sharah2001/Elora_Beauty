import type {
  Artist,
  BlockedDate,
  Booking,
  Service,
  TimeSlot,
  WorkingHours,
} from "../src/types";

const ACTIVE_STATUSES = ["pending", "confirmed"];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDayName(date: string): string {
  const day = new Date(`${date}T00:00:00`).getDay();
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  slotDurationMinutes: number,
  serviceDurationMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  for (
    let current = openMinutes;
    current + serviceDurationMinutes <= closeMinutes;
    current += slotDurationMinutes
  ) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + serviceDurationMinutes),
      available: true,
    });
  }

  return slots;
}

export function filterSlotsByBranch(slots: TimeSlot[], branchId: string): TimeSlot[] {
  return slots.map((slot) => ({
    ...slot,
    branchId,
  }));
}

export function filterSlotsByArtist(slots: TimeSlot[], artistId?: string): TimeSlot[] {
  if (!artistId || artistId === "any") return slots;

  return slots.map((slot) => ({
    ...slot,
    artistId,
  }));
}

export function checkBookingConflict(
  slotStartTime: string,
  slotEndTime: string,
  booking: Booking
): boolean {
  if (!ACTIVE_STATUSES.includes(booking.status)) return false;

  const slotStart = timeToMinutes(slotStartTime);
  const slotEnd = timeToMinutes(slotEndTime);
  const bookingStart = timeToMinutes(booking.startTime);
  const bookingEnd = timeToMinutes(booking.endTime);

  return slotStart < bookingEnd && slotEnd > bookingStart;
}

function isBlockedSlot(
  date: string,
  branchId: string,
  startTime: string,
  endTime: string,
  blockedDates: BlockedDate[]
): boolean {
  return blockedDates.some((blocked) => {
    const sameDate = blocked.date === date;
    const sameBranch = !blocked.branchId || blocked.branchId === branchId;

    if (!sameDate || !sameBranch) return false;
    if (blocked.isFullDay) return true;

    if (!blocked.blockedStartTime || !blocked.blockedEndTime) return false;

    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);
    const blockedStart = timeToMinutes(blocked.blockedStartTime);
    const blockedEnd = timeToMinutes(blocked.blockedEndTime);

    return slotStart < blockedEnd && slotEnd > blockedStart;
  });
}

export function getAvailableSlots(params: {
  date: string;
  branchId: string;
  artistId?: string;
  selectedServiceIds: string[];
  services: Service[];
  artists: Artist[];
  workingHours: WorkingHours[];
  blockedDates: BlockedDate[];
  bookings: Booking[];
}): TimeSlot[] {
  const {
    date,
    branchId,
    artistId,
    selectedServiceIds,
    services,
    workingHours,
    blockedDates,
    bookings,
  } = params;

  const selectedServices = services.filter((service) =>
    selectedServiceIds.includes(service.id)
  );

  const totalDuration = selectedServices.reduce(
    (sum, service) => sum + service.durationMinutes,
    0
  );

  if (!date || !branchId || totalDuration <= 0) return [];

  const branchWorkingHours = workingHours.find(
    (item) => item.branchId === branchId
  );

  if (!branchWorkingHours) return [];

  const dayName = getDayName(date);

  const daySchedule = branchWorkingHours.schedule.find(
    (day) => day.dayOfWeek === dayName
  );

  if (!daySchedule || daySchedule.isClosed) return [];

  const baseSlots = generateTimeSlots(
    daySchedule.openTime,
    daySchedule.closeTime,
    branchWorkingHours.slotDurationMinutes,
    totalDuration
  );

  return baseSlots.map((slot) => {
    const blocked = isBlockedSlot(
      date,
      branchId,
      slot.startTime,
      slot.endTime,
      blockedDates
    );

    const conflict = bookings.some((booking) => {
      const sameDate = booking.date === date;
      const sameBranch = booking.branch === branchId;

      const sameArtist =
        !artistId || artistId === "any"
          ? true
          : booking.artist === artistId;

      return (
        sameDate &&
        sameBranch &&
        sameArtist &&
        checkBookingConflict(slot.startTime, slot.endTime, booking)
      );
    });

    return {
      ...slot,
      branchId,
      artistId: artistId === "any" ? undefined : artistId,
      available: !blocked && !conflict,
    };
  });
}