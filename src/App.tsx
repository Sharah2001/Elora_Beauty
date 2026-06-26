"use client";

import React, {Suspense, lazy, useState, useEffect} from "react";
import Image from "next/image";
import { 
  ArrowRight, Calendar, Facebook, Instagram, MessageSquareText, Scissors, Hand, HeartHandshake, SmilePlus, Star
} from "lucide-react";
import Navbar from "./components/Navbar";
import About from "./components/About";
import DeferredSection from "./components/ui/DeferredSection";
import LoadingSkeleton from "./components/ui/LoadingSkeleton";
import {Branch, SiteSettings} from "./types";

const BookingWizard = lazy(() => import("./components/BookingWizard"));
const Services = lazy(() => import("./components/Services"));
const Artists = lazy(() => import("./components/Artists"));
const Gallery = lazy(() => import("./components/Gallery"));
const Locations = lazy(() => import("./components/Locations"));
const Reviews = lazy(() => import("./components/Reviews"));
const ManageBookings = lazy(() => import("./components/ManageBookings"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const Faq = lazy(() => import("./components/Faq"));
const Footer = lazy(() => import("./components/Footer"));

interface AppProps {
  initialSiteSettings?: SiteSettings | null;
  initialBranches?: Branch[];
}

type BookingDefaults = {
  branchId?: string;
  serviceIds?: string[];
  artistId?: string;
};

export default function App({
  initialSiteSettings = null,
  initialBranches = [],
}: AppProps) {
  // Routes: "home" | "services" | "artists" | "work" | "locations" | "reviews" | "manage" | "admin" | "book_now"
  const [activeTab, setActiveTab] = useState<string>("home");

  // Pre-selected parameters for booking flow launcher
  const [siteSettings] = useState<SiteSettings | null>(initialSiteSettings);
  const [branches] = useState<Branch[]>(initialBranches);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [bookingDefaults, setBookingDefaults] = useState<BookingDefaults>({});
  
  // Contact form state
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cMessage, setCMessage] = useState("");
  const [cStatus, setCStatus] = useState("");
  const [cError, setCError] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    const savedBranch = window.localStorage.getItem("elora-preferred-branch") || "";
    if (savedBranch && branches.some((branch) => branch.id === savedBranch)) {
      setSelectedBranch(savedBranch);
    }
  }, [branches]);

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

  const handleOpenBooking = (defaults: BookingDefaults = {}) => {
    const branchId = defaults.branchId ?? selectedBranch;
    if (branchId && branchId !== selectedBranch) {
      handleSelectBranch(branchId);
    }

    setBookingDefaults({
      branchId,
      serviceIds: defaults.serviceIds ?? [],
      artistId: defaults.artistId ?? "any",
    });
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

  const heroTitle = siteSettings?.heroTitle?.trim() || "Where Beauty Meets Artistry";
  const heroTitleWords = heroTitle.split(/\s+/);
  const heroTitleMain =
    heroTitleWords.length > 2 ? heroTitleWords.slice(0, -2).join(" ") : heroTitle;
  const heroTitleAccent = heroTitleWords.length > 2 ? heroTitleWords.slice(-2).join(" ") : "";
  const defaultHeroBackgroundImage = "/images/elora-hero-salon-luxury.jpg";
  const heroBackgroundImage =
    siteSettings?.heroBackgroundImage?.includes("floral-beauty-editorial") ||
    siteSettings?.heroBackgroundImage?.endsWith("elora-hero-salon-luxury.png")
      ? defaultHeroBackgroundImage
      : siteSettings?.heroBackgroundImage || defaultHeroBackgroundImage;

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
              <Image
                src={heroBackgroundImage}
                alt=""
                fill
                priority
                fetchPriority="high"
                quality={62}
                sizes="100vw"
                className="hero-reference-bg"
              />
              <div className="hero-reference-grid relative z-10 mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 sm:px-10 lg:min-h-[720px] lg:grid-cols-[0.12fr_1fr_0.34fr] lg:px-14 lg:py-16 xl:px-20">
                <div className="hidden lg:block" aria-hidden="true"></div>

                <div className="hero-reference-copy mx-auto w-full max-w-3xl text-center">
                  <div className="hero-reference-status mx-auto">
                    <span></span>
                    Now accepting new clients
                  </div>

                  <div className="hero-reference-eyebrow mx-auto">
                    {siteSettings?.heroEyebrow || "Hair · Makeup · Nails · Skin · Bridal"}
                  </div>

                  <h1 className="hero-reference-title">
                    {heroTitleMain}
                    {heroTitleAccent && <span>{heroTitleAccent}</span>}
                  </h1>

                  <p className="hero-reference-description">
                    {siteSettings?.heroDescription ||
                      "Premium hair, makeup, nails, skin care and bridal styling across Colombo, delivered by experienced artists with calm precision and polished, photo-ready results."}
                  </p>

                  <p className="hero-reference-trust-line">
                    {siteSettings?.heroTrustLine ||
                      "Trusted by brides, professionals and beauty lovers across Colombo."}
                  </p>

                  <div className="hero-reference-actions">
                    <button
                      onClick={() => handleOpenBooking()}
                      className="hero-reference-primary"
                    >
                      <Calendar className="h-4 w-4" />
                      {siteSettings?.heroButtonLabel || "Book Appointment"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("services")}
                      className="hero-reference-secondary"
                    >
                      Our Services
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="hero-reference-badges" aria-label="Elora Beauty trust highlights">
                    {[
                      {label: "Certified Artists", icon: Scissors},
                      {label: "Six Colombo Studios", icon: HeartHandshake},
                      {label: "Online Booking", icon: Calendar},
                    ].map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <span key={badge.label}>
                          <Icon className="h-3.5 w-3.5" />
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="hero-reference-stats">
                    {[
                      {value: "12+", label: "Years Experience"},
                      {value: "5K+", label: "Happy Clients"},
                      {value: "4.9", label: "Average Rating"},
                    ].map((item, index) => (
                      <div key={item.label} className="hero-reference-stat">
                        <strong>
                          {item.value}
                          {index === 2 && <Star className="h-5 w-5 fill-current" />}
                        </strong>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {(siteSettings?.instagramUrl || siteSettings?.facebookUrl) && (
                    <div className="hero-reference-social">
                      <span>
                        Follow Elora
                      </span>
                      {siteSettings.instagramUrl && (
                        <a
                          href={siteSettings.instagramUrl}
	                      target="_blank"
	                      rel="noreferrer"
	                      aria-label="Visit Elora Beauty on Instagram"
	                      className="hero-reference-social-link"
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
	                      className="hero-reference-social-link"
	                    >
	                      <Facebook className="h-4 w-4" />
	                    </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="hero-reference-feature">
                  <div className="hero-reference-review">
                    <div className="hero-reference-review-image">
                      <Image
                        src={
                          siteSettings?.heroImage?.endsWith("bridal-makeup-hero.png")
                            ? "/images/bridal-makeup-hero.jpg"
                            : siteSettings?.heroImage || "/images/bridal-makeup-hero.jpg"
                        }
                        alt={siteSettings?.heroImageAlt || "Finished bridal makeup at Elora Beauty"}
                        fill
                        quality={64}
                        sizes="(max-width: 1023px) 78vw, 20vw"
                      />
                    </div>
                    <div className="hero-reference-review-stars" aria-label="Five star review">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p>
                      “The team made my bridal appointment feel calm, elegant and effortless. The finish stayed flawless all day.”
                    </p>
                    <div className="hero-reference-review-client">
                      <Image
                        src="/images/artists/elora-jayawardena.png"
                        alt=""
                        width={42}
                        height={42}
                      />
                      <span>
                        <strong>Elora Client</strong>
                        Bridal appointment
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <About settings={siteSettings} />

            {/* QUICK FEATURES BENTO (Looklike UI Image 1 category cards) */}
            <section className="content-auto space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-1">
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] tracking-tight">Our Specialized Treatments</h2>
                <p className="text-xs font-normal text-stone-600">Elora Beauty provides high-end skin care and styling using certified organic international products.</p>
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
                      <div className="w-fit rounded-2xl bg-brand-gold-soft p-3 text-brand-gold-dark transition duration-300 group-hover:bg-brand-gold-dark group-hover:text-white">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif font-bold text-sm text-[#1A1A1A] mt-4 leading-tight">{item.title}</h3>
                      <p className="mt-1 text-[10px] leading-snug text-stone-600 sm:text-xs">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleOpenBooking()}
                      className="mt-4 text-left text-xs font-bold text-brand-gold-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-dark"
                    >
                      Book Session →
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* GALLERY, REVIEWS AND LOCATIONS */}
            <DeferredSection fallback={<LoadingSkeleton count={3} />}>
              <Suspense fallback={<LoadingSkeleton count={3} />}>
                <Gallery
                  preview
                  onViewMore={() => {
                    setActiveTab("work");
                    window.scrollTo({top: 0, behavior: "smooth"});
                  }}
                />
              </Suspense>
            </DeferredSection>
            <DeferredSection fallback={<LoadingSkeleton count={3} />}>
              <Suspense fallback={<LoadingSkeleton count={3} />}>
                <Reviews showForm={false} />
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reviews");
                      window.scrollTo({top: 0, behavior: "smooth"});
                    }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-gold/30 bg-white px-6 text-sm font-semibold text-brand-gold-dark shadow-sm transition hover:border-brand-gold hover:bg-brand-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <MessageSquareText className="h-4 w-4" />
                    Write a Review
                  </button>
                </div>
              </Suspense>
            </DeferredSection>
            <DeferredSection fallback={<LoadingSkeleton count={2} className="lg:grid-cols-2" />}>
              <Suspense fallback={<LoadingSkeleton count={2} className="lg:grid-cols-2" />}>
                <Locations
                  selectedBranchId={selectedBranch}
                  onSelectBranch={handleSelectBranch}
                  onSelectBranchForBooking={(branchId) => handleOpenBooking({branchId})}
                />
              </Suspense>
            </DeferredSection>
            <DeferredSection fallback={<LoadingSkeleton count={3} className="grid-cols-1" />}>
              <Suspense fallback={<LoadingSkeleton count={3} className="grid-cols-1" />}>
                <Faq />
              </Suspense>
            </DeferredSection>

            {/* INTERACTIVE IN-PAGE CONTACT FORM (Saranjah, Section 5) */}
            <section className="bg-gradient-to-r from-stone-50 to-amber-50/10 border border-[#C5A059]/15 rounded-2xl p-6 md:p-8 max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Connect With Elora</h3>
                <p className="text-stone-500 text-xs font-light">Have custom styling inquiries? Send us a direct inbox inquiry.</p>
              </div>

              {cStatus && <p role="status" aria-live="polite" className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-bold">{cStatus}</p>}
              {cError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">{cError}</p>}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Your Full Name *</label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
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
                    <label htmlFor="contact-phone" className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Phone Number *</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-xs"
                      placeholder="e.g. +94 77 822 5322"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Email Address</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-xs"
                      placeholder="minoli@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-[10px] font-bold uppercase tracking-wide text-stone-700 mb-1">Message Detail *</label>
                  <textarea
                    id="contact-message"
                    name="message"
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
          <Suspense fallback={<LoadingSkeleton count={6} />}>
            <Services
              selectedBranchId={selectedBranch}
              onSelectServiceForBooking={(serviceIds) => handleOpenBooking({serviceIds})}
            />
          </Suspense>
        )}

        {/* VIEW 3: STYLISTS SECTION */}
        {activeTab === "artists" && (
          <Suspense fallback={<LoadingSkeleton count={6} />}>
            <Artists
              selectedBranchId={selectedBranch}
              onSelectArtistForBooking={(artistId) => handleOpenBooking({artistId})}
            />
          </Suspense>
        )}

        {/* VIEW 4: PORTFOLIO / PREVIOUS WORK */}
        {activeTab === "work" && (
          <Suspense fallback={<LoadingSkeleton count={9} />}>
            <Gallery />
          </Suspense>
        )}

        {/* VIEW 5: LOCATIONS GUIDES */}
        {activeTab === "locations" && (
          <Suspense fallback={<LoadingSkeleton count={2} className="lg:grid-cols-2" />}>
            <Locations
              selectedBranchId={selectedBranch}
              onSelectBranch={handleSelectBranch}
              onSelectBranchForBooking={(branchId) => handleOpenBooking({branchId})}
            />
          </Suspense>
        )}

        {/* VIEW 6: TESTIMONIALS */}
        {activeTab === "reviews" && (
          <Suspense fallback={<LoadingSkeleton count={3} />}>
            <Reviews />
          </Suspense>
        )}

        {/* VIEW 7: SELF-SERVICE MANAGEMENT LOOKUP */}
        {activeTab === "manage" && (
          <Suspense fallback={<LoadingSkeleton count={2} />}>
            <ManageBookings />
          </Suspense>
        )}

        {/* VIEW 8: BOOK NOMINATION FLOW WIZARD */}
        {activeTab === "book_now" && (
          <Suspense fallback={<LoadingSkeleton count={2} />}>
            <BookingWizard
              initialBranchId={bookingDefaults.branchId}
              initialServiceIds={bookingDefaults.serviceIds}
              initialArtistId={bookingDefaults.artistId}
            />
          </Suspense>
        )}

        {/* VIEW 9: STAFF ADMIN DOCK */}
        {activeTab === "admin" && (
          <Suspense fallback={<LoadingSkeleton count={3} />}>
            <AdminPanel />
          </Suspense>
        )}

      </main>

      {/* Footer */}
      <DeferredSection
        rootMargin="300px"
        minHeight={360}
        fallback={<div className="min-h-[360px] bg-brand-ink" aria-hidden="true" />}
      >
        <Suspense fallback={<div className="min-h-[360px] bg-brand-ink" aria-hidden="true" />}>
          <Footer
            setActiveTab={setActiveTab}
            onOpenBooking={() => handleOpenBooking()}
            branches={branches}
            settings={siteSettings}
          />
        </Suspense>
      </DeferredSection>

    </div>
  );
}
