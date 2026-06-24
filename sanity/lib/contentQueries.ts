import {groq} from 'next-sanity'

const branchProjection = groq`
  _id,
  name,
  "slug": slug.current,
  address,
  city,
  phone,
  whatsapp,
  location,
  image,
  "imageAlt": image.alt,
  displayOrder
`

const serviceProjection = groq`
  _id,
  name,
  "slug": slug.current,
  category,
  description,
  durationMinutes,
  basePrice,
  image,
  "imageAlt": image.alt,
  "branches": branches[]->{
    ${branchProjection}
  },
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
    _id,
    name,
    "slug": slug.current,
    photo,
    "photoAlt": photo.alt,
    bio,
    "specialties": specialties[]->{
      _id,
      name,
      "slug": slug.current,
      category,
      durationMinutes,
      basePrice
    },
    "branches": branches[]->{
      ${branchProjection}
    },
    displayOrder
  }
`

export const packagesQuery = groq`
  *[_type == "package" && isActive == true] | order(displayOrder asc, name asc) {
    _id,
    name,
    totalPrice,
    discountNote,
    description,
    image,
    "imageAlt": image.alt,
    "includedServices": includedServices[]->{
      _id,
      name,
      "slug": slug.current,
      category,
      durationMinutes,
      basePrice
    },
    displayOrder
  }
`

export const offersQuery = groq`
  *[
    _type == "offer" &&
    isActive == true &&
    dateTime(validFrom) <= dateTime(now()) &&
    dateTime(validUntil) >= dateTime(now())
  ] | order(validUntil asc, title asc) {
    _id,
    title,
    description,
    discountType,
    discountValue,
    validFrom,
    validUntil,
    image,
    "imageAlt": image.alt,
    "applicableServices": applicableServices[]->{
      _id,
      name,
      "slug": slug.current,
      category,
      durationMinutes,
      basePrice
    }
  }
`

export const faqsQuery = groq`
  *[_type == "faq" && isActive == true] | order(displayOrder asc, category asc, question asc) {
    _id,
    question,
    answer,
    category,
    displayOrder
  }
`

export const galleryItemsQuery = groq`
  *[_type == "galleryItem" && isActive == true] | order(_createdAt desc)[0...24] {
    _id,
    _createdAt,
    title,
    category,
    image,
    "imageAlt": image.alt,
    description,
    displayOrder
  }
`

export const beforeAfterQuery = groq`
  *[_type == "beforeAfter" && isActive == true] | order(displayOrder asc, title asc) {
    _id,
    title,
    caption,
    serviceCategory,
    "service": service->{
      _id,
      name,
      "slug": slug.current,
      category
    },
    beforeImage,
    "beforeImageAlt": beforeImage.alt,
    afterImage,
    "afterImageAlt": afterImage.alt,
    displayOrder
  }
`

export const certificationsQuery = groq`
  *[_type == "certification" && isActive == true] | order(displayOrder asc, title asc) {
    _id,
    title,
    issuer,
    reference,
    description,
    image,
    displayOrder
  }
`

export const approvedTestimonialsQuery = groq`
  *[_type == "testimonial" && isApproved == true] | order(submittedAt desc) {
    _id,
    customerName,
    rating,
    comment,
    submittedAt,
    "serviceReceived": serviceReceived->{
      _id,
      name,
      "slug": slug.current,
      category
    },
    "branch": branch->{
      ${branchProjection}
    }
  }
`

export const workingHoursQuery = groq`
  *[_type == "workingHours"] | order(branch->displayOrder asc, branch->name asc) {
    _id,
    slotDurationMinutes,
    schedule[]{
      dayOfWeek,
      openTime,
      closeTime,
      isClosed
    },
    "branch": branch->{
      ${branchProjection}
    }
  }
`

export const blockedDatesQuery = groq`
  *[_type == "blockedDate" && date >= $fromDate] | order(date asc) {
    _id,
    date,
    reason,
    isFullDay,
    blockedStartTime,
    blockedEndTime,
    "branch": branch->{
      ${branchProjection}
    }
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    _id,
    businessName,
    heroEyebrow,
    heroTitle,
    heroDescription,
    heroImage,
    "heroImageAlt": heroImage.alt,
    contactEmail,
    instagramUrl,
    facebookUrl,
    googleBusinessUrl,
    seoTitle,
    seoDescription
  }
`
