import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion:
    process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-06-23',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

console.log('PROJECT:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
console.log('DATASET:', process.env.NEXT_PUBLIC_SANITY_DATASET)

const db = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'db-store.json'),
    'utf8'
  )
)

function safeId(value: unknown) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getItemId(item: any, type: string) {
  return (
    item.id ||
    item.branchId ||
    item.slug ||
    item.name ||
    item.title ||
    item.date ||
    type
  )
}

async function migrate(
  collection: any[] = [],
  type: string
) {
  if (!collection.length) {
    console.log(`Skipping ${type} (empty collection)`)
    return
  }

  for (const item of collection) {
    try {
      const rawId = getItemId(item, type)

      await writeClient.createOrReplace({
        _id: `${type}-${safeId(rawId)}`,
        _type: type,
        ...item,
      })

      console.log(
        `Migrated ${type}:`,
        item.name ||
          item.title ||
          item.id ||
          item.branchId ||
          rawId
      )
    } catch (err) {
      console.error(
        `Failed ${type}:`,
        item.name ||
          item.title ||
          item.id ||
          item.branchId
      )

      console.error(err)
    }
  }
}

async function run() {
  await migrate(db.branches, 'branch')

  await migrate(db.services, 'service')

  await migrate(db.artists, 'artist')

  await migrate(db.workingHours, 'workingHours')

  await migrate(db.packages, 'package')

  await migrate(db.offers, 'offer')

  await migrate(db.faqs, 'faq')

  await migrate(db.testimonials, 'testimonial')

  await migrate(db.bookings, 'booking')

  await migrate(db.contactMessages, 'contactMessage')

  await migrate(db.certifications, 'certification')

  await migrate(db.beforeAfter, 'beforeAfter')

  await migrate(db.blockedDates, 'blockedDate')

  console.log('\n✅ Migration completed successfully.')
}

run().catch((error) => {
  console.error('\n❌ Migration failed')

  console.error(error)

  process.exit(1)
})