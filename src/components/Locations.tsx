import React, { useState, useEffect } from "react";
import { MapPin, Phone, Building, MessageSquare, Clock } from "lucide-react";
import { Branch, WorkingHours } from "../types";

interface LocationsProps {
  onSelectBranchForBooking: (branchId: string) => void;
}

export default function Locations({ onSelectBranchForBooking }: LocationsProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);

  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data));

    fetch("/api/working-hours")
      .then((res) => res.json())
      .then((data) => setWorkingHours(data));
  }, []);

  return (
    <div className="space-y-12 py-4">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900">Our Colombo Studios</h2>
        <p className="text-stone-500 text-sm font-light">With two beautiful, fully-serviced premises in Colombo's premium districts, relaxation is never far away.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {branches.map((branch) => {
          const branchHours = workingHours.find((hours) => hours.branchId === branch.id);
          const weekday = branchHours?.schedule.find((day) => day.dayOfWeek === "Mon");
          const saturday = branchHours?.schedule.find((day) => day.dayOfWeek === "Sat");
          const sunday = branchHours?.schedule.find((day) => day.dayOfWeek === "Sun");
          // Generate a Colombo Google Map embed source based on latitude & longitude
          // Or search queries for Kollupitiya/Cinnamon Gardens
          const mapQuery = encodeURIComponent(branch.address + ", " + branch.city);
          const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

          return (
            <div key={branch.id} className="bg-[#FAF8F5] rounded-3xl border border-[#C5A059]/15 p-6 md:p-8 space-y-6 flex flex-col justify-between hover:shadow-md transition">
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#C5A059]/10 text-[#C5A059] rounded-2xl">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-stone-400 font-mono">ID: {branch.id.toUpperCase()}</span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900">{branch.name}</h3>
                  <p className="text-xs text-[#C5A059] font-semibold mt-1 uppercase font-mono">{branch.city}</p>
                </div>

                {/* Info block */}
                <div className="space-y-2.5 text-sm text-stone-700">
                  <p className="flex items-start">
                    <MapPin className="w-4 h-4 text-[#C5A059] mr-2 mt-0.5 shrink-0" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 text-[#C5A059] mr-2 shrink-0" />
                    <span>{branch.phone}</span>
                  </p>
                  {branch.whatsapp && (
                    <p className="flex items-center text-emerald-700 font-medium font-sans">
                      <MessageSquare className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      <span>{branch.whatsapp} (WhatsApp Support)</span>
                    </p>
                  )}
                </div>

                {/* Embedded google map */}
                <div className="h-48 w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner">
                  <iframe
                    title={`${branch.name} Map`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={embedUrl}
                    className="filter select-none grayscale invert contrast-90 md:contrast-100"
                  />
                </div>

                {branchHours && (
                  <div className="grid grid-cols-3 gap-3 border-t border-[#C5A059]/15 pt-4 text-center">
                    {[
                      {label: "Mon–Fri", schedule: weekday},
                      {label: "Saturday", schedule: saturday},
                      {label: "Sunday", schedule: sunday},
                    ].map(({label, schedule}) => (
                      <div key={label} className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
                        <p className="mt-1 text-[10px] font-mono text-stone-700">
                          {schedule?.isClosed
                            ? "Closed"
                            : `${schedule?.openTime || "—"}–${schedule?.closeTime || "—"}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectBranchForBooking(branch.id)}
                className="w-full py-3.5 bg-[#C5A059] text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-amber-900/10 hover:bg-[#AA823B] hover:scale-[1.01] transition-all text-center cursor-pointer"
              >
                Book At This Branch
              </button>

            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 border-y border-[#C5A059]/20 py-5 text-center text-sm text-stone-600">
        <Clock className="h-5 w-5 text-[#C5A059]" />
        <p>
          Opening times are maintained per branch and may change on blocked dates or public holidays.
        </p>
      </div>
    </div>
  );
}
