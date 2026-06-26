import React, { useState, useEffect } from "react";
import { 
  Phone, Eye, Key, Calendar, RefreshCw, XCircle, CheckCircle, 
  Search, ShieldAlert, Sparkles, Clock, MapPin, User, AlertCircle 
} from "lucide-react";
import { Service, Artist, Branch } from "../types";

export default function ManageBookings() {
  const [phone, setPhone] = useState("");
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [lookups, setLookups] = useState<any[]>([]);
  const [lookupError, setLookupError] = useState("");

  // PIN authentication state
  const [selectedBookingRef, setSelectedBookingRef] = useState("");
  const [pin, setPin] = useState("");
  const [authedBooking, setAuthedBooking] = useState<any | null>(null);
  const [authError, setAuthError] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  // Operations: "view" | "reschedule" | "cancelled_success" | "rescheduled_success"
  const [mode, setMode] = useState<"view" | "reschedule" | "cancelled_success" | "rescheduled_success">("view");

  // Rescheduling states
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; availableArtists: any[] }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState("");

  // Base list
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  // Fetch bookings by phone number search lookup
  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoadingLookups(true);
    setLookupError("");
    setLookups([]);
    setAuthedBooking(null);
    setMode("view");

    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Error looking up your appointments.");
      } else {
        setLookups(data);
        if (data.length === 0) {
          setLookupError("No booking records matching this mobile number found in Colombo databases.");
        }
      }
    } catch (err) {
      setLookupError("Database query failed. Please verify connectivity.");
    } finally {
      setLoadingLookups(false);
    }
  };

  // Authenticate selective reference using PIN code
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingRef || !pin.trim()) return;

    setAuthenticating(true);
    setAuthError("");

    try {
      const res = await fetch("/api/bookings/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: selectedBookingRef, pin })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Incorrect security PIN.");
      } else {
        setAuthedBooking(data.booking);
        // Pre-fill tomorrow as new date for rescheduled input
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        setNewDate(tmr.toISOString().split("T")[0]);
      }
    } catch (err) {
      setAuthError("Failed to authenticate security PIN.");
    } finally {
      setAuthenticating(false);
    }
  };

  // Load available times slots when reschedule date is specified by authenticated guest
  useEffect(() => {
    if (authedBooking && newDate) {
      setSlotsLoading(true);
      setActionError("");
      const params = new URLSearchParams({
        branchId: authedBooking.branch,
        date: newDate,
        serviceIds: authedBooking.services.join(","),
        artistId: "any" // look up any available qualified expert
      });

      fetch(`/api/availability?${params}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableSlots(data);
          setSlotsLoading(false);
        })
        .catch((err) => {
          console.error("Reschedule slots loading failure", err);
          setSlotsLoading(false);
        });
    }
  }, [authedBooking, newDate]);

  // Execute cancel action
 const handleCancelBooking = async () => {
  if (!authedBooking) {
    setActionError("Please verify a booking before cancelling.");
    return;
  }

  if (
    !window.confirm(
      "Are you absolutely sure you wish to cancel this beauty appointment? This cannot be undone."
    )
  ) {
    return;
  }

  setSubmittingAction(true);
  setActionError("");

  try {
    const bookingReference = authedBooking.bookingReference;

    const res = await fetch("/api/bookings/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: bookingReference,
        pin,
        action: "cancel",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setActionError(data.error || "Failed to cancel.");
      return;
    }

    setAuthedBooking((prev: any | null) =>
      prev ? { ...prev, status: "cancelled" } : prev
    );

    setLookups((prev) =>
      prev.map((bk) =>
        bk.bookingReference === bookingReference
          ? { ...bk, status: "cancelled" }
          : bk
      )
    );

    setMode("cancelled_success");
  } catch (err) {
    setActionError("Internal cancellation error. Try again.");
  } finally {
    setSubmittingAction(false);
  }
};

  // Execute reschedule action
  const handleRescheduleBooking = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!authedBooking) {
    setActionError("Please verify a booking before rescheduling.");
    return;
  }

  if (!newDate || !newTime) {
    setActionError("Please select a new date and time slot.");
    return;
  }

  setSubmittingAction(true);
  setActionError("");

  try {
    const bookingReference = authedBooking.bookingReference;

    const res = await fetch("/api/bookings/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: bookingReference,
        pin,
        action: "reschedule",
        newDate,
        newStartTime: newTime,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setActionError(
        data.error ||
        "The selected slot is busy. Please pick another."
      );
      return;
    }

    setAuthedBooking((prev: any | null) =>
      prev
        ? {
            ...prev,
            date: newDate,
            startTime: newTime,
            status: "confirmed",
          }
        : prev
    );

    setLookups((prev) =>
      prev.map((bk) =>
        bk.bookingReference === bookingReference
          ? {
              ...bk,
              date: newDate,
              startTime: newTime,
              status: "confirmed",
            }
          : bk
      )
    );

    setMode("rescheduled_success");
  } catch (err) {
    setActionError("Error updating reservation. Please re-try.");
  } finally {
    setSubmittingAction(false);
  }
};
  return (
    <div className="max-w-2xl mx-auto py-4 space-y-10 animate-fadeIn">
      
      <div className="text-center max-w-lg mx-auto space-y-1">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900">Manage My Booking</h2>
        <p className="text-stone-500 text-sm font-light">Lookup, reschedule, or cancel your upcoming beauty slots instantly without login.</p>
      </div>

      {/* Lookup Form */}
      <section className="bg-white rounded-3xl p-6 border border-[#C5A059]/15 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center">
          <Phone className="w-4 h-4 text-[#C5A059] mr-2 shrink-0" /> Search by Mobile Number
        </h3>

        <form onSubmit={handlePhoneLookup} className="flex gap-2">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +94 77 123 4567"
            className="flex-1 p-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
          />
          <button
            type="submit"
            disabled={loadingLookups}
            className="px-6 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold uppercase hover:bg-[#C5A059] transition-colors flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{loadingLookups ? "Searching..." : "Lookup"}</span>
          </button>
        </form>

        {lookupError && (
          <div className="p-3 bg-red-50 rounded-lg text-xs text-red-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}
      </section>

      {/* Search results */}
      {lookups.length > 0 && !authedBooking && (
        <section className="space-y-3 animate-fadeIn">
          <h3 className="font-serif font-bold text-stone-900 text-md">Matched Appointments found:</h3>
          <div className="space-y-3">
            {lookups.map((bk) => {
              const cancelled = bk.status === "cancelled";
              const completed = bk.status === "completed";
              return (
                <div key={bk.bookingReference} className="bg-stone-50/50 border border-stone-200/65 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                        {bk.bookingReference}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                        cancelled 
                          ? "bg-stone-200 text-stone-500" 
                          : completed 
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#C5A059]/10 text-[#C5A059]"
                      }`}>
                        {bk.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-snug">
                      <span className="font-bold text-stone-900">{bk.services.join(", ")}</span> at {bk.branchName}
                    </p>
                    <p className="text-[11px] text-stone-400 flex items-center font-mono font-light">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {bk.date} @ {bk.startTime} - {bk.endTime}
                    </p>
                  </div>

                  {!cancelled && !completed && (
                    <button
                      onClick={() => {
                        setSelectedBookingRef(bk.bookingReference);
                        // Pin auto focuses
                      }}
                      className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium hover:border-[#C5A059] hover:text-[#C5A059] transition text-center cursor-pointer"
                    >
                      Authenticate with PIN
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Password/PIN gate */}
      {selectedBookingRef && !authedBooking && (
        <section className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#C5A059]/20 shadow-md animate-fadeIn space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-serif font-bold text-stone-905 text-sm flex items-center uppercase tracking-wide">
              <Key className="w-4 h-4 text-[#C5A059] mr-1.5" /> Security Access Verification
            </h4>
            <span className="text-xs font-mono bg-[#1A1A1A] text-[#C5A059] px-2.5 py-0.5 rounded">
              PIN lock: {selectedBookingRef}
            </span>
          </div>

          <p className="text-xs text-stone-500">Provide the 4-digit security PIN sent on confirmation screen to self-manage this booking:</p>

          <form onSubmit={handleVerifyPin} className="flex gap-2">
            <input
              type="password"
              required
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 4932"
              className="flex-1 p-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
            />
            <button
              type="submit"
              disabled={authenticating || pin.length < 4}
              className="px-6 bg-[#C5A059] text-white rounded-xl text-xs font-semibold uppercase hover:bg-[#AA823B] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Verify PIN
            </button>
          </form>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5" />
              <span>{authError}</span>
            </div>
          )}
        </section>
      )}

      {/* Authenticated operations portal */}
      {authedBooking && mode === "view" && (
        <section className="bg-white border border-[#C5A059]/20 shadow-md rounded-3xl p-6 md:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-[#C5A059]/10 pb-4 text-center">
            <span className="inline-block text-[10px] font-mono font-bold bg-[#C5A059]/10 text-[#C5A059] px-3 py-1 rounded-full uppercase">
              Management Portal Authorized &bull; {authedBooking.bookingReference}
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-905 mt-1">Hello, {authedBooking.customerName}!</h3>
          </div>

          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-150 text-xs text-stone-700">
            <p className="flex justify-between"><span>Registered Phone:</span> <span className="font-mono text-stone-900">{authedBooking.customerPhone}</span></p>
            <p className="flex justify-between"><span>Date:</span> <span className="text-stone-900 font-bold">{authedBooking.date}</span></p>
            <p className="flex justify-between"><span>Time Windows:</span> <span className="text-[#C5A059] font-mono font-bold">{authedBooking.startTime} - {authedBooking.endTime}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("reschedule")}
              className="flex items-center justify-center space-x-2 py-3 bg-[#1A1A1A] hover:bg-[#C5A059] text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reschedule Slot</span>
            </button>

            <button
              onClick={handleCancelBooking}
              disabled={submittingAction}
              className="flex items-center justify-center space-x-2 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-red-100 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>{submittingAction ? "Cancelling..." : "Cancel Appointment"}</span>
            </button>
          </div>

          {actionError && (
            <div className="p-3 bg-red-50 rounded-lg text-xs text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}
        </section>
      )}

      {/* ACTIVE RESCHEDULING SUB-MODULE */}
      {authedBooking && mode === "reschedule" && (
        <section className="bg-white border border-[#C5A059]/25 shadow-md rounded-3xl p-6 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h4 className="font-serif font-bold text-stone-900">Reschedule Beauty Slot</h4>
            <button
              onClick={() => setMode("view")}
              className="text-stone-400 hover:text-stone-700 text-xs font-semibold uppercase font-mono cursor-pointer"
            >
              Cancel Adjust
            </button>
          </div>

          <form onSubmit={handleRescheduleBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pick New Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setNewTime("");
                }}
                className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Pick New Time Slot</label>
              {slotsLoading ? (
                <div className="h-10 bg-stone-100 rounded animate-pulse"></div>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-[#C5A059] italic">No available times on this date. Please pick a different date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[170px] overflow-y-auto pr-1">
                  {availableSlots.map(({ time }) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setNewTime(time)}
                      className={`p-2 rounded-lg text-xs font-mono font-bold tracking-wide transition border cursor-pointer ${
                        newTime === time
                          ? "bg-[#C5A059] border-[#C5A059] text-white"
                          : "bg-white border-stone-250 text-stone-700 hover:bg-[#C5A059]/10"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 text-xs text-red-705 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                <span>{actionError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingAction || !newTime || !newDate}
              className="w-full py-3.5 bg-[#C5A059] text-white hover:bg-[#AA823B] transition-colors font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              {submittingAction ? "Writing database transaction..." : "Confirm Reschedule"}
            </button>
          </form>
        </section>
      )}

      {/* CANCELLED SUCCESS STATUS CARD */}
      {mode === "cancelled_success" && authedBooking && (
        <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-250 text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-emerald-900 text-lg leading-tight">Session Cancelled Successfully</h4>
          <p className="text-emerald-700 text-xs leading-relaxed max-w-sm mx-auto font-light">
            Your beauty appointment under reference {authedBooking?.bookingReference ?? "N/A"} has been cancelled correctly in Colombo registers. Feel free to book again at any time!
          </p>
          <button
            onClick={() => {
              setAuthedBooking(null);
              setSelectedBookingRef("");
              setPin("");
              setPhone("");
              setLookups([]);
            }}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-white rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors"
          >
            Manage other bookings
          </button>
        </section>
      )}

      {/* RESCHEDULED SUCCESS STATUS CARD */}
      {mode === "rescheduled_success" && authedBooking && (
        <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-250 text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-emerald-900 text-lg leading-tight">Slot Changed Successfully!</h4>
          <p className="text-emerald-700 text-xs leading-relaxed max-w-sm mx-auto font-light">
            Your beauty appointment is rescheduled to the new secure slot: <span className="font-bold underline">{newDate} @ {newTime}</span>. Welcome again!
          </p>
          <button
            onClick={() => {
              setAuthedBooking(null);
              setSelectedBookingRef("");
              setPin("");
              setPhone("");
              setLookups([]);
            }}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-white rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-colors"
          >
            Manage other bookings
          </button>
        </section>
      )}

    </div>
  );
}
