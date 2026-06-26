import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import {
  artistsQuery,
  blockedDatesQuery,
  servicesQuery,
  workingHoursQuery,
} from "@/sanity/lib/contentQueries";
import { readDatabase } from "@/lib/database";

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getDayName(date: string) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(endA) > timeToMinutes(startB);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const branchId = searchParams.get("branchId") || "";
    const date = searchParams.get("date") || "";
    const serviceIds = (searchParams.get("serviceIds") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const artistIdRaw = searchParams.get("artistId") || "";
    const artistId = artistIdRaw === "any" ? "" : artistIdRaw;

    if (!branchId || !date || serviceIds.length === 0) {
      return NextResponse.json([]);
    }

    const [services, artists, workingHours, blockedDates, localDatabase] =
      await Promise.all([
        client.fetch<any[]>(servicesQuery),
        client.fetch<any[]>(artistsQuery),
        client.fetch<any[]>(workingHoursQuery),
        client.fetch<any[]>(blockedDatesQuery, { fromDate: date }),
        readDatabase(),
      ]);

    const selectedServices = services.filter((s) =>
      serviceIds.includes(s.id)
    );

    const duration =
      selectedServices.reduce(
        (sum, s) => sum + Number(s.durationMinutes || 0),
        0
      ) || 30;

    const branchHours = workingHours.find((w) => w.branchId === branchId);

    if (!branchHours) return NextResponse.json([]);

    const dayName = getDayName(date);

    const schedule =
      branchHours.schedule?.find((s: any) => s.dayOfWeek === dayName) ||
      branchHours.schedule?.find((s: any) => !s.isClosed);

    if (!schedule || schedule.isClosed) return NextResponse.json([]);

    const availableArtists = artistId
      ? artists.filter((a) => a.id === artistId && a.branches?.includes(branchId))
      : artists.filter((a) => a.branches?.includes(branchId));

    if (availableArtists.length === 0) {
      return NextResponse.json([]);
    }

    const fullDayBlocked = blockedDates.some((block) => {
      const appliesToBranch = !block.branchId || block.branchId === branchId;
      return appliesToBranch && block.date === date && block.isFullDay;
    });

    if (fullDayBlocked) return NextResponse.json([]);

    const partialBlocks = blockedDates.filter((block) => {
      const appliesToBranch = !block.branchId || block.branchId === branchId;
      return appliesToBranch && block.date === date && !block.isFullDay;
    });

    const open = timeToMinutes(schedule.openTime);
    const close = timeToMinutes(schedule.closeTime);
    const step = Number(branchHours.slotDurationMinutes || 30);

    const slots = [];

    for (let current = open; current + duration <= close; current += step) {
      const startTime = minutesToTime(current);
      const endTime = minutesToTime(current + duration);

      const blocked = partialBlocks.some((block) => {
        return block.blockedStartTime && block.blockedEndTime && overlaps(
          startTime,
          endTime,
          block.blockedStartTime,
          block.blockedEndTime,
        );
      });

      if (blocked) continue;

      const slotArtists = availableArtists.filter((artist) => {
        return !(localDatabase.bookings ?? []).some((b: any) => {
        if (["cancelled", "completed", "no-show"].includes(b.status)) {
          return false;
        }

        if (b.date !== date) return false;
        if (b.branch !== branchId) return false;
          if (b.artist !== artist.id) return false;

          return overlaps(startTime, endTime, b.startTime, b.endTime);
        });
      });

      if (slotArtists.length > 0) {
        slots.push({
          time: startTime,
          startTime,
          endTime,
          available: true,
          availableArtists: slotArtists.map((artist) => ({
            id: artist.id,
            name: artist.name,
          })),
        });
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json([]);
  }
}
