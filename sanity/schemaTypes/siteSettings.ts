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
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alternative Text', type: 'string'}],
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
