export interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  whatsapp?: string;
  geo?: { lat: number; lng: number };
  image: string;
  imageAlt?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface DaySchedule {
  dayOfWeek: string; // "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
  openTime: string; // "09:00"
  closeTime: string; // "19:30"
  isClosed: boolean;
}

export interface WorkingHours {
  branchId: string;
  schedule: DaySchedule[];
  slotDurationMinutes: number; // e.g., 30
}

export interface BlockedDate {
  id: string;
  branchId?: string; // empty means "all branches"
  date: string; // "YYYY-MM-DD"
  reason?: string;
  isFullDay: boolean;
  blockedStartTime?: string;
  blockedEndTime?: string;
}


export interface Artist {
  id: string;
  name: string;
  slug: string;
  photo: string;
  photoAlt?: string;
  bio: string;
  role?: string;
  experienceYears?: number;
  specialties: string[]; // List of service IDs
  branches: string[]; // List of branch IDs
  certifications?: Pick<Certification, "id" | "title" | "issuer" | "reference">[];
  isActive: boolean;
  displayOrder: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string; // "Makeup" | "Hair" | "Nails" | "Skin" | "Bridal" | "Body"
  description: string;
  durationMinutes: number;
  basePrice: number;
  image?: string;
  imageAlt?: string;
  branches: string[]; // availability per branch
  isActive: boolean;
}

export interface Package {
  id: string;
  name: string;
  slug?: string;
  includedServices: string[]; // Service IDs
  branches?: string[];
  totalPrice: number;
  discountNote?: string; // e.g. "Save 15%"
  description: string;
  image?: string;
  imageAlt?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  validFrom: string; // "YYYY-MM-DD"
  validUntil: string; // "YYYY-MM-DD"
  applicableServices?: string[]; // Service IDs
  image?: string;
  imageAlt?: string;
  isActive: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  serviceReceived?: string; // Service ID
  branch?: string; // Branch ID
  isApproved: boolean;
  submittedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer?: string;
  reference?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  displayOrder: number;
}

export interface BeforeAfter {
  id: string;
  title: string;
  caption: string;
  serviceCategory: string;
  service?: string;
  beforeImage: string;
  beforeImageAlt?: string;
  afterImage: string;
  afterImageAlt?: string;
  displayOrder: number;
}

export interface SiteSettings {
  businessName?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroServiceLabel?: string;
  heroButtonLabel?: string;
  heroBackgroundImage?: string;
  heroBackgroundImageAlt?: string;
  heroImage?: string;
  heroImageAlt?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  aboutImageAlt?: string;
  aboutHighlights?: string[];
  contactEmail?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  googleBusinessUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "no-show" | "cancelled";

export interface Booking {
  id: string;
  branch: string; // Branch ID
  artist?: string; // Artist ID or "" for "Any Available"
  services: string[]; // Service IDs
  customerName: string;
  customerPhone: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "14:30"
  endTime: string; // "15:30"
  status: BookingStatus;
  bookingSource: "online" | "manual";
  bookingReference: string; // e.g. "BK-7F3K2"
  pin: string; // 4-digit code e.g. "4932"
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot{
  startTime: string;
  endTime: string;
  available: boolean;
  artistId?: string;
  branchId?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  branch?: string; // Branch ID
  status: "new" | "read" | "responded";
  submittedAt: string;
}

export interface RescheduleRequest {
  bookingId: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}

export interface BookingLookupResult {
  customerPhone: string;
  bookings: Booking[];
}

export interface BookingCancellationRequest {
  bookingId: string;
  customerPhone: string;
  pin: string;
  reason?: string;
  cancelledAt: string;
  cancelledBy: "customer" | "staff";
}
