import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 500) {
  return json({ error: message }, status);
}

async function getPath(context: RouteContext) {
  return (await context.params).path.join("/");
}

async function getBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function isAdmin(request: NextRequest) {
  const cookieToken = request.cookies.get("admin_token")?.value;
  const authorization = request.headers.get("authorization") ?? "";

  return (
    cookieToken === "Elora_Secure_Staff_Session" ||
    authorization === "Bearer Elora_Secure_Staff_Session"
  );
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB)
  );
}

function generateReference() {
  return `BK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function cleanPhone(phone: string) {
  return phone.replace(/[\s\-()+]/g, "");
}

async function getServicesDuration(serviceIds: string[]) {
  const services = await client.fetch<any[]>(
    `*[_type == "service" && id in $serviceIds]{id,durationMinutes}`,
    { serviceIds },
  );

  return (
    services.reduce(
      (sum, service) => sum + Number(service.durationMinutes || 0),
      0,
    ) || 30
  );
}

async function checkConflict({
  branchId,
  artistId,
  date,
  startTime,
  endTime,
  excludeBookingId,
}: {
  branchId: string;
  artistId: string;
  date: string;
  startTime: string;
  endTime: string;
  excludeBookingId?: string;
}) {
  const bookings = await client.fetch<any[]>(
    `*[
      _type == "booking" &&
      branch == $branchId &&
      artist == $artistId &&
      date == $date &&
      !(status in ["cancelled", "completed", "no-show"])
    ]{id,startTime,endTime}`,
    { branchId, artistId, date },
  );

  return bookings.some((booking) => {
    if (excludeBookingId && booking.id === excludeBookingId) return false;
    return overlaps(startTime, endTime, booking.startTime, booking.endTime);
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const route = await getPath(context);

    if (route === "branches") {
      return json(
        await client.fetch(`*[_type == "branch"] | order(displayOrder asc)`),
      );
    }

    if (route === "services") {
      return json(
        await client.fetch(`*[_type == "service"] | order(name asc)`),
      );
    }

    if (route === "artists") {
      return json(
        await client.fetch(`*[_type == "artist"] | order(displayOrder asc)`),
      );
    }

    if (route === "packages") {
      return json(await client.fetch(`*[_type == "package"]`));
    }

    if (route === "offers") {
      return json(await client.fetch(`*[_type == "offer"]`));
    }

    if (route === "faqs") {
      return json(
        await client.fetch(`*[_type == "faq"] | order(displayOrder asc)`),
      );
    }

    if (route === "testimonials") {
      return json(
        await client.fetch(`*[_type == "testimonial" && isApproved == true]`),
      );
    }

    if (route === "admin/me") {
      return isAdmin(request)
        ? json({ authenticated: true })
        : json({ authenticated: false }, 401);
    }

    if (route.startsWith("admin/") && !isAdmin(request)) {
      return error("Unauthorized access", 401);
    }

    if (route === "admin/bookings") {
      return json(
        await client.fetch(
          `*[_type == "booking"] | order(date desc, startTime asc)`,
        ),
      );
    }

    if (route === "admin/contact-messages") {
      return json(
        await client.fetch(
          `*[_type == "contactMessage"] | order(submittedAt desc)`,
        ),
      );
    }

    if (route === "admin/testimonials") {
      return json(
        await client.fetch(
          `*[_type == "testimonial"] | order(submittedAt desc)`,
        ),
      );
    }

    if (route === "admin/blocked-dates") {
      return json(
        await client.fetch(`*[_type == "blockedDate"] | order(date desc)`),
      );
    }

    return error("API route not found", 404);
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const route = await getPath(context);
    const body = await getBody(request);

    if (route === "admin/auth") {
      const password = process.env.ADMIN_PASSWORD_HASH ?? "admin123";

      if (body.password !== password) {
        return error("Invalid administrative pass code.", 401);
      }

      const response = json({ token: "Elora_Secure_Staff_Session" });
      response.cookies.set("admin_token", "Elora_Secure_Staff_Session", {
        httpOnly: true,
        maxAge: 86400,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    if (route === "admin/logout") {
      const response = json({ success: true });
      response.cookies.set("admin_token", "", {
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    if (route === "contact") {
      const { name, phone, email, message, branch } = body;

      if (!name || !phone || !message) {
        return error("Name, phone, and message are required.", 400);
      }

      const contact = await writeClient.create({
        _type: "contactMessage",
        id: `msg_${Date.now()}`,
        name,
        phone,
        email: email ?? "",
        message,
        branch: branch ?? "",
        status: "new",
        submittedAt: new Date().toISOString(),
      });

      return json({ success: true, contact });
    }

    if (route === "testimonials") {
      const { customerName, rating, comment, serviceReceived, branch } = body;

      if (!customerName || !rating || !comment) {
        return error("Name, rating and comments are required.", 400);
      }

      const testimonial = await writeClient.create({
        _type: "testimonial",
        id: `t_${Date.now()}`,
        customerName,
        rating: Number(rating),
        comment,
        serviceReceived: serviceReceived ?? "",
        branch: branch ?? "",
        isApproved: false,
        submittedAt: new Date().toISOString(),
      });

      return json({ success: true, testimonial });
    }

    if (route === "bookings" || route === "admin/bookings") {
      const branchId = body.branchId || body.branch;
      const artistId = body.artistId || body.artist || "";
      const rawServiceIds = body.serviceIds || body.services;
      const serviceIds = Array.isArray(rawServiceIds)
        ? rawServiceIds
        : [rawServiceIds].filter(Boolean);

      const customerName = body.customerName;
      const customerPhone = body.customerPhone;
      const date = body.date;
      const startTime = body.startTime;
      const notes = body.notes ?? "";
      const bookingSource =
        body.bookingSource ||
        (route === "admin/bookings" ? "manual" : "online");

      if (
        !branchId ||
        !customerName ||
        !customerPhone ||
        !date ||
        !startTime ||
        serviceIds.length === 0
      ) {
        return error("Missing required booking details.", 400);
      }

      if (!["online", "manual", "virtual"].includes(bookingSource)) {
        return error("Invalid booking source.", 400);
      }

      const duration = await getServicesDuration(serviceIds);
      const endTime = minutesToTime(timeToMinutes(startTime) + duration);

      const selectedArtist =
        artistId ||
        (
          await client.fetch<any[]>(
            `*[_type == "artist" && $branchId in branches && isActive == true][0]{id,name}`,
            { branchId },
          )
        )?.id;

      if (!selectedArtist) {
        return error("No artist available for this booking.", 409);
      }

      const hasConflict = await checkConflict({
        branchId,
        artistId: selectedArtist,
        date,
        startTime,
        endTime,
      });

      if (hasConflict) {
        return error("This slot is no longer available.", 409);
      }

      const now = new Date().toISOString();

      const newBooking = {
        _type: "booking",
        id: `bk_${Date.now()}`,
        branch: branchId,
        artist: selectedArtist,
        services: serviceIds,
        customerName,
        customerPhone,
        date,
        startTime,
        endTime,
        status: body.status ?? "confirmed",
        bookingSource,
        bookingReference: generateReference(),
        pin: generatePin(),
        notes,
        createdAt: now,
        updatedAt: now,
      };

      const booking = await writeClient.create(newBooking);

      return json({ success: true, booking });
    }

    if (route === "bookings/lookup") {
      if (!body.phone) return error("Phone number is required.", 400);

      const inputPhone = cleanPhone(body.phone);

      const bookings = await client.fetch<any[]>(
        `*[_type == "booking"] | order(date desc, startTime asc)`,
      );

      return json(
        bookings.filter((booking) => {
          const bookingPhone = cleanPhone(booking.customerPhone || "");
          return (
            bookingPhone.includes(inputPhone) ||
            inputPhone.includes(bookingPhone)
          );
        }),
      );
    }

    if (route === "bookings/verify-pin") {
      const { reference, pin } = body;

      if (!reference || !pin) {
        return error("Reference code and PIN are required.", 400);
      }

      const booking = await client.fetch<any>(
        `*[_type == "booking" && bookingReference == $reference][0]`,
        { reference },
      );

      if (!booking) return error("Booking record not found.", 404);
      if (booking.pin !== String(pin).trim()) {
        return error("Incorrect security PIN.", 401);
      }

      return json({ authorized: true, booking });
    }

    if (route === "bookings/update") {
      const { reference, pin, action, newDate, newStartTime } = body;

      const booking = await client.fetch<any>(
        `*[_type == "booking" && bookingReference == $reference][0]`,
        { reference },
      );

      if (!booking) return error("Booking reference not found.", 404);
      if (booking.pin !== String(pin).trim())
        return error("Security PIN check failed.", 401);

      if (action === "cancel") {
        const updated = await writeClient
          .patch(booking._id)
          .set({
            status: "cancelled",
            updatedAt: new Date().toISOString(),
          })
          .commit();

        return json({ success: true, booking: updated });
      }

      if (action === "reschedule") {
        if (!newDate || !newStartTime) {
          return error("New date and time are required.", 400);
        }

        const duration = await getServicesDuration(booking.services);
        const endTime = minutesToTime(timeToMinutes(newStartTime) + duration);

        const hasConflict = await checkConflict({
          branchId: booking.branch,
          artistId: booking.artist,
          date: newDate,
          startTime: newStartTime,
          endTime,
          excludeBookingId: booking.id,
        });

        if (hasConflict) return error("The requested time slot is busy.", 409);

        const updated = await writeClient
          .patch(booking._id)
          .set({
            date: newDate,
            startTime: newStartTime,
            endTime,
            status: "confirmed",
            updatedAt: new Date().toISOString(),
          })
          .commit();

        return json({ success: true, booking: updated });
      }

      return error("Invalid booking action.", 400);
    }

    if (route.startsWith("admin/") && !isAdmin(request)) {
      return error("Unauthorized staff route.", 401);
    }

    if (route === "admin/blocked-dates") {
      if (!body.date) return error("Date is required.", 400);

      const block = await writeClient.create({
        _type: "blockedDate",
        id: `b_${Date.now()}`,
        branchId: body.branchId ?? "",
        date: body.date,
        reason: body.reason ?? "Custom blocked date",
        isFullDay: body.isFullDay ?? true,
        blockedStartTime: body.blockedStartTime,
        blockedEndTime: body.blockedEndTime,
      });

      return json({ success: true, block });
    }

    return error("API route not found", 404);
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!isAdmin(request)) return error("Unauthorized", 401);

    const segments = (await context.params).path;
    const route = segments.slice(0, -1).join("/");
    const id = segments[segments.length - 1];
    const body = await getBody(request);

    if (!id) return error("Missing record id.", 400);

    if (route === "admin/bookings") {
      const updated = await writeClient
        .patch(id)
        .set({
          ...(body.status ? { status: body.status } : {}),
          ...(body.notes !== undefined ? { notes: body.notes } : {}),
          ...(body.artist ? { artist: body.artist } : {}),
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return json({ success: true, booking: updated });
    }

    if (route === "admin/contact-messages") {
      const updated = await writeClient
        .patch(id)
        .set({ status: body.status })
        .commit();

      return json({ success: true, message: updated });
    }

    if (route === "admin/testimonials") {
      const updated = await writeClient
        .patch(id)
        .set({ isApproved: Boolean(body.isApproved) })
        .commit();

      return json({ success: true, testimonial: updated });
    }

    return error("API route not found", 404);
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (!isAdmin(request)) return error("Unauthorized", 401);

    const segments = (await context.params).path;
    const route = segments.slice(0, -1).join("/");
    const id = segments[segments.length - 1];

    if (route !== "admin/blocked-dates" || !id) {
      return error("API route not found", 404);
    }

    await writeClient.delete(id);

    return json({ success: true });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}
