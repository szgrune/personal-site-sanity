import {defineType, defineField, defineArrayMember} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Page heading, e.g. "About Me"',
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      description: 'Subheading, e.g. "Designer, Developer, Educator"',
    }),
    defineField({
      name: 'headshot',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Alternative Text'})],
    }),
    defineField({
      name: 'bio',
      type: 'array',
      description: 'Biography text shown next to the headshot',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [{title: 'Bullet', value: 'bullet'}],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {name: 'href', type: 'url', title: 'URL', validation: (rule: any) => rule.required()},
                  {name: 'openInNewTab', type: 'boolean', title: 'Open in new tab', initialValue: true},
                ],
              },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'About Page'}),
  },
})
