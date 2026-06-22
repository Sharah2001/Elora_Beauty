import React, { useState, useEffect } from "react";
import { User, Sparkles, Building, Medal, Heart } from "lucide-react";
import { Artist, Service, Branch } from "../types";

interface ArtistsProps {
  onSelectArtistForBooking: (artistId: string) => void;
}

export default function Artists({ onSelectArtistForBooking }: ArtistsProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

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
                  src={`https://picsum.photos/seed/${artist.photo}/500/500`}
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

      {/* Certifications Section (Sathurgini, 1 hr) */}
      <section className="bg-[#1A1A1A] text-stone-300 border border-[#C5A059]/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="font-serif text-xl font-bold text-white">Highly Awarded and Safe Standards</h3>
          <p className="text-stone-400 text-xs leading-relaxed font-light font-sans">
            Elora Beauty is a certified licensed partner of the Lanka Beauty Pageants Association. Every treatment adheres fully to international sanitary safety protocols, ensuring supreme luxury without compromise.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-stone-900 border border-[#C5A059]/15 rounded-xl p-3 shadow-sm max-w-[200px] text-center shrink-0">
            <h4 className="text-[10px] font-mono font-bold tracking-wider text-[#C5A059] block mb-1">ACC_NO 2932</h4>
            <p className="text-[11px] font-bold text-stone-200">Sri Lanka Salon Of The Year 2025</p>
          </div>
          <div className="bg-stone-900 border border-[#C5A059]/15 rounded-xl p-3 shadow-sm max-w-[200px] text-center shrink-0">
            <h4 className="text-[10px] font-mono font-bold tracking-wider text-[#C5A059] block mb-1 font-bold">certified</h4>
            <p className="text-[11px] font-bold text-stone-200">Toni&Guy London Affiliation</p>
          </div>
        </div>
      </section>
    </div>
  );
}
