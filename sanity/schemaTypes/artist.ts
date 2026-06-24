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
      fields: [{name: 'alt', title: 'Alternative Text', type: 'string'}],
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
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
    select: {title: 'name', media: 'photo', active: 'isActive'},
    prepare({title, media, active}) {
      return {title, subtitle: active ? 'Active artist' : 'Inactive artist', media}
    },
  },
})
