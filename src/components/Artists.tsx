import {useEffect, useMemo, useState} from "react";
import {Award, BadgeCheck, Building2, Medal, Sparkles, UserRound} from "lucide-react";
import {Artist, Branch, Certification, Service} from "../types";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";
import {fetchJson} from "../lib/fetchJson";

interface ArtistsProps {
  onSelectArtistForBooking: (artistId: string) => void;
  selectedBranchId?: string;
}

export default function Artists({
  onSelectArtistForBooking,
  selectedBranchId = "",
}: ArtistsProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchJson<Artist[]>("/api/artists"),
      fetchJson<Service[]>("/api/services"),
      fetchJson<Branch[]>("/api/branches"),
      fetchJson<Certification[]>("/api/certifications"),
    ])
      .then(([artistData, serviceData, branchData, certificationData]) => {
        setArtists(Array.isArray(artistData) ? artistData : []);
        setServices(Array.isArray(serviceData) ? serviceData : []);
        setBranches(Array.isArray(branchData) ? branchData : []);
        setCertifications(Array.isArray(certificationData) ? certificationData : []);
      })
      .catch(() => setError("Our artist profiles could not be loaded. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  const visibleArtists = useMemo(
    () =>
      selectedBranchId
        ? artists.filter((artist) => artist.branches.includes(selectedBranchId))
        : artists,
    [artists, selectedBranchId],
  );

  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId);

  return (
    <div className="space-y-16 py-4">
      <section className="space-y-9">
        <SectionHeading
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Certified creative team
            </span>
          }
          title="Meet Our Beauty Artists"
          description={
            selectedBranch
              ? `Discover the artists currently available at ${selectedBranch.name}.`
              : "Experienced professionals specialising in hair, makeup, nails, skin and bridal artistry."
          }
        />

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : error ? (
          <EmptyState title="Artist profiles unavailable" description={error} />
        ) : visibleArtists.length === 0 ? (
          <EmptyState
            title="No artists listed for this studio"
            description="The team schedule may still be changing. Please choose another branch or contact the studio."
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleArtists.map((artist) => (
              <Card key={artist.id} as="article" interactive className="flex overflow-hidden">
                <div className="flex w-full flex-col">
                  <div className="relative h-72 overflow-hidden bg-stone-100">
                    {artist.photo ? (
                      <img
                        src={artist.photo}
                        alt={artist.photoAlt || `${artist.name}, Elora Beauty artist`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-surface-muted">
                        <UserRound className="h-16 w-16 text-brand-gold/35" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-5 pt-16">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E0C17C]">
                        {artist.role || "Beauty specialist"}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-semibold text-white">{artist.name}</h3>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="line-clamp-4 text-sm leading-6 text-stone-600">{artist.bio}</p>

                    {typeof artist.experienceYears === "number" && artist.experienceYears > 0 && (
                      <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-gold-dark">
                        <BadgeCheck className="h-4 w-4" />
                        {artist.experienceYears}+ years of professional experience
                      </p>
                    )}

                    <div className="mt-5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Specialities
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {artist.specialties.map((serviceId) => {
                          const service = services.find((item) => item.id === serviceId);
                          return service ? (
                            <span
                              key={serviceId}
                              className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold-soft px-3 py-1 text-[10px] font-semibold text-brand-gold-dark"
                            >
                              <Sparkles className="h-3 w-3" />
                              {service.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {artist.certifications && artist.certifications.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-brand-gold/15 bg-brand-surface-muted p-4">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          <Award className="h-4 w-4 text-brand-gold" />
                          Certifications
                        </p>
                        <ul className="mt-2 space-y-2">
                          {artist.certifications.map((certification) => (
                            <li key={certification.id} className="text-xs leading-5 text-stone-600">
                              <span className="font-semibold text-stone-800">{certification.title}</span>
                              {certification.issuer && (
                                <span className="block text-[10px] text-stone-400">
                                  {certification.issuer}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Available studios
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {artist.branches.map((branchId) => {
                          const branch = branches.find((item) => item.id === branchId);
                          return (
                            <span key={branchId} className="inline-flex items-center gap-1 text-xs text-stone-500">
                              <Building2 className="h-3.5 w-3.5 text-brand-gold" />
                              {branch?.name.replace("Elora Beauty - ", "") || branchId}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      fullWidth
                      className="mt-6"
                      onClick={() => onSelectArtistForBooking(artist.id)}
                    >
                      Book with {artist.name.split(" ")[0]}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {certifications.length > 0 && (
        <section className="overflow-hidden rounded-3xl bg-brand-ink px-6 py-10 text-stone-300 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <SectionHeading
              align="left"
              inverse
              eyebrow="Professional recognition"
              title="Certifications & Awards"
              description="A selection of qualifications, partnerships and industry recognition held by Elora Beauty and our team."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {certifications.map((certification) => (
                <article
                  key={certification.id}
                  className="flex min-h-40 gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  {certification.image ? (
                    <img
                      src={certification.image}
                      alt={certification.imageAlt || certification.title}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15">
                      <Award className="h-6 w-6 text-brand-gold" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-base font-semibold text-white">{certification.title}</h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                      {certification.issuer || certification.reference || "Elora Beauty"}
                    </p>
                    {certification.description && (
                      <p className="mt-2 text-xs leading-5 text-stone-400">{certification.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
