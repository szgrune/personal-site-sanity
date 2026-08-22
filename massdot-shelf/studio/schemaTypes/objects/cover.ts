import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const cover = defineType({
  name: 'cover',
  title: 'Cover image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe the cover image for visitors who cannot see it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showTitleOverlay',
      title: 'Show title overlay',
      type: 'boolean',
      description:
        'Show the cover title at the bottom of bound books that use this uploaded image.',
      initialValue: false,
    }),
  ],
})
