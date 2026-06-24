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
      validation: (rule) => rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }),
    defineField({
      name: 'closeTime',
      title: 'Closing Time',
      type: 'string',
      validation: (rule) => rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/),
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
      validation: (rule) => rule.required().min(7).max(7),
    }),
  ],
  preview: {
    select: {title: 'branch.name', duration: 'slotDurationMinutes'},
    prepare({title, duration}) {
      return {title: title || 'Working hours', subtitle: `${duration || 30}-minute booking slots`}
    },
  },
})
