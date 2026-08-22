import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const figure = defineType({
  name: 'figure',
  title: 'Slide image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe what matters in this image for visitors who cannot see it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      type: 'string',
      description: 'Optional short caption displayed with the image.',
    }),
    defineField({
      name: 'displaySize',
      title: 'Display size',
      type: 'string',
      description:
        'Limit the displayed image height. Full Size uses all available space; smaller sizes help prevent low-resolution images from being enlarged.',
      initialValue: 'full',
      options: {
        list: [
          {title: 'Full Size', value: 'full'},
          {title: 'Large — up to 720px high', value: 'large'},
          {title: 'Medium — up to 480px high', value: 'medium'},
          {title: 'Small — up to 320px high', value: 'small'},
        ],
        layout: 'radio',
      },
    }),
  ],
})
