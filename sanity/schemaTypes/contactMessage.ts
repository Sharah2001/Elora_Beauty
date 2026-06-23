import {defineField, defineType} from 'sanity'

export const contactMessageType = defineType({
  name: 'contactMessage',
  title: 'Contact Messages',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Customer Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'email', title: 'Email', type: 'email'}),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'branch',
      title: 'Preferred Branch',
      type: 'reference',
      to: [{type: 'branch'}],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Read', value: 'read'},
          {title: 'Responded', value: 'responded'},
        ],
        layout: 'radio',
      },
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
    select: {title: 'name', phone: 'phone', status: 'status', submittedAt: 'submittedAt'},
    prepare({title, phone, status, submittedAt}) {
      return {
        title: title || 'Unnamed customer',
        subtitle: `${phone || 'No phone'} · ${status || 'new'} · ${
          submittedAt ? new Date(submittedAt).toLocaleDateString() : 'No date'
        }`,
      }
    },
  },
})
