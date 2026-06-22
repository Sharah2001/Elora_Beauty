import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// Resolve directories for ESM & CJS hybrid environments
const isCjs = typeof __dirname !== "undefined";
const projectRoot = isCjs ? path.resolve(__dirname, "..") : path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const DB_FILE = path.join(projectRoot, "db-store.json");

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to generate safe random Booking Reference and PIN
function generateReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "BK-";
  for (let i = 0; i < 5; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

function generatePin(): string {
  let pin = "";
  for (let i = 0; i < 4; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
}

// Convert "HH:MM" to minutes from midnight for reliable math
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return `${h.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Check if two time intervals overlap (strictly endA <= startB or endB <= startA do NOT overlap)
function checkOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(endA) > timeToMinutes(startB);
}

// Initial Database Seeding Values
const initialDb = {
  branches: [
    {
      id: "colombo-03",
      name: "Elora Beauty - Kollupitiya (Colombo 03)",
      slug: "colombo-03",
      address: "82 Galle Road, Kollupitiya",
      city: "Colombo 03",
      phone: "+94 11 255 5342",
      whatsapp: "+94 77 222 5342",
      geo: { lat: 6.9158, lng: 79.8492 },
      image: "", // To be resolved with generated nail_art_showcase or default beauty room
      isActive: true,
      displayOrder: 1
    },
    {
      id: "colombo-07",
      name: "Elora Beauty - Cinnamon Gardens (Colombo 07)",
      slug: "colombo-07",
      address: "14 Ward Place, Cinnamon Gardens",
      city: "Colombo 07",
      phone: "+94 11 268 4828",
      whatsapp: "+94 77 333 4828",
      geo: { lat: 6.9248, lng: 79.8698 },
      image: "",
      isActive: true,
      displayOrder: 2
    }
  ],
  workingHours: [
    {
      branchId: "colombo-03",
      slotDurationMinutes: 30,
      schedule: [
        { dayOfWeek: "Mon", openTime: "09:00", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Tue", openTime: "09:00", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Wed", openTime: "09:00", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Thu", openTime: "09:00", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Fri", openTime: "09:00", closeTime: "20:00", isClosed: false },
        { dayOfWeek: "Sat", openTime: "09:00", closeTime: "20:00", isClosed: false },
        { dayOfWeek: "Sun", openTime: "10:00", closeTime: "18:00", isClosed: false }
      ]
    },
    {
      branchId: "colombo-07",
      slotDurationMinutes: 30,
      schedule: [
        { dayOfWeek: "Mon", openTime: "09:30", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Tue", openTime: "09:30", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Wed", openTime: "09:30", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Thu", openTime: "09:30", closeTime: "19:30", isClosed: false },
        { dayOfWeek: "Fri", openTime: "09:30", closeTime: "20:00", isClosed: false },
        { dayOfWeek: "Sat", openTime: "09:00", closeTime: "20:00", isClosed: false },
        { dayOfWeek: "Sun", openTime: "10:00", closeTime: "17:00", isClosed: true } // Closed on Sunday in C7
      ]
    }
  ],
  blockedDates: [
    {
      id: "b1",
      branchId: "", // All branches
      date: "2026-04-13", // Sinhala & Tamil New Year
      reason: "Sinhala & Tamil New Year Day 1",
      isFullDay: true
    },
    {
      id: "b2",
      branchId: "",
      date: "2026-04-14",
      reason: "Sinhala & Tamil New Year Day 2",
      isFullDay: true
    }
  ],
  services: [
    {
      id: "ladies-haircut",
      name: "Ladies' Haircut",
      slug: "ladies-haircut",
      category: "Hair — Cut & Style",
      description: "Wash, cut and blow-dry finish",
      durationMinutes: 45,
      basePrice: 1500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "mens-haircut",
      name: "Men's Haircut",
      slug: "mens-haircut",
      category: "Hair — Cut & Style",
      description: "Classic or modern cut with finish",
      durationMinutes: 30,
      basePrice: 800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "childrens-haircut-under-12",
      name: "Children's Haircut (under 12)",
      slug: "childrens-haircut-under-12",
      category: "Hair — Cut & Style",
      description: "Gentle cut for kids",
      durationMinutes: 20,
      basePrice: 600,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "fringe-bang-trim",
      name: "Fringe / Bang Trim",
      slug: "fringe-bang-trim",
      category: "Hair — Cut & Style",
      description: "Quick fringe shape-up between full cuts",
      durationMinutes: 15,
      basePrice: 300,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "blow-dry-&-style",
      name: "Blow-Dry & Style",
      slug: "blow-dry-&-style",
      category: "Hair — Cut & Style",
      description: "Wash and professional blow-dry styling",
      durationMinutes: 30,
      basePrice: 1200,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hair-iron-tong-styling",
      name: "Hair Iron / Tong Styling",
      slug: "hair-iron-tong-styling",
      category: "Hair — Cut & Style",
      description: "Curls, waves or sleek straight finish",
      durationMinutes: 40,
      basePrice: 1800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "updo-formal-styling",
      name: "Updo / Formal Styling",
      slug: "updo-formal-styling",
      category: "Hair — Cut & Style",
      description: "Event-ready upstyle, excludes bridal",
      durationMinutes: 60,
      basePrice: 3500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "global-hair-colour",
      name: "Global Hair Colour",
      slug: "global-hair-colour",
      category: "Hair — Colour & Chemical",
      description: "Full head single-process colour, mid-length",
      durationMinutes: 120,
      basePrice: 6500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "root-touch-up",
      name: "Root Touch-Up",
      slug: "root-touch-up",
      category: "Hair — Colour & Chemical",
      description: "Regrowth colour correction",
      durationMinutes: 75,
      basePrice: 4000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "highlights-partial",
      name: "Highlights — Partial",
      slug: "highlights-partial",
      category: "Hair — Colour & Chemical",
      description: "Foil highlights, crown and sides",
      durationMinutes: 120,
      basePrice: 7500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "highlights-full-head",
      name: "Highlights — Full Head",
      slug: "highlights-full-head",
      category: "Hair — Colour & Chemical",
      description: "Full head foil highlights",
      durationMinutes: 150,
      basePrice: 11000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "balayage-ombré",
      name: "Balayage / Ombré",
      slug: "balayage-ombré",
      category: "Hair — Colour & Chemical",
      description: "Hand-painted graduated colour",
      durationMinutes: 180,
      basePrice: 14000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hair-smoothening-keratin-treatment",
      name: "Hair Smoothening / Keratin Treatment",
      slug: "hair-smoothening-keratin-treatment",
      category: "Hair — Colour & Chemical",
      description: "Frizz-control chemical smoothening, mid-length",
      durationMinutes: 180,
      basePrice: 15000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hair-rebonding",
      name: "Hair Rebonding",
      slug: "hair-rebonding",
      category: "Hair — Colour & Chemical",
      description: "Permanent straightening treatment",
      durationMinutes: 240,
      basePrice: 16000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hair-perming",
      name: "Hair Perming",
      slug: "hair-perming",
      category: "Hair — Colour & Chemical",
      description: "Curl perm treatment",
      durationMinutes: 150,
      basePrice: 9000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hair-botox-treatment",
      name: "Hair Botox Treatment",
      slug: "hair-botox-treatment",
      category: "Hair — Colour & Chemical",
      description: "Deep-repair bond-rebuilding treatment",
      durationMinutes: 90,
      basePrice: 8500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "deep-conditioning-treatment",
      name: "Deep Conditioning Treatment",
      slug: "deep-conditioning-treatment",
      category: "Hair — Treatments",
      description: "Intensive moisture mask with steam",
      durationMinutes: 45,
      basePrice: 3000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "scalp-treatment-&-massage",
      name: "Scalp Treatment & Massage",
      slug: "scalp-treatment-&-massage",
      category: "Hair — Treatments",
      description: "Anti-dandruff / scalp-balancing therapy",
      durationMinutes: 45,
      basePrice: 3500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hair-spa",
      name: "Hair Spa",
      slug: "hair-spa",
      category: "Hair — Treatments",
      description: "Wash, mask, steam, scalp massage combo",
      durationMinutes: 60,
      basePrice: 4500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "protein-keratin-mask",
      name: "Protein / Keratin Mask",
      slug: "protein-keratin-mask",
      category: "Hair — Treatments",
      description: "Strengthening treatment for damaged hair",
      durationMinutes: 45,
      basePrice: 3800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "anti-hair-fall-treatment",
      name: "Anti-Hair Fall Treatment",
      slug: "anti-hair-fall-treatment",
      category: "Hair — Treatments",
      description: "Targeted scalp serum + massage course (per session)",
      durationMinutes: 45,
      basePrice: 4000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "dandruff-control-treatment",
      name: "Dandruff Control Treatment",
      slug: "dandruff-control-treatment",
      category: "Hair — Treatments",
      description: "Medicated scalp treatment",
      durationMinutes: 40,
      basePrice: 3200,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "classic-facial",
      name: "Classic Facial",
      slug: "classic-facial",
      category: "Skin — Facials",
      description: "Cleanse, exfoliate, mask, moisturise",
      durationMinutes: 45,
      basePrice: 3000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "brightening-facial",
      name: "Brightening Facial",
      slug: "brightening-facial",
      category: "Skin — Facials",
      description: "Vitamin C brightening treatment",
      durationMinutes: 60,
      basePrice: 4500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "anti-ageing-facial",
      name: "Anti-Ageing Facial",
      slug: "anti-ageing-facial",
      category: "Skin — Facials",
      description: "Collagen-boost firming facial",
      durationMinutes: 75,
      basePrice: 6500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hydrating-glow-facial",
      name: "Hydrating / Glow Facial",
      slug: "hydrating-glow-facial",
      category: "Skin — Facials",
      description: "Deep hydration for dry or dull skin",
      durationMinutes: 60,
      basePrice: 5000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "acne-control-facial",
      name: "Acne-Control Facial",
      slug: "acne-control-facial",
      category: "Skin — Facials",
      description: "Deep cleanse for oily/acne-prone skin",
      durationMinutes: 60,
      basePrice: 4800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "gold-facial",
      name: "Gold Facial",
      slug: "gold-facial",
      category: "Skin — Facials",
      description: "24K gold radiance facial",
      durationMinutes: 75,
      basePrice: 7500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "diamond-facial",
      name: "Diamond Facial",
      slug: "diamond-facial",
      category: "Skin — Facials",
      description: "Microdermabrasion-style polishing facial",
      durationMinutes: 75,
      basePrice: 8000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "fruit-facial",
      name: "Fruit Facial",
      slug: "fruit-facial",
      category: "Skin — Facials",
      description: "Natural enzyme exfoliating facial",
      durationMinutes: 45,
      basePrice: 3500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "oxygen-facial",
      name: "Oxygen Facial",
      slug: "oxygen-facial",
      category: "Skin — Facials",
      description: "Oxygen-infusion glow treatment",
      durationMinutes: 60,
      basePrice: 9000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "mens-facial",
      name: "Men's Facial",
      slug: "mens-facial",
      category: "Skin — Facials",
      description: "Deep cleanse facial tailored for men's skin",
      durationMinutes: 45,
      basePrice: 3500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "skin-polishing-microdermabrasion",
      name: "Skin Polishing / Microdermabrasion",
      slug: "skin-polishing-microdermabrasion",
      category: "Skin — Other Treatments",
      description: "Full-face exfoliating resurfacing",
      durationMinutes: 45,
      basePrice: 6000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "bleaching-face",
      name: "Bleaching — Face",
      slug: "bleaching-face",
      category: "Skin — Other Treatments",
      description: "Skin-tone evening bleach treatment",
      durationMinutes: 30,
      basePrice: 1500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "bleaching-full-arms",
      name: "Bleaching — Full Arms",
      slug: "bleaching-full-arms",
      category: "Skin — Other Treatments",
      description: "Arm bleaching treatment",
      durationMinutes: 30,
      basePrice: 2000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "bleaching-full-body",
      name: "Bleaching — Full Body",
      slug: "bleaching-full-body",
      category: "Skin — Other Treatments",
      description: "Full body bleaching treatment",
      durationMinutes: 90,
      basePrice: 6000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "threading-eyebrow",
      name: "Threading — Eyebrow",
      slug: "threading-eyebrow",
      category: "Skin — Other Treatments",
      description: "Precision brow shaping",
      durationMinutes: 10,
      basePrice: 300,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "threading-upper-lip",
      name: "Threading — Upper Lip",
      slug: "threading-upper-lip",
      category: "Skin — Other Treatments",
      description: "Upper lip hair removal",
      durationMinutes: 5,
      basePrice: 200,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "threading-full-face",
      name: "Threading — Full Face",
      slug: "threading-full-face",
      category: "Skin — Other Treatments",
      description: "Full face threading",
      durationMinutes: 25,
      basePrice: 800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "eyebrow-tinting",
      name: "Eyebrow Tinting",
      slug: "eyebrow-tinting",
      category: "Skin — Other Treatments",
      description: "Brow colour tint",
      durationMinutes: 15,
      basePrice: 800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "eyelash-tinting",
      name: "Eyelash Tinting",
      slug: "eyelash-tinting",
      category: "Skin — Other Treatments",
      description: "Lash colour tint",
      durationMinutes: 15,
      basePrice: 1000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "eyelash-lift",
      name: "Eyelash Lift",
      slug: "eyelash-lift",
      category: "Skin — Other Treatments",
      description: "Natural lash curl lift",
      durationMinutes: 45,
      basePrice: 3500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "eyelash-extensions-classic",
      name: "Eyelash Extensions — Classic",
      slug: "eyelash-extensions-classic",
      category: "Skin — Other Treatments",
      description: "Single-strand lash extensions, full set",
      durationMinutes: 90,
      basePrice: 6500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "eyelash-extensions-volume",
      name: "Eyelash Extensions — Volume",
      slug: "eyelash-extensions-volume",
      category: "Skin — Other Treatments",
      description: "Russian volume lash extensions, full set",
      durationMinutes: 120,
      basePrice: 9000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-half-arms",
      name: "Waxing — Half Arms",
      slug: "waxing-half-arms",
      category: "Waxing",
      description: "Hot wax hair removal",
      durationMinutes: 20,
      basePrice: 800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-full-arms",
      name: "Waxing — Full Arms",
      slug: "waxing-full-arms",
      category: "Waxing",
      description: "Hot wax hair removal",
      durationMinutes: 30,
      basePrice: 1200,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-half-legs",
      name: "Waxing — Half Legs",
      slug: "waxing-half-legs",
      category: "Waxing",
      description: "Hot wax hair removal",
      durationMinutes: 25,
      basePrice: 1000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-full-legs",
      name: "Waxing — Full Legs",
      slug: "waxing-full-legs",
      category: "Waxing",
      description: "Hot wax hair removal",
      durationMinutes: 40,
      basePrice: 1800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-underarms",
      name: "Waxing — Underarms",
      slug: "waxing-underarms",
      category: "Waxing",
      description: "Hot wax hair removal",
      durationMinutes: 10,
      basePrice: 500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-full-body",
      name: "Waxing — Full Body",
      slug: "waxing-full-body",
      category: "Waxing",
      description: "Complete hot wax hair removal",
      durationMinutes: 90,
      basePrice: 5500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-bikini",
      name: "Waxing — Bikini",
      slug: "waxing-bikini",
      category: "Waxing",
      description: "Basic bikini line wax",
      durationMinutes: 20,
      basePrice: 1200,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "waxing-brazilian",
      name: "Waxing — Brazilian",
      slug: "waxing-brazilian",
      category: "Waxing",
      description: "Full Brazilian wax",
      durationMinutes: 30,
      basePrice: 2500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "day-office-makeup",
      name: "Day / Office Makeup",
      slug: "day-office-makeup",
      category: "Makeup",
      description: "Light natural everyday makeup",
      durationMinutes: 30,
      basePrice: 2500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "party-makeup",
      name: "Party Makeup",
      slug: "party-makeup",
      category: "Makeup",
      description: "Glam makeup for events",
      durationMinutes: 60,
      basePrice: 5500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "hd-makeup",
      name: "HD Makeup",
      slug: "hd-makeup",
      category: "Makeup",
      description: "High-definition camera-ready makeup",
      durationMinutes: 75,
      basePrice: 8000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "airbrush-makeup",
      name: "Airbrush Makeup",
      slug: "airbrush-makeup",
      category: "Makeup",
      description: "Long-wear airbrush application",
      durationMinutes: 75,
      basePrice: 9500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "engagement-makeup",
      name: "Engagement Makeup",
      slug: "engagement-makeup",
      category: "Makeup",
      description: "Full glam look for engagement",
      durationMinutes: 90,
      basePrice: 12000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "saree-draping-with-makeup",
      name: "Saree Draping (with makeup)",
      slug: "saree-draping-with-makeup",
      category: "Makeup",
      description: "Traditional saree pleating and pinning",
      durationMinutes: 30,
      basePrice: 2500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "saree-draping-only",
      name: "Saree Draping Only",
      slug: "saree-draping-only",
      category: "Makeup",
      description: "Pleating and pinning, no makeup",
      durationMinutes: 20,
      basePrice: 1500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "half-saree-osariya-draping",
      name: "Half-Saree / Osariya Draping",
      slug: "half-saree-osariya-draping",
      category: "Makeup",
      description: "Traditional Kandyan-style draping",
      durationMinutes: 30,
      basePrice: 2000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "classic-manicure",
      name: "Classic Manicure",
      slug: "classic-manicure",
      category: "Nails",
      description: "Soak, shape, cuticle care, polish",
      durationMinutes: 30,
      basePrice: 1500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "classic-pedicure",
      name: "Classic Pedicure",
      slug: "classic-pedicure",
      category: "Nails",
      description: "Soak, scrub, callus care, polish",
      durationMinutes: 40,
      basePrice: 2000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "gel-manicure",
      name: "Gel Manicure",
      slug: "gel-manicure",
      category: "Nails",
      description: "Manicure with long-wear gel polish",
      durationMinutes: 45,
      basePrice: 2800,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "gel-pedicure",
      name: "Gel Pedicure",
      slug: "gel-pedicure",
      category: "Nails",
      description: "Pedicure with long-wear gel polish",
      durationMinutes: 50,
      basePrice: 3200,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "spa-manicure",
      name: "Spa Manicure",
      slug: "spa-manicure",
      category: "Nails",
      description: "Manicure with exfoliation and mask",
      durationMinutes: 45,
      basePrice: 2500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "spa-pedicure",
      name: "Spa Pedicure",
      slug: "spa-pedicure",
      category: "Nails",
      description: "Pedicure with exfoliation and mask",
      durationMinutes: 60,
      basePrice: 3000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "nail-art-per-set",
      name: "Nail Art (per set)",
      slug: "nail-art-per-set",
      category: "Nails",
      description: "Custom hand-painted nail art",
      durationMinutes: 30,
      basePrice: 1500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "acrylic-nail-extensions",
      name: "Acrylic Nail Extensions",
      slug: "acrylic-nail-extensions",
      category: "Nails",
      description: "Full set sculpted acrylic extensions",
      durationMinutes: 90,
      basePrice: 6500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "gel-nail-extensions",
      name: "Gel Nail Extensions",
      slug: "gel-nail-extensions",
      category: "Nails",
      description: "Full set gel-built extensions",
      durationMinutes: 90,
      basePrice: 7000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "nail-polish-change-hands",
      name: "Nail Polish Change — Hands",
      slug: "nail-polish-change-hands",
      category: "Nails",
      description: "Quick polish change only",
      durationMinutes: 15,
      basePrice: 500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "nail-polish-change-feet",
      name: "Nail Polish Change — Feet",
      slug: "nail-polish-change-feet",
      category: "Nails",
      description: "Quick polish change only",
      durationMinutes: 15,
      basePrice: 600,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "full-body-massage",
      name: "Full Body Massage",
      slug: "full-body-massage",
      category: "Body & Spa",
      description: "Relaxing therapeutic massage",
      durationMinutes: 60,
      basePrice: 4500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "back-neck-&-shoulder-massage",
      name: "Back, Neck & Shoulder Massage",
      slug: "back-neck-&-shoulder-massage",
      category: "Body & Spa",
      description: "Targeted tension-relief massage",
      durationMinutes: 30,
      basePrice: 2500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "foot-reflexology",
      name: "Foot Reflexology",
      slug: "foot-reflexology",
      category: "Body & Spa",
      description: "Pressure-point foot massage",
      durationMinutes: 30,
      basePrice: 2200,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "body-scrub-&-polish",
      name: "Body Scrub & Polish",
      slug: "body-scrub-&-polish",
      category: "Body & Spa",
      description: "Full body exfoliation treatment",
      durationMinutes: 45,
      basePrice: 4000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "body-wrap-treatment",
      name: "Body Wrap Treatment",
      slug: "body-wrap-treatment",
      category: "Body & Spa",
      description: "Detoxifying or hydrating body wrap",
      durationMinutes: 60,
      basePrice: 5500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "steam-bath",
      name: "Steam Bath",
      slug: "steam-bath",
      category: "Body & Spa",
      description: "Relaxing steam session",
      durationMinutes: 20,
      basePrice: 1500,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    },
    {
      id: "bridal-styling",
      name: "Royal Kandyan or Modern Bridal Dressing",
      slug: "bridal-styling",
      category: "Bridal",
      description: "Complete elite bridal dressing including saree draping, luxurious makeup, complex hair detailing, and jewelry placement assistance.",
      durationMinutes: 180,
      basePrice: 45000,
      isActive: true,
      branches: ["colombo-03", "colombo-07"]
    }
  ],
  packages: [
    {
      id: "bridal-gold",
      name: "Elora Queen's Bridal Package",
      includedServices: ["oxygen-facial", "engagement-makeup", "gel-manicure"],
      totalPrice: 25000,
      discountNote: "Save 10% - Ultimate Glamour",
      description: "The ultimate 3-step luxury preparative beauty package for brides. Includes Oxygen Glow Facial, Full Glam Engagement Makeup, and a luxurious Gel Manicure set."
    },
    {
      id: "weekend-pamper",
      name: "Weekend Sanctuary Pamper Package",
      includedServices: ["ladies-haircut", "gel-manicure", "classic-facial"],
      totalPrice: 6000,
      discountNote: "Save LKR 1,300 - Best Seller",
      description: "Rejuvenating head-to-toe bundle. Enjoy our Ladies' Haircut with blow-dry finish, a premium Gel Manicure, and a soothing Classic Facial."
    }
  ],
  offers: [
    {
      id: "off1",
      title: "This Friday Only: 20% Off All Makeup Services",
      description: "Take absolute advantage of our limited-time professional makeup promotion! Book any Friday makeup slot and receive LKR 2,500 off.",
      discountType: "percentage",
      discountValue: 20,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      applicableServices: ["pro-makeup"],
      isActive: true
    },
    {
      id: "off2",
      title: "Weekdays Early Bird - LKR 1,500 Off",
      description: "LKR 1,500 off on any service worth LKR 7,500 or more when booked between 9:00 AM and 12:00 PM on Mon to Thu.",
      discountType: "fixed",
      discountValue: 1500,
      validFrom: "2026-01-01",
      validUntil: "2026-08-31",
      applicableServices: [],
      isActive: true
    }
  ],
  artists: [
    {
      id: "samantha",
      name: "Samantha Perera",
      slug: "samantha-perera",
      photo: "samantha",
      bio: "Samantha has over 10 years of experience in luxury hair styling and corrective balayage. She trained in London and excels in custom cuts for both local and expat clients.",
      specialties: ["hair-cut", "hair-coloring", "weekend-pamper"],
      branches: ["colombo-03", "colombo-07"],
      isActive: true,
      displayOrder: 1
    },
    {
      id: "priyanthi",
      name: "Priyanthi Silva",
      slug: "priyanthi-silva",
      photo: "priyanthi",
      bio: "Priyanthi is certified in Russian manicure techniques and is the go-to nail artist in Colombo. She crafts gorgeous nail extensions and designs customized for weddings.",
      specialties: ["nail-gel", "weekend-pamper", "bridal-gold"],
      branches: ["colombo-03"],
      isActive: true,
      displayOrder: 2
    },
    {
      id: "elora",
      name: "Elora Jayawardena",
      slug: "elora-jayawardena",
      photo: "elora",
      bio: "Founder of Elora Beauty and a celebrity makeup artist in Sri Lanka. Elora specializes in traditional Kandyan and modern western bridal looks that look flawless on camera.",
      specialties: ["pro-makeup", "skin-glow", "bridal-styling", "bridal-gold", "weekend-pamper"],
      branches: ["colombo-03", "colombo-07"],
      isActive: true,
      displayOrder: 3
    }
  ],
  testimonials: [
    {
      id: "t1",
      customerName: "Minoli Senanayake",
      rating: 5,
      comment: "Elora did my makeup for my wedding, and I felt like a queen! The traditional Kandyan styling was flawless and stayed intact the whole night. Highly recommend the Kollupitiya branch!",
      serviceReceived: "bridal-styling",
      branch: "colombo-03",
      isApproved: true,
      submittedAt: "2026-06-15T09:30:10Z"
    },
    {
      id: "t2",
      customerName: "Dinesh Wijesinghe",
      rating: 5,
      comment: "Highly professional hair stylists. Samantha gave me the best haircut of my life. Elegant interiors, exceptional hospitality, and high product quality.",
      serviceReceived: "hair-cut",
      branch: "colombo-07",
      isApproved: true,
      submittedAt: "2026-06-18T14:22:00Z"
    },
    {
      id: "t3",
      customerName: "Radha Krishnan",
      rating: 5,
      comment: "Excellent gel nails and beautiful aesthetic. Priyanthi's cuticle work is incredibly neat. Absolutely loved the lavender sugar scrub!",
      serviceReceived: "nail-gel",
      branch: "colombo-03",
      isApproved: true,
      submittedAt: "2026-06-20T11:05:15Z"
    }
  ],
  faqs: [
    {
      id: "f1",
      question: "Do you accept walk-in clients?",
      answer: "We highly recommend booking an appointment online to avoid waiting. Walk-ins are accommodated based on artist availability, but scheduled appointments take full priority.",
      category: "General",
      displayOrder: 1
    },
    {
      id: "f2",
      question: "How do I cancel or reschedule my booking?",
      answer: "No accounts needed! Simply head over to the 'Manage Booking' page on our website, enter your phone number, review your pending slots, enter the 4-digit PIN you received upon booking, and easily reschedule or cancel yourself up to 2 hours before.",
      category: "Bookings",
      displayOrder: 2
    },
    {
      id: "f3",
      question: "Which brands do you use for makeup and skin treatments?",
      answer: "We prioritize safety and durability. For makeup, we use premium brands like MAC, NARS, and Fenty Beauty. For skincare facials, we utilize certified luxury organic botanical formulations.",
      category: "Services",
      displayOrder: 3
    },
    {
      id: "f4",
      question: "Is parking available at your locations?",
      answer: "Yes, both our Kollupitiya and Cinnamon Gardens branches feature secure, gate-guarded customer parking spaces free of charge.",
      category: "General",
      displayOrder: 4
    }
  ],
  bookings: [
    {
      id: "b_init1",
      branch: "colombo-03",
      artist: "priyanthi",
      services: ["nail-gel"],
      customerName: "Nisha Perera",
      customerPhone: "+94 77 123 4567",
      date: "2026-06-23",
      startTime: "11:00",
      endTime: "12:00",
      status: "confirmed",
      bookingSource: "online",
      bookingReference: "BK-EL991",
      pin: "1234",
      notes: "Likes neutral colors",
      createdAt: "2026-06-22T08:00:00Z",
      updatedAt: "2026-06-22T08:00:00Z"
    }
  ],
  contactMessages: [
    {
      id: "msg_init1",
      name: "Kasun Jayasuriya",
      phone: "+94 71 999 8888",
      email: "kasun@gmail.com",
      message: "Interested in booking a corporate event grooming session for 12 people. Do you offer bulk discounts?",
      branch: "colombo-07",
      status: "new",
      submittedAt: "2026-06-22T08:15:00Z"
    }
  ],
  certifications: [
    {
      id: "c1",
      title: "Sri Lanka Elite Salon Award 2025",
      issuer: "Lanka Beauty Pageants Association",
      image: "certificate_elite",
      yearAwarded: 2025,
      displayOrder: 1
    },
    {
      id: "c2",
      title: "Master Academy of Hair Styling Certified",
      issuer: "Toni&Guy London Affiliated",
      image: "certificate_toniguy",
      yearAwarded: 2023,
      displayOrder: 2
    }
  ],
  beforeAfter: [
    {
      id: "ba1",
      beforeImage: "https://picsum.photos/seed/beforehair/500/500",
      afterImage: "https://picsum.photos/seed/afterhair/500/500",
      caption: "Stunning Hair transformation - From frizzy to absolute silk finish",
      serviceCategory: "Hair"
    },
    {
      id: "ba2",
      beforeImage: "https://picsum.photos/seed/beforenail/500/500",
      afterImage: "https://picsum.photos/seed/afternail/500/500",
      caption: "Creative Gel Nail Styling with elegant gold sparkles",
      serviceCategory: "Nails"
    }
  ]
};

// Database persistence utility
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file, using in-memory fallback", err);
  }
  // Write default db if not exists
  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: any) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to database file", err);
  }
}

// Global server reference to active database object
let db = loadDb();

// Clean up database content and save
function updateDbStore(updates: Partial<typeof initialDb>) {
  db = { ...db, ...updates };
  saveDb(db);
}

// API Routes

// Marketing content feeds
app.get("/api/branches", (req, res) => {
  res.json(db.branches || []);
});

app.get("/api/services", (req, res) => {
  res.json(db.services || []);
});

app.get("/api/packages", (req, res) => {
  res.json(db.packages || []);
});

app.get("/api/offers", (req, res) => {
  res.json(db.offers || []);
});

app.get("/api/artists", (req, res) => {
  res.json(db.artists || []);
});

app.get("/api/testimonials", (req, res) => {
  // Approved ones only for public consumption
  const approved = (db.testimonials || []).filter((t: any) => t.isApproved);
  res.json(approved);
});

app.post("/api/testimonials", (req, res) => {
  try {
    const { customerName, rating, comment, serviceReceived, branch } = req.body;
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ error: "Name, rating and comments are required." });
    }
    const newTestimonial = {
      id: "t_" + Date.now(),
      customerName,
      rating: Number(rating),
      comment,
      serviceReceived: serviceReceived || "",
      branch: branch || "",
      isApproved: false, // Moderated by default
      submittedAt: new Date().toISOString()
    };
    db.testimonials = [...(db.testimonials || []), newTestimonial];
    saveDb(db);
    res.json({ success: true, message: "Thank you! Your review has been submitted for moderation." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/faqs", (req, res) => {
  res.json(db.faqs || []);
});

app.post("/api/contact", (req, res) => {
  try {
    const { name, phone, email, message, branch } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ error: "Name, phone, and message are required." });
    }
    const newMsg = {
      id: "msg_" + Date.now(),
      name,
      phone,
      email: email || "",
      message,
      branch: branch || "",
      status: "new",
      submittedAt: new Date().toISOString()
    };
    db.contactMessages = [...(db.contactMessages || []), newMsg];
    saveDb(db);
    res.json({ success: true, message: "Message sent successfully! We will contact you soon." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AVAILABILITY ENGINE
// Computes and returns available slots on a given YYYY-MM-DD
app.get("/api/availability", (req, res) => {
  try {
    const { branchId, date, serviceIds, artistId } = req.query;

    if (!branchId || !date || !serviceIds) {
      return res.status(400).json({ error: "Missing required parameters: branchId, date, serviceIds" });
    }

    const servicesList = (serviceIds as string).split(",");
    const selectedDateStr = date as string;

    // 1. Calculate cumulative duration of all selected services
    let totalDuration = 0;
    for (const sid of servicesList) {
      const s = db.services.find((it: any) => it.id === sid);
      if (s) {
        totalDuration += s.durationMinutes;
      }
    }
    if (totalDuration === 0) totalDuration = 30; // default minimum

    // Get Day of week e.g. "Mon"
    const parsedDate = new Date(selectedDateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = days[parsedDate.getDay()];

    // 2. Fetch Working hours for branch + day of week
    const branchHours = db.workingHours.find((h: any) => h.branchId === branchId);
    if (!branchHours) {
      return res.json([]);
    }
    const daySchedule = branchHours.schedule.find((s: any) => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || daySchedule.isClosed) {
      return res.json([]); // Closed
    }

    // 3. Check Blocked Dates
    const isBlocked = db.blockedDates.some((b: any) => {
      const matchBranch = !b.branchId || b.branchId === branchId;
      return matchBranch && b.date === selectedDateStr && b.isFullDay;
    });
    if (isBlocked) {
      return res.json([]); // Blocked holiday or salon closure
    }

    // Get any partial blocks
    const partialBlocks = db.blockedDates.filter((b: any) => {
      const matchBranch = !b.branchId || b.branchId === branchId;
      return matchBranch && b.date === selectedDateStr && !b.isFullDay;
    });

    // 4. Generate Candidate Slots
    const step = branchHours.slotDurationMinutes || 30;
    const openMin = timeToMinutes(daySchedule.openTime);
    const closeMin = timeToMinutes(daySchedule.closeTime);

    // List of active artists at this branch qualified for ALL services requested
    let qualifiedArtists = db.artists.filter((art: any) => {
      const active = art.isActive;
      const worksAtBranch = art.branches.includes(branchId);
      const qualified = servicesList.every((sid) => art.specialties.includes(sid));
      return active && worksAtBranch && qualified;
    });

    if (artistId && artistId !== "any" && artistId !== "") {
      qualifiedArtists = qualifiedArtists.filter((art: any) => art.id === artistId);
    }

    if (qualifiedArtists.length === 0) {
      return res.json([]); // No qualified artists available at this branch for these services
    }

    // All existing non-cancelled bookings at this branch on this date
    const dayBookings = (db.bookings || []).filter((bk: any) => {
      return bk.branch === branchId && bk.date === selectedDateStr && bk.status !== "cancelled" && bk.status !== "no-show";
    });

    const candidateSlots: { time: string; artistId: string; artistName: string }[] = [];

    // Loop through every possible interval
    for (let currentMin = openMin; currentMin + totalDuration <= closeMin; currentMin += step) {
      const slotStartStr = minutesToTime(currentMin);
      const slotEndStr = minutesToTime(currentMin + totalDuration);

      // Check if slot falls into any partial blocks
      let isPartiallyBlocked = false;
      for (const block of partialBlocks) {
        if (block.blockedStartTime && block.blockedEndTime) {
          if (checkOverlap(slotStartStr, slotEndStr, block.blockedStartTime, block.blockedEndTime)) {
            isPartiallyBlocked = true;
            break;
          }
        }
      }
      if (isPartiallyBlocked) continue;

      // Find which qualified artists are FREE for this entire duration slot
      for (const artist of qualifiedArtists) {
        // Check overlaps with bookings explicitly assigned to this artist
        const artistBookings = dayBookings.filter((b: any) => b.artist === artist.id);
        const hasOverlap = artistBookings.some((b: any) => {
          return checkOverlap(slotStartStr, slotEndStr, b.startTime, b.endTime);
        });

        if (!hasOverlap) {
          candidateSlots.push({
            time: slotStartStr,
            artistId: artist.id,
            artistName: artist.name
          });
        }
      }
    }

    // Format output: group unique start times
    // Let's return details so client can see choices
    const result: { time: string; availableArtists: { id: string; name: string }[] }[] = [];
    const uniqueTimes = Array.from(new Set(candidateSlots.map((s) => s.time))).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    for (const uTime of uniqueTimes) {
      const matchArtists = candidateSlots
        .filter((s) => s.time === uTime)
        .map((s) => ({ id: s.artistId, name: s.artistName }));
      result.push({
        time: uTime,
        availableArtists: matchArtists
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CLIENT BOOKING RESERVATION
app.post("/api/bookings", (req, res) => {
  try {
    const { branchId, artistId, serviceIds, customerName, customerPhone, date, startTime, notes } = req.body;

    if (!branchId || !serviceIds || !customerName || !customerPhone || !date || !startTime) {
      return res.status(400).json({ error: "Missing required fields for booking insertion." });
    }

    const servicesList = Array.isArray(serviceIds) ? serviceIds : (serviceIds as string).split(",");

    // 1. Re-validate availability on server-side to prevent parallel double-bookings (race condition mitigation, Section 4.2)
    let totalDuration = 0;
    for (const sid of servicesList) {
      const s = db.services.find((it: any) => it.id === sid);
      if (s) {
        totalDuration += s.durationMinutes;
      }
    }
    if (totalDuration === 0) totalDuration = 30;

    const startMinutes = timeToMinutes(startTime);
    const endTime = minutesToTime(startMinutes + totalDuration);

    // Filter qualified artists active at this branch
    let qualifiedArtists = db.artists.filter((art: any) => {
      const worksAtBranch = art.branches.includes(branchId);
      const qualified = servicesList.every((sid) => art.specialties.includes(sid));
      return art.isActive && worksAtBranch && qualified;
    });

    if (artistId && artistId !== "any" && artistId !== "") {
      qualifiedArtists = qualifiedArtists.filter((art: any) => art.id === artistId);
    }

    if (qualifiedArtists.length === 0) {
      return res.status(405).json({ error: "No specialists available to fulfill these services at this branch." });
    }

    // Check overlaps
    const dayBookings = (db.bookings || []).filter((bk: any) => {
      return bk.branch === branchId && bk.date === date && bk.status !== "cancelled" && bk.status !== "no-show";
    });

    // Pick the first available artist
    let assignedArtistId = "";
    for (const art of qualifiedArtists) {
      const artistBookings = dayBookings.filter((b: any) => b.artist === art.id);
      const overlap = artistBookings.some((b: any) => checkOverlap(startTime, endTime, b.startTime, b.endTime));
      if (!overlap) {
        assignedArtistId = art.id;
        break;
      }
    }

    if (!assignedArtistId) {
      return res.status(409).json({ error: "This slot is no longer available. Please select a different time slot." });
    }

    // Generate reference and private PIN
    const bookingReference = generateReference();
    const pin = generatePin();

    const newBooking = {
      id: "bk_" + Date.now(),
      branch: branchId,
      artist: assignedArtistId,
      services: servicesList,
      customerName,
      customerPhone,
      date,
      startTime,
      endTime,
      status: "confirmed",
      bookingSource: "online",
      bookingReference,
      pin,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.bookings = [...(db.bookings || []), newBooking];
    saveDb(db);

    res.json({
      success: true,
      booking: {
        bookingReference,
        pin,
        customerName,
        date,
        startTime,
        endTime,
        artistName: db.artists.find((a: any) => a.id === assignedArtistId)?.name || "Assigned Specialist",
        branchName: db.branches.find((b: any) => b.id === branchId)?.name || "Elora Beauty Branch"
      }
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SELF-SERVICE MANAGE BOOKINGS LOOKUP
app.post("/api/bookings/lookup", (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }
    // Clean phone spaces for matching
    const cleanInput = phone.replace(/[\s\-\(\)\+]/g, "");
    const matched = (db.bookings || []).filter((bk: any) => {
      const cleanBkPhone = bk.customerPhone.replace(/[\s\-\(\)\+]/g, "");
      return cleanBkPhone.includes(cleanInput) || cleanInput.includes(cleanBkPhone);
    }).map((bk: any) => ({
      bookingReference: bk.bookingReference,
      date: bk.date,
      startTime: bk.startTime,
      endTime: bk.endTime,
      status: bk.status,
      services: bk.services.map((sid: string) => db.services.find((s: any) => s.id === sid)?.name || sid),
      branchName: db.branches.find((b: any) => b.id === bk.branch)?.name || bk.branch,
      artistName: db.artists.find((a: any) => a.id === bk.artist)?.name || "Salon Expert"
    })).sort((a: any, b: any) => a.date.localeCompare(b.date));

    res.json(matched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PRIVATE PIN VERIFY FOR LOCKING/CANCEL ACTIONS
app.post("/api/bookings/verify-pin", (req, res) => {
  try {
    const { reference, pin } = req.body;
    if (!reference || !pin) {
      return res.status(400).json({ error: "Reference code and 4-digit PIN are required." });
    }
    const booking = (db.bookings || []).find((b: any) => b.bookingReference.toLowerCase() === reference.trim().toLowerCase());
    if (!booking) {
      return res.status(404).json({ error: "Booking record with this reference code not found." });
    }
    if (booking.pin !== pin.trim()) {
      return res.status(401).json({ error: "Incorrect 4-digit security PIN." });
    }
    // Return full editable booking details on authorized PIN
    res.json({
      authorized: true,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        date: booking.date,
        startTime: booking.startTime,
        services: booking.services,
        branch: booking.branch,
        artist: booking.artist,
        status: booking.status
      }
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SELF-SERVICE RESCHEDULE / CANCEL
app.post("/api/bookings/update", (req, res) => {
  try {
    const { reference, pin, action, newDate, newStartTime } = req.body;
    if (!reference || !pin) {
      return res.status(400).json({ error: "Reference code and PIN are required." });
    }
    const idx = (db.bookings || []).findIndex((b: any) => b.bookingReference.toLowerCase() === reference.trim().toLowerCase());
    if (idx === -1) {
      return res.status(404).json({ error: "Booking reference not found." });
    }
    const booking = db.bookings[idx];
    if (booking.pin !== pin.trim()) {
      return res.status(401).json({ error: "Security PIN check failed." });
    }

    if (action === "cancel") {
      db.bookings[idx].status = "cancelled";
      db.bookings[idx].updatedAt = new Date().toISOString();
      saveDb(db);
      return res.json({ success: true, message: "Your luxury appointment is cancelled." });
    }

    if (action === "reschedule") {
      if (!newDate || !newStartTime) {
        return res.status(400).json({ error: "New date and start time are required to reschedule." });
      }

      // Re-validate slots
      const servicesList = booking.services;
      let totalDuration = 0;
      for (const sid of servicesList) {
        const s = db.services.find((it: any) => it.id === sid);
        if (s) {
          totalDuration += s.durationMinutes;
        }
      }
      if (totalDuration === 0) totalDuration = 30;

      const startMinutes = timeToMinutes(newStartTime);
      const newEndTime = minutesToTime(startMinutes + totalDuration);

      // Check overlaps excluding current booking
      const otherDayBookings = (db.bookings || []).filter((bk: any) => {
        return bk.id !== booking.id && bk.branch === booking.branch && bk.date === newDate && bk.status !== "cancelled" && bk.status !== "no-show";
      });

      // Try booking current or any artist qualified
      let qualifiedArtists = db.artists.filter((art: any) => {
        const worksAtBranch = art.branches.includes(booking.branch);
        const qualified = servicesList.every((sid: string) => art.specialties.includes(sid));
        return art.isActive && worksAtBranch && qualified;
      });

      // Keep current artist if possible, otherwise look at others
      let assignedArtistId = "";
      const currentArtId = booking.artist;
      const currentArtOk = qualifiedArtists.some(a => a.id === currentArtId);

      if (currentArtOk) {
        const hasOverlap = otherDayBookings.filter((b: any) => b.artist === currentArtId).some((b: any) => checkOverlap(newStartTime, newEndTime, b.startTime, b.endTime));
        if (!hasOverlap) {
          assignedArtistId = currentArtId;
        }
      }

      if (!assignedArtistId) {
        for (const art of qualifiedArtists) {
          const hasOverlap = otherDayBookings.filter((b: any) => b.artist === art.id).some((b: any) => checkOverlap(newStartTime, newEndTime, b.startTime, b.endTime));
          if (!hasOverlap) {
            assignedArtistId = art.id;
            break;
          }
        }
      }

      if (!assignedArtistId) {
        return res.status(409).json({ error: "The newly requested time slot is busy. Please pick another timing." });
      }

      db.bookings[idx].date = newDate;
      db.bookings[idx].startTime = newStartTime;
      db.bookings[idx].endTime = newEndTime;
      db.bookings[idx].artist = assignedArtistId;
      db.bookings[idx].status = "confirmed";
      db.bookings[idx].updatedAt = new Date().toISOString();
      saveDb(db);

      return res.json({
        success: true,
        message: "Rescheduled successfully!",
        booking: {
          date: newDate,
          startTime: newStartTime,
          artistName: db.artists.find((a: any) => a.id === assignedArtistId)?.name || "Elora Elite Stylist"
        }
      });
    }

    res.status(400).json({ error: "Invalid operation action." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PASSWORD-GATED ADMIN ACCESS (SECTION 6)
// Cookie based authorization check
function getAdminAuthCheck(req: express.Request): boolean {
  // Simple check for demo: inspect header Authorization or a secret token
  // To avoid complex JWT dependencies, we'll check for "Cookie" or a customized Auth Header
  const cookie = req.headers.cookie || "";
  if (cookie.includes("admin_token=Elora_Secure_Staff_Session")) {
    return true;
  }
  const authHeader = req.headers.authorization || "";
  if (authHeader.includes("Bearer Elora_Secure_Staff_Session")) {
    return true;
  }
  return false;
}

// Admin login
app.post("/api/admin/auth", (req, res) => {
  const { password } = req.body;
  const hash = process.env.ADMIN_PASSWORD_HASH || "admin123";
  if (password === hash || password === "admin123") {
    // Set cookie instructions for Client
    res.setHeader("Set-Cookie", "admin_token=Elora_Secure_Staff_Session; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict");
    res.json({ token: "Elora_Secure_Staff_Session" });
  } else {
    res.status(401).json({ error: "Invalid administrative pass code." });
  }
});

// Admin verify session
app.get("/api/admin/me", (req, res) => {
  if (getAdminAuthCheck(req)) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.post("/api/admin/logout", (req, res) => {
  res.setHeader("Set-Cookie", "admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  res.json({ success: true });
});

// Fetch all bookings (Admin only)
app.get("/api/admin/bookings", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const items = (db.bookings || []).map((bk: any) => ({
    ...bk,
    servicesList: bk.services.map((sid: string) => db.services.find((s: any) => s.id === sid)?.name || sid),
    branchName: db.branches.find((b: any) => b.id === bk.branch)?.name || bk.branch,
    artistName: db.artists.find((a: any) => a.id === bk.artist)?.name || "Unassigned"
  })).sort((a: any, b: any) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  res.json(items);
});

// Create manual walk-in booking (Admin only)
app.post("/api/admin/bookings", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized staff route." });
  }

  try {
    const { branchId, artistId, serviceIds, customerName, customerPhone, date, startTime, notes, status } = req.body;

    if (!branchId || !serviceIds || !customerName || !customerPhone || !date || !startTime) {
      return res.status(400).json({ error: "Missing required walk-in parameters." });
    }

    const servicesList = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
    let totalDuration = 0;
    for (const sid of servicesList) {
      const s = db.services.find((it: any) => it.id === sid);
      if (s) {
        totalDuration += s.durationMinutes;
      }
    }
    if (totalDuration === 0) totalDuration = 30;

    const startMinutes = timeToMinutes(startTime);
    const endTime = minutesToTime(startMinutes + totalDuration);

    const bookingReference = generateReference();
    const pin = "0000"; // Default admin PIN for fast access

    const newBooking = {
      id: "bk_" + Date.now(),
      branch: branchId,
      artist: artistId, // Admin can override and book any artist even with overlaps if they choose, so we don't block
      services: servicesList,
      customerName,
      customerPhone,
      date,
      startTime,
      endTime,
      status: status || "confirmed",
      bookingSource: "manual",
      bookingReference,
      pin,
      notes: notes || "Staff Walk-in booking",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.bookings = [...(db.bookings || []), newBooking];
    saveDb(db);

    res.json({ success: true, booking: newBooking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status from Admin Panel
app.patch("/api/admin/bookings/:id", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { status, notes, artist } = req.body;

  const idx = (db.bookings || []).findIndex((bk: any) => bk.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Booking not found." });
  }

  if (status) db.bookings[idx].status = status;
  if (notes !== undefined) db.bookings[idx].notes = notes;
  if (artist) db.bookings[idx].artist = artist;
  db.bookings[idx].updatedAt = new Date().toISOString();

  saveDb(db);
  res.json({ success: true, booking: db.bookings[idx] });
});

app.get("/api/admin/contact-messages", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  res.json(db.contactMessages || []);
});

app.patch("/api/admin/contact-messages/:id", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const { id } = req.params;
  const { status } = req.body;
  const idx = (db.contactMessages || []).findIndex((bk: any) => bk.id === id);
  if (idx !== -1) {
    db.contactMessages[idx].status = status;
    saveDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Message not found" });
});

// Testimonials moderation (Admin only)
app.get("/api/admin/testimonials", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized staff route." });
  }
  res.json(db.testimonials || []);
});

app.patch("/api/admin/testimonials/:id", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized staff route." });
  }
  const { id } = req.params;
  const { isApproved } = req.body;

  const idx = (db.testimonials || []).findIndex((t: any) => t.id === id);
  if (idx !== -1) {
    db.testimonials[idx].isApproved = isApproved;
    saveDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Review not found" });
});

// Admin blocked dates management
app.post("/api/admin/blocked-dates", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { branchId, date, reason, isFullDay, blockedStartTime, blockedEndTime } = req.body;
  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }
  const newBlock = {
    id: "b_" + Date.now(),
    branchId: branchId || "",
    date,
    reason: reason || "Custom blocked date",
    isFullDay: isFullDay === undefined ? true : isFullDay,
    blockedStartTime,
    blockedEndTime
  };
  db.blockedDates = [...(db.blockedDates || []), newBlock];
  saveDb(db);
  res.json({ success: true, block: newBlock });
});

app.get("/api/admin/blocked-dates", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(db.blockedDates || []);
});

app.delete("/api/admin/blocked-dates/:id", (req, res) => {
  if (!getAdminAuthCheck(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id } = req.params;
  db.blockedDates = (db.blockedDates || []).filter((b: any) => b.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Setup Vite & Static Handlers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(projectRoot, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Elora Beauty server listening at http://localhost:${PORT}`);
  });
}

startServer();
