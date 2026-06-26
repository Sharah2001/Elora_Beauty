import {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {Check, Clock3, Flame, Sparkles, Star} from "lucide-react";
import {Offer, Package, Service} from "../types";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";
import {fetchJson} from "../lib/fetchJson";

interface ServicesProps {
  onSelectServiceForBooking: (serviceIds: string[]) => void;
  selectedBranchId?: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function Services({
  onSelectServiceForBooking,
  selectedBranchId = "",
}: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchJson<Service[]>("/api/services"),
      fetchJson<Package[]>("/api/packages"),
      fetchJson<Offer[]>("/api/offers"),
    ])
      .then(([serviceData, packageData, offerData]) => {
        setServices(Array.isArray(serviceData) ? serviceData : []);
        setPackages(Array.isArray(packageData) ? packageData : []);
        setOffers(Array.isArray(offerData) ? offerData : []);
      })
      .catch(() => setError("Services could not be loaded. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  const branchServices = useMemo(
    () =>
      selectedBranchId
        ? services.filter((service) => service.branches.includes(selectedBranchId))
        : services,
    [selectedBranchId, services],
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(branchServices.map((service) => service.category)))],
    [branchServices],
  );

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory]);

  const filteredServices =
    selectedCategory === "All"
      ? branchServices
      : branchServices.filter((service) => service.category === selectedCategory);

  const visiblePackages = selectedBranchId
    ? packages.filter((item) => !item.branches?.length || item.branches.includes(selectedBranchId))
    : packages;

  if (loading) {
    return <LoadingSkeleton count={6} className="py-8 md:grid-cols-2" />;
  }

  if (error) {
    return <EmptyState title="Services unavailable" description={error} />;
  }

  return (
    <div className="space-y-16 py-4">
      {offers.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-surface-muted p-6 md:p-9">
          <SectionHeading
            align="left"
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Limited-time offers
              </span>
            }
            title="Current Promotions"
            description="Explore active salon offers and check the applicable treatments before booking."
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {offers.map((offer) => {
              const applicableNames = offer.applicableServices
                ?.map((serviceId) => services.find((service) => service.id === serviceId)?.name)
                .filter(Boolean);

              return (
                <Card key={offer.id} as="article" interactive className="overflow-hidden">
                  {offer.image && (
                    <Image
                      src={offer.image}
                      alt={offer.imageAlt || offer.title}
                      width={720}
                      height={360}
                      sizes="(max-width: 767px) 100vw, 50vw"
                      quality={70}
                      className="h-44 w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-xl font-semibold text-brand-ink">{offer.title}</h3>
                      <span className="shrink-0 rounded-full bg-brand-gold-soft px-3 py-1 text-xs font-bold text-brand-gold-dark">
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}% off`
                          : `LKR ${offer.discountValue.toLocaleString()} off`}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{offer.description}</p>
                    {applicableNames && applicableNames.length > 0 && (
                      <p className="mt-4 text-xs leading-5 text-stone-500">
                        <span className="font-semibold text-stone-700">Applies to:</span>{" "}
                        {applicableNames.join(", ")}
                      </p>
                    )}
                    <p className="mt-5 border-t border-stone-100 pt-4 text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
                      Valid until {formatDate(offer.validUntil)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Treatments & pricing"
          title="Services Designed Around You"
          description={
            selectedBranchId
              ? "Showing treatments available at your selected studio."
              : "Explore professional hair, beauty, skin, nail and bridal treatments across Elora Beauty."
          }
        />

        <div
          className="flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Filter services by category"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-10 rounded-full px-5 text-xs font-semibold uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                selectedCategory === category
                  ? "bg-brand-gold text-white shadow-sm"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-brand-gold hover:text-brand-gold-dark"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredServices.length === 0 ? (
          <EmptyState
            title="No treatments found"
            description="There are no active treatments in this category for the selected studio."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredServices.map((service) => (
              <Card key={service.id} as="article" interactive className="overflow-hidden">
                <div className="grid h-full sm:grid-cols-[9rem_1fr]">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.imageAlt || service.name}
                      width={288}
                      height={360}
                      sizes="(max-width: 639px) 100vw, 144px"
                      quality={68}
                      className="h-52 w-full object-cover sm:h-full"
                    />
                  ) : (
                    <div className="flex min-h-36 items-center justify-center bg-brand-gold-soft">
                      <Sparkles className="h-8 w-8 text-brand-gold/60" />
                    </div>
                  )}
                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                          {service.category}
                        </span>
                        <span className="font-mono text-sm font-bold text-brand-ink">
                          LKR {service.basePrice.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-xl font-semibold text-brand-ink">{service.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{service.description}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                      <span className="inline-flex items-center gap-2 text-xs text-stone-500">
                        <Clock3 className="h-4 w-4 text-brand-gold" />
                        {service.durationMinutes} minutes
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectServiceForBooking([service.id])}
                      >
                        Book treatment
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {visiblePackages.length > 0 && (
        <section className="relative overflow-hidden rounded-3xl bg-brand-ink p-7 text-white md:p-12">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative">
            <SectionHeading
              inverse
              eyebrow={
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current" />
                  Curated combinations
                </span>
              }
              title="Signature Packages"
              description="Thoughtfully grouped treatments with clear pricing for complete beauty and wellness experiences."
            />

            <div className="mt-9 grid gap-6 lg:grid-cols-2">
              {visiblePackages.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.imageAlt || item.name}
                      width={720}
                      height={384}
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      quality={70}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-white">{item.name}</h3>
                        {item.discountNote && (
                          <p className="mt-1 text-xs font-semibold text-brand-gold">{item.discountNote}</p>
                        )}
                      </div>
                      <span className="shrink-0 font-mono text-base font-bold text-brand-gold">
                        LKR {item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-400">{item.description}</p>
                    <ul className="mt-5 space-y-2">
                      {item.includedServices.map((serviceId) => {
                        const service = services.find((candidate) => candidate.id === serviceId);
                        return (
                          <li key={serviceId} className="flex items-start gap-2 text-xs text-stone-300">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                            <span>
                              {service?.name || serviceId}
                              {service ? ` · ${service.durationMinutes} min` : ""}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <Button
                      fullWidth
                      className="mt-6"
                      onClick={() => onSelectServiceForBooking(item.includedServices)}
                    >
                      Book this package
                    </Button>
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
