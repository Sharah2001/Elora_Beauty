import {defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'businessName', title: 'Business Name', type: 'string', initialValue: 'Elora Beauty'}),
    defineField({name: 'heroEyebrow', title: 'Hero Small Heading', type: 'string'}),
    defineField({name: 'heroTitle', title: 'Hero Title', type: 'string'}),
    defineField({name: 'heroDescription', title: 'Hero Description', type: 'text', rows: 3}),
    defineField({name: 'heroTrustLine', title: 'Hero Trust Line', type: 'string'}),
    defineField({name: 'heroServiceLabel', title: 'Hero Service Label', type: 'string'}),
    defineField({name: 'heroButtonLabel', title: 'Hero Button Label', type: 'string'}),
    defineField({
      name: 'heroBackgroundImage',
      title: 'Hero Background Image',
      description: 'Wide background image behind the homepage hero text.',
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
    defineField({
      name: 'heroImage',
      title: 'Hero Featured Image',
      description: 'Smaller featured image used in the hero review card.',
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
    defineField({name: 'aboutTitle', title: 'About Title', type: 'string'}),
    defineField({name: 'aboutDescription', title: 'About Description', type: 'text', rows: 5}),
    defineField({
      name: 'aboutImage',
      title: 'About Image',
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
    defineField({
      name: 'aboutHighlights',
      title: 'About Highlights',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.max(4),
    }),
    defineField({name: 'contactEmail', title: 'Contact Email', type: 'email'}),
    defineField({name: 'instagramUrl', title: 'Instagram URL', type: 'url'}),
    defineField({name: 'facebookUrl', title: 'Facebook URL', type: 'url'}),
    defineField({name: 'googleBusinessUrl', title: 'Google Business URL', type: 'url'}),
    defineField({name: 'seoTitle', title: 'SEO Title', type: 'string'}),
    defineField({name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 3}),
  ],
  preview: {
    prepare() {
      return {title: 'Elora Beauty Website Settings'}
    },
  },
})
