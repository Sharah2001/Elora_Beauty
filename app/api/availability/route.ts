import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

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

    const data = await client.fetch<{
      services: any[];
      artists: any[];
      workingHours: any[];
      bookings: any[];
    }>(
      `{
        "services": *[_type == "service" && isActive == true],
        "artists": *[_type == "artist" && isActive == true],
        "workingHours": *[_type == "workingHours"],
        "bookings": *[_type == "booking" && date == $date]
      }`,
      { date }
    );

    const selectedServices = data.services.filter((s) =>
      serviceIds.includes(s.id)
    );

    const duration =
      selectedServices.reduce(
        (sum, s) => sum + Number(s.durationMinutes || 0),
        0
      ) || 30;

    const branchHours =
      data.workingHours.find((w) => w.branchId === branchId) ||
      data.workingHours[0];

    if (!branchHours) return NextResponse.json([]);

    const dayName = getDayName(date);

    const schedule =
      branchHours.schedule?.find((s: any) => s.dayOfWeek === dayName) ||
      branchHours.schedule?.find((s: any) => !s.isClosed);

    if (!schedule || schedule.isClosed) return NextResponse.json([]);

    const availableArtists = artistId
      ? data.artists.filter((a) => a.id === artistId)
      : data.artists.filter((a) => a.branches?.includes(branchId));

    const open = timeToMinutes(schedule.openTime);
    const close = timeToMinutes(schedule.closeTime);
    const step = Number(branchHours.slotDurationMinutes || 30);

    const slots = [];

    for (let current = open; current + duration <= close; current += step) {
      const startTime = minutesToTime(current);
      const endTime = minutesToTime(current + duration);

      const hasConflict = data.bookings.some((b) => {
        if (["cancelled", "completed", "no-show"].includes(b.status)) {
          return false;
        }

        if (b.date !== date) return false;
        if (b.branch !== branchId) return false;
        if (artistId && b.artist !== artistId) return false;

        const bookingStart = timeToMinutes(b.startTime);
        const bookingEnd = timeToMinutes(b.endTime);

        return current < bookingEnd && current + duration > bookingStart;
      });

      if (!hasConflict) {
        slots.push({
          time: startTime,
          startTime,
          endTime,
          available: true,
          availableArtists,
        });
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json([]);
  }
}