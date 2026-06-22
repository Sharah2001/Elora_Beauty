import React, { useState, useEffect } from "react";
import { Sparkles, Check, Flame, Star } from "lucide-react";
import { Service, Package, Offer } from "../types";

interface ServicesProps {
  onSelectServiceForBooking: (serviceId: string) => void;
}

export default function Services({ onSelectServiceForBooking }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data));

    fetch("/api/packages")
      .then((res) => res.json())
      .then((data) => setPackages(data));

    fetch("/api/offers")
      .then((res) => res.json())
      .then((data) => setOffers(data.filter((o: any) => o.isActive)));
  }, []);

  const categories = ["All", "Hair", "Makeup", "Nails", "Skin", "Bridal"];

  const filteredServices = selectedCategory === "All" 
    ? services 
    : services.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-16 py-4">
      {/* Featured Promotions / Active Shows (Sathurgini, 2 hrs line item) */}
      {offers.length > 0 && (
        <section className="bg-gradient-to-r from-amber-50/60 to-stone-50 border border-[#C5A059]/20 rounded-3xl p-6 md:p-8">
          <div className="text-center md:text-left md:flex justify-between items-center mb-6">
            <div className="mb-4 md:mb-0">
              <span className="inline-flex items-center text-xs font-mono font-bold uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/15 px-3 py-1 rounded-full border border-[#C5A059]/20">
                <Flame className="w-3.5 h-3.5 mr-1 fill-[#C5A059] inline text-[#C5A059]" />
                Featured Exclusive Offer
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-2">Active Salon Promotions</h3>
            </div>
            <p className="text-stone-500 text-xs italic">Offers auto-applied during your custom checkout</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((off) => (
              <div key={off.id} className="bg-white rounded-2xl p-6 border border-[#C5A059]/10 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#1A1A1A] leading-snug">{off.title}</h4>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed font-light">{off.description}</p>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#C5A059]/10">
                  <div className="text-xs text-stone-400 font-mono">
                    Valid until: <span className="font-semibold text-[#C5A059]">{off.validUntil}</span>
                  </div>
                  <span className="text-xs font-bold text-[#C5A059] font-mono bg-[#C5A059]/10 px-2.5 py-1 rounded-full uppercase">
                    {off.discountType === "percentage" ? `${off.discountValue}% OFF` : `LKR ${off.discountValue} OFF`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Menu Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">Our Services & Price List</h2>
          <p className="text-stone-500 text-sm font-light">Explore our wide array of premium head-to-toe beauty treatments tailored to perfection.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 border-b border-[#C5A059]/10 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#C5A059] text-white shadow-md shadow-amber-900/10"
                  : "bg-stone-50 text-stone-600 hover:bg-[#C5A059]/10 hover:text-[#C5A059]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid (Looklike UI Image 1 style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-2xl p-6 border border-[#C5A059]/10 flex flex-col justify-between hover:border-[#C5A059]/35 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded-md uppercase font-bold">
                    {service.category}
                  </span>
                  <span className="text-sm font-bold font-mono text-stone-900">
                    LKR {service.basePrice.toLocaleString()}
                  </span>
                </div>
                <h3 className="font-serif text-md font-bold text-[#1A1A1A] mt-2.5 leading-snug">{service.name}</h3>
                <p className="text-xs text-stone-500 font-light leading-relaxed mt-2">{service.description}</p>
              </div>

              <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-6">
                <span className="text-xs text-stone-400 font-mono">
                  Duration: {service.durationMinutes} mins
                </span>
                <button
                  onClick={() => onSelectServiceForBooking(service.id)}
                  className="px-4 py-1.5 bg-white border border-[#C5A059] text-[#C5A059] text-xs font-semibold rounded-full hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] transition duration-300 cursor-pointer"
                >
                  Book Treatment
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spa Packages & Bundles */}
      <section className="bg-[#1A1A1A] text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl border border-[#C5A059]/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-[#C5A059]/10 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-amber-900/10 blur-3xl"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center text-xs font-mono text-[#C5A059] uppercase tracking-widest font-bold">
              <Star className="w-4 h-4 mr-1 text-[#C5A059] fill-[#C5A059] inline" />
              Sathurgini's Premium Selection
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white">Luxury Spa Packages</h2>
            <p className="text-stone-400 text-xs sm:text-sm font-light">Combining multiple treatments in sequential blocks for the ultimate therapeutic restoration.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-stone-900/50 border border-[#C5A059]/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">{pkg.name}</h3>
                      {pkg.discountNote && (
                        <span className="inline-block text-[10px] font-bold text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/25 px-2 py-0.5 rounded mt-1.5">
                          {pkg.discountNote}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-mono font-bold text-[#C5A059]">LKR {pkg.totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed font-light">{pkg.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">Included Sessions:</h4>
                  <div className="space-y-2 text-xs">
                    {pkg.includedServices.map((sid) => {
                      const sObj = services.find((s) => s.id === sid);
                      return (
                        <div key={sid} className="flex items-center text-stone-300">
                          <Check className="w-4 h-4 text-[#C5A059] mr-2 shrink-0" />
                          <span>{sObj?.name || sid} ({sObj ? `${sObj.durationMinutes} mins` : ""})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Preselect package's first service and open booking flow
                    if (pkg.includedServices.length > 0) {
                      onSelectServiceForBooking(pkg.includedServices[0]);
                    }
                  }}
                  className="w-full py-3 bg-[#C5A059] text-white font-semibold text-xs tracking-wider rounded-xl uppercase hover:bg-[#AA823B] transition-all text-center cursor-pointer"
                >
                  Book Package Block
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
