import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createClient} from '@sanity/client'

const envPath = resolve(process.cwd(), '.env.local')

try {
  const envFile = readFileSync(envPath, 'utf8')

  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue
    }

    const [key, ...valueParts] = trimmed.split('=')
    const value = valueParts.join('=').replace(/^["']|["']$/g, '')

    process.env[key] = value
  }
} catch {
  console.warn('No .env.local file found. Falling back to existing environment variables.')
}

const requiredEnv = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'NEXT_PUBLIC_SANITY_API_VERSION',
  'SANITY_API_WRITE_TOKEN',
]

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

const assignee = 'sathurgini'
const reportedTotalHours = 32

const tasks = [
  {
    task: 'Hero Section (homepage banner)',
    hours: 3,
    relatedSchemaTypes: [],
  },
  {
    task: 'Branch schema + branch selector',
    hours: 3,
    relatedSchemaTypes: ['branch'],
  },
  {
    task: 'Locations page (map per branch)',
    hours: 2,
    relatedSchemaTypes: [],
  },
  {
    task: 'About Us',
    hours: 1.5,
    relatedSchemaTypes: [],
  },
  {
    task: 'Artist List (staff profiles)',
    hours: 2,
    relatedSchemaTypes: ['artist'],
  },
  {
    task: 'Certifications / Awards',
    hours: 1,
    relatedSchemaTypes: ['certification'],
  },
  {
    task: 'Gallery + Before-After + Previous Work',
    hours: 3,
    relatedSchemaTypes: ['galleryItem', 'beforeAfter'],
  },
  {
    task: 'Services + Packages',
    hours: 3,
    relatedSchemaTypes: ['service', 'package'],
  },
  {
    task: 'Offers / Promotions',
    hours: 2,
    relatedSchemaTypes: ['offer'],
  },
  {
    task: 'Reviews (display existing)',
    hours: 1.5,
    relatedSchemaTypes: ['testimonial'],
  },
  {
    task: 'FAQ',
    hours: 1.5,
    relatedSchemaTypes: ['faq'],
  },
  {
    task: 'Working hours / blocked dates schema (owner edits in Sanity)',
    hours: 3,
    relatedSchemaTypes: ['workingHours', 'blockedDate'],
  },
  {
    task: 'Design system: Tailwind colors/fonts, shared Navbar/Footer/Button/Card',
    hours: 5,
    relatedSchemaTypes: [],
  },
]

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const transaction = client.transaction()

tasks.forEach((item, index) => {
  transaction.createOrReplace({
    _id: `taskHour.${assignee}.${slugify(item.task)}`,
    _type: 'taskHour',
    assignee,
    task: item.task,
    hours: item.hours,
    relatedSchemaTypes: item.relatedSchemaTypes,
    status: 'Completed',
    displayOrder: index + 1,
  })
})

await transaction.commit()

const calculatedTotalHours = tasks.reduce((total, item) => total + item.hours, 0)

console.log(`Migrated ${tasks.length} task-hour records for ${assignee}.`)
console.log(`Calculated total: ${calculatedTotalHours} hrs`)
console.log(`Reported total: ${reportedTotalHours} hrs`)

if (calculatedTotalHours !== reportedTotalHours) {
  console.log(`Difference: ${reportedTotalHours - calculatedTotalHours} hrs`)
}
