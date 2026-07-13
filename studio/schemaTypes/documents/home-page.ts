import {defineType, defineField} from 'sanity'
import {HomeIcon} from '@sanity/icons'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      initialValue: 'Home',
      hidden: true,
    }),
    defineField({
      name: 'heroVideo',
      title: 'Gallery Video',
      type: 'file',
      options: {accept: 'video/*,.mov,.mp4'},
      description: 'The looping video in the freeform gallery (largest item)',
    }),
    defineField({
      name: 'heroGif',
      title: 'Gallery GIF',
      type: 'image',
      description: 'The animated GIF in the freeform gallery (middle item)',
    }),
    defineField({
      name: 'heroImage',
      title: 'Gallery Image',
      type: 'image',
      options: {hotspot: true},
      description: 'The still image in the freeform gallery (smallest item)',
      fields: [defineField({name: 'alt', type: 'string', title: 'Alternative Text'})],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Home Page'}),
  },
})
