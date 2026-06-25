import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ArrowRight, Check, Facebook, Instagram, MapPin, Scissors, Hand, HeartHandshake, SmilePlus
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
import About from "./components/About";
import Faq from "./components/Faq";
import {Branch, SiteSettings} from "./types";

export default function App() {
  // Routes: "home" | "services" | "artists" | "work" | "locations" | "reviews" | "manage" | "admin" | "book_now"
  const [activeTab, setActiveTab] = useState<string>("home");

  // Pre-selected parameters for booking flow launcher
  const [preSelectedBranch, setPreSelectedBranch] = useState("");
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  
  // Contact form state
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cMessage, setCMessage] = useState("");
  const [cStatus, setCStatus] = useState("");
  const [cError, setCError] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/site-settings").then((response) => response.json()),
      fetch("/api/branches").then((response) => response.json()),
    ]).then(([settingsData, branchData]) => {
      setSiteSettings(settingsData || null);
      setBranches(Array.isArray(branchData) ? branchData : []);
      const savedBranch = window.localStorage.getItem("elora-preferred-branch") || "";
      if (savedBranch && branchData.some((branch: Branch) => branch.id === savedBranch)) {
        setSelectedBranch(savedBranch);
      }
    });
  }, []);

  useEffect(() => {
    document.title =
      siteSettings?.seoTitle ||
      "Elora Beauty | Colombo Premium Multi-Branch Hair, Nails & Bridal Parlour";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        siteSettings?.seoDescription ||
          "Elora Beauty Parlour Colombo. Professional hair, nails, makeup, skin care, and bridal styling.",
      );
    }
  }, [activeTab, siteSettings]);

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    if (branchId) {
      window.localStorage.setItem("elora-preferred-branch", branchId);
    } else {
      window.localStorage.removeItem("elora-preferred-branch");
    }
  };

  const handleOpenBooking = (branchId = selectedBranch) => {
    setPreSelectedBranch(branchId || selectedBranch);
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

  const heroTitle = siteSettings?.heroTitle || "Signature Beauty";
  const [heroTitleFirst, ...heroTitleRest] = heroTitle.split(" ");

  return (
    <div className="min-h-screen bg-[#FAF6F4] text-stone-900 font-sans flex flex-col justify-between">
      
      {/* Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenBooking={() => handleOpenBooking()}
        branches={branches}
        selectedBranchId={selectedBranch}
        onSelectBranch={handleSelectBranch}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* VIEW 1: HOME PAGE (Looklike UI Image 1 Combined style) */}
        {activeTab === "home" && (
          <div className="space-y-16 animate-fadeIn">
            
            {/* HERO BANNER SECTION */}
            <section className="hero-reference relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden">
              <div className="hero-reference-right" aria-hidden="true">
                <Image
                  src="/images/makeup-showcase.jpg"
                  alt=""
                  fill
                  priority
                  sizes="48vw"
                />
              </div>

              <div className="hero-reference-grid relative z-10 mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-16 sm:px-10 lg:min-h-[680px] lg:grid-cols-[0.82fr_1.08fr_0.8fr] lg:px-14 lg:py-14 xl:px-20">
                <div className="hero-reference-copy mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
                  <div className="hero-reference-eyebrow mx-auto lg:mx-0">
                    <span></span>
                    {siteSettings?.heroEyebrow || "Hair · Makeup · Nails · Skin · Bridal"}
                  </div>

                  <h1 className="mt-7 font-serif text-[3.5rem] font-medium leading-[0.94] tracking-[-0.045em] text-white sm:text-7xl lg:text-[5.35rem]">
                    {heroTitleFirst}
                    <span className="block text-[#D3AD63]">{heroTitleRest.join(" ")}</span>
                  </h1>

                  <p className="mx-auto mt-7 max-w-lg text-base font-light leading-7 text-stone-300 lg:mx-0 lg:text-lg">
                    {siteSettings?.heroDescription ||
                      "Personalised beauty care, refined by experienced artists and delivered with thoughtful attention to every detail."}
                  </p>

                  <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                    <button
                      onClick={() => handleOpenBooking()}
                      className="group inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#C5A059] px-7 text-sm font-semibold text-white transition hover:bg-[#AA823B] sm:w-auto cursor-pointer"
                    >
                      {siteSettings?.heroButtonLabel || "Book Appointment"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("services")}
                      className="inline-flex min-h-12 w-full items-center justify-center border border-white/25 px-7 text-sm font-medium text-white transition hover:border-[#C5A059] hover:text-[#D3AD63] sm:w-auto cursor-pointer"
                    >
                      Explore Services
                    </button>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:flex sm:gap-8">
                    {[
                      "Certified beauty artists",
                      "Studios across Colombo",
                    ].map((item, index) => (
                      <div key={item} className="flex items-center justify-center gap-2 text-left lg:justify-start">
                        {index === 0 ? (
                          <Check className="h-4 w-4 shrink-0 text-[#D3AD63]" />
                        ) : (
                          <MapPin className="h-4 w-4 shrink-0 text-[#D3AD63]" />
                        )}
                        <span className="text-xs leading-5 text-stone-400">{item}</span>
                      </div>
                    ))}
                  </div>

                  {(siteSettings?.instagramUrl || siteSettings?.facebookUrl) && (
                    <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Follow Elora
                      </span>
                      {siteSettings.instagramUrl && (
                        <a
                          href={siteSettings.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Visit Elora Beauty on Instagram"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-stone-300 transition hover:border-brand-gold hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                      {siteSettings.facebookUrl && (
                        <a
                          href={siteSettings.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Visit Elora Beauty on Facebook"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-stone-300 transition hover:border-brand-gold hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="hero-reference-center relative z-20 mx-auto flex w-full items-center justify-center">
                  <div className="hero-reference-diamond">
                    <div className="hero-reference-diamond-image">
                      <Image
                        src={siteSettings?.heroImage || "/images/bridal-makeup-hero.png"}
                        alt={siteSettings?.heroImageAlt || "Bridal makeup artistry at Elora Beauty"}
                        fill
                        priority
                        sizes="(max-width: 1023px) 68vw, 32vw"
                      />
                    </div>
                  </div>
                  <div className="hero-reference-shape hero-reference-shape-top" aria-hidden="true"></div>
                  <div className="hero-reference-shape hero-reference-shape-bottom" aria-hidden="true"></div>
                </div>

                <div className="hidden lg:block" aria-hidden="true"></div>
              </div>
            </section>

            <About settings={siteSettings} />

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
                      onClick={() => handleOpenBooking()}
                      className="text-xs text-[#C5A059] font-bold hover:underline text-left mt-4 cursor-pointer"
                    >
                      Book Session →
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* GALLERY, REVIEWS AND LOCATIONS */}
            <Gallery
              preview
              onViewMore={() => {
                setActiveTab("work");
                window.scrollTo({top: 0, behavior: "smooth"});
              }}
            />
            <Reviews />
            <Locations
              selectedBranchId={selectedBranch}
              onSelectBranch={handleSelectBranch}
              onSelectBranchForBooking={(bid) => handleOpenBooking(bid)}
            />
            <Faq />

            {/* INTERACTIVE IN-PAGE CONTACT FORM (Saranjah, Section 5) */}
            <section className="bg-gradient-to-r from-stone-50 to-amber-50/10 border border-[#C5A059]/15 rounded-2xl p-6 md:p-8 max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Connect With Elora</h3>
                <p className="text-stone-500 text-xs font-light">Have custom styling inquiries? Send us a direct inbox inquiry.</p>
              </div>

              {cStatus && <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-bold">{cStatus}</p>}
              {cError && <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">{cError}</p>}

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
          <Services
            selectedBranchId={selectedBranch}
            onSelectServiceForBooking={() => handleOpenBooking()}
          />
        )}

        {/* VIEW 3: STYLISTS SECTION */}
        {activeTab === "artists" && (
          <Artists selectedBranchId={selectedBranch} onSelectArtistForBooking={(aid) => {
            setPreSelectedBranch(selectedBranch);
            setActiveTab("book_now");
          }} />
        )}

        {/* VIEW 4: PORTFOLIO / PREVIOUS WORK */}
        {activeTab === "work" && (
          <Gallery />
        )}

        {/* VIEW 5: LOCATIONS GUIDES */}
        {activeTab === "locations" && (
          <Locations
            selectedBranchId={selectedBranch}
            onSelectBranch={handleSelectBranch}
            onSelectBranchForBooking={(bid) => handleOpenBooking(bid)}
          />
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
        onOpenBooking={() => handleOpenBooking()}
      />

    </div>
  );
}
