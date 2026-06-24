import {defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      options: {list: [1, 2, 3, 4, 5]},
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'comment',
      title: 'Review',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'serviceReceived',
      title: 'Service Received',
      type: 'reference',
      to: [{type: 'service'}],
    }),
    defineField({
      name: 'branch',
      title: 'Branch Visited',
      type: 'reference',
      to: [{type: 'branch'}],
    }),
    defineField({
      name: 'isApproved',
      title: 'Approved for Website',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'submittedAtDesc',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'customerName',
      rating: 'rating',
      approved: 'isApproved',
      comment: 'comment',
    },
    prepare({title, rating, approved, comment}) {
      return {
        title: `${title || 'Anonymous'} · ${rating || 0}/5`,
        subtitle: `${approved ? 'Approved' : 'Waiting for approval'} · ${comment || ''}`,
      }
    },
  },
})
