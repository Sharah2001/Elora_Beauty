import React, { useState, useEffect } from "react";
import { 
  Facebook, Instagram, MessageCircle, Phone, Scissors, Hand, HeartHandshake, SmilePlus
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
            
            {/* HERO BANNER SECTION */}
            <section className="hero-reference relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden bg-black">
              <div className="hero-reference-right" aria-hidden="true">
                <img src="/images/makeup-showcase.jpg" alt="" />
              </div>

              <div className="hero-reference-grid relative z-10 mx-auto grid min-h-[640px] max-w-[1440px] grid-cols-1 items-center px-6 py-10 sm:px-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[0.82fr_1.08fr_0.8fr] lg:px-14 lg:py-8 xl:px-20">
                <div className="hero-reference-copy relative z-20 mx-auto w-full max-w-md text-center lg:mx-0 lg:text-left">
                  <div className="mx-auto flex w-fit items-center gap-3 lg:mx-0">
                    <div className="brand-mark brand-mark-hero">
                      <span>E</span>
                    </div>
                    <div className="text-left leading-none">
                      <p className="font-serif text-xl font-bold text-white">
                        Elora <span className="font-sans text-xs uppercase tracking-[0.24em] text-[#C5A059]">Beauty</span>
                      </p>
                      <p className="mt-1.5 text-[8px] uppercase tracking-[0.28em] text-stone-400">
                        Colombo Premier Salon
                      </p>
                    </div>
                  </div>

                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#C5A059]">
                    Hair · Makeup · Nails · Skin · Bridal
                  </p>

                  <h1 className="mt-4 font-sans text-6xl font-extrabold uppercase leading-[0.86] text-[#C5A059] sm:text-7xl lg:text-[4.8rem] xl:text-[5.1rem]">
                    Signature
                    <span className="block">Beauty</span>
                  </h1>

                  <p className="mt-5 max-w-sm font-serif text-2xl italic leading-tight text-white sm:text-[1.7rem]">
                    Personal care. Polished results.
                  </p>

                  <div className="mt-5 flex justify-center gap-3 lg:justify-start">
                    {[
                      {label: "Instagram", icon: Instagram},
                      {label: "Facebook", icon: Facebook},
                      {label: "Call Elora Beauty", icon: Phone},
                      {label: "WhatsApp", icon: MessageCircle},
                    ].map(({label, icon: Icon}) => (
                      <button
                        key={label}
                        type="button"
                        title={label}
                        aria-label={label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/65 text-white transition hover:border-[#C5A059] hover:bg-[#C5A059] cursor-pointer"
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-[10px] uppercase tracking-[0.32em] text-stone-400">
                    Colombo · Sri Lanka
                  </p>

                  <div className="hero-reference-line mt-6"></div>

                  <div className="hero-reference-label mt-9">
                    Premium Salon Services
                  </div>

                  <p className="mt-5 max-w-sm text-sm leading-5 text-stone-400">
                    Tailored beauty treatments delivered by experienced artists at our
                    Kollupitiya and Cinnamon Gardens studios.
                  </p>

                  <button
                    onClick={() => handleOpenBooking("")}
                    className="mt-5 min-h-11 border border-[#C5A059] bg-[#C5A059] px-8 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:border-[#AA823B] hover:bg-[#AA823B] cursor-pointer"
                  >
                    Book Appointment
                  </button>
                </div>

                <div className="hero-reference-center relative z-20 mx-auto mt-14 flex w-full items-center justify-center lg:mt-0">
                  <div className="hero-reference-diamond">
                    <div className="hero-reference-diamond-image">
                      <img
                        src="/images/bridal-makeup-hero.png"
                        alt="Elora Beauty bridal makeup service"
                      />
                    </div>
                  </div>
                  <div className="hero-reference-shape hero-reference-shape-top" aria-hidden="true"></div>
                  <div className="hero-reference-shape hero-reference-shape-bottom" aria-hidden="true"></div>
                </div>

                <div className="hidden lg:block" aria-hidden="true"></div>
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
