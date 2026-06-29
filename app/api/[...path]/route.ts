import { NextRequest, NextResponse } from "next/server";
import { mutateDatabase, readDatabase, type Database } from "@/lib/database";
import { client } from "@/sanity/lib/client";
import {
  approvedTestimonialsQuery,
  artistsQuery,
  beforeAfterQuery,
  blockedDatesQuery,
  branchesQuery,
  certificationsQuery,
  faqsQuery,
  galleryItemsQuery,
  offersQuery,
  packagesQuery,
  servicesQuery,
  siteSettingsQuery,
  workingHoursQuery,
} from "@/sanity/lib/contentQueries";
import { writeClient } from "@/sanity/lib/writeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

type AvailableSlot = {
  time: string;
  availableArtists: { id: string; name: string }[];
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 500) {
  return json({ error: message }, status);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB)
  );
}

function generateReference(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let reference = "BK-";

  for (let index = 0; index < 5; index += 1) {
    reference += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return reference;
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-()+]/g, "");
}

function sanityDocumentId(type: string, sourceId: string): string {
  const safeId = sourceId
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");

  return `${type}-${safeId}`;
}

function isAdmin(request: NextRequest): boolean {
  const cookieToken = request.cookies.get("admin_token")?.value;
  const authorization = request.headers.get("authorization") ?? "";
  return (
    cookieToken === "Elora_Secure_Staff_Session" ||
    authorization === "Bearer Elora_Secure_Staff_Session"
  );
}

function totalServiceDuration(
  database: Database,
  serviceIds: string[],
): number {
  const duration = serviceIds.reduce((total, serviceId) => {
    const service = database.services.find(
      (item: any) => item.id === serviceId,
    );
    return total + (service?.durationMinutes ?? 0);
  }, 0);

  return duration || 30;
}

function artistSupportsService(
  database: Database,
  artist: any,
  serviceId: string,
): boolean {
  if (artist.specialties.includes(serviceId)) {
    return true;
  }

  const service = database.services.find((item: any) => item.id === serviceId);
  const category = service?.category ?? "";
  const specialties = new Set<string>(artist.specialties);

  return (
    ((specialties.has("hair-cut") || specialties.has("hair-coloring")) &&
      category.startsWith("Hair")) ||
    (specialties.has("nail-gel") && category === "Nails") ||
    (specialties.has("pro-makeup") && category === "Makeup") ||
    (specialties.has("skin-glow") &&
      (category.startsWith("Skin") ||
        category === "Waxing" ||
        category === "Body & Spa"))
  );
}

function getAvailability(
  database: Database,
  {
    branchId,
    date,
    serviceIds,
    artistId = "any",
    excludeBookingId,
  }: {
    branchId: string;
    date: string;
    serviceIds: string[];
    artistId?: string;
    excludeBookingId?: string;
  },
): AvailableSlot[] {
  const duration = totalServiceDuration(database, serviceIds);
  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return [];
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = dayNames[parsedDate.getUTCDay()];
  const branchHours = database.workingHours.find(
    (hours: any) => hours.branchId === branchId,
  );
  const schedule = branchHours?.schedule.find(
    (item: any) => item.dayOfWeek === dayOfWeek,
  );

  if (!branchHours || !schedule || schedule.isClosed) {
    return [];
  }

  const fullDayBlocked = database.blockedDates.some((block: any) => {
    const appliesToBranch = !block.branchId || block.branchId === branchId;
    return appliesToBranch && block.date === date && block.isFullDay;
  });

  if (fullDayBlocked) {
    return [];
  }

  const partialBlocks = database.blockedDates.filter((block: any) => {
    const appliesToBranch = !block.branchId || block.branchId === branchId;
    return appliesToBranch && block.date === date && !block.isFullDay;
  });

  let artists = database.artists.filter((artist: any) => {
    const worksAtBranch = artist.branches.includes(branchId);
    const isQualified = serviceIds.every((serviceId) =>
      artistSupportsService(database, artist, serviceId),
    );
    return artist.isActive && worksAtBranch && isQualified;
  });

  if (artistId && artistId !== "any") {
    artists = artists.filter((artist: any) => artist.id === artistId);
  }

  if (artists.length === 0) {
    return [];
  }

  const dayBookings = (database.bookings ?? []).filter((booking: any) => {
    return (
      booking.id !== excludeBookingId &&
      booking.branch === branchId &&
      booking.date === date &&
      booking.status !== "cancelled" &&
      booking.status !== "no-show"
    );
  });

  const groupedSlots = new Map<string, { id: string; name: string }[]>();
  const openMinutes = timeToMinutes(schedule.openTime);
  const closeMinutes = timeToMinutes(schedule.closeTime);
  const step = branchHours.slotDurationMinutes || 30;

  for (
    let current = openMinutes;
    current + duration <= closeMinutes;
    current += step
  ) {
    const startTime = minutesToTime(current);
    const endTime = minutesToTime(current + duration);
    const blocked = partialBlocks.some(
      (block: any) =>
        block.blockedStartTime &&
        block.blockedEndTime &&
        overlaps(
          startTime,
          endTime,
          block.blockedStartTime,
          block.blockedEndTime,
        ),
    );

    if (blocked) {
      continue;
    }

    const availableArtists = artists
      .filter((artist: any) => {
        const hasConflict = dayBookings.some((booking: any) => {
          return (
            booking.artist === artist.id &&
            overlaps(startTime, endTime, booking.startTime, booking.endTime)
          );
        });

        return !hasConflict;
      })
      .map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      }));

    if (availableArtists.length > 0) {
      groupedSlots.set(startTime, availableArtists);
    }
  }

  return [...groupedSlots.entries()].map(([time, availableArtists]) => ({
    time,
    availableArtists,
  }));
}
async function getPath(context: RouteContext): Promise<string[]> {
  return (await context.params).path;
}

async function getBody(request: NextRequest): Promise<Record<string, any>> {
  try {
    return (await request.json()) as Record<string, any>;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const segments = await getPath(context);
    const route = segments.join("/");

    if (route === "branches") return json(await client.fetch(branchesQuery));
    if (route === "services") return json(await client.fetch(servicesQuery));
    if (route === "packages") return json(await client.fetch(packagesQuery));
    if (route === "offers") {
      const today = new Date().toISOString().slice(0, 10);
      return json(await client.fetch(offersQuery, { today }));
    }
    if (route === "artists") return json(await client.fetch(artistsQuery));
    if (route === "faqs") return json(await client.fetch(faqsQuery));
    if (route === "gallery") return json(await client.fetch(galleryItemsQuery));
    if (route === "before-after")
      return json(await client.fetch(beforeAfterQuery));
    if (route === "certifications")
      return json(await client.fetch(certificationsQuery));
    if (route === "testimonials") {
      return json(await client.fetch(approvedTestimonialsQuery));
    }
    if (route === "working-hours") {
      return json(await client.fetch(workingHoursQuery));
    }
    if (route === "blocked-dates") {
      const fromDate =
        request.nextUrl.searchParams.get("fromDate") ??
        new Date().toISOString().slice(0, 10);
      return json(await client.fetch(blockedDatesQuery, { fromDate }));
    }
    if (route === "site-settings") {
      return json(await client.fetch(siteSettingsQuery));
    }

    if (route === "availability") {
      const branchId = request.nextUrl.searchParams.get("branchId");
      const date = request.nextUrl.searchParams.get("date");
      const serviceIds = request.nextUrl.searchParams.get("serviceIds");
      const artistId = request.nextUrl.searchParams.get("artistId") ?? "any";

      if (!branchId || !date || !serviceIds) {
        return error(
          "Missing required parameters: branchId, date, serviceIds",
          400,
        );
      }

      const [
        branches,
        services,
        artists,
        workingHours,
        blockedDates,
        localDatabase,
      ] = await Promise.all([
        client.fetch(branchesQuery),
        client.fetch(servicesQuery),
        client.fetch(artistsQuery),
        client.fetch(workingHoursQuery),
        client.fetch(blockedDatesQuery, { fromDate: date }),
        readDatabase(),
      ]);
      const availabilityDatabase: Database = {
        branches,
        services,
        artists,
        workingHours,
        blockedDates,
        bookings: localDatabase.bookings ?? [],
      };

      return json(
        getAvailability(availabilityDatabase, {
          branchId,
          date,
          serviceIds: serviceIds.split(",").filter(Boolean),
          artistId,
        }),
      );
    }

    const database = await readDatabase();

    if (route === "admin/me") {
      return isAdmin(request)
        ? json({ authenticated: true })
        : json({ authenticated: false }, 401);
    }

    if (route.startsWith("admin/") && !isAdmin(request)) {
      return error("Unauthorized access", 401);
    }

    if (route === "admin/bookings") {
      const bookings = (database.bookings ?? [])
        .map((booking: any) => ({
          ...booking,
          servicesList: booking.services.map(
            (serviceId: string) =>
              database.services.find((service: any) => service.id === serviceId)
                ?.name ?? serviceId,
          ),
          branchName:
            database.branches.find(
              (branch: any) => branch.id === booking.branch,
            )?.name ?? booking.branch,
          artistName:
            database.artists.find((artist: any) => artist.id === booking.artist)
              ?.name ?? "Unassigned",
        }))
        .sort(
          (a: any, b: any) =>
            b.date.localeCompare(a.date) ||
            b.startTime.localeCompare(a.startTime),
        );
      return json(bookings);
    }

    if (route === "admin/contact-messages") {
      return json(database.contactMessages ?? []);
    }

    if (route === "admin/testimonials") {
      const testimonials = await writeClient.fetch(
        `*[_type == "testimonial"] | order(submittedAt desc, _createdAt desc) {
          "id": _id,
          customerName,
          rating,
          comment,
          "serviceReceived": serviceReceived->sourceId,
          "branch": branch->sourceId,
          isApproved,
          submittedAt
        }`,
      );

      return json(Array.isArray(testimonials) ? testimonials : []);
    }

    if (route === "admin/blocked-dates") {
      return json(database.blockedDates ?? []);
    }

    return error("API route not found", 404);
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const segments = await getPath(context);
    const route = segments.join("/");
    const body = await getBody(request);

    if (route === "sanity/gallery-cleanup") {
      const configuredSecret = process.env.SANITY_GALLERY_WEBHOOK_SECRET;
      const providedSecret = request.headers.get("x-gallery-cleanup-secret");

      if (!configuredSecret) {
        return error("Gallery cleanup webhook is not configured.", 503);
      }

      if (providedSecret !== configuredSecret) {
        return error("Unauthorized gallery cleanup request.", 401);
      }

      const galleryDocuments = await writeClient.fetch<
        { _id: string; assetId?: string }[]
      >(
        `*[_type == "galleryItem"] | order(_createdAt desc) {
          _id,
          "assetId": image.asset->_id
        }`,
      );
      const staleDocuments = galleryDocuments.slice(24);

      if (staleDocuments.length === 0) {
        return json({ success: true, deletedDocuments: 0, deletedAssets: 0 });
      }

      let transaction = writeClient.transaction();
      for (const document of staleDocuments) {
        transaction = transaction.delete(document._id);
      }
      await transaction.commit();

      let deletedAssets = 0;
      for (const assetId of new Set(
        staleDocuments.map((document) => document.assetId).filter(Boolean),
      )) {
        const referenceCount = await writeClient.fetch<number>(
          `count(*[references($assetId)])`,
          { assetId },
        );
        if (referenceCount === 0 && assetId) {
          await writeClient.delete(assetId);
          deletedAssets += 1;
        }
      }

      return json({
        success: true,
        deletedDocuments: staleDocuments.length,
        deletedAssets,
      });
    }

    if (route === "admin/auth") {
      const configuredPassword = process.env.ADMIN_PASSWORD_HASH ?? "admin123";

      if (body.password !== configuredPassword) {
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

    if (route === "testimonials") {
      const { customerName, rating, comment, serviceReceived, branch } = body;

      if (!customerName || !rating || !comment) {
        return error("Name, rating and comments are required.", 400);
      }

      const sourceId = `t_${Date.now()}`;
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return error("Rating must be between 1 and 5.", 400);
      }

      await writeClient.create({
        _id: sanityDocumentId("testimonial", sourceId),
        _type: "testimonial",
        sourceId,
        customerName,
        rating: numericRating,
        comment,
        serviceReceived: serviceReceived
          ? {
              _type: "reference",
              _ref: sanityDocumentId("service", String(serviceReceived)),
            }
          : undefined,
        branch: branch
          ? {
              _type: "reference",
              _ref: sanityDocumentId("branch", String(branch)),
            }
          : undefined,
        isApproved: false,
        submittedAt: new Date().toISOString(),
      });

      return json({
        success: true,
        message: "Thank you! Your review has been submitted for moderation.",
      });
    }

    if (route === "contact") {
      const { name, phone, email, message, branch } = body;

      if (!name || !phone || !message) {
        return error("Name, phone, and message are required.", 400);
      }

      await mutateDatabase((database) => {
        database.contactMessages = [
          ...(database.contactMessages ?? []),
          {
            id: `msg_${Date.now()}`,
            name,
            phone,
            email: email ?? "",
            message,
            branch: branch ?? "",
            status: "new",
            submittedAt: new Date().toISOString(),
          },
        ];
      });

      return json({
        success: true,
        message: "Message sent successfully! We will contact you soon.",
      });
    }

    if (route === "bookings") {
      const branchId = body.branchId || body.branch;
      const artistId = body.artistId || body.artist || "any";
      const rawServiceIds = body.serviceIds || body.services;
      const bookingSource = body.bookingSource || "online";
      const validSources = ["online", "manual", "virtual"];

      if (!validSources.includes(bookingSource)) {
        return error("Invalid booking source.", 400);

        const serviceIds = Array.isArray(rawServiceIds)
          ? rawServiceIds
          : String(rawServiceIds || "")
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean);

        const customerName = body.customerName || body.clientName;
        const customerPhone = body.customerPhone || body.clientPhone;
        const date = body.date;
        const startTime = body.startTime || body.selectedTimeSlot;
        const notes = body.notes || body.clientNotes || "";
        const validSources = ["online", "manual", "virtual"];

        if (!validSources.includes(bookingSource)) {
          return error("Invalid booking source.", 400);
        }

        if (
          !branchId ||
          serviceIds.length === 0 ||
          !customerName ||
          !customerPhone ||
          !date ||
          !startTime
        ) {
          console.log("Missing booking fields:", {
            branchId,
            artistId,
            serviceIds,
            customerName,
            customerPhone,
            date,
            startTime,
          });

          return error("Missing required fields for booking insertion.", 400);
        }

        const result = await mutateDatabase((database) => {
          const duration = totalServiceDuration(database, serviceIds);
          const endTime = minutesToTime(timeToMinutes(startTime) + duration);

          const availableSlots = getAvailability(database, {
            branchId,
            date,
            serviceIds,
            artistId,
          });

          const selectedSlot = availableSlots.find(
            (slot) => slot.time === startTime,
          );

          const assignedArtist =
            artistId && artistId !== "any"
              ? database.artists.find((artist: any) => artist.id === artistId)
              : selectedSlot?.availableArtists?.[0];

          if (!assignedArtist) {
            return {
              failure: "This slot is no longer available.",
              status: 409,
            };
          }

          const hasConflict = (database.bookings ?? []).some((booking: any) => {
            if (
              booking.status === "cancelled" ||
              booking.status === "completed" ||
              booking.status === "no-show"
            ) {
              return false;
            }

            return (
              booking.branch === branchId &&
              booking.artist === assignedArtist.id &&
              booking.date === date &&
              overlaps(startTime, endTime, booking.startTime, booking.endTime)
            );
          });

          if (hasConflict) {
            return {
              failure: "This slot is no longer available.",
              status: 409,
            };
          }

          const bookingReference = generateReference();
          const pin = generatePin();
          const timestamp = new Date().toISOString();

          const newBooking = {
            id: `bk_${Date.now()}`,
            branch: branchId,
            artist: assignedArtist.id,
            services: serviceIds,
            customerName,
            customerPhone,
            date,
            startTime,
            endTime,
            status: "confirmed",
            bookingSource, //online /manual / virtual
            bookingReference,
            pin,
            notes,
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          writeClient.create({
            _type: "booking",
            ...newBooking,
          });
          return {
            booking: {
              ...newBooking,
              artistName: assignedArtist.name,
              branchName:
                database.branches.find((branch: any) => branch.id === branchId)
                  ?.name ?? "Elora Beauty Branch",
            },
          };
        });

        if ("failure" in result && result.failure) {
          return error(
            result.failure ?? "Booking failed",
            result.status ?? 500,
          );
        }

        return json({ success: true, booking: result.booking });
      }
    }

    if (route === "bookings/lookup") {
      if (!body.phone) {
        return error("Phone number is required.", 400);
      }

      const database = await readDatabase();
      const inputPhone = cleanPhone(body.phone);
      const bookings = (database.bookings ?? [])
        .filter((booking: any) => {
          const bookingPhone = cleanPhone(booking.customerPhone);
          return (
            bookingPhone.includes(inputPhone) ||
            inputPhone.includes(bookingPhone)
          );
        })
        .map((booking: any) => ({
          bookingReference: booking.bookingReference,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          services: booking.services.map(
            (serviceId: string) =>
              database.services.find((service: any) => service.id === serviceId)
                ?.name ?? serviceId,
          ),
          branchName:
            database.branches.find(
              (branch: any) => branch.id === booking.branch,
            )?.name ?? booking.branch,
          artistName:
            database.artists.find((artist: any) => artist.id === booking.artist)
              ?.name ?? "Salon Expert",
        }))
        .sort((a: any, b: any) => a.date.localeCompare(b.date));

      return json(bookings);
    }

    if (route === "bookings/verify-pin") {
      const { reference, pin } = body;

      if (!reference || !pin) {
        return error("Reference code and 4-digit PIN are required.", 400);
      }

      const database = await readDatabase();
      const booking = (database.bookings ?? []).find(
        (item: any) =>
          item.bookingReference.toLowerCase() ===
          String(reference).trim().toLowerCase(),
      );

      if (!booking) return error("Booking record not found.", 404);
      if (booking.pin !== String(pin).trim()) {
        return error("Incorrect 4-digit security PIN.", 401);
      }

      return json({
        authorized: true,
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          date: booking.date,
          startTime: booking.startTime,
          services: booking.services,
          branch: booking.branch,
          artist: booking.artist,
          status: booking.status,
        },
      });
    }

    if (route === "bookings/update") {
      const { reference, pin, action, newDate, newStartTime } = body;

      if (!reference || !pin) {
        return error("Reference code and PIN are required.", 400);
      }

      const result = await mutateDatabase((database) => {
        const bookingIndex = (database.bookings ?? []).findIndex(
          (item: any) =>
            item.bookingReference.toLowerCase() ===
            String(reference).trim().toLowerCase(),
        );

        if (bookingIndex === -1) {
          return { failure: "Booking reference not found.", status: 404 };
        }

        const booking = database.bookings[bookingIndex];
        if (booking.pin !== String(pin).trim()) {
          return { failure: "Security PIN check failed.", status: 401 };
        }

        if (action === "cancel") {
          booking.status = "cancelled";
          booking.updatedAt = new Date().toISOString();
          return { message: "Your luxury appointment is cancelled." };
        }

        if (action !== "reschedule" || !newDate || !newStartTime) {
          return {
            failure: "New date and start time are required.",
            status: 400,
          };
        }

        const slot = getAvailability(database, {
          branchId: booking.branch,
          date: newDate,
          serviceIds: booking.services,
          artistId: "any",
          excludeBookingId: booking.id,
        }).find((item) => item.time === newStartTime);

        if (!slot) {
          return {
            failure: "The requested time slot is busy.",
            status: 409,
          };
        }

        const preferredArtist =
          slot.availableArtists.find(
            (artist) => artist.id === booking.artist,
          ) ?? slot.availableArtists[0];
        const duration = totalServiceDuration(database, booking.services);

        booking.date = newDate;
        booking.startTime = newStartTime;
        booking.endTime = minutesToTime(timeToMinutes(newStartTime) + duration);
        booking.artist = preferredArtist.id;
        booking.status = "confirmed";
        booking.updatedAt = new Date().toISOString();

        return {
          message: "Rescheduled successfully!",
          booking: {
            date: newDate,
            startTime: newStartTime,
            artistName: preferredArtist.name,
          },
        };
      });

      if ("failure" in result) {
        return error(
          result.failure ?? "Booking could not be updated.",
          result.status ?? 500,
        );
      }

      return json({ success: true, ...result });
    }

    if (route.startsWith("admin/") && !isAdmin(request)) {
      return error("Unauthorized staff route.", 401);
    }

    if (route === "admin/bookings") {
      const {
        branchId,
        artistId,
        serviceIds,
        customerName,
        customerPhone,
        date,
        startTime,
        notes,
        status,
      } = body;

      if (
        !branchId ||
        !serviceIds ||
        !customerName ||
        !customerPhone ||
        !date ||
        !startTime
      ) {
        return error("Missing required walk-in parameters.", 400);
      }

      const services = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
      const booking = await mutateDatabase((database) => {
        const timestamp = new Date().toISOString();
        const newBooking = {
          id: `bk_${Date.now()}`,
          branch: branchId,
          artist: artistId ?? "",
          services,
          customerName,
          customerPhone,
          date,
          startTime,
          endTime: minutesToTime(
            timeToMinutes(startTime) + totalServiceDuration(database, services),
          ),
          status: status ?? "confirmed",
          bookingSource: "manual",
          bookingReference: generateReference(),
          pin: generatePin(),
          notes: notes ?? "Staff walk-in booking",
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        database.bookings = [...(database.bookings ?? []), newBooking];
        return newBooking;
      });

      return json({ success: true, booking });

      if (route === "admin/blocked-dates") {
        if (!body.date) return error("Date is required.", 400);

        const block = await mutateDatabase((database) => {
          const newBlock = {
            id: `b_${Date.now()}`,
            branchId: body.branchId ?? "",
            date: body.date,
            reason: body.reason ?? "Custom blocked date",
            isFullDay: body.isFullDay ?? true,
            blockedStartTime: body.blockedStartTime,
            blockedEndTime: body.blockedEndTime,
          };
          database.blockedDates = [...(database.blockedDates ?? []), newBlock];
          return newBlock;
        });

        return json({ success: true, block });
      }
    }

    return error("API route not found", 404);
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!isAdmin(request)) return error("Unauthorized", 401);

    const segments = await getPath(context);
    const route = segments.slice(0, -1).join("/");
    const id = segments.at(-1);
    const body = await getBody(request);

    if (!id) return error("Missing record id.", 400);

    if (route === "admin/bookings") {
      const updated = await mutateDatabase((database) => {
        const booking = (database.bookings ?? []).find(
          (item: any) => item.id === id,
        );
        if (!booking) return null;

        if (body.status) booking.status = body.status;
        if (body.notes !== undefined) booking.notes = body.notes;
        if (body.artist) booking.artist = body.artist;
        booking.updatedAt = new Date().toISOString();
        return booking;
      });

      return updated
        ? json({ success: true, booking: updated })
        : error("Booking not found.", 404);
    }

    if (route === "admin/contact-messages") {
      const updated = await mutateDatabase((database) => {
        const message = (database.contactMessages ?? []).find(
          (item: any) => item.id === id,
        );
        if (!message) return false;
        message.status = body.status;
        return true;
      });
      return updated
        ? json({ success: true })
        : error("Message not found.", 404);
    }

    if (route === "admin/testimonials") {
      const updated = await writeClient
        .patch(id)
        .set({ isApproved: Boolean(body.isApproved) })
        .commit();

      return updated
        ? json({ success: true })
        : error("Review not found.", 404);
    }

    return error("API route not found", 404);
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (!isAdmin(request)) return error("Unauthorized", 401);

    const segments = await getPath(context);
    const route = segments.slice(0, -1).join("/");
    const id = segments.at(-1);

    if (route !== "admin/blocked-dates" || !id) {
      return error("API route not found", 404);
    }

    await mutateDatabase((database) => {
      database.blockedDates = (database.blockedDates ?? []).filter(
        (block: any) => block.id !== id,
      );
    });

    return json({ success: true });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Unknown error");
  }
}
