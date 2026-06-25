import {defineField, defineType} from 'sanity'
import {sourceIdField} from './sourceId'

export const offerType = defineType({
  name: 'offer',
  title: 'Offers',
  type: 'document',
  fields: [
    sourceIdField(),
    defineField({name: 'title', title: 'Offer Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      options: {
        list: [
          {title: 'Percentage', value: 'percentage'},
          {title: 'Fixed amount', value: 'fixed'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      validation: (rule) =>
        rule.required().positive().custom((value, context) => {
          if (context.parent && (context.parent as {discountType?: string}).discountType === 'percentage' && Number(value) > 100) {
            return 'Percentage discounts cannot exceed 100%.'
          }
          return true
        }),
    }),
    defineField({name: 'validFrom', title: 'Valid From', type: 'date', validation: (rule) => rule.required()}),
    defineField({
      name: 'validUntil',
      title: 'Valid Until',
      type: 'date',
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const validFrom = (context.parent as {validFrom?: string} | undefined)?.validFrom
          return !value || !validFrom || value >= validFrom
            ? true
            : 'Valid Until must be the same as or later than Valid From.'
        }),
    }),
    defineField({
      name: 'applicableServices',
      title: 'Applicable Services',
      description: 'Leave empty when the offer applies to every service.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'service'}]}],
    }),
    defineField({
      name: 'image',
      title: 'Offer Image',
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
  ],
  preview: {
    select: {title: 'title', type: 'discountType', value: 'discountValue', active: 'isActive'},
    prepare({title, type, value, active}) {
      const discount = type === 'percentage' ? `${value || 0}% off` : `LKR ${value || 0} off`
      return {title, subtitle: `${discount} · ${active ? 'Active' : 'Inactive'}`}
    },
  },
})
