import {defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const galleryItemType = defineType({
  name: 'galleryItem',
  title: 'Gallery',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'string'}),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', title: 'Alternative Text', type: 'string', validation: (rule) => rule.required()},
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({name: 'isActive', title: 'Show on Website', type: 'boolean', initialValue: true}),
    defineField({name: 'displayOrder', title: 'Display Order', type: 'number', initialValue: 0}),
  ],
  orderings: [
    {title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'category', media: 'image'}},
})
