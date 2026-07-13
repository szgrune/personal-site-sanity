import {defineType, defineField, defineArrayMember} from 'sanity'
import {ImageIcon, ImagesIcon, PlayIcon, CodeBlockIcon} from '@sanity/icons'

/**
 * A single image with an optional caption, rendered as a <figure>.
 * `size` controls the max display size to match the original page layouts.
 */
export const figure = defineType({
  name: 'figure',
  title: 'Image / Figure',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (rule) => rule.warning('Alt text helps accessibility and SEO'),
        }),
      ],
    }),
    defineField({
      name: 'caption',
      type: 'text',
      rows: 3,
      description: 'Optional caption displayed below the image',
    }),
    defineField({
      name: 'size',
      type: 'string',
      title: 'Display Size',
      description: 'How large the image should appear on the page',
      initialValue: 'default',
      options: {
        list: [
          {title: 'Default (max 50% of screen height)', value: 'default'},
          {title: 'Large (max 70% of screen height)', value: 'large'},
          {title: 'Wide (full content width)', value: 'wide'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {title: 'caption', media: 'image'},
    prepare({title, media}) {
      return {title: title || 'Image', media}
    },
  },
})

/**
 * Two or more images displayed side by side in a row (stacked on mobile),
 * with a single shared caption.
 */
export const imageRow = defineType({
  name: 'imageRow',
  title: 'Image Row (side by side)',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string', title: 'Alternative Text'})],
        }),
      ],
      validation: (rule) => rule.min(2).max(4),
    }),
    defineField({
      name: 'caption',
      type: 'text',
      rows: 3,
      description: 'Optional caption displayed below the row',
    }),
  ],
  preview: {
    select: {title: 'caption', media: 'images.0'},
    prepare({title, media}) {
      return {title: title || 'Image Row', media}
    },
  },
})

/**
 * A video file with an optional caption, rendered as a <figure>.
 */
export const videoFigure = defineType({
  name: 'videoFigure',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'video',
      type: 'file',
      options: {accept: 'video/*,.mov,.mp4'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      type: 'text',
      rows: 3,
      description: 'Optional caption displayed below the video',
    }),
    defineField({
      name: 'playback',
      type: 'string',
      initialValue: 'autoplay',
      options: {
        list: [
          {title: 'Autoplay silently in a loop', value: 'autoplay'},
          {title: 'Show player controls', value: 'controls'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {title: 'caption'},
    prepare({title}) {
      return {title: title || 'Video'}
    },
  },
})

/**
 * An embedded iframe (Figma prototype, YouTube video, InVision prototype, ...).
 * Width/height mirror the original hand-written embed dimensions.
 */
export const embed = defineType({
  name: 'embed',
  title: 'Embed (Figma / YouTube / iframe)',
  type: 'object',
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'Embed URL',
      description: 'The iframe src URL (e.g. a Figma embed link or YouTube embed link)',
      validation: (rule) =>
        rule.required().uri({scheme: ['http', 'https'], allowRelative: true}),
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Accessible title for the embed',
    }),
    defineField({
      name: 'width',
      type: 'string',
      description: 'CSS width, e.g. "80%" or "640"',
      initialValue: '80%',
    }),
    defineField({
      name: 'height',
      type: 'string',
      description: 'CSS height in pixels, e.g. "600"',
      initialValue: '600',
    }),
    defineField({
      name: 'caption',
      type: 'text',
      rows: 3,
      description: 'Optional caption displayed below the embed',
    }),
  ],
  preview: {
    select: {title: 'caption', subtitle: 'url'},
    prepare({title, subtitle}) {
      return {title: title || 'Embed', subtitle}
    },
  },
})
