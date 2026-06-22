import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShieldCheck, MapPin, Phone, Mail, Instagram, Star, Clock, 
  MapPinOff, Landmark, Scissors, Smile, Hand, HeartHandshake, SmilePlus 
} from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingWizard from "./components/BookingWizard";
import Services from "./components/Services";
import Artists from "./components/Artists";
import Locations from "./components/Locations";
import Reviews from "./components/Reviews";
import ManageBookings from "./components/ManageBookings";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // Routes: "home" | "services" | "artists" | "work" | "locations" | "reviews" | "manage" | "admin" | "book_now"
  const [activeTab, setActiveTab] = useState<string>("home");

  // Pre-selected parameters for booking flow launcher
  const [preSelectedBranch, setPreSelectedBranch] = useState("");
  
  // Image path references generated
  const heroImage = "/images/elora-hero-banner.jpg";
  const portfolio1 = "/images/makeup-showcase.jpg";
  const portfolio2 = "/images/nail-art-showcase.jpg";

  // Contact form state
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cMessage, setCMessage] = useState("");
  const [cStatus, setCStatus] = useState("");
  const [cError, setCError] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Set Search Engine Optimization meta headers (SEO)
  useEffect(() => {
    document.title = "Elora Beauty | Colombo Premium Multi-Branch Hair, Nails & Bridal Parlour";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Elora Beauty Parlour Colombo. Luxury multi-branch salon in Kollupitiya & Cinnamon Gardens offering professional nail extensions, makeup, protective hair balayage, and Kandyan bridal styling.");
    }
  }, [activeTab]);

  const handleOpenBooking = (branchId = "") => {
    setPreSelectedBranch(branchId);
    setActiveTab("book_now");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cPhone || !cMessage) {
      setCError("Please populate all required fields.");
      return;
    }

    setSendingMsg(true);
    setCError("");
    setCStatus("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cName,
          phone: cPhone,
          email: cEmail,
          message: cMessage
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCError(data.error || "Inquiry submission failed.");
      } else {
        setCStatus(data.message);
        setCName("");
        setCPhone("");
        setCEmail("");
        setCMessage("");
      }
    } catch (err) {
      setCError("Server currently offline. Try again soon.");
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F4] text-stone-900 font-sans flex flex-col justify-between">
      
      {/* Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenBooking={() => handleOpenBooking("")} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* VIEW 1: HOME PAGE (Looklike UI Image 1 Combined style) */}
        {activeTab === "home" && (
          <div className="space-y-16 animate-fadeIn">
            
            {/* HERO BANNER SECTION (Image 1 Style + Slogan) */}
            <section className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Elora Beauty Colombo Studio" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-900/45 to-transparent"></div>
              
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-6 sm:px-12 max-w-xl text-white space-y-6">
                <div>
                  <span className="inline-flex items-center text-xs font-mono tracking-widest text-[#FCD34D] uppercase font-bold bg-amber-500/20 px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-[#FCD34D]" />
                    luxury salon EXPERIENCE
                  </span>
                  <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                    This Friday <span className="text-[#FCA5A5]">20% OFF</span> all Makeups!
                  </h1>
                  <p className="text-stone-300 text-xs sm:text-sm mt-3 leading-relaxed font-light">
                    Indulge in Colombo's premium hair care, luxury gel extensions, oxygen facials, and royalty bridal styling. Our master certified team awaits you.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleOpenBooking("")}
                    className="px-6 py-3 bg-[#C5A059] text-white font-bold text-sm rounded-full shadow-lg shadow-amber-950/20 hover:bg-[#AA823B] hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Book An Appointment
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById("footer");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm rounded-full text-center transition cursor-pointer"
                  >
                    Contact Hotlines
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK FEATURES BENTO (Looklike UI Image 1 category cards) */}
            <section className="space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-1">
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] tracking-tight">Our Specialized Treatments</h2>
                <p className="text-stone-500 text-xs font-light">Elora Beauty provides high-end skin care and styling using certified organic international products.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Hair Styling", desc: "Precision cuts, luxury balayage, Italian protective coloring", icon: Scissors, id: "hair-cut" },
                  { title: "Nail Art", desc: "Premium Russian manicure, gel extensions, bride details", icon: Hand, id: "nail-gel" },
                  { title: "Glamour Makeup", desc: "MAC & NARS brand makeup designed for Colombo climate", icon: SmilePlus, id: "pro-makeup" },
                  { title: "Organic Facials", desc: "Pure oxygen hydrating serums to cure urban pollution", icon: HeartHandshake, id: "skin-glow" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl border border-[#C5A059]/10 shadow-sm flex flex-col justify-between hover:border-[#C5A059]/40 transition group">
                    <div>
                      <div className="p-3 rounded-2xl bg-[#C5A059]/10 text-[#C5A059] w-fit group-hover:bg-[#C5A059] group-hover:text-white transition duration-300">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif font-bold text-sm text-[#1A1A1A] mt-4 leading-tight">{item.title}</h3>
                      <p className="text-stone-400 text-[10px] sm:text-xs mt-1 leading-snug">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleOpenBooking("")}
                      className="text-xs text-[#C5A059] font-bold hover:underline text-left mt-4 cursor-pointer"
                    >
                      Book Session →
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* OUR RECENLY WORK PORTFOLIO (Looklike UI Image 1 portfolio) */}
            <section className="bg-[#1A1A1A] border border-[#C5A059]/20 text-white rounded-3xl p-8 md:p-10 space-y-8 shadow-xl">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase font-bold">our recently work</span>
                <h2 className="font-serif text-3xl font-bold">Crafted Colombo Portfolios</h2>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto font-light">Pristine results recorded raw in our Kollupitiya beauty studio.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-64 rounded-2xl overflow-hidden border border-[#C5A059]/20 shadow-lg relative group">
                    <img 
                       src={portfolio1} 
                      alt="Sri Lankan Glamour Makeup result" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-stone-950/20"></div>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm">Colombo Evening Sensation Makeup</h4>
                    <span className="text-[10px] font-mono text-[#C5A059] block font-semibold">Category: Professional Glamour Makeup</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-64 rounded-2xl overflow-hidden border border-[#C5A059]/20 shadow-lg relative group">
                    <img 
                      src={portfolio2} 
                      alt="Nude Pink and gold foil nails" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-stone-950/20"></div>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm">Luxury Chic Nude Gold Gel Acrylic overlay</h4>
                    <span className="text-[10px] font-mono text-[#C5A059] block font-bold">Category: Russian Nails extensions</span>
                  </div>
                </div>
              </div>
            </section>

            {/* BRANCH PICKER DIRECT LINKS */}
            <section className="bg-white border border-[#C5A059]/10 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="font-mono text-xs font-bold text-[#C5A059] uppercase tracking-widest block">multi-branch convenient</span>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Choose Your Nearby Elora Studio</h3>
                <p className="text-stone-500 text-xs leading-relaxed font-light">
                  Our premises in Kollupitiya and Cinnamon Gardens feature comfortable waiting lounge areas, gate-guarded client parking space, and private styling rooms.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleOpenBooking("colombo-03")} 
                    className="px-4 py-2 bg-[#1A1A1A] rounded-lg text-xs font-semibold text-white uppercase hover:bg-[#C5A059] transition-colors cursor-pointer animate-fadeIn"
                  >
                    Kollupitiya (C3)
                  </button>
                  <button 
                    onClick={() => handleOpenBooking("colombo-07")} 
                    className="px-4 py-2 bg-[#1A1A1A] rounded-lg text-xs font-semibold text-white uppercase hover:bg-[#C5A059] transition-colors cursor-pointer animate-fadeIn"
                  >
                    Cinnamon Gardens (C7)
                  </button>
                </div>
              </div>
              <div className="space-y-3 bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs text-stone-704">
                <h4 className="font-serif font-bold text-[#1A1A1A]">Colombo Support Hotlines</h4>
                <p className="flex justify-between border-b pb-1"><span>Kollupitiya Galle Rd:</span> <span className="font-mono text-[#C5A059] font-bold">+94 11 255 5342</span></p>
                <p className="flex justify-between border-b pb-1"><span>Cinnamon Gardens Ward Pl:</span> <span className="font-mono text-[#C5A059] font-bold">+94 11 268 4828</span></p>
                <p className="flex justify-between"><span>WhatsApp Consultation:</span> <span className="font-mono text-[#059669] font-bold">+94 77 222 5342</span></p>
              </div>
            </section>

            {/* INTERACTIVE IN-PAGE CONTACT FORM (Saranjah, Section 5) */}
            <section className="bg-gradient-to-r from-stone-50 to-amber-50/10 border border-[#C5A059]/15 rounded-2xl p-6 md:p-8 max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Connect With Elora</h3>
                <p className="text-stone-500 text-xs font-light">Have custom styling inquiries? Send us a direct inbox inquiry.</p>
              </div>

              {cStatus && <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-bold">{cStatus}</p>}
              {cError && <p className="text-xs text-red-700 bg-red-50 border border-red-150 p-2.5 rounded-lg font-bold">{cError}</p>}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-xs"
                    placeholder="Minoli de Silva"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-xs"
                      placeholder="e.g. +94 77 822 5322"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-xs"
                      placeholder="minoli@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Message Detail *</label>
                  <textarea
                    required
                    value={cMessage}
                    onChange={(e) => setCMessage(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-xs"
                    placeholder="Enter details of your inquiry, date requested, bridal groups size..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-950 text-white font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {sendingMsg ? "Sending Message..." : "Send Inquiry"}
                </button>
              </form>
            </section>

          </div>
        )}

        {/* VIEW 2: SERVICES SECTION */}
        {activeTab === "services" && (
          <Services onSelectServiceForBooking={(sid) => handleOpenBooking("")} />
        )}

        {/* VIEW 3: STYLISTS SECTION */}
        {activeTab === "artists" && (
          <Artists onSelectArtistForBooking={(aid) => {
            setPreSelectedBranch("");
            setActiveTab("book_now");
          }} />
        )}

        {/* VIEW 4: PORTFOLIO / PREVIOUS WORK */}
        {activeTab === "work" && (
          <div className="space-y-12 py-4 animate-fadeIn">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Elora Visual Catalogue</h2>
              <p className="text-stone-500 text-sm font-light">Actual unedited outcomes from our Colombo beauty parlor rooms.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Nude pink gel manicure design", tag: "Nails Expert", seed: "ba1", img: portfolio2 },
                { title: "Colombo cocktail makeup application", tag: "Makeup Artist", seed: "ba2", img: portfolio1 },
                { title: "Italian protective balayage treatment", tag: "Hair Dresser", seed: "ba3", img: "https://picsum.photos/seed/balayagebeauty/500/500" },
                { title: "Royal Kandyan bride sari draping detail", tag: "Bridal Suite", seed: "ba4", img: "https://picsum.photos/seed/kandyanbridal/500/500" },
                { title: "Hydrated organic facial skin result", tag: "Skin Clinic", seed: "ba5", img: "https://picsum.photos/seed/facialsing/500/500" },
                { title: "Modern western bridal styling set", tag: "Bridal Suite", seed: "ba6", img: "https://picsum.photos/seed/weddingdressingsl/550/550" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-[#C5A059]/10 rounded-2xl overflow-hidden shadow-sm hover:border-[#C5A059]/30 transition-all">
                  <div className="h-56 bg-stone-100 overflow-hidden relative group">
                    <img 
                      src={item.img} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-350"
                    />
                  </div>
                  <div className="p-4 flex justify-between items-center bg-white border-t border-stone-100">
                    <h4 className="font-serif font-bold text-xs text-[#1A1A1A] leading-snug">{item.title}</h4>
                    <span className="text-[10px] text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded font-mono uppercase shrink-0 ml-2 font-bold">
                      {item.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: LOCATIONS GUIDES */}
        {activeTab === "locations" && (
          <Locations onSelectBranchForBooking={(bid) => handleOpenBooking(bid)} />
        )}

        {/* VIEW 6: TESTIMONIALS */}
        {activeTab === "reviews" && (
          <Reviews />
        )}

        {/* VIEW 7: SELF-SERVICE MANAGEMENT LOOKUP */}
        {activeTab === "manage" && (
          <ManageBookings />
        )}

        {/* VIEW 8: BOOK NOMINATION FLOW WIZARD */}
        {activeTab === "book_now" && (
          <BookingWizard 
            initialBranchId={preSelectedBranch} 
            onSuccess={(ref, pin) => {
              // Successfully booked
            }} 
          />
        )}

        {/* VIEW 9: STAFF ADMIN DOCK */}
        {activeTab === "admin" && (
          <AdminPanel />
        )}

      </main>

      {/* Footer */}
      <Footer 
        setActiveTab={setActiveTab} 
        onOpenBooking={() => handleOpenBooking("")} 
      />

    </div>
  );
}
