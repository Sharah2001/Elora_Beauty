import {useEffect, useMemo, useState} from "react";
import {Building2, Clock, ExternalLink, MapPin, MessageCircle, Phone} from "lucide-react";
import {Branch, DaySchedule, WorkingHours} from "../types";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";
import {fetchJson} from "../lib/fetchJson";

interface LocationsProps {
  onSelectBranchForBooking: (branchId: string) => void;
  selectedBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
}

const dayLabels: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function formatSchedule(schedule: DaySchedule) {
  return schedule.isClosed ? "Closed" : `${schedule.openTime} – ${schedule.closeTime}`;
}

function cleanPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export default function Locations({
  onSelectBranchForBooking,
  selectedBranchId = "",
  onSelectBranch,
}: LocationsProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedMaps, setLoadedMaps] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    Promise.all([
      fetchJson<Branch[]>("/api/branches"),
      fetchJson<WorkingHours[]>("/api/working-hours"),
    ])
      .then(([branchData, hoursData]) => {
        setBranches(Array.isArray(branchData) ? branchData : []);
        setWorkingHours(Array.isArray(hoursData) ? hoursData : []);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load locations."))
      .finally(() => setLoading(false));
  }, []);

  const visibleBranches = useMemo(
    () =>
      selectedBranchId
        ? branches.filter((branch) => branch.id === selectedBranchId)
        : branches,
    [branches, selectedBranchId],
  );

  return (
    <section className="space-y-10 py-4">
      <SectionHeading
        eyebrow="Find your studio"
        title="Our Colombo Locations"
        description={`Choose from ${branches.length || "our"} professionally equipped ${
          branches.length === 1 ? "studio" : "studios"
        }, each with its own team, services and opening hours.`}
      />

      {selectedBranchId && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-brand-gold/20 bg-brand-gold-soft/60 px-4 py-3 text-sm text-stone-700">
          <MapPin className="h-4 w-4 text-brand-gold" />
          <span>Showing your preferred studio.</span>
          <button
            type="button"
            onClick={() => onSelectBranch?.("")}
            className="font-semibold text-brand-gold-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            View all locations
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={2} className="lg:grid-cols-2" />
      ) : error ? (
        <EmptyState title="Locations unavailable" description={error} />
      ) : visibleBranches.length === 0 ? (
        <EmptyState
          title="No matching studio"
          description="Choose another preferred branch or view all Elora Beauty locations."
          action={
            <Button variant="outline" onClick={() => onSelectBranch?.("")}>
              View all branches
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {visibleBranches.map((branch) => {
            const branchHours = workingHours.find((hours) => hours.branchId === branch.id);
            const mapTarget = branch.geo
              ? `${branch.geo.lat},${branch.geo.lng}`
              : `${branch.address}, ${branch.city}`;
            const encodedTarget = encodeURIComponent(mapTarget);
            const embedUrl = `https://maps.google.com/maps?q=${encodedTarget}&z=15&output=embed`;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedTarget}`;
            const whatsappNumber = branch.whatsapp ? cleanPhone(branch.whatsapp).replace(/^\+/, "") : "";

            return (
              <Card key={branch.id} as="article" interactive className="overflow-hidden">
                <div className="relative h-64 bg-stone-100">
                  {loadedMaps.has(branch.id) ? (
                    <iframe
                      title={`${branch.name} location map`}
                      src={embedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setLoadedMaps((current) => new Set(current).add(branch.id))
                      }
                      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,_#f5ecdb,_#e7e5e4)] px-6 text-center transition hover:bg-brand-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold"
                      aria-label={`Load interactive map for ${branch.name}`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card">
                        <MapPin className="h-7 w-7 text-brand-gold-dark" />
                      </span>
                      <span className="font-serif text-lg font-semibold text-brand-ink">
                        View interactive map
                      </span>
                      <span className="max-w-sm text-xs leading-5 text-stone-600">
                        Map content loads only when requested to improve page speed and privacy.
                      </span>
                    </button>
                  )}
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark shadow-sm backdrop-blur">
                    <Building2 className="h-3.5 w-3.5" />
                    {branch.city}
                  </span>
                </div>

                <div className="space-y-6 p-6 md:p-8">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-brand-ink">{branch.name}</h3>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-stone-600">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-gold" />
                      {branch.address}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${cleanPhone(branch.phone)}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 px-4 text-xs font-semibold text-stone-700 transition hover:border-brand-gold hover:text-brand-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      <Phone className="h-4 w-4" />
                      Call studio
                    </a>
                    {whatsappNumber && (
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200 px-4 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 px-4 text-xs font-semibold text-stone-700 transition hover:border-brand-gold hover:text-brand-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Directions
                    </a>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                      <Clock className="h-4 w-4 text-brand-gold" />
                      Weekly opening hours
                    </h4>
                    {branchHours?.schedule?.length ? (
                      <dl className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                        {branchHours.schedule.map((schedule) => (
                          <div
                            key={schedule.dayOfWeek}
                            className="flex justify-between gap-4 border-b border-stone-100 py-2.5 text-xs"
                          >
                            <dt className="font-medium text-stone-600">
                              {dayLabels[schedule.dayOfWeek] || schedule.dayOfWeek}
                            </dt>
                            <dd className={schedule.isClosed ? "text-stone-400" : "font-mono text-stone-700"}>
                              {formatSchedule(schedule)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="mt-3 text-xs text-stone-400">Please contact this studio for current hours.</p>
                    )}
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => {
                      onSelectBranch?.(branch.id);
                      onSelectBranchForBooking(branch.id);
                    }}
                  >
                    Book at this branch
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
