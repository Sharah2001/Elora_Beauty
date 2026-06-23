import {defineField, defineType} from 'sanity'

export const bookingType = defineType({
  name: 'booking',
  title: 'Bookings',
  type: 'document',
  fields: [
    defineField({
      name: 'bookingReference',
      title: 'Booking Reference',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pin',
      title: 'Customer PIN',
      type: 'string',
      description: 'Four-digit PIN used by the customer to manage the booking.',
      validation: (rule) => rule.required().regex(/^\d{4}$/),
    }),
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerPhone',
      title: 'Customer Phone',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'branch',
      title: 'Branch',
      type: 'reference',
      to: [{type: 'branch'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: [{type: 'artist'}],
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'service'}]}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'date',
      title: 'Appointment Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startTime',
      title: 'Start Time',
      type: 'string',
      description: '24-hour time, for example 14:30.',
      validation: (rule) => rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }),
    defineField({
      name: 'endTime',
      title: 'End Time',
      type: 'string',
      validation: (rule) => rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Confirmed', value: 'confirmed'},
          {title: 'Completed', value: 'completed'},
          {title: 'No-show', value: 'no-show'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bookingSource',
      title: 'Booking Source',
      type: 'string',
      initialValue: 'online',
      options: {
        list: [
          {title: 'Online', value: 'online'},
          {title: 'Manual / Walk-in', value: 'manual'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'notes', title: 'Notes', type: 'text', rows: 3}),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'updatedAt', title: 'Updated At', type: 'datetime'}),
  ],
  orderings: [
    {
      title: 'Appointment date, newest',
      name: 'appointmentDateDesc',
      by: [
        {field: 'date', direction: 'desc'},
        {field: 'startTime', direction: 'desc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'customerName',
      reference: 'bookingReference',
      date: 'date',
      time: 'startTime',
      status: 'status',
    },
    prepare({title, reference, date, time, status}) {
      return {
        title: `${title || 'Unnamed customer'} · ${reference || 'No reference'}`,
        subtitle: `${date || 'No date'} ${time || ''} · ${status || 'pending'}`,
      }
    },
  },
})
