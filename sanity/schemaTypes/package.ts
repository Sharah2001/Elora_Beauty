import {defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const packageType = defineType({
  name: 'package',
  title: 'Packages',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({name: 'name', title: 'Package Name', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'includedServices',
      title: 'Included Services',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'service'}]}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'totalPrice',
      title: 'Total Price (LKR)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({name: 'discountNote', title: 'Discount Note', type: 'string'}),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'branches',
      title: 'Available Branches',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'branch'}]}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'image',
      title: 'Package Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          validation: (rule) => rule.required(),
        },
      ],
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
  preview: {
    select: {title: 'name', price: 'totalPrice', media: 'image'},
    prepare({title, price, media}) {
      return {title, subtitle: `LKR ${price || 0}`, media}
    },
  },
})
