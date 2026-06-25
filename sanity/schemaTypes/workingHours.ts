import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const dayScheduleType = defineType({
  name: 'daySchedule',
  title: 'Day Schedule',
  type: 'object',
  fields: [
    defineField({
      name: 'dayOfWeek',
      title: 'Day',
      type: 'string',
      options: {
        list: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'openTime',
      title: 'Opening Time',
      type: 'string',
      hidden: ({parent}) => parent?.isClosed === true,
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as {isClosed?: boolean} | undefined)?.isClosed) return true
          if (!value) return 'Opening time is required when the branch is open.'
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value))
            ? true
            : 'Use 24-hour time in HH:MM format.'
        }),
    }),
    defineField({
      name: 'closeTime',
      title: 'Closing Time',
      type: 'string',
      hidden: ({parent}) => parent?.isClosed === true,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {isClosed?: boolean; openTime?: string} | undefined
          if (parent?.isClosed) return true
          if (!value) return 'Closing time is required when the branch is open.'
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value))) {
            return 'Use 24-hour time in HH:MM format.'
          }
          return !parent?.openTime || String(value) > parent.openTime
            ? true
            : 'Closing time must be later than opening time.'
        }),
    }),
    defineField({name: 'isClosed', title: 'Closed', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {day: 'dayOfWeek', open: 'openTime', close: 'closeTime', closed: 'isClosed'},
    prepare({day, open, close, closed}) {
      return {title: day, subtitle: closed ? 'Closed' : `${open || '--:--'} – ${close || '--:--'}`}
    },
  },
})

export const workingHoursType = defineType({
  name: 'workingHours',
  title: 'Working Hours',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({
      name: 'branch',
      title: 'Branch',
      type: 'reference',
      to: [{type: 'branch'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slotDurationMinutes',
      title: 'Booking Slot Duration',
      type: 'number',
      initialValue: 30,
      validation: (rule) => rule.required().integer().min(5),
    }),
    defineField({
      name: 'schedule',
      title: 'Weekly Schedule',
      type: 'array',
      of: [defineArrayMember({type: 'daySchedule'})],
      validation: (rule) =>
        rule.required().min(7).max(7).custom((schedule) => {
          if (!Array.isArray(schedule)) return true
          const days = schedule
            .map((item) => (item as {dayOfWeek?: string})?.dayOfWeek)
            .filter(Boolean)
          return new Set(days).size === days.length
            ? true
            : 'Each weekday can only appear once.'
        }),
    }),
  ],
  validation: (rule) =>
    rule.custom(async (document, context) => {
      if (!document) return true
      const branchReference = document?.branch as {_ref?: string} | undefined
      if (!branchReference?._ref) return true
      const documentId = document._id?.replace(/^drafts\./, '')
      const client = context.getClient({apiVersion: '2025-01-01'})
      const duplicateCount = await client.fetch<number>(
        `count(*[_type == "workingHours" && branch._ref == $branchId && !(_id in [$draftId, $publishedId])])`,
        {
          branchId: branchReference._ref,
          draftId: `drafts.${documentId}`,
          publishedId: documentId,
        },
      )
      return duplicateCount === 0 ? true : 'This branch already has a Working Hours document.'
    }),
  preview: {
    select: {title: 'branch.name', duration: 'slotDurationMinutes'},
    prepare({title, duration}) {
      return {title: title || 'Working hours', subtitle: `${duration || 30}-minute booking slots`}
    },
  },
})
