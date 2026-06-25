import {defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const certificationType = defineType({
  name: 'certification',
  title: 'Certifications',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'issuer', title: 'Issuer', type: 'string'}),
    defineField({name: 'reference', title: 'Reference / Certificate Number', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({
      name: 'image',
      title: 'Certificate or Logo',
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
    defineField({name: 'isActive', title: 'Show on Website', type: 'boolean', initialValue: true}),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'issuer', media: 'image'}},
})
