import {defineField, defineType} from 'sanity'

export const serviceType = defineType({
  name: 'service',
  title: 'Services',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Service Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Hair',
          'Makeup',
          'Nails',
          'Skin',
          'Bridal',
          'Waxing',
          'Body & Spa',
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration in Minutes',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'basePrice',
      title: 'Base Price (LKR)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'image',
      title: 'Service Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alternative Text', type: 'string'}],
    }),
    defineField({
      name: 'branches',
      title: 'Available Branches',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'branch'}]}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({name: 'isActive', title: 'Active', type: 'boolean', initialValue: true}),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {title: 'Category, then name', name: 'categoryName', by: [
      {field: 'category', direction: 'asc'},
      {field: 'name', direction: 'asc'},
    ]},
  ],
  preview: {
    select: {title: 'name', category: 'category', price: 'basePrice', media: 'image'},
    prepare({title, category, price, media}) {
      return {title, subtitle: `${category || 'Uncategorised'} · LKR ${price || 0}`, media}
    },
  },
})
