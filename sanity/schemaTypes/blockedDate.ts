import {defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const blockedDateType = defineType({
  name: 'blockedDate',
  title: 'Blocked Dates',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({
      name: 'branch',
      title: 'Branch',
      description: 'Leave empty to block every branch.',
      type: 'reference',
      to: [{type: 'branch'}],
    }),
    defineField({name: 'date', title: 'Date', type: 'date', validation: (rule) => rule.required()}),
    defineField({name: 'reason', title: 'Reason', type: 'string'}),
    defineField({name: 'isFullDay', title: 'Block Full Day', type: 'boolean', initialValue: true}),
    defineField({
      name: 'blockedStartTime',
      title: 'Blocked Start Time',
      type: 'string',
      hidden: ({parent}) => parent?.isFullDay !== false,
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as {isFullDay?: boolean} | undefined)?.isFullDay !== false) return true
          if (!value) return 'Start time is required for a partial-day block.'
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value))
            ? true
            : 'Use 24-hour time in HH:MM format.'
        }),
    }),
    defineField({
      name: 'blockedEndTime',
      title: 'Blocked End Time',
      type: 'string',
      hidden: ({parent}) => parent?.isFullDay !== false,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as
            | {isFullDay?: boolean; blockedStartTime?: string}
            | undefined
          if (parent?.isFullDay !== false) return true
          if (!value) return 'End time is required for a partial-day block.'
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value))) {
            return 'Use 24-hour time in HH:MM format.'
          }
          return !parent.blockedStartTime || String(value) > parent.blockedStartTime
            ? true
            : 'End time must be later than start time.'
        }),
    }),
  ],
  preview: {
    select: {date: 'date', branch: 'branch.name', reason: 'reason', fullDay: 'isFullDay'},
    prepare({date, branch, reason, fullDay}) {
      return {
        title: `${date || 'No date'} · ${branch || 'All branches'}`,
        subtitle: `${fullDay ? 'Full day' : 'Partial day'}${reason ? ` · ${reason}` : ''}`,
      }
    },
  },
})
