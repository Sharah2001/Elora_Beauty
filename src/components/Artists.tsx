import React, { useState, useEffect } from "react";
import { Building, Medal } from "lucide-react";
import { Artist, Service, Branch, Certification } from "../types";

interface ArtistsProps {
  onSelectArtistForBooking: (artistId: string) => void;
}

export default function Artists({ onSelectArtistForBooking }: ArtistsProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    fetch("/api/artists")
      .then((res) => res.json())
      .then((data) => setArtists(data));

    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data));

    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data));

    fetch("/api/certifications")
      .then((res) => res.json())
      .then((data) => setCertifications(data));
  }, []);

  return (
    <div className="space-y-12 py-4">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-flex items-center text-xs font-mono font-bold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full border border-[#C5A059]/20">
          <Medal className="w-3 h-3 mr-1 inline" />
          Master Certified Team
        </span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">Meet Our Premier Stylists</h2>
        <p className="text-stone-500 text-sm font-light leading-relaxed">
          Elora's elite beauty artisans are fully accredited and deeply committed to delivering pristine custom elegance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => {
          return (
            <div key={artist.id} className="bg-white rounded-3xl border border-[#C5A059]/10 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              
              {/* Picture + Basic overlay */}
              <div className="relative h-64 bg-stone-100">
                <img 
                  src={artist.photo || `https://picsum.photos/seed/${artist.id}/500/500`}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-serif font-bold text-lg">{artist.name}</h3>
                  <p className="text-xs text-[#C5A059] font-mono">Expert Beauty Artisan</p>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <p className="text-xs text-stone-500 leading-relaxed font-light">{artist.bio}</p>
                  
                  {/* Branches */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">Operating Studios:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {artist.branches.map((bid) => {
                        const bObj = branches.find((b) => b.id === bid);
                        return (
                          <span key={bid} className="inline-flex items-center text-[10px] text-stone-600 bg-stone-100 px-2 py-1 rounded">
                            <Building className="w-3 h-3 mr-1 text-stone-400 shrink-0" />
                            {bObj?.name.replace("Elora Beauty - ", "") || bid}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">Specialties:</span>
                    <div className="flex flex-wrap gap-1">
                      {artist.specialties.map((sid) => {
                        const sObj = services.find((s) => s.id === sid);
                        if (!sObj) return null;
                        return (
                          <span key={sid} className="text-[10px] text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded font-mono">
                            {sObj.name.replace("Professional ", "").replace("Luxury ", "")}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectArtistForBooking(artist.id)}
                  className="w-full py-2.5 border-2 border-[#C5A059] text-[#C5A059] font-semibold text-xs tracking-wide rounded-xl uppercase hover:bg-[#C5A059] hover:text-white transition duration-300 text-center cursor-pointer"
                >
                  Book with {artist.name.split(" ")[0]}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {certifications.length > 0 && (
        <section className="border-y border-[#C5A059]/20 bg-[#1A1A1A] px-6 py-8 text-stone-300 md:px-8">
          <div className="grid gap-7 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                Recognition
              </p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                Certifications & Awards
              </h3>
              <p className="mt-2 text-xs leading-5 text-stone-400">
                Professional standards and industry recognition maintained by Elora Beauty.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {certifications.map((certification) => (
                <article key={certification.id} className="border border-white/15 p-4">
                  <Medal className="h-5 w-5 text-[#C5A059]" />
                  <h4 className="mt-3 font-serif text-sm font-semibold text-white">
                    {certification.title}
                  </h4>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-500">
                    {certification.issuer || certification.reference}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
