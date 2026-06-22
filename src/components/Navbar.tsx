import React from "react";
import { Sparkles, Calendar, Menu, X, Shield, PhoneCall } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenBooking }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Services & Prices", id: "services" },
    { label: "Stylists", id: "artists" },
    { label: "Our Work", id: "work" },
    { label: "Locations", id: "locations" },
    { label: "Reviews", id: "reviews" },
    { label: "My Booking", id: "manage" }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#C5A059]/15 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#AA823B] to-[#C5A059] shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">
                Elora<span className="text-[#C5A059] font-sans font-normal text-lg ml-1">Beauty</span>
              </span>
              <p className="text-[9px] font-mono tracking-widest text-[#C5A059] uppercase leading-none">Colombo Premier Spa</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? "text-[#C5A059] border-b-2 border-[#C5A059] pt-3 font-semibold"
                    : "text-stone-600 hover:text-[#C5A059]"
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => setActiveTab("admin")}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                activeTab === "admin" ? "bg-[#C5A059]/15 text-[#C5A059]" : "text-stone-400 hover:text-[#C5A059]"
              }`}
              title="Staff Portal"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenBooking}
              className="inline-flex items-center px-5 py-2.5 bg-[#C5A059] text-white rounded-full text-sm font-medium hover:bg-[#AA823B] hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-amber-900/15 cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-stone-600 hover:text-[#C5A059] focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#C5A059]/15 shadow-inner px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
               key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-[#C5A059]/15 text-[#C5A059]"
                  : "text-stone-700 hover:bg-[#C5A059]/5 hover:text-[#C5A059]"
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => {
              setActiveTab("admin");
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 rounded-xl text-stone-700 hover:bg-[#C5A059]/5 hover:text-[#C5A059] text-base font-medium"
          >
            <Shield className="w-5 h-5 mr-2 text-stone-400" />
            Staff Administrative Area
          </button>

          <div className="pt-4 px-4">
            <button
              onClick={() => {
                onOpenBooking();
                setIsOpen(false);
              }}
              className="flex justify-center items-center w-full py-4 px-6 bg-[#C5A059] text-white font-medium rounded-full hover:bg-[#AA823B] transition"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Nomination Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
