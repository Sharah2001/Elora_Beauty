import React, { useState, useEffect } from "react";
import { 
  Lock, Check, Settings, Trash, Calendar, PlusCircle, AlertCircle, 
  MessageSquare, UserCheck, Shield, ClipboardList, LogOut, Clock, Bookmark, Filter, ShieldCheck 
} from "lucide-react";
import { Booking, ContactMessage, Testimonial, Service, Artist, Branch } from "../types";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Lists
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Manual booking states
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newBName, setNewBName] = useState("");
  const [newBPhone, setNewBPhone] = useState("");
  const [newBBranch, setNewBBranch] = useState("");
  const [newBArtist, setNewBArtist] = useState("");
  const [newBServices, setNewBServices] = useState<string[]>([]);
  const [newBDate, setNewBDate] = useState("");
  const [newBTime, setNewBTime] = useState("");
  const [newBNotes, setNewBNotes] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");

  // Blocked date states
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockBranch, setBlockBranch] = useState("");
  const [blockError, setBlockError] = useState("");

  // Filters
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  // Subsections in Admin: "bookings" | "reviews" | "messages" | "closures"
  const [subTab, setSubTab] = useState<"bookings" | "reviews" | "messages" | "closures">("bookings");

  const [loadingBookings, setLoadingBookings] = useState(false);

  // Read admin token (from localStorage or httpOnly cookie)
  const loadData = async () => {
    setLoadingBookings(true);
    const token = localStorage.getItem("elora_admin_token") || "";
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // 1. Fetch bookings
      const bRes = await fetch("/api/admin/bookings", { headers });
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData);
      }

      // 2. Fetch messages
      const mRes = await fetch("/api/admin/contact-messages", { headers });
      if (mRes.ok) setMessages(await mRes.json());

      // 3. Fetch reviews
      const rRes = await fetch("/api/admin/testimonials", { headers });
      if (rRes.ok) setReviews(await rRes.json());

      // 4. Fetch blocked dates
      const clRes = await fetch("/api/admin/blocked-dates", { headers });
      if (clRes.ok) setBlockedDates(await clRes.json());

    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Verify authentication on boot
  useEffect(() => {
    const token = localStorage.getItem("elora_admin_token");
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    fetch("/api/admin/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
          loadData();
        } else {
          localStorage.removeItem("elora_admin_token");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));

    // Base setups
    fetch("/api/services").then(res => res.json()).then(data => setServices(data));
    fetch("/api/artists").then(res => res.json()).then(data => setArtists(data));
    fetch("/api/branches").then(res => res.json()).then(data => setBranches(data));
  }, []);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login rejected.");
      } else {
        localStorage.setItem("elora_admin_token", data.token);
        setAuthenticated(true);
        loadData();
      }
    } catch (err) {
      setAuthError("Auth server unavailable.");
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("elora_admin_token") || "";
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    localStorage.removeItem("elora_admin_token");
    setAuthenticated(false);
  };

  // Update Status / Notes
  const handleUpdateBooking = async (id: string, updates: any) => {
    const token = localStorage.getItem("elora_admin_token") || "";
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        // Refresh local bookings list
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderation: Approve / Disapprove reviews
  const handleModerateReview = async (id: string, approve: boolean) => {
    const token = localStorage.getItem("elora_admin_token") || "";
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: approve })
      });
      if (res.ok) {
        setReviews(reviews.map(item => item.id === id ? { ...item, isApproved: approve } : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderate Contact Messages
  const handleUpdateMessageStatus = async (id: string, status: "read" | "responded") => {
    const token = localStorage.getItem("elora_admin_token") || "";
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setMessages(messages.map(item => item.id === id ? { ...item, status } : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add customized holiday / closure block (Section 3.1 Sathurgini)
  const handleAddBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;

    setBlockError("");
    const token = localStorage.getItem("elora_admin_token") || "";

    try {
      const res = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: blockDate,
          reason: blockReason,
          branchId: blockBranch || undefined
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setBlockError(data.error || "Blocked date addition failed.");
      } else {
        setBlockedDates([...blockedDates, data.block]);
        setBlockDate("");
        setBlockReason("");
        setBlockBranch("");
      }
    } catch (err) {
      setBlockError("Error adding custom close date.");
    }
  };

  const handleDeleteBlockDate = async (id: string) => {
    if (!window.confirm("Delete this closed holiday override block?")) return;
    const token = localStorage.getItem("elora_admin_token") || "";

    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setBlockedDates(blockedDates.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Manual Walk-in Booking (Admin Walk-In Route, Section 5 Saranjah)
  const handleAddManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBName.trim() || !newBPhone.trim() || !newBBranch || !newBDate || !newBTime || newBServices.length === 0) {
      setManualError("Please fill out all required fields to register manual walk-in.");
      return;
    }

    setManualError("");
    setManualSuccess("");
    const token = localStorage.getItem("elora_admin_token") || "";

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          branchId: newBBranch,
          artistId: newBArtist || undefined,
          serviceIds: newBServices,
          customerName: newBName,
          customerPhone: newBPhone,
          date: newBDate,
          startTime: newBTime,
          notes: newBNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error || "Manual booking creation failed.");
      } else {
        setManualSuccess("Success! Handcrafted Walk-in appointment registered successfully.");
        // Clear
        setNewBName("");
        setNewBPhone("");
        setNewBNotes("");
        setNewBTime("");
        setNewBServices([]);
        setIsAddingBooking(false);
        loadData();
      }
    } catch (err) {
      setManualError("Server communication error creating walk-in booking.");
    }
  };

  // Filter Bookings list
  const filteredBookings = bookings.filter((bk) => {
    const matchB = filterBranch === "All" || bk.branch === filterBranch;
    const matchS = filterStatus === "All" || bk.status === filterStatus.toLowerCase();
    const matchD = !filterDate || bk.date === filterDate;
    return matchB && matchS && matchD;
  });

  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-mono text-stone-550">Authenticating safe administrative sessions...</p>
      </div>
    );
  }

  // LOGIN PAGE (SHARED PASSWORD GATE)
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fadeIn">
        <div className="bg-white border border-stone-250 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center space-y-4 mb-6">
            <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto border border-[#C5A059]/30">
              <Lock className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold block">Internal Portal</span>
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1">Elora Staff Area</h2>
              <p className="text-xs text-stone-500 font-light mt-1">Provide administrative pass code to access bookings and closures.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Administrative Pass code</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (e.g. admin123)"
                className="w-full p-3 border border-stone-300 rounded-xl bg-white text-[#1A1A1A] text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
              />
            </div>

            {authError && (
              <p className="text-xs font-bold text-red-700 bg-red-50 p-2.5 rounded-lg text-center flex items-center justify-center border border-red-100">
                <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 text-red-600" />
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#C5A059] hover:border-[#C5A059] text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition cursor-pointer transition-colors"
            >
              Sign In to Dashboard
            </button>
          </form>

          <p className="text-[10px] text-stone-400 font-mono text-center mt-6">
            Protected under standard browser session encryption.
          </p>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="space-y-10 py-4 animate-fadeIn">
      {/* Header section with credentials info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#C5A059]/20 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">Elora Staff Console</h2>
            <p className="text-xs text-stone-500 font-mono">Status: Secure Session Active &bull; <span className="text-emerald-700 font-bold">Authenticated</span></p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-[#C5A059]/20 text-[#C5A059] text-xs font-bold rounded-xl hover:bg-[#C5A059]/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Logout Panel
        </button>
      </div>

      {/* Manual Booking Entry Walk-In Widget Modal slider (Section 5 Saranjah) */}
      {isAddingBooking ? (
        <section className="bg-stone-50/50 border border-[#C5A059]/25 rounded-3xl p-6 md:p-8 animate-fadeIn space-y-6 shadow-md">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-stone-900">Enter Manual Guest (Walk-In)</h3>
            <button
              onClick={() => setIsAddingBooking(false)}
              className="text-stone-500 hover:text-stone-800 text-xs font-mono uppercase cursor-pointer"
            >
              Close Widget
            </button>
          </div>

          <form onSubmit={handleAddManualBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newBName}
                  onChange={(e) => setNewBName(e.target.value)}
                  placeholder="e.g. Malik Perera"
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-sm focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700">Telephone Number *</label>
                <input
                  type="text"
                  required
                  value={newBPhone}
                  onChange={(e) => setNewBPhone(e.target.value)}
                  placeholder="e.g. +94 77 922 4811"
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700">Branch *</label>
                <select
                  required
                  value={newBBranch}
                  onChange={(e) => setNewBBranch(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-sm focus:outline-none"
                >
                  <option value="">Select Studio...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name.replace("Elora Beauty - ", "")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700">Assigned Stylist</label>
                <select
                  value={newBArtist}
                  onChange={(e) => setNewBArtist(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-sm focus:outline-none"
                >
                  <option value="">Select Expert...</option>
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700">Services Selection *</label>
                <select
                  multiple
                  required
                  value={newBServices}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(option => (option as HTMLOptionElement).value);
                    setNewBServices(selected);
                  }}
                  className="w-full p-2 border border-stone-300 rounded-xl bg-white text-stone-900 text-xs focus:outline-none h-20"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes}m)</option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-400 mt-1">* Hold Command/Ctrl to select multiple.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700">Date *</label>
                <input
                  type="date"
                  required
                  value={newBDate}
                  onChange={(e) => setNewBDate(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700">Start Time *</label>
                <input
                  type="time"
                  required
                  value={newBTime}
                  onChange={(e) => setNewBTime(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700">Internal Staff Notes</label>
              <textarea
                value={newBNotes}
                onChange={(e) => setNewBNotes(e.target.value)}
                placeholder="Walk-in client, requested special beverage..."
                rows={2}
                className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-sm focus:outline-none"
              />
            </div>

            {manualError && <p className="text-xs font-bold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100">{manualError}</p>}
            {manualSuccess && <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">{manualSuccess}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-[#1A1A1A] hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-colors cursor-pointer"
            >
              Finalize manual walk-in slot
            </button>
          </form>
        </section>
      ) : null}

      {/* Sub Tabs controller */}
      <div className="flex border-b border-stone-200 gap-1 overflow-x-auto pb-1">
        {[
          { label: "Bookings Ledger", id: "bookings", icon: ClipboardList },
          { label: "Reviews Moderation", id: "reviews", icon: UserCheck },
          { label: "Messaging Inbox", id: "messages", icon: MessageSquare },
          { label: "Holiday closures", id: "closures", icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 cursor-pointer text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all ${
                subTab === tab.id
                  ? "bg-[#C5A059] text-white"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="shrink-0">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION A: BOOKINGS VIEW */}
      {subTab === "bookings" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header & Filter segment */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50 border border-stone-200 rounded-2xl p-4">
            
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="space-y-1">
                <span className="block text-[10px] text-stone-400 font-bold uppercase font-mono">Select Branch</span>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="p-2 border border-stone-300 rounded bg-white text-stone-850"
                >
                  <option value="All">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name.replace("Elora Beauty - ", "")}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-stone-400 font-bold uppercase font-mono">Select Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-stone-300 rounded bg-white text-stone-850"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="No-Show">No-Show</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-stone-400 font-bold uppercase font-mono">Specific Date</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="p-2 border border-stone-300 rounded bg-white text-stone-850"
                />
              </div>

              {(filterBranch !== "All" || filterStatus !== "All" || filterDate) && (
                <button
                  onClick={() => {
                    setFilterBranch("All");
                    setFilterStatus("All");
                    setFilterDate("");
                  }}
                  className="px-3 py-2 bg-stone-200 text-stone-800 rounded font-semibold mt-4 hover:bg-stone-300 cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setManualError("");
                setManualSuccess("");
                setIsAddingBooking(true);
              }}
              className="inline-flex items-center px-4 py-2.5 bg-[#C5A059] hover:bg-[#AA823B] transition-colors text-white rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer self-end"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Manual Walk-In Entry
            </button>
          </div>

          {/* Bookings Ledger list */}
          {loadingBookings ? (
            <div className="h-40 bg-stone-100 rounded-2xl animate-pulse"></div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-white">
              <p className="text-xs text-stone-400 font-light">No bookings records found matching filter constraints currently.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-sm">
              <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                <thead className="bg-stone-50 text-stone-400 uppercase font-mono text-[9px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Client / Contact</th>
                    <th scope="col" className="px-6 py-4">Date & Slot</th>
                    <th scope="col" className="px-6 py-4">Location & Staff</th>
                    <th scope="col" className="px-6 py-4">Services Details</th>
                    <th scope="col" className="px-6 py-4 text-center">Status Action</th>
                    <th scope="col" className="px-6 py-4">Internal Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/60 bg-white">
                  {filteredBookings.map((bk) => {
                    return (
                      <tr key={bk.id} className="hover:bg-stone-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-serif font-bold text-stone-900">{bk.customerName}</div>
                          <div className="text-stone-400 font-mono mt-0.5">{bk.customerPhone}</div>
                          <span className="text-[10px] text-stone-400 font-mono tracking-wider block mt-1">Ref: {bk.bookingReference}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-stone-850 block">{bk.date}</span>
                          <span className="text-[#C5A059] font-mono py-0.5 rounded px-1 bg-[#C5A059]/10 text-[10px] mt-1 inline-block font-bold">
                            {bk.startTime} - {bk.endTime}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-stone-800 font-medium block">{bk.branchName.replace("Elora Beauty - ", "")}</span>
                          <span className="text-stone-400 text-[10px] mt-1 block">Staff: {bk.artistName}</span>
                        </td>
                        <td className="px-6 py-4 max-w-[180px]">
                          <span className="text-stone-750 font-medium leading-relaxed block">{bk.servicesList.join(", ")}</span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <select
                            value={bk.status}
                            onChange={(e) => handleUpdateBooking(bk.id, { status: e.target.value })}
                            className={`p-1.5 border rounded text-[11px] font-semibold font-sans focus:outline-none ${
                              bk.status === "confirmed" ? "bg-amber-100 border-amber-300 text-amber-850 font-bold" :
                              bk.status === "completed" ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" :
                              bk.status === "no-show" ? "bg-stone-100 border-stone-300 text-stone-605" :
                              "bg-red-50 border-red-200 text-red-850 font-bold"
                            }`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="no-show">No-Show</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={bk.notes || ""}
                            onChange={(e) => handleUpdateBooking(bk.id, { notes: e.target.value })}
                            placeholder="Add notes..."
                            className="p-1 border border-stone-300 rounded text-stone-704 w-full text-[11px] max-w-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION B: REVIEWS MODERATION (Section 3.1 Testimonial approved: false) */}
      {subTab === "reviews" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="max-w-xl">
            <h3 className="font-serif text-lg font-bold text-stone-906">Reviews Moderation Panel</h3>
            <p className="text-stone-500 text-xs mt-1">Review feedback submitted by Sri Lankan guests. Approved feedback is fed directly onto the public feed.</p>
          </div>

          {reviews.length === 0 ? (
            <div className="py-12 text-center text-stone-400 font-light border-2 border-dashed border-stone-200 rounded-3xl bg-white">
              No reviews registered in catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-stone-900 text-sm">{rev.customerName}</span>
                      <span className="text-[10px] bg-stone-100 px-2.5 py-0.5 rounded-full font-mono text-stone-500">
                        {rev.rating} / 5 Stars
                      </span>
                    </div>
                    <p className="text-stone-450 italic mt-2 text-xs leading-relaxed">"{rev.comment}"</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-stone-100 pt-3">
                    <span className="text-[10px] text-stone-400 font-mono">
                      Received: {new Date(rev.submittedAt).toLocaleDateString()}
                    </span>
                    <div className="space-x-1.5 text-xs">
                      {rev.isApproved ? (
                        <button
                          onClick={() => handleModerateReview(rev.id, false)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 cursor-pointer font-semibold transition-colors"
                        >
                          Disapprove / Take Down
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateReview(rev.id, true)}
                          className="px-3 py-1.5 bg-[#C5A059] text-white rounded-lg hover:bg-[#AA823B] border border-[#C5A059] font-bold cursor-pointer transition-colors"
                        >
                          Approve Review Live
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION C: CONTACT MESSAGES */}
      {subTab === "messages" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="max-w-xl">
            <h3 className="font-serif text-lg font-bold text-stone-905">Guest Inquiries</h3>
            <p className="text-stone-500 text-xs mt-1 font-light">Read messages submitted through the online Contact forms.</p>
          </div>

          {messages.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-stone-200 text-center text-stone-400 rounded-3xl bg-white font-light">
              Inquiries inbox is completely empty.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-white border border-stone-205 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <h4 className="font-serif font-bold text-stone-905 text-sm">{msg.name}</h4>
                      <p className="text-xs text-stone-404 font-mono mt-0.5">{msg.phone} {msg.email ? `| ${msg.email}` : ""}</p>
                    </div>
                    <select
                      value={msg.status}
                      onChange={(e) => handleUpdateMessageStatus(msg.id, e.target.value as any)}
                      className={`p-1.5 border rounded text-[10px] uppercase font-bold tracking-wider font-mono ${
                        msg.status === "new" ? "bg-amber-100 border-amber-300 text-amber-800" :
                        msg.status === "read" ? "bg-stone-105 border-stone-300 text-stone-650" :
                        "bg-emerald-50 border-emerald-250 text-emerald-800"
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="responded">Responded</option>
                    </select>
                  </div>

                  <p className="text-xs text-stone-704 bg-stone-50 p-3 rounded-lg leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION D: HOLIDAY CLOSURES & BLOCKED TIMES (Section 3.1 Sathurgini) */}
      {subTab === "closures" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          
          {/* Add Closure Block form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-sm self-start">
            <h3 className="font-serif font-bold text-stone-900 border-b border-stone-105 pb-2 text-md">
              Add Closure Override
            </h3>

            {blockError && <p className="text-xs text-rose-700 font-bold bg-rose-50 p-2 rounded-lg">{blockError}</p>}

            <form onSubmit={handleAddBlockDate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Override Date *</label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-905 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Reason overridden / Note</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Staff training closure, Poya Day"
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Branch target</label>
                <select
                  value={blockBranch}
                  onChange={(e) => setBlockBranch(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white text-stone-900 text-xs focus:outline-none"
                >
                  <option value="">Apply globally to all branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name.replace("Elora Beauty - ", "")}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wide rounded-xl hover:bg-[#AA823B] transition-colors cursor-pointer"
              >
                Add Closure overriding Block
              </button>
            </form>
          </div>

          {/* Block list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-md">Registered Override Blocks</h3>
            <p className="text-xs text-stone-500">Dates recorded here are immediately blocked and can never display any available online timeslots to clients.</p>

            {blockedDates.length === 0 ? (
              <div className="py-12 text-center text-stone-400 font-light border-2 border-dashed border-stone-200 rounded-3xl bg-white">
                No closure overrides registered.
              </div>
            ) : (
              <div className="space-y-3">
                {blockedDates.map((block) => {
                  const br = branches.find((b) => b.id === block.branchId);
                  return (
                    <div key={block.id} className="bg-white border border-stone-205 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-bold text-stone-900 flex items-center">
                          <Calendar className="w-4 h-4 text-[#C5A059] mr-2 shrink-0" />
                          {block.date}
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">{block.reason || "Custom Block"}</p>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md inline-block">
                          Branch scope: {block.branchId ? (br?.name.replace("Elora Beauty - ", "") || block.branchId) : "Global (All Colombo branches)"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBlockDate(block.id)}
                        className="p-2 text-stone-400 hover:text-red-650 rounded-full hover:bg-red-50 transition cursor-pointer"
                        title="Delete closed block"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
