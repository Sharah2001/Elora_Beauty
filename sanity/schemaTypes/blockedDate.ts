import {defineField, defineType} from 'sanity'

export const blockedDateType = defineType({
  name: 'blockedDate',
  title: 'Blocked Dates',
  type: 'document',
  fields: [
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
      validation: (rule) => rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }),
    defineField({
      name: 'blockedEndTime',
      title: 'Blocked End Time',
      type: 'string',
      hidden: ({parent}) => parent?.isFullDay !== false,
      validation: (rule) => rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/),
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
