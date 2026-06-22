import React, { useState, useEffect } from "react";
import { 
  Building, User, Calendar, Check, CircleAlert, Sparkles, 
  ArrowLeft, Clock, ShoppingBag, Phone, Smile, ArrowRight, ClipboardCheck 
} from "lucide-react";
import { Service, Artist, Branch } from "../types";

interface BookingWizardProps {
  onSuccess: (ref: string, pin: string) => void;
  initialBranchId?: string;
}

export default function BookingWizard({ onSuccess, initialBranchId = "" }: BookingWizardProps) {
  // Master state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  // Wizard steps: 1: Branch, 2: Services, 3: Artist, 4: Date & Time, 5: Contact Info
  const [step, setStep] = useState(1);

  // User selections
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranchId);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>("any"); // ID or "any"
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(""); // HH:MM

  // Guest details
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  // Server state
  const [availableSlots, setAvailableSlots] = useState<{ time: string; availableArtists: { id: string; name: string }[] }[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  // Calendar parameters
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load basic configurations
  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        setBranches(data);
        if (initialBranchId) {
          setSelectedBranch(initialBranchId);
        } else if (data.length > 0) {
          setSelectedBranch(data[0].id);
        }
      });

    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data.filter((s: any) => s.isActive)));

    fetch("/api/artists")
      .then((res) => res.json())
      .then((data) => setArtists(data.filter((a: any) => a.isActive)));
  }, [initialBranchId]);

  // Set default date to tomorrow if not set
  useEffect(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const yyyy = tmr.getFullYear();
    const mm = String(tmr.getMonth() + 1).padStart(2, "0");
    const dd = String(tmr.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch slot availability when branch, service, artist, or date changes
  useEffect(() => {
    if (step === 4 && selectedBranch && selectedServices.length > 0 && selectedDate) {
      setIsSlotsLoading(true);
      setBookingError("");
      const params = new URLSearchParams({
        branchId: selectedBranch,
        date: selectedDate,
        serviceIds: selectedServices.join(","),
        artistId: selectedArtist
      });

      fetch(`/api/availability?${params}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableSlots(data);
          setIsSlotsLoading(false);
          // Auto select first slot if available and nothing is selected
          if (data.length > 0) {
            setSelectedTimeSlot("");
          }
        })
        .catch((err) => {
          console.error("Availability load error", err);
          setIsSlotsLoading(false);
        });
    }
  }, [step, selectedBranch, selectedServices, selectedArtist, selectedDate]);

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((sid) => sid !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  // Helper selectors
  const activeBranchObj = branches.find((b) => b.id === selectedBranch);
  const activeServicesList = services.filter((s) => selectedServices.includes(s.id));
  const activeArtistObj = artists.find((a) => a.id === selectedArtist);

  // Mathematical details
  const totalDuration = activeServicesList.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = activeServicesList.reduce((acc, s) => acc + s.basePrice, 0);

  // Submit booking
  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      setBookingError("Please provide your name and mobile number to confirm.");
      return;
    }
    
    setIsSubmitting(true);
    setBookingError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: selectedBranch,
          artistId: selectedArtist,
          serviceIds: selectedServices,
          customerName: clientName,
          customerPhone: clientPhone,
          date: selectedDate,
          startTime: selectedTimeSlot,
          notes: clientNotes
        })
      });

      const resJson = await response.json();
      if (!response.ok) {
        setBookingError(resJson.error || "A scheduler conflict occurred. Handcrafted slot was taken.");
      } else {
        setBookingSuccessData(resJson.booking);
        // Call parent prop if exists
        onSuccess(resJson.booking.bookingReference, resJson.booking.pin);
      }
    } catch (err) {
      setBookingError("Server unavailable. Please verify connectivity and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build calendar logic
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const buildCalendarCells = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    const cells: React.ReactNode[] = [];
    
    // Empty cells for alignment
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    for (let day = 1; day <= totalDays; day++) {
      const cellDateObj = new Date(year, month, day);
      const isPast = cellDateObj < todayDate;
      const cellDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isSelected = selectedDate === cellDateStr;

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPast}
          onClick={() => {
            setSelectedDate(cellDateStr);
            setSelectedTimeSlot("");
          }}
          className={`h-10 w-10 flex items-center justify-center rounded-full text-xs font-medium border cursor-pointer select-none transition-all ${
            isPast 
              ? "text-stone-300 border-transparent cursor-not-allowed" 
              : isSelected
                ? "bg-[#C5A059] border-[#C5A059] text-white shadow-sm font-bold scale-105"
                : "border-[#C5A059]/10 text-stone-700 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/10"
          }`}
        >
          {day}
        </button>
      );
    }
    return cells;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    // Prevent going past current month
    const currentReal = new Date();
    if (currentMonth.getFullYear() === currentReal.getFullYear() && currentMonth.getMonth() === currentReal.getMonth()) {
      return;
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // RENDER BOOKED SUCCESS SCREEN
  if (bookingSuccessData) {
    return (
      <div className="max-w-md mx-auto bg-[#FAF8F5] border border-[#C5A059]/15 shadow-2xl rounded-2xl overflow-hidden p-8 text-center border-t-8 border-t-[#C5A059] animate-fadeIn">
        <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClipboardCheck className="w-8 h-8 text-[#C5A059]" />
        </div>
        
        <h2 className="font-serif text-2xl font-bold text-stone-950 mb-2">Luxury Appointment Confirmed!</h2>
        <p className="text-stone-500 text-sm mb-6">Authentic styling is waiting for you in Colombo.</p>

        <div className="bg-white rounded-2xl p-5 shadow-inner border border-[#C5A059]/10 space-y-4 mb-6 text-left">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <span className="text-xs text-stone-400 uppercase tracking-wider font-mono">Reference ID</span>
            <span className="text-md font-bold font-mono text-[#C5A059]">{bookingSuccessData.bookingReference}</span>
          </div>

          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <span className="text-xs text-stone-400 uppercase tracking-wider font-mono">Security PIN</span>
            <div className="text-right">
              <span className="text-sm font-bold font-mono tracking-widest bg-stone-100 px-2.5 py-1 rounded text-stone-800">{bookingSuccessData.pin}</span>
              <p className="text-[10px] text-stone-400 mt-1">* Keep safe for self-rescheduling</p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-stone-700">
            <p className="flex justify-between">
              <span className="text-stone-400 font-light">Client:</span>
              <span className="font-medium text-stone-900">{bookingSuccessData.customerName}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-400 font-light">Salon Branch:</span>
              <span className="font-medium text-stone-900 text-right">{bookingSuccessData.branchName}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-400 font-light">Specialist:</span>
              <span className="font-medium text-stone-900">{bookingSuccessData.artistName}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-400 font-light">Date:</span>
              <span className="font-medium text-stone-900">{bookingSuccessData.date}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-400 font-light">Time Window:</span>
              <span className="font-medium text-[#C5A059] font-mono">{bookingSuccessData.startTime} - {bookingSuccessData.endTime}</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center leading-relaxed">
          Need changes? Simply look up this phone number under "My Booking" and input the security PIN {bookingSuccessData.pin} to self-manage at any time.
        </p>

        <button
          onClick={() => {
            setBookingSuccessData(null);
            setSelectedServices([]);
            setSelectedTimeSlot("");
            setStep(1);
          }}
          className="w-full mt-6 py-3.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-sm font-semibold rounded-xl tracking-wide transition cursor-pointer"
        >
          Book Another Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-[#FAF8F5] border border-[#C5A059]/15 shadow-xl rounded-2xl p-6 md:p-8 relative">
      {/* Step indicator */}
      <div className="flex items-center justify-between border-b border-[#C5A059]/10 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold">Step {step} of 5 &bull; {
            step === 1 ? "Select Studio" :
            step === 2 ? "Select Treatments" :
            step === 3 ? "Pick Specialist" :
            step === 4 ? "Date & Timing" :
            "Client Authentication"
          }</span>
          <h2 className="font-serif text-xl font-bold tracking-tight text-[#1A1A1A]">Reserve Elora Session</h2>
        </div>
        <div className="flex space-x-1.5">
          {[1, 2, 3, 4, 5].map((sNum) => (
            <div 
              key={sNum} 
              className={`w-6 h-1.5 rounded-full transition-all duration-350 ${
                sNum === step ? "bg-[#C5A059] w-10" : sNum < step ? "bg-[#C5A059]/50" : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>

      {bookingError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-start text-sm">
          <CircleAlert className="w-5 h-5 mr-2 shrink-0 text-red-550" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* STEP 1: BRANCH SELECTOR */}
      {step === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-stone-500 text-sm">Please choose which Colombo studio location fits your convenience:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBranch(b.id);
                  setStep(2);
                }}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedBranch === b.id
                    ? "bg-[#C5A059]/10 border-[#C5A059]/60 ring-2 ring-[#C5A059]/20"
                    : "bg-white border-stone-200 hover:border-[#C5A059]/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2.5 rounded-xl bg-[#C5A059]/10 text-[#C5A059]">
                    <Building className="w-5 h-5" />
                  </div>
                  {selectedBranch === b.id && (
                    <span className="p-1 rounded-full bg-[#C5A059] text-white"><Check className="w-3 h-3" /></span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-stone-900 leading-snug">{b.name}</h3>
                <p className="text-xs text-stone-500 mt-1 leading-snug">{b.address}, {b.city}</p>
                <p className="text-xs font-mono text-stone-400 mt-2">{b.phone}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedBranch}
              className="inline-flex items-center px-6 py-3 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#C5A059] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SERVICES SELECTION */}
      {step === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <p className="text-stone-500 text-xs sm:text-sm">Select one or more services (we will calculate cumulative durations):</p>
            {selectedServices.length > 0 && (
              <span className="text-xs font-mono bg-[#C5A059]/15 text-[#C5A059] px-2.5 py-1 rounded-full font-bold">
                {selectedServices.length} Selected
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 divide-y divide-[#C5A059]/10">
            {services.map((s) => {
              const selected = selectedServices.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`flex justify-between items-start p-4 rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? "bg-[#C5A059]/10 border-[#C5A059]/40 ring-1 ring-[#C5A059]/20"
                      : "bg-white border-stone-200 hover:border-[#C5A059]/20"
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] font-mono tracking-wider text-[#C5A059] uppercase font-bold">{s.category}</span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">{s.name}</h4>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1 font-light">{s.description}</p>
                    <p className="text-xs font-mono text-stone-400 mt-2 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {s.durationMinutes} Minutes Session
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-stone-900 font-mono">LKR {s.basePrice.toLocaleString()}</span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-3 ml-auto ${
                      selected ? "bg-[#C5A059] border-[#C5A059] text-white" : "border-stone-300"
                    }`}>
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#C5A059]/10">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-stone-300 text-stone-700 text-xs rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Location
            </button>
            <div className="text-right mr-3 hidden sm:block">
              <p className="text-xs text-stone-405">Selected total:</p>
              <span className="text-[#C5A059] font-mono font-bold text-md">LKR {totalPrice.toLocaleString()} ({totalDuration} mins)</span>
            </div>
            <button
              disabled={selectedServices.length === 0}
              onClick={() => setStep(3)}
              className="inline-flex items-center px-6 py-3 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#C5A059] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PICK STYLIST */}
      {step === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-stone-500 text-sm">Select an expert stylist or select any available for maximum slot options:</p>
          
          <div className="space-y-3">
            {/* Any Artist choice */}
            <button
              onClick={() => {
                setSelectedArtist("any");
                setStep(4);
              }}
              className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                selectedArtist === "any"
                  ? "bg-[#C5A059]/10 border-[#C5A059]/40"
                  : "bg-white border-stone-200 hover:border-[#C5A059]/30"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">Any Qualified Specialist</h3>
                  <p className="text-xs text-stone-500">Auto-assigns to the first available expert (Highly Recommended)</p>
                </div>
              </div>
              {selectedArtist === "any" && (
                <span className="p-1 rounded-full bg-[#C5A059] text-white"><Check className="w-3.5 h-3.5" /></span>
              )}
            </button>

            {/* Filters by branch and specialties */}
            {artists
              .filter((a) => a.branches.includes(selectedBranch))
              .map((a) => {
                const isSelected = selectedArtist === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelectedArtist(a.id);
                      setStep(4);
                    }}
                    className={`w-full text-left p-4 rounded-xl border flex items-start justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#C5A059]/10 border-[#C5A059]/40"
                        : "bg-white border-stone-200 hover:border-[#C5A059]/35"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <img 
                        src={`https://picsum.photos/seed/${a.photo}/150/150`} 
                        alt={a.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#C5A059]/15"
                      />
                      <div>
                        <h3 className="font-serif font-bold text-stone-900 text-sm">{a.name}</h3>
                        <p className="text-xs text-stone-500 leading-relaxed max-w-md">{a.bio}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-[#C5A059] text-white shrink-0"><Check className="w-3.5 h-3.5" /></span>
                    )}
                  </button>
                );
              })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#C5A059]/10">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center px-4 py-2 border border-stone-300 text-stone-700 text-xs rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center px-6 py-3 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#C5A059] cursor-pointer"
            >
              Continue to Timing
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DATE & TIME SELECTOR */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Calendar */}
            <div className="bg-white rounded-2xl p-4 border border-[#C5A059]/15 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <button 
                  type="button" 
                  onClick={prevMonth}
                  className="p-1 px-2.5 rounded-full border border-stone-200 text-stone-600 font-mono text-sm hover:bg-stone-50 cursor-pointer"
                >
                  &lt;
                </button>
                <span className="font-serif text-sm font-bold text-stone-900 capitalize">
                  {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <button 
                  type="button" 
                  onClick={nextMonth}
                  className="p-1 px-2.5 rounded-full border border-stone-200 text-stone-600 font-mono text-sm hover:bg-stone-50 cursor-pointer"
                >
                  &gt;
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-stone-400 text-[10px] uppercase font-mono mb-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-1">
                {buildCalendarCells()}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
                Selected date: <span className="font-bold text-[#C5A059] font-mono">{selectedDate}</span>
              </div>
            </div>

            {/* Timeslots */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center">
                <Clock className="w-4 h-4 text-[#C5A059] mr-1.5" />
                Available Times on {selectedDate}
              </h4>

              {isSlotsLoading ? (
                <div className="space-y-2 py-8">
                  <div className="h-6 bg-stone-200 rounded animate-pulse w-full"></div>
                  <div className="h-6 bg-stone-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-6 bg-stone-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-[#C5A059]/15 rounded-2xl bg-white">
                  <p className="text-xs text-stone-400 font-light">
                    The salon is either closed, fully blocked, or completely booked for the selected date. Please attempt another day on the calendar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2 max-h-[290px] overflow-y-auto pr-1">
                  {availableSlots.map(({ time }) => {
                    const active = selectedTimeSlot === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-semibold font-mono tracking-wide transition-all border cursor-pointer ${
                          active
                            ? "bg-[#C5A059] border-[#C5A059] text-white font-bold"
                            : "bg-white border-stone-250 text-stone-700 hover:bg-[#C5A059]/10 hover:border-[#C5A059]/40"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#C5A059]/10">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center px-4 py-2 border border-stone-300 text-stone-700 text-xs rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Selection
            </button>
            <button
              disabled={!selectedTimeSlot || !selectedDate}
              onClick={() => setStep(5)}
              className="inline-flex items-center px-6 py-3 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#C5A059] cursor-pointer"
            >
              Proceed to Confirm
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONTACT & CONFIRMATION */}
      {step === 5 && (
        <form onSubmit={handleFinalizeBooking} className="space-y-4 animate-fadeIn">
          <p className="text-stone-500 text-sm">Please finalize with your physical detail labels. Online booking requires valid contact information.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Aanya Senanayake"
                className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Contact Phone *</label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Special Preferences / Requests (Optional)</label>
            <textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="e.g. skin allergies, preferred beverages, hair length details..."
              rows={3}
              className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
            />
          </div>

          {/* Quick Summary Card */}
          <div className="bg-[#C5A059]/5 rounded-2xl p-4 border border-[#C5A059]/15 space-y-2 text-xs text-stone-700">
            <h5 className="font-serif font-bold text-stone-900 text-sm mb-1 uppercase tracking-wide">Summary check:</h5>
            <p><span className="font-semibold text-stone-800">Branch:</span> {activeBranchObj?.name}</p>
            <p><span className="font-semibold text-stone-800">Specialist:</span> {selectedArtist === "any" ? "Any Qualified Expert Specialist" : activeArtistObj?.name}</p>
            <p><span className="font-semibold text-stone-800">Date & Timing:</span> <span className="font-bold text-[#C5A059] font-mono">{selectedDate} @ {selectedTimeSlot}</span> ({totalDuration} mins duration)</p>
            <p><span className="font-semibold text-stone-800">Services list:</span> {activeServicesList.map(s => s.name).join(", ")}</p>
            <div className="border-t border-[#C5A059]/15 pt-2 flex justify-between items-center text-sm font-bold text-stone-900">
              <span className="font-serif">Estimated Total Price:</span>
              <span className="font-mono text-[#C5A059]">LKR {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#C5A059]/10">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(4)}
              className="inline-flex items-center px-4 py-2 border border-stone-300 text-stone-700 text-xs rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Adjust Timing
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !clientName.trim() || !clientPhone.trim()}
              className="inline-flex items-center px-7 py-3.5 bg-[#C5A059] text-white text-sm font-bold rounded-full hover:bg-[#AA823B] transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Finalizing Security Lock..." : "Confirm Luxury Booking"}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
