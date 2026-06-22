import React from "react";
import { Sparkles, MapPin, Phone, Mail, Clock, Instagram, Heart, Globe } from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
}

export default function Footer({ setActiveTab, onOpenBooking }: FooterProps) {
  return (
    <footer id="footer" className="bg-[#1A1A1A] text-stone-300 border-t-4 border-[#C5A059] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Intro */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#AA823B] to-[#C5A059] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Elora<span className="text-[#C5A059] font-sans font-normal text-sm ml-1">Beauty</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Experience the pinnacle of luxury guest styling and modern organic treatments, designed exclusively to enhance your authentic confidence in Colombo.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-stone-850 flex items-center justify-center hover:bg-[#C5A059] hover:text-[#1A1A1A] transition-colors cursor-pointer text-stone-400">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-stone-850 flex items-center justify-center hover:bg-[#C5A059] hover:text-[#1A1A1A] transition-colors cursor-pointer text-stone-400">
                <Heart className="w-4 h-4" />
              </a>
              <a href="https://google.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-stone-850 flex items-center justify-center hover:bg-[#C5A059] hover:text-[#1A1A1A] transition-colors cursor-pointer text-stone-400">
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
            <h3 className="font-serif font-semibold text-white tracking-wide border-b border-stone-800 pb-2 text-md">Colombo Studios</h3>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C5A059] shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">Kollupitiya Branch:</h4>
                  <p>82 Galle Road, Colombo 03</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C5A059] shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">Cinnamon Gardens Branch:</h4>
                  <p>14 Ward Place, Colombo 07</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-1">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+94 11 255 5342 (Hotline)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>contact@elorabeauty.com</span>
              </div>
            </div>
          </div>

          {/* Column 4: Timings */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-white tracking-wide border-b border-stone-800 pb-2 text-md">General Hours</h3>
            <div className="space-y-2 text-sm text-stone-400 font-mono">
              <div className="flex justify-between border-b border-stone-800 pb-1">
                <span>Monday - Thursday</span>
                <span>09:00 - 19:30</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-1">
                <span>Friday - Saturday</span>
                <span className="text-[#C5A059]">09:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday (C3 only)</span>
                <span>10:00 - 18:00</span>
              </div>
              <p className="text-[11px] text-[#C5A059] font-sans leading-snug pt-2">
                * Note: Our Cinnamon Gardens branch remains fully closed on Sundays.
              </p>
            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500">
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
