import React, {useEffect, useState} from "react";
import { MapPin, Phone, Mail, Instagram, Heart, Globe } from "lucide-react";
import {Branch, SiteSettings, WorkingHours} from "../types";

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  branches?: Branch[];
  settings?: SiteSettings | null;
}

export default function Footer({
  setActiveTab,
  onOpenBooking,
  branches = [],
  settings = null,
}: FooterProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);

  useEffect(() => {
    fetch("/api/working-hours")
      .then((response) => response.json())
      .then((hoursData) => setWorkingHours(Array.isArray(hoursData) ? hoursData : []));
  }, []);

  const firstSchedule = workingHours[0]?.schedule ?? [];
  const weekday = firstSchedule.find((day) => day.dayOfWeek === "Mon");
  const friday = firstSchedule.find((day) => day.dayOfWeek === "Fri");
  const sunday = firstSchedule.find((day) => day.dayOfWeek === "Sun");
  const formatHours = (schedule: typeof weekday) =>
    !schedule || schedule.isClosed ? "Closed" : `${schedule.openTime} - ${schedule.closeTime}`;

  return (
    <footer id="footer" className="bg-[#1A1A1A] text-stone-300 border-t-4 border-[#C5A059] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Intro */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="brand-mark brand-mark-footer">
                <span>E</span>
              </div>
              <span className="font-serif text-xl font-bold tracking-[-0.04em] text-white">
                Elora<span className="text-[#C5A059] font-sans font-semibold text-[0.68em] tracking-[0.18em] uppercase ml-1.5 align-middle">Beauty</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              {settings?.aboutDescription ||
                "Premium hair, makeup, nails, skin, and bridal care across our Colombo-area studios."}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={settings?.instagramUrl || "https://instagram.com"} target="_blank" rel="noreferrer" aria-label="Elora Beauty on Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-stone-400 transition-colors hover:bg-brand-gold hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={settings?.facebookUrl || "https://facebook.com"} target="_blank" rel="noreferrer" aria-label="Elora Beauty on Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-stone-400 transition-colors hover:bg-brand-gold hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                <Heart className="w-4 h-4" />
              </a>
              <a href={settings?.googleBusinessUrl || "https://google.com"} target="_blank" rel="noreferrer" aria-label="Elora Beauty Google business profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-stone-400 transition-colors hover:bg-brand-gold hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-white tracking-wide border-b border-stone-800 pb-2 text-md">Explore Our Suite</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => setActiveTab("services")} className="hover:text-[#C5A059] transition cursor-pointer text-left">
                  Services & Price Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("artists")} className="hover:text-[#C5A059] transition cursor-pointer text-left">
                  Premium Stylists Profiles
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("work")} className="hover:text-[#C5A059] transition cursor-pointer text-left">
                  Before-After Gallery
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("locations")} className="hover:text-[#C5A059] transition cursor-pointer text-left">
                  Locations & Map Guides
                </button>
              </li>
              <li>
                <button onClick={onOpenBooking} className="text-[#C5A059] font-medium hover:underline transition cursor-pointer text-left">
                  Reserve Appointment Now →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-white tracking-wide border-b border-stone-800 pb-2 text-md">Our Locations</h3>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C5A059] shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">
                    {branches.length ? `${branches.length} Elora Beauty ${branches.length === 1 ? "studio" : "studios"}` : "Elora Beauty studios"}
                  </h4>
                  <p>{branches.map((branch) => branch.city).join(", ") || "Colombo and nearby areas"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-1">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{branches[0]?.phone || "+94 11 255 5342"} (Hotline)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{settings?.contactEmail || "contact@elorabeauty.com"}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Timings */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-white tracking-wide border-b border-stone-800 pb-2 text-md">General Hours</h3>
            <div className="space-y-2 text-sm text-stone-400 font-mono">
              <div className="flex justify-between border-b border-stone-800 pb-1">
                <span>Monday - Thursday</span>
                <span>{formatHours(weekday)}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-1">
                <span>Friday - Saturday</span>
                <span className="text-[#C5A059]">{formatHours(friday)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>{formatHours(sunday)}</span>
              </div>
              <p className="text-[11px] text-[#C5A059] font-sans leading-snug pt-2">
                Check the Locations page for current branch-specific hours.
              </p>
            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-300">
          <p>© 2026 Elora Beauty Parlour (Colombo, Sri Lanka). All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <button onClick={() => setActiveTab("admin")} className="hover:text-[#C5A059] transition cursor-pointer flex items-center space-x-1">
              <span>Admin Portal Login</span>
            </button>
            <span>•</span>
            <span className="flex items-center">
              Made with <Heart className="w-3 h-3 text-[#C5A059] fill-[#C5A059] mx-1 inline" /> in Sri Lanka
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
