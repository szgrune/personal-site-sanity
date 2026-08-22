import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteTitle',
      type: 'string',
      description: 'The small site title shown above the shelves and used in default metadata.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'text',
      rows: 2,
      description: 'A brief line introducing the collection above the shelf.',
    }),
    defineField({
      name: 'intro',
      type: 'array',
      description: 'A short introductory paragraph shown before the shelves.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'colophon',
      type: 'string',
      description: 'The small closing line at the bottom of the shelf page.',
      initialValue: 'The Lab @ MassDOT · Summer 2026',
    }),
    defineField({
      name: 'email',
      type: 'string',
      description: 'The contact email shown in the colophon.',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      description: 'The GitHub profile linked from the colophon.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
      description: 'The LinkedIn profile linked from the colophon.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'ogImage',
      title: 'Default social sharing image',
      type: 'image',
      description: 'The fallback social image when a project has no cover or sharing image.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'favicon',
      type: 'file',
      description: 'The browser icon file used across the exported site.',
      options: {accept: 'image/png,image/svg+xml,image/x-icon,.ico'},
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
