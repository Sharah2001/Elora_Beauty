import {groq} from 'next-sanity'

const branchProjection = groq`
  "id": sourceId,
  name,
  "slug": slug.current,
  address,
  city,
  phone,
  whatsapp,
  "geo": location{
    lat,
    lng
  },
  "image": image.asset->url,
  "imageAlt": image.alt,
  isActive,
  displayOrder
`

const serviceProjection = groq`
  "id": sourceId,
  name,
  "slug": slug.current,
  category,
  description,
  durationMinutes,
  basePrice,
  "image": image.asset->url,
  "imageAlt": image.alt,
  "branches": branches[]->sourceId,
  isActive,
  displayOrder
`

export const branchesQuery = groq`
  *[_type == "branch" && isActive == true] | order(displayOrder asc, name asc) {
    ${branchProjection}
  }
`

export const servicesQuery = groq`
  *[_type == "service" && isActive == true] | order(displayOrder asc, category asc, name asc) {
    ${serviceProjection}
  }
`

export const artistsQuery = groq`
  *[_type == "artist" && isActive == true] | order(displayOrder asc, name asc) {
    "id": sourceId,
    name,
    "slug": slug.current,
    "photo": photo.asset->url,
    "photoAlt": photo.alt,
    bio,
    role,
    experienceYears,
    "specialties": specialties[]->sourceId,
    "branches": branches[]->sourceId,
    "certifications": certifications[]->{
      "id": sourceId,
      title,
      issuer,
      reference
    },
    isActive,
    displayOrder
  }
`

export const packagesQuery = groq`
  *[_type == "package" && isActive == true] | order(displayOrder asc, name asc) {
    "id": sourceId,
    name,
    "slug": slug.current,
    "includedServices": includedServices[]->sourceId,
    "branches": branches[]->sourceId,
    totalPrice,
    discountNote,
    description,
    "image": image.asset->url,
    "imageAlt": image.alt,
    isActive,
    displayOrder
  }
`

export const offersQuery = groq`
  *[
    _type == "offer" &&
    isActive == true &&
    validFrom <= $today &&
    validUntil >= $today
  ] | order(validUntil asc, title asc) {
    "id": sourceId,
    title,
    description,
    discountType,
    discountValue,
    validFrom,
    validUntil,
    "applicableServices": applicableServices[]->sourceId,
    "image": image.asset->url,
    "imageAlt": image.alt,
    isActive
  }
`

export const faqsQuery = groq`
  *[_type == "faq" && isActive == true] | order(displayOrder asc, category asc, question asc) {
    "id": sourceId,
    question,
    answer,
    category,
    displayOrder
  }
`

export const galleryItemsQuery = groq`
  *[_type == "galleryItem" && isActive == true] | order(_createdAt desc)[0...24] {
    "id": sourceId,
    title,
    category,
    "image": image.asset->url,
    "imageAlt": image.alt,
    description,
    "createdAt": _createdAt,
    displayOrder
  }
`

export const beforeAfterQuery = groq`
  *[_type == "beforeAfter" && isActive == true] | order(displayOrder asc, title asc) {
    "id": sourceId,
    title,
    caption,
    serviceCategory,
    "service": service->sourceId,
    "beforeImage": beforeImage.asset->url,
    "beforeImageAlt": beforeImage.alt,
    "afterImage": afterImage.asset->url,
    "afterImageAlt": afterImage.alt,
    isActive,
    displayOrder
  }
`

export const certificationsQuery = groq`
  *[_type == "certification" && isActive == true] | order(displayOrder asc, title asc) {
    "id": sourceId,
    title,
    issuer,
    reference,
    description,
    "image": image.asset->url,
    "imageAlt": image.alt,
    isActive,
    displayOrder
  }
`

export const approvedTestimonialsQuery = groq`
  *[_type == "testimonial" && isApproved == true] | order(submittedAt desc) {
    "id": sourceId,
    customerName,
    rating,
    comment,
    "serviceReceived": serviceReceived->sourceId,
    "branch": branch->sourceId,
    isApproved,
    submittedAt
  }
`

export const workingHoursQuery = groq`
  *[_type == "workingHours"] | order(branch->displayOrder asc, branch->name asc) {
    "id": sourceId,
    "branchId": branch->sourceId,
    slotDurationMinutes,
    schedule[]{
      dayOfWeek,
      openTime,
      closeTime,
      isClosed
    }
  }
`

export const blockedDatesQuery = groq`
  *[_type == "blockedDate" && date >= $fromDate] | order(date asc) {
    "id": sourceId,
    "branchId": branch->sourceId,
    date,
    reason,
    isFullDay,
    blockedStartTime,
    blockedEndTime
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    businessName,
    heroEyebrow,
    heroTitle,
    heroDescription,
    heroServiceLabel,
    heroButtonLabel,
    "heroImage": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    aboutTitle,
    aboutDescription,
    "aboutImage": aboutImage.asset->url,
    "aboutImageAlt": aboutImage.alt,
    aboutHighlights,
    contactEmail,
    instagramUrl,
    facebookUrl,
    googleBusinessUrl,
    seoTitle,
    seoDescription
  }
`
