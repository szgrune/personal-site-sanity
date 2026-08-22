import {StackIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const shelf = defineType({
  name: 'shelf',
  title: 'Shelf',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'The shelf label visitors see below the plank, such as “Summer 2026”.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'A stable identifier generated from the shelf title.',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      type: 'string',
      description: 'Optional small supporting line beneath the shelf label.',
    }),
    defineField({
      name: 'itemStyle',
      title: 'Default item style',
      type: 'string',
      description: 'The default presentation for every project on this shelf.',
      initialValue: 'book',
      options: {
        list: [
          {title: 'Bound book', value: 'book'},
          {title: 'Stacked manuscript', value: 'manuscript'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Controls shelf order from top to bottom; lower numbers appear first.',
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: 'items',
      title: 'Projects',
      type: 'array',
      description: 'Drag projects into the exact left-to-right order they should appear.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      itemStyle: 'itemStyle',
      items: 'items',
    },
    prepare({title, itemStyle, items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title,
        subtitle: `${count} ${count === 1 ? 'project' : 'projects'} · ${itemStyle || 'no style'}`,
      }
    },
  },
})
