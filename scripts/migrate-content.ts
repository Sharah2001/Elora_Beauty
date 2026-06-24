import dotenv from 'dotenv'
dotenv.config({path: '.env.local'})

import fs from 'node:fs'
import path from 'node:path'
import {createClient, type SanityDocumentStub} from 'next-sanity'

type JsonRecord = Record<string, unknown>
type SanityImage = {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
  alt?: string
}
type MigrationDocument = SanityDocumentStub & {_id: string}

const isDryRun = process.argv.includes('--dry-run')
const sourcePath = path.join(process.cwd(), 'db-store.json')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-06-23'

if (!projectId) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required in .env.local')
}

if (!isDryRun && !token) {
  throw new Error('SANITY_API_WRITE_TOKEN is required in .env.local')
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Migration source not found: ${sourcePath}`)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const db = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as JsonRecord
const serviceIds = new Set(readCollection('services').map((item) => stringValue(item.id)))
const branchIds = new Set(readCollection('branches').map((item) => stringValue(item.id)))

const migrationCounts = {
  created: 0,
  skipped: 0,
  failed: 0,
}

// Old data uses a few broad service labels that do not match the service IDs.
const legacyServiceAliases: Record<string, string> = {
  'hair-cut': 'ladies-haircut',
  'hair-coloring': 'global-hair-colour',
  'nail-gel': 'gel-manicure',
  'pro-makeup': 'party-makeup',
  'skin-glow': 'hydrating-glow-facial',
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readCollection(key: string): JsonRecord[] {
  const value = db[key]
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
}

function safeId(value: unknown): string {
  const id = String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')

  if (!id) {
    throw new Error(`Unable to create a Sanity ID from "${String(value)}"`)
  }

  return id
}

function documentId(type: string, sourceId: unknown): string {
  return `${type}-${safeId(sourceId)}`
}

function slug(value: unknown, fallback: unknown): {_type: 'slug'; current: string} {
  return {
    _type: 'slug',
    current: safeId(stringValue(value) || fallback),
  }
}

function reference(type: string, sourceId: string) {
  return {
    _type: 'reference' as const,
    _ref: documentId(type, sourceId),
  }
}

function keyedReference(type: string, sourceId: string, index: number) {
  return {
    _key: `${safeId(sourceId)}-${index}`,
    ...reference(type, sourceId),
  }
}

function resolveServiceId(sourceId: string): string | undefined {
  if (serviceIds.has(sourceId)) {
    return sourceId
  }

  const alias = legacyServiceAliases[sourceId]
  return alias && serviceIds.has(alias) ? alias : undefined
}

function serviceReferences(value: unknown, owner: string) {
  return stringArray(value).flatMap((sourceId, index) => {
    const resolvedId = resolveServiceId(sourceId)

    if (!resolvedId) {
      console.warn(`  Warning: ${owner} references unknown service "${sourceId}"; skipped.`)
      return []
    }

    return [keyedReference('service', resolvedId, index)]
  })
}

function branchReferences(value: unknown, owner: string) {
  return stringArray(value).flatMap((sourceId, index) => {
    if (!branchIds.has(sourceId)) {
      console.warn(`  Warning: ${owner} references unknown branch "${sourceId}"; skipped.`)
      return []
    }

    return [keyedReference('branch', sourceId, index)]
  })
}

function normalizeCategory(value: unknown): string {
  const category = stringValue(value)

  if (category.startsWith('Hair')) return 'Hair'
  if (category.startsWith('Skin')) return 'Skin'

  return category
}

function imageCandidatePaths(source: string): string[] {
  const normalizedSource = source.replace(/^[/\\]+/, '')
  const extensions = path.extname(normalizedSource) ? [''] : ['.png', '.jpg', '.jpeg', '.webp']
  const roots = [
    process.cwd(),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'public', 'images'),
  ]

  return roots.flatMap((root) =>
    extensions.map((extension) => path.resolve(root, `${normalizedSource}${extension}`)),
  )
}

async function imageValue(
  source: unknown,
  alt: string,
  owner: string,
): Promise<SanityImage | undefined> {
  if (!source) return undefined

  if (isRecord(source) && isRecord(source.asset) && typeof source.asset._ref === 'string') {
    return source as SanityImage
  }

  if (typeof source !== 'string') {
    console.warn(`  Warning: ${owner} has an unsupported image value; skipped.`)
    return undefined
  }

  const imageSource = source.trim()
  if (!imageSource) return undefined

  if (/^https?:\/\//i.test(imageSource)) {
    if (isDryRun) {
      console.log(`  Dry run: would download image for ${owner} from ${imageSource}`)
      return undefined
    }

    const response = await fetch(imageSource)

    if (!response.ok) {
      throw new Error(`Image download failed (${response.status}) for ${imageSource}`)
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const asset = await client.assets.upload('image', bytes, {
      contentType,
      filename: path.basename(new URL(response.url).pathname) || `${safeId(owner)}.jpg`,
    })

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt,
    }
  }

  const localPath = imageCandidatePaths(imageSource).find((candidate) => fs.existsSync(candidate))

  if (!localPath) {
    console.warn(`  Warning: image "${imageSource}" for ${owner} was not found; skipped.`)
    return undefined
  }

  if (isDryRun) {
    console.log(`  Dry run: would upload image for ${owner} from ${localPath}`)
    return undefined
  }

  const asset = await client.assets.upload('image', fs.createReadStream(localPath), {
    filename: path.basename(localPath),
  })

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
    alt,
  }
}

function compact<T extends JsonRecord>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as T
}

async function writeDocument(document: MigrationDocument, label: string) {
  if (isDryRun) {
    console.log(`  Would migrate ${label} (${document._id})`)
    migrationCounts.created += 1
    return
  }

  await client.createOrReplace(document)
  console.log(`  Migrated ${label}`)
  migrationCounts.created += 1
}

async function migrateCollection(
  label: string,
  items: JsonRecord[],
  transform: (item: JsonRecord, index: number) => Promise<MigrationDocument>,
) {
  console.log(`\n${label}: ${items.length} item(s)`)

  if (items.length === 0) {
    migrationCounts.skipped += 1
    console.log('  Skipped: no source data.')
    return
  }

  for (const [index, item] of items.entries()) {
    try {
      const document = await transform(item, index)
      await writeDocument(document, `${label} ${index + 1}/${items.length}`)
    } catch (error) {
      migrationCounts.failed += 1
      console.error(`  Failed ${label} ${index + 1}/${items.length}:`, error)
    }
  }
}

async function migrateBranches() {
  await migrateCollection('1. Branches', readCollection('branches'), async (item, index) => {
    const sourceId = stringValue(item.id, `branch-${index + 1}`)
    const name = stringValue(item.name, sourceId)
    const geo = isRecord(item.geo) ? item.geo : undefined

    return compact({
      _id: documentId('branch', sourceId),
      _type: 'branch',
      sourceId,
      name,
      slug: slug(item.slug, name),
      address: stringValue(item.address),
      city: stringValue(item.city),
      phone: stringValue(item.phone),
      whatsapp: stringValue(item.whatsapp) || undefined,
      location: geo
        ? {
            _type: 'geopoint',
            lat: numberValue(geo.lat),
            lng: numberValue(geo.lng),
          }
        : undefined,
      image: await imageValue(item.image, name, `branch "${name}"`),
      isActive: booleanValue(item.isActive, true),
      displayOrder: numberValue(item.displayOrder, index),
    })
  })
}

async function migrateServices() {
  await migrateCollection('2. Services', readCollection('services'), async (item, index) => {
    const sourceId = stringValue(item.id, `service-${index + 1}`)
    const name = stringValue(item.name, sourceId)

    return compact({
      _id: documentId('service', sourceId),
      _type: 'service',
      sourceId,
      name,
      slug: slug(item.slug, name),
      category: normalizeCategory(item.category),
      description: stringValue(item.description),
      durationMinutes: numberValue(item.durationMinutes),
      basePrice: numberValue(item.basePrice),
      image: await imageValue(item.image, name, `service "${name}"`),
      branches: branchReferences(item.branches, `service "${name}"`),
      isActive: booleanValue(item.isActive, true),
      displayOrder: numberValue(item.displayOrder, index),
    })
  })
}

async function migrateArtists() {
  await migrateCollection('3. Artists', readCollection('artists'), async (item, index) => {
    const sourceId = stringValue(item.id, `artist-${index + 1}`)
    const name = stringValue(item.name, sourceId)

    return compact({
      _id: documentId('artist', sourceId),
      _type: 'artist',
      sourceId,
      name,
      slug: slug(item.slug, name),
      photo: await imageValue(item.photo, name, `artist "${name}"`),
      bio: stringValue(item.bio),
      specialties: serviceReferences(item.specialties, `artist "${name}"`),
      branches: branchReferences(item.branches, `artist "${name}"`),
      isActive: booleanValue(item.isActive, true),
      displayOrder: numberValue(item.displayOrder, index),
    })
  })
}

async function migrateWorkingHours() {
  await migrateCollection('4. Working Hours', readCollection('workingHours'), async (item, index) => {
    const branchId = stringValue(item.branchId, `branch-${index + 1}`)
    const schedule = Array.isArray(item.schedule) ? item.schedule.filter(isRecord) : []

    return {
      _id: documentId('workingHours', branchId),
      _type: 'workingHours',
      sourceId: branchId,
      branch: reference('branch', branchId),
      slotDurationMinutes: numberValue(item.slotDurationMinutes, 30),
      schedule: schedule.map((day, dayIndex) => ({
        _key: `${stringValue(day.dayOfWeek, 'day').toLowerCase()}-${dayIndex}`,
        _type: 'daySchedule',
        dayOfWeek: stringValue(day.dayOfWeek),
        openTime: stringValue(day.openTime) || undefined,
        closeTime: stringValue(day.closeTime) || undefined,
        isClosed: booleanValue(day.isClosed, false),
      })),
    }
  })
}

async function migrateBlockedDates() {
  await migrateCollection('5. Blocked Dates', readCollection('blockedDates'), async (item, index) => {
    const sourceId = stringValue(item.id, stringValue(item.date, `blocked-${index + 1}`))
    const branchId = stringValue(item.branchId)
    const isFullDay = booleanValue(item.isFullDay, true)

    return compact({
      _id: documentId('blockedDate', sourceId),
      _type: 'blockedDate',
      sourceId,
      branch: branchId ? reference('branch', branchId) : undefined,
      date: stringValue(item.date),
      reason: stringValue(item.reason) || undefined,
      isFullDay,
      blockedStartTime: !isFullDay ? stringValue(item.blockedStartTime) || undefined : undefined,
      blockedEndTime: !isFullDay ? stringValue(item.blockedEndTime) || undefined : undefined,
    })
  })
}

async function migratePackages() {
  await migrateCollection('6. Packages', readCollection('packages'), async (item, index) => {
    const sourceId = stringValue(item.id, `package-${index + 1}`)
    const name = stringValue(item.name, sourceId)

    return compact({
      _id: documentId('package', sourceId),
      _type: 'package',
      sourceId,
      name,
      includedServices: serviceReferences(item.includedServices, `package "${name}"`),
      totalPrice: numberValue(item.totalPrice),
      discountNote: stringValue(item.discountNote) || undefined,
      description: stringValue(item.description) || undefined,
      image: await imageValue(item.image, name, `package "${name}"`),
      isActive: booleanValue(item.isActive, true),
      displayOrder: numberValue(item.displayOrder, index),
    })
  })
}

async function migrateOffers() {
  await migrateCollection('7. Offers', readCollection('offers'), async (item, index) => {
    const sourceId = stringValue(item.id, `offer-${index + 1}`)
    const title = stringValue(item.title, sourceId)

    return compact({
      _id: documentId('offer', sourceId),
      _type: 'offer',
      sourceId,
      title,
      description: stringValue(item.description) || undefined,
      discountType: stringValue(item.discountType),
      discountValue: numberValue(item.discountValue),
      validFrom: stringValue(item.validFrom),
      validUntil: stringValue(item.validUntil),
      applicableServices: serviceReferences(item.applicableServices, `offer "${title}"`),
      image: await imageValue(item.image, title, `offer "${title}"`),
      isActive: booleanValue(item.isActive, true),
    })
  })
}

async function migrateFaqs() {
  await migrateCollection('8. FAQs', readCollection('faqs'), async (item, index) => {
    const sourceId = stringValue(item.id, `faq-${index + 1}`)

    return compact({
      _id: documentId('faq', sourceId),
      _type: 'faq',
      sourceId,
      question: stringValue(item.question),
      answer: stringValue(item.answer),
      category: stringValue(item.category) || undefined,
      displayOrder: numberValue(item.displayOrder, index),
      isActive: booleanValue(item.isActive, true),
    })
  })
}

async function migrateGalleryItems() {
  const galleryItems = readCollection('galleryItems')
  const legacyGalleryItems = galleryItems.length > 0 ? galleryItems : readCollection('gallery')

  const latestGalleryItems = [...legacyGalleryItems]
    .sort((left, right) =>
      stringValue(right.createdAt).localeCompare(stringValue(left.createdAt)),
    )
    .slice(0, 24)

  await migrateCollection('9. Gallery Items', latestGalleryItems, async (item, index) => {
    const sourceId = stringValue(item.id, `gallery-${index + 1}`)
    const title = stringValue(item.title, `Gallery item ${index + 1}`)

    return compact({
      _id: documentId('galleryItem', sourceId),
      _type: 'galleryItem',
      sourceId,
      title,
      category: stringValue(item.category) || undefined,
      image: await imageValue(item.image, title, `gallery item "${title}"`),
      description: stringValue(item.description) || undefined,
      isActive: booleanValue(item.isActive, true),
      displayOrder: numberValue(item.displayOrder, index),
    })
  })
}

async function migrateBeforeAfter() {
  await migrateCollection('10. Before After', readCollection('beforeAfter'), async (item, index) => {
    const sourceId = stringValue(item.id, `before-after-${index + 1}`)
    const caption = stringValue(item.caption)
    const title = stringValue(item.title, caption || `Before and after ${index + 1}`)
    const serviceId = resolveServiceId(stringValue(item.service))

    return compact({
      _id: documentId('beforeAfter', sourceId),
      _type: 'beforeAfter',
      sourceId,
      title,
      caption,
      serviceCategory: normalizeCategory(item.serviceCategory),
      service: serviceId ? reference('service', serviceId) : undefined,
      beforeImage: await imageValue(item.beforeImage, `Before: ${title}`, `before image "${title}"`),
      afterImage: await imageValue(item.afterImage, `After: ${title}`, `after image "${title}"`),
      isActive: booleanValue(item.isActive, true),
      displayOrder: numberValue(item.displayOrder, index),
    })
  })
}

async function migrateCertifications() {
  await migrateCollection(
    '11. Certifications',
    readCollection('certifications'),
    async (item, index) => {
      const sourceId = stringValue(item.id, `certification-${index + 1}`)
      const title = stringValue(item.title, sourceId)
      const yearAwarded = numberValue(item.yearAwarded)

      return compact({
        _id: documentId('certification', sourceId),
        _type: 'certification',
        sourceId,
        title,
        issuer: stringValue(item.issuer) || undefined,
        reference: stringValue(item.reference) || undefined,
        description:
          stringValue(item.description) ||
          (yearAwarded ? `Awarded in ${yearAwarded}` : undefined),
        image: await imageValue(item.image, title, `certification "${title}"`),
        isActive: booleanValue(item.isActive, true),
        displayOrder: numberValue(item.displayOrder, index),
      })
    },
  )
}

async function migrateApprovedTestimonials() {
  const approved = readCollection('testimonials').filter((item) =>
    booleanValue(item.isApproved, false),
  )

  await migrateCollection('12. Existing Approved Testimonials', approved, async (item, index) => {
    const sourceId = stringValue(item.id, `testimonial-${index + 1}`)
    const serviceId = resolveServiceId(stringValue(item.serviceReceived))
    const branchId = stringValue(item.branch)

    return compact({
      _id: documentId('testimonial', sourceId),
      _type: 'testimonial',
      sourceId,
      customerName: stringValue(item.customerName, 'Anonymous'),
      rating: numberValue(item.rating, 5),
      comment: stringValue(item.comment),
      serviceReceived: serviceId ? reference('service', serviceId) : undefined,
      branch: branchId && branchIds.has(branchId) ? reference('branch', branchId) : undefined,
      isApproved: true,
      submittedAt: stringValue(item.submittedAt, new Date().toISOString()),
    })
  })
}

async function migrateSiteSettings() {
  const source = db.siteSettings
  const settings = Array.isArray(source)
    ? source.filter(isRecord)
    : isRecord(source)
      ? [source]
      : []

  await migrateCollection('13. Site Settings', settings, async (item) => {
    const businessName = stringValue(item.businessName, 'Elora Beauty')

    return compact({
      _id: 'siteSettings',
      _type: 'siteSettings',
      businessName,
      heroEyebrow: stringValue(item.heroEyebrow) || undefined,
      heroTitle: stringValue(item.heroTitle) || undefined,
      heroDescription: stringValue(item.heroDescription) || undefined,
      heroServiceLabel: stringValue(item.heroServiceLabel) || undefined,
      heroButtonLabel: stringValue(item.heroButtonLabel) || undefined,
      heroImage: await imageValue(item.heroImage, businessName, 'site settings hero'),
      aboutTitle: stringValue(item.aboutTitle) || undefined,
      aboutDescription: stringValue(item.aboutDescription) || undefined,
      aboutImage: await imageValue(item.aboutImage, businessName, 'site settings about'),
      aboutHighlights: stringArray(item.aboutHighlights),
      contactEmail: stringValue(item.contactEmail) || undefined,
      instagramUrl: stringValue(item.instagramUrl) || undefined,
      facebookUrl: stringValue(item.facebookUrl) || undefined,
      googleBusinessUrl: stringValue(item.googleBusinessUrl) || undefined,
      seoTitle: stringValue(item.seoTitle) || undefined,
      seoDescription: stringValue(item.seoDescription) || undefined,
    })
  })
}

async function run() {
  console.log(`Sanity content migration${isDryRun ? ' (dry run)' : ''}`)
  console.log(`Project: ${projectId}`)
  console.log(`Dataset: ${dataset}`)
  console.log(`Source: ${sourcePath}`)

  await migrateBranches()
  await migrateServices()
  await migrateArtists()
  await migrateWorkingHours()
  await migrateBlockedDates()
  await migratePackages()
  await migrateOffers()
  await migrateFaqs()
  await migrateGalleryItems()
  await migrateBeforeAfter()
  await migrateCertifications()
  await migrateApprovedTestimonials()
  await migrateSiteSettings()

  console.log('\nMigration summary')
  console.log(`  ${isDryRun ? 'Validated' : 'Migrated'}: ${migrationCounts.created}`)
  console.log(`  Empty sections skipped: ${migrationCounts.skipped}`)
  console.log(`  Failed: ${migrationCounts.failed}`)

  if (migrationCounts.failed > 0) {
    process.exitCode = 1
  }
}

run().catch((error) => {
  console.error('\nMigration stopped:', error)
  process.exitCode = 1
})
