import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const slide = defineType({
  name: 'slide',
  title: 'Slide',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Optional heading shown at the top of this slide.',
    }),
    defineField({
      name: 'body',
      title: 'Slide text',
      type: 'array',
      description: 'The narrative text for this slide, including links when useful.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 4', value: 'h4'},
            {title: 'Heading 5', value: 'h5'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    description: 'The page or live demo this text should open.',
                    validation: (rule) =>
                      rule.required().uri({scheme: ['http', 'https']}),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    description: 'Keep this on for external pages and live demos.',
                    initialValue: true,
                  }),
                ],
              }),
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'image',
      type: 'figure',
      description:
        'Optional slide image. Choose a display size to keep lower-resolution images sharp.',
    }),
    defineField({
      name: 'layout',
      type: 'string',
      description: 'Choose how the image and text share the slide.',
      initialValue: 'image-right',
      options: {
        list: [
          {title: 'Image right', value: 'image-right'},
          {title: 'Image left', value: 'image-left'},
          {title: 'Full image with text overlay', value: 'image-full'},
          {title: 'Image only', value: 'image-only'},
          {title: 'Text only', value: 'text-only'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({title, media}) {
      return {
        title: title || 'Untitled slide',
        media,
      }
    },
  },
})
