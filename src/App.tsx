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
import Gallery from "./components/Gallery";
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
            
            {/* HERO BANNER SECTION (Dark makeup-shop style using Elora colours) */}
            <section className="relative left-1/2 -mt-8 min-h-[calc(100vh-5rem)] w-screen -translate-x-1/2 overflow-hidden border-y border-[#C5A059]/30 bg-[#050505] shadow-2xl">
              <img
                src={heroImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-[0.18] mix-blend-screen saturate-[0.78]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.94)_0%,rgba(5,5,5,0.82)_38%,rgba(5,5,5,0.68)_100%),radial-gradient(circle_at_72%_42%,rgba(197,160,89,0.24),transparent_32%)]"></div>
              <div className="absolute inset-0 hero-dark-texture"></div>
              <div className="hero-outline-square left-[36%] top-[9%]"></div>

              <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[0.82fr_1fr] lg:px-14 xl:grid-cols-[0.78fr_0.82fr_0.95fr]">
                <div className="space-y-7 text-center animate-heroContent lg:text-left">
                  <div className="mx-auto flex w-fit items-center gap-3 lg:mx-0">
                    <div className="brand-mark brand-mark-footer">
                      <span>E</span>
                    </div>
                    <div className="text-left leading-none">
                      <p className="font-serif text-lg font-bold tracking-[-0.04em] text-white">
                        Elora<span className="ml-1.5 font-sans text-[0.68em] font-semibold uppercase tracking-[0.2em] text-[#C5A059] align-middle">Beauty</span>
                      </p>
                      <p className="mt-1 text-[8px] font-mono uppercase tracking-[0.24em] text-stone-400">Make-up & Salon</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-serif text-2xl italic tracking-wide text-white sm:text-3xl">
                      Blend Beauty in You!
                    </p>
                    <h1 className="font-sans text-6xl font-extrabold uppercase leading-[0.9] tracking-[-0.07em] text-[#C5A059] sm:text-7xl lg:text-8xl">
                      Beauty<br />Salon
                    </h1>
                  </div>

                  <div className="mx-auto flex w-fit items-center gap-3 text-white lg:mx-0">
                    {[Instagram, Phone, Mail].map((Icon, index) => (
                      <span key={index} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/5">
                        <Icon className="h-4 w-4" />
                      </span>
                    ))}
                  </div>

                  <div className="hero-line mx-auto lg:mx-0"></div>

                  <div className="mx-auto max-w-xs space-y-4 lg:mx-0">
                    <div className="hero-frame-label">
                      Make-up & Cosmetic
                    </div>
                    <p className="text-xs leading-relaxed text-stone-400">
                      Premium Colombo beauty care for makeup, hair, nails, skin, and bridal styling — crafted with certified Elora artists.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenBooking("")}
                    className="group relative overflow-hidden rounded-full bg-[#C5A059] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#C5A059]/20 transition-all hover:bg-[#AA823B] hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <span className="absolute inset-y-0 -left-10 w-8 rotate-12 bg-white/30 blur-sm transition-all duration-700 group-hover:left-[115%]"></span>
                    <span className="relative">Book Appointment</span>
                  </button>
                </div>

                <div className="relative mx-auto flex min-h-[360px] w-full items-center justify-center animate-heroContent lg:min-h-[520px]">
                  <div className="hero-diamond-frame">
                    <div className="hero-diamond-photo">
                      <img
                        src="/images/bridal-makeup-hero.png"
                        alt="Bridal makeup service at Elora Beauty"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative hidden min-h-[520px] items-center justify-center animate-heroContent xl:flex">
                  <div className="relative h-[430px] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-[#C5A059]/75 bg-[radial-gradient(circle_at_24%_20%,rgba(250,246,244,0.13),transparent_24%),radial-gradient(circle_at_76%_74%,rgba(197,160,89,0.24),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.07),rgba(197,160,89,0.05)_42%,rgba(5,5,5,0.24))] p-6 shadow-[0_28px_90px_rgba(197,160,89,0.18)]">
                    <div className="absolute inset-3 rounded-[1.55rem] border border-white/18"></div>
                    <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full border border-[#C5A059]/35"></div>
                    <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full border border-[#C5A059]/25"></div>

                    <div className="absolute left-8 top-10 h-28 w-28">
                      {[0, 1, 2, 3].map((petal) => (
                        <span
                          key={petal}
                          className="absolute left-1/2 top-1/2 h-14 w-7 origin-bottom rounded-full bg-gradient-to-b from-[#FAF6F4]/80 to-[#C5A059]/55"
                          style={{ transform: `translate(-50%, -100%) rotate(${petal * 90}deg)` }}
                        ></span>
                      ))}
                      <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C5A059] shadow-[0_0_26px_rgba(197,160,89,0.72)]"></span>
                    </div>

                    <div className="absolute bottom-12 right-10 h-36 w-36">
                      {[0, 1, 2, 3, 4].map((petal) => (
                        <span
                          key={petal}
                          className="absolute left-1/2 top-1/2 h-16 w-8 origin-bottom rounded-full bg-gradient-to-b from-white/70 to-[#AA823B]/60"
                          style={{ transform: `translate(-50%, -100%) rotate(${petal * 72}deg)` }}
                        ></span>
                      ))}
                      <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C5A059] bg-[#050505]"></span>
                    </div>

                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="ml-auto grid grid-cols-2 gap-3">
                        {[Sparkles, SmilePlus, Scissors, Hand].map((Icon, index) => (
                          <span
                            key={index}
                            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] text-[#C5A059] shadow-lg shadow-black/20 backdrop-blur-sm"
                          >
                            <Icon className="h-6 w-6" />
                          </span>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div className="h-px w-40 bg-gradient-to-r from-[#C5A059] via-white/55 to-transparent"></div>
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full bg-[#C5A059]"></span>
                          <span className="h-3 w-16 rounded-full border border-[#C5A059]/60"></span>
                          <span className="h-3 w-3 rounded-full bg-white/60"></span>
                        </div>
                      </div>
                    </div>
                  </div>
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

            {/* GALLERY, REVIEWS AND LOCATIONS */}
            <Gallery />
            <Reviews />
            <Locations onSelectBranchForBooking={(bid) => handleOpenBooking(bid)} />

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
          <Gallery />
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
