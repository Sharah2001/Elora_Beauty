import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function overlaps(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string
) {
  return (
    timeToMinutes(newStart) < timeToMinutes(existingEnd) &&
    timeToMinutes(newEnd) > timeToMinutes(existingStart)
  );
}

function generateBookingReference() {
  return `BK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const branch = body.branch || body.branchId;
    const artistRaw = body.artist || body.artistId || "";
    const artist = artistRaw === "any" ? "" : artistRaw;

    const services = body.services || body.serviceIds || [];
    const customerName = body.customerName || body.clientName;
    const customerPhone = body.customerPhone || body.clientPhone;
    const date = body.date;
    const startTime = body.startTime || body.selectedTimeSlot;
    const bookingSource = body.bookingSource || "online";
    const notes = body.notes || body.clientNotes || "";

    if (
      !branch ||
      !Array.isArray(services) ||
      services.length === 0 ||
      !customerName ||
      !customerPhone ||
      !date ||
      !startTime
    ) {
      console.log("Missing booking fields:", {
        branch,
        artist,
        services,
        customerName,
        customerPhone,
        date,
        startTime,
      });

      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const selectedServices = await client.fetch<any[]>(
      `*[_type == "service" && id in $services]{
        id,
        name,
        durationMinutes
      }`,
      { services }
    );

    const totalDuration =
      selectedServices.reduce(
        (sum, service) => sum + Number(service.durationMinutes || 0),
        0
      ) || 30;

    const endTime = minutesToTime(timeToMinutes(startTime) + totalDuration);

    const existingBookings = await client.fetch<any[]>(
      `*[
        _type == "booking" &&
        branch == $branch &&
        date == $date
      ]{
        branch,
        artist,
        date,
        startTime,
        endTime,
        status
      }`,
      { branch, date }
    );

    const conflictingBooking = existingBookings.some((booking) => {
      if (["cancelled", "completed", "no-show"].includes(booking.status)) {
        return false;
      }

      if (!artist) {
        return false;
      }

      return (
        booking.artist === artist &&
        overlaps(startTime, endTime, booking.startTime, booking.endTime)
      );
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "This slot is no longer available." },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const booking = await writeClient.create({
      _type: "booking",
      id: `booking-${Date.now()}`,
      branch,
      artist,
      services,
      customerName,
      customerPhone,
      date,
      startTime,
      endTime,
      status: "confirmed",
      bookingSource,
      bookingReference: generateBookingReference(),
      pin: generatePin(),
      notes,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Booking create error:", error);

    return NextResponse.json(
      { error: "Failed to create booking." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await client.fetch(
      `*[_type == "booking"] | order(date desc, startTime asc)`
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json([]);
  }
}