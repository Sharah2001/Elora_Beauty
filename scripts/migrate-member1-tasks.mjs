import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const envPath = resolve(process.cwd(), '.env.local')

try {
  const envFile = readFileSync(envPath, 'utf8')

  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue
    }

    const [key, ...valueParts] = trimmed.split('=')
    process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '')
  }
} catch {
  console.warn('No .env.local file found. Falling back to existing environment variables.')
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION
const token = process.env.SANITY_API_WRITE_TOKEN

for (const [key, value] of Object.entries({
  NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  NEXT_PUBLIC_SANITY_DATASET: dataset,
  NEXT_PUBLIC_SANITY_API_VERSION: apiVersion,
  SANITY_API_WRITE_TOKEN: token,
})) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

const memberName = 'sathurgini'
const memberLabel = 'member1'

const tasks = [
  {
    task: 'Hero Section (homepage banner)',
    relatedSchemaTypes: [],
    workArea: 'Frontend',
  },
  {
    task: 'Branch schema + branch selector',
    relatedSchemaTypes: ['branch'],
    workArea: 'Backend',
  },
  {
    task: 'Locations page (map per branch)',
    relatedSchemaTypes: [],
    workArea: 'Frontend',
  },
  {
    task: 'About Us',
    relatedSchemaTypes: [],
    workArea: 'Frontend',
  },
  {
    task: 'Artist List (staff profiles)',
    relatedSchemaTypes: ['artist'],
    workArea: 'Backend',
  },
  {
    task: 'Certifications / Awards',
    relatedSchemaTypes: ['certification'],
    workArea: 'Backend',
  },
  {
    task: 'Gallery + Before-After + Previous Work',
    relatedSchemaTypes: ['galleryItem', 'beforeAfter'],
    workArea: 'Backend',
  },
  {
    task: 'Services + Packages',
    relatedSchemaTypes: ['service', 'package'],
    workArea: 'Backend',
  },
  {
    task: 'Offers / Promotions',
    relatedSchemaTypes: ['offer'],
    workArea: 'Backend',
  },
  {
    task: 'Reviews (display existing)',
    relatedSchemaTypes: ['testimonial'],
    workArea: 'Backend',
  },
  {
    task: 'FAQ',
    relatedSchemaTypes: ['faq'],
    workArea: 'Backend',
  },
  {
    task: 'Working hours / blocked dates schema (owner edits in Sanity)',
    relatedSchemaTypes: ['workingHours', 'blockedDate'],
    workArea: 'Backend',
  },
  {
    task: 'Design system: Tailwind colors/fonts, shared Navbar/Footer/Button/Card',
    relatedSchemaTypes: [],
    workArea: 'Design system',
  },
]

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const mutations = tasks.map((item, index) => ({
  createOrReplace: {
    _id: `memberTask.${memberName}.${slugify(item.task)}`,
    _type: 'memberTask',
    memberName,
    memberLabel,
    task: item.task,
    relatedSchemaTypes: item.relatedSchemaTypes,
    workArea: item.workArea,
    status: 'Completed',
    displayOrder: index + 1,
  },
}))

const response = await fetch(
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations}),
  },
)

const result = await response.json()

if (!response.ok) {
  console.error(result)
  throw new Error(`Sanity migration failed with status ${response.status}`)
}

console.log(`Migrated ${tasks.length} tasks for ${memberName} (${memberLabel}).`)
