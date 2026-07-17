import {defineType, defineField, defineArrayMember} from 'sanity'
import {CaseIcon} from '@sanity/icons'

// Text-only rich text for card fields: bold/italic, no headings/lists/links
const inlineRichText = {
  type: 'block' as const,
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [],
  marks: {
    decorators: [
      {title: 'Strong', value: 'strong'},
      {title: 'Emphasis', value: 'em'},
    ],
    annotations: [],
  },
}

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: CaseIcon,
  groups: [
    {name: 'card', title: 'Work Page Card'},
    {name: 'page', title: 'Project Page'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Project name shown on the work page card',
      validation: (rule) => rule.required(),
      group: ['card', 'page'],
    }),
    defineField({
      name: 'linkType',
      title: 'Card Link Type',
      type: 'string',
      initialValue: 'page',
      options: {
        list: [
          {title: 'Project page on this site (uses Slug)', value: 'page'},
          {title: 'Direct link (external URL or path)', value: 'external'},
        ],
        layout: 'radio',
      },
      description: 'Where the work page card goes when clicked',
      group: ['card', 'page'],
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL path of the project page, e.g. "kimino" → /kimino',
      hidden: ({parent}) => parent?.linkType === 'external',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {linkType?: string} | undefined
          if (doc?.linkType === 'external') return true
          return value?.current ? true : 'Required unless the card uses a direct link'
        }),
      group: 'page',
    }),
    defineField({
      name: 'externalUrl',
      title: 'Direct Link URL',
      type: 'url',
      description:
        'Full URL (https://…) or site-relative path (/37gge) the card links to instead of a project page',
      hidden: ({parent}) => parent?.linkType !== 'external',
      validation: (rule) =>
        rule
          .uri({allowRelative: true, scheme: ['http', 'https']})
          .custom((value, context) => {
            const doc = context.document as {linkType?: string} | undefined
            if (doc?.linkType !== 'external') return true
            return value ? true : 'Required when the card uses a direct link'
          }),
      group: ['card', 'page'],
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      initialValue: true,
      hidden: ({parent}) => parent?.linkType !== 'external',
      group: ['card', 'page'],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      description:
        'Project categories (e.g. Front End, UX Design). Each tag becomes a filter pill on the work page; entering a new tag creates a new pill automatically.',
      group: 'card',
    }),
    defineField({
      name: 'cardSubtitle',
      title: 'Card Subtitle',
      type: 'array',
      of: [defineArrayMember(inlineRichText)],
      description: 'Secondary line on the work page card',
      group: 'card',
    }),
    defineField({
      name: 'cardDescription',
      title: 'Card Description',
      type: 'array',
      of: [defineArrayMember(inlineRichText)],
      description: 'Short description on the work page card',
      group: 'card',
    }),
    defineField({
      name: 'cardMediaType',
      title: 'Card Media Type',
      type: 'string',
      initialValue: 'image',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Animated GIF (plays on hover)', value: 'animatedGif'},
          {title: 'Video (plays on hover)', value: 'video'},
        ],
        layout: 'radio',
      },
      group: 'card',
    }),
    defineField({
      name: 'cardImage',
      title: 'Card Image',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.cardMediaType === 'video',
      group: 'card',
    }),
    defineField({
      name: 'cardVideo',
      title: 'Card Video',
      type: 'file',
      options: {accept: 'video/*,.mov,.mp4'},
      hidden: ({parent}) => parent?.cardMediaType !== 'video',
      group: 'card',
    }),
    defineField({
      name: 'cardImageFit',
      title: 'Card Image Fit',
      type: 'string',
      initialValue: 'cover',
      description:
        '"Contain on black" shows the whole image on a black background (used for logo cards)',
      options: {
        list: [
          {title: 'Fill the card (crop)', value: 'cover'},
          {title: 'Contain on black background', value: 'contain'},
        ],
        layout: 'radio',
      },
      group: 'card',
    }),
    defineField({
      name: 'comingSoon',
      title: 'Coming Soon',
      type: 'boolean',
      initialValue: false,
      description:
        'When on, the card is not clickable and shows a "Coming soon" tag on hover instead of linking to a project page',
      group: 'card',
    }),
    defineField({
      name: 'body',
      title: 'Project Page Content',
      type: 'array',
      group: 'page',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Page Title (H3)', value: 'h3'},
            {title: 'Section Heading (H4)', value: 'h4'},
            {title: 'Subheading (H5)', value: 'h5'},
            {title: 'Lede (H6)', value: 'h6'},
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
        defineArrayMember({type: 'figure'}),
        defineArrayMember({type: 'imageRow'}),
        defineArrayMember({type: 'videoFigure'}),
        defineArrayMember({type: 'embed'}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'cardSubtitle', media: 'cardImage'},
    prepare: ({title, subtitle, media}) => ({
      title,
      // cardSubtitle is portable text; flatten it to plain text for the list preview
      subtitle: Array.isArray(subtitle)
        ? subtitle
            .map((block) =>
              (block.children ?? []).map((child: {text?: string}) => child.text ?? '').join(''),
            )
            .join(' ')
        : subtitle,
      media,
    }),
  },
})
