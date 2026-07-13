import {defineType, defineField, defineArrayMember} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'

export const workPage = defineType({
  name: 'workPage',
  title: 'Work Page',
  type: 'document',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'Work',
      hidden: true,
    }),
    defineField({
      name: 'tagline',
      type: 'text',
      rows: 2,
      description: 'The heading above the project grid. Line breaks are preserved.',
    }),
    defineField({
      name: 'projects',
      type: 'array',
      description: 'Projects shown on the work page, in display order',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Work Page'}),
  },
})
