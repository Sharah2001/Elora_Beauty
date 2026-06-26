"use client";

import { useEffect, useState } from "react";

type Branch = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  basePrice: number;
};

type Artist = {
  id: string;
  name: string;
  branches: string[];
};

type AvailableSlot = {
  time: string;
  startTime: string;
  endTime: string;
  available: boolean;
  availableArtists: Artist[];
};

interface BookingWizardProps {
  initialBranchId?: string;
  initialServiceIds?: string[];
  initialArtistId?: string;
}

export default function BookingWizard({
  initialBranchId = "",
  initialServiceIds = [],
  initialArtistId = "any",
}: BookingWizardProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedArtist, setSelectedArtist] = useState("any");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  const [error, setError] = useState("");
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const initialServiceKey = initialServiceIds.join("|");

  useEffect(() => {
    Promise.all([
      fetch("/api/branches").then((res) => res.json()),
      fetch("/api/services").then((res) => res.json()),
      fetch("/api/artists").then((res) => res.json()),
    ])
      .then(([branchesData, servicesData, artistsData]) => {
        setBranches(Array.isArray(branchesData) ? branchesData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
        setArtists(Array.isArray(artistsData) ? artistsData : []);
      })
      .catch((err) => {
        console.error("Initial data load error:", err);
        setError("Failed to load booking data.");
      });
  }, []);

  useEffect(() => {
    setSelectedBranch(initialBranchId);
    setSelectedServices(initialServiceKey ? initialServiceKey.split("|") : []);
    setSelectedArtist(initialArtistId || "any");
    setSelectedTimeSlot("");
    setSuccessBooking(null);
  }, [initialBranchId, initialArtistId, initialServiceKey]);

  useEffect(() => {
  if (!selectedBranch || selectedServices.length === 0 || !selectedDate) {
    setAvailableSlots([]);
    setSelectedTimeSlot("");
    return;
  }

  setIsSlotsLoading(true);
  setError("");

  const params = new URLSearchParams({
    branchId: selectedBranch,
    date: selectedDate,
    serviceIds: selectedServices.join(","),
    artistId: selectedArtist || "any",
  });

  fetch(`/api/availability?${params}`)
    .then(async (res) => {
      const text = await res.text();

      try {
        return JSON.parse(text);
      } catch {
        console.error("Availability API returned non-JSON:", text);
        return [];
      }
    })
    .then((data) => {
      const slots = Array.isArray(data) ? data : [];

      setAvailableSlots(slots);

      setSelectedTimeSlot((currentSlot) => {
        if (!currentSlot) return "";

        const stillExists = slots.some(
          (slot: any) =>
            slot.time === currentSlot || slot.startTime === currentSlot
        );

        return stillExists ? currentSlot : "";
      });

      setIsSlotsLoading(false);
    })
    .catch((err) => {
      console.error("Availability load error:", err);
      setAvailableSlots([]);
      setSelectedTimeSlot("");
      setIsSlotsLoading(false);
    });
}, [selectedBranch, selectedServices, selectedDate, selectedArtist]);
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );

    setSelectedTimeSlot("");
  };

  const filteredArtists = selectedBranch
    ? artists.filter((artist) => artist.branches?.includes(selectedBranch))
    : artists;

  const handleConfirmBooking = async () => {
    setError("");

    if (
      !selectedBranch ||
      selectedServices.length === 0 ||
      !selectedDate ||
      !selectedTimeSlot ||
      !clientName ||
      !clientPhone
    ) {
      setError("Please complete all required booking details.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  branchId: selectedBranch,
  artistId: selectedArtist,
  serviceIds: selectedServices,
  customerName: clientName,
  customerPhone: clientPhone,
  date: selectedDate,
  startTime: selectedTimeSlot,
  notes: clientNotes,
}),
      });

      const result = await response.json();

      if (response.status === 409) {
        setError("This slot is no longer available.");
        return;
      }

      if (!response.ok) {
        setError(result.error || "Failed to create booking.");
        return;
      }

      setSuccessBooking(result.booking);
    } catch (err) {
      console.error("Booking create error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-emerald-700">
          Booking Confirmed
        </h2>

        <div className="mt-6 space-y-3 text-gray-700">
          <p>
            <strong>Reference:</strong> {successBooking.bookingReference}
          </p>
          <p>
            <strong>PIN:</strong> {successBooking.pin}
          </p>
          <p>
            <strong>Date:</strong> {successBooking.date}
          </p>
          <p>
            <strong>Time:</strong> {successBooking.startTime} -{" "}
            {successBooking.endTime}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-[#E8DCC4] bg-white p-8 shadow-lg">
      <h2 className="text-3xl font-bold text-[#2B2118]">
        Reserve Elora Session
      </h2>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-8">
        <div>
          <label className="mb-2 block font-semibold">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedArtist("any");
              setSelectedTimeSlot("");
            }}
            className="w-full rounded-xl border p-3"
          >
            <option value="">Select branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Services</label>
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceToggle(service.id)}
                className={`rounded-xl border p-4 text-left ${
                  selectedServices.includes(service.id)
                    ? "border-[#C5A059] bg-[#FFF8E7]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm text-gray-500">
                  {service.durationMinutes} mins · LKR {service.basePrice}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Artist</label>
          <select
            value={selectedArtist}
            onChange={(e) => {
              setSelectedArtist(e.target.value);
              setSelectedTimeSlot("");
            }}
            className="w-full rounded-xl border p-3"
          >
            <option value="any">Any Available Artist</option>
            {filteredArtists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTimeSlot("");
            }}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Available Times</label>

          {isSlotsLoading && (
            <p className="text-sm text-gray-500">Loading available slots...</p>
          )}

          {!isSlotsLoading && availableSlots.length === 0 && (
            <p className="text-sm text-gray-500">
              No time slots available for the selected details.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {availableSlots.map((slot) => {
              const slotValue = slot.startTime || slot.time;

              return (
                <button
                  key={slotValue}
                  type="button"
                  onClick={() => setSelectedTimeSlot(slotValue)}
                  className={`rounded-xl border p-3 text-center ${
                    selectedTimeSlot === slotValue
                      ? "border-[#C5A059] bg-[#C5A059] text-white"
                      : "border-gray-200 bg-white hover:bg-[#FFF8E7]"
                  }`}
                >
                  {slotValue}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">Name</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="Customer name"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Phone</label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="+94..."
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Notes</label>
          <textarea
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="Optional notes"
            rows={3}
          />
        </div>

        <button
          type="button"
          onClick={handleConfirmBooking}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#C5A059] px-6 py-4 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Confirming..." : "Confirm Luxury Booking"}
        </button>
      </div>
    </section>
  );
}
