import {defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const artistType = defineType({
  name: 'artist',
  title: 'Artists',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({
      name: 'name',
      title: 'Artist Name',
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
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          validation: (rule) => rule.required(),
        },
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Professional Role',
      description: 'For example: Senior Hair Stylist or Bridal Makeup Artist.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'experienceYears',
      title: 'Years of Experience',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0).max(60),
    }),
    defineField({
      name: 'specialties',
      title: 'Service Specialties',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'service'}]}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'branches',
      title: 'Branches',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'branch'}]}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications & Qualifications',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'certification'}]}],
      validation: (rule) => rule.required().min(1).unique(),
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
    {title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', role: 'role', media: 'photo', active: 'isActive'},
    prepare({title, role, media, active}) {
      return {
        title,
        subtitle: `${role || 'Beauty Artist'} · ${active ? 'Active' : 'Inactive'}`,
        media,
      }
    },
  },
})
