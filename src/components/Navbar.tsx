import React from "react";
import Image from "next/image";
import { Calendar, ChevronDown, MapPin, Menu, X, Shield } from "lucide-react";
import {Branch} from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  branches: Branch[];
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenBooking,
  branches,
  selectedBranchId,
  onSelectBranch,
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Services & Prices", id: "services" },
    { label: "Stylists", id: "artists" },
    { label: "My Booking", id: "manage" }
  ];

  return (
    <nav aria-label="Primary navigation" className="sticky top-0 z-40 border-b border-brand-gold/15 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center space-x-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            onClick={() => setActiveTab("home")}
          >
            <Image
              src="/images/elora-logo.svg"
              alt="Elora Beauty Colombo Premier Spa"
              width={220}
              height={58}
              priority
              sizes="220px"
              className="h-[58px] w-[220px]"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                aria-current={activeTab === item.id ? "page" : undefined}
                className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? "border-b-2 border-brand-gold-dark pt-3 font-semibold text-brand-gold-dark"
                    : "text-stone-700 hover:text-brand-gold-dark"
                }`}
              >
                {item.label}
              </button>
            ))}

            <label className="relative flex items-center">
              <MapPin className="pointer-events-none absolute left-3 h-4 w-4 text-brand-gold" />
              <span className="sr-only">Preferred branch</span>
              <select
                value={selectedBranchId}
                onChange={(event) => onSelectBranch(event.target.value)}
                className="h-10 max-w-44 appearance-none rounded-full border border-brand-gold/25 bg-brand-surface-muted py-2 pl-9 pr-8 text-xs font-medium text-stone-700 transition hover:border-brand-gold focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                aria-label="Choose preferred branch"
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name.replace("Elora Beauty - ", "")}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-stone-400" />
            </label>

            <button
              onClick={() => setActiveTab("admin")}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                activeTab === "admin" ? "bg-brand-gold/15 text-brand-gold-dark" : "text-stone-500 hover:text-brand-gold-dark"
              }`}
              title="Staff Portal"
              aria-label="Open staff portal"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenBooking}
              className="inline-flex items-center rounded-full bg-brand-gold-dark px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-amber-900/15 transition-all hover:scale-[1.02] hover:bg-[#76511c] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-dark focus-visible:ring-offset-2"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-md p-2 text-stone-600 hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div id="mobile-navigation" className="space-y-2 border-b border-brand-gold/15 bg-brand-surface-muted px-4 pb-6 pt-2 shadow-inner lg:hidden">
          {navItems.map((item) => (
            <button
               key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-brand-gold/15 text-brand-gold-dark"
                  : "text-stone-700 hover:bg-brand-gold/5 hover:text-brand-gold-dark"
              }`}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}

          <label className="relative block px-4 py-2">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Preferred studio
            </span>
            <select
              value={selectedBranchId}
              onChange={(event) => onSelectBranch(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-brand-gold/25 bg-white px-3 text-sm text-stone-700 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name.replace("Elora Beauty - ", "")}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => {
              setActiveTab("admin");
              setIsOpen(false);
            }}
            className="flex w-full items-center rounded-xl px-4 py-3 text-base font-medium text-stone-700 hover:bg-brand-gold/5 hover:text-brand-gold"
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
              className="flex w-full items-center justify-center rounded-full bg-brand-gold-dark px-6 py-4 font-medium text-white transition hover:bg-[#76511c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-dark"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
