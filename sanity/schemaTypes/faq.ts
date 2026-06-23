import {defineField, defineType} from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQs',
  type: 'document',
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'string'}),
    defineField({name: 'displayOrder', title: 'Display Order', type: 'number', initialValue: 0}),
    defineField({name: 'isActive', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  orderings: [
    {title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]},
  ],
  preview: {select: {title: 'question', subtitle: 'category'}},
})
