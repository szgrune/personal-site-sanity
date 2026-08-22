import {CaseIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const inlineRichText = defineArrayMember({
  type: 'block',
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [],
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
            description: 'The page this linked summary text should open.',
            validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
          }),
          defineField({
            name: 'openInNewTab',
            type: 'boolean',
            title: 'Open in new tab',
            description: 'Keep this on for links away from the portfolio.',
            initialValue: true,
          }),
        ],
      }),
    ],
  },
})

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: CaseIcon,
  groups: [
    {name: 'cover', title: 'Cover', default: true},
    {name: 'page', title: 'Page'},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    defineField({
      name: 'comingSoon',
      title: 'Coming soon (stacked manuscripts only)',
      type: 'boolean',
      description:
        'When checked, this manuscript keeps its shelf animation but cannot be opened and shows a “Coming soon...” message on hover.',
      initialValue: true,
      group: 'cover',
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'The full project name used on its page and in Studio.',
      group: 'cover',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'The project URL after /work/, generated from the title.',
      options: {source: 'title'},
      group: 'page',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverTitle',
      type: 'string',
      description: 'Optional shorter wording when the full title will not set well on a cover.',
      group: 'cover',
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      description: 'One short line beneath the title on the composed cover.',
      group: 'cover',
    }),
    defineField({
      name: 'year',
      type: 'string',
      description: 'The cover year, such as “2026” or “2026–” for ongoing work.',
      group: 'cover',
    }),
    defineField({
      name: 'presentation',
      type: 'string',
      description: 'Use the shelf style or override this one project.',
      initialValue: 'inherit',
      options: {
        list: [
          {title: 'Inherit shelf style', value: 'inherit'},
          {title: 'Bound book', value: 'book'},
          {title: 'Stacked manuscript', value: 'manuscript'},
        ],
        layout: 'radio',
      },
      group: 'cover',
    }),
    defineField({
      name: 'clothColor',
      title: 'Cloth color',
      type: 'string',
      description: 'The Massachusetts palette color used for a composed book cover.',
      initialValue: 'bay-blue',
      options: {
        list: [
          {title: 'Bay Blue', value: 'bay-blue'},
          {title: 'Berkshires Green', value: 'berkshires-green'},
          {title: 'Duckling Yellow', value: 'duckling-yellow'},
          {title: 'Independence Cranberry', value: 'independence-cranberry'},
          {title: 'Ink', value: 'ink'},
        ],
        layout: 'radio',
      },
      group: 'cover',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverMotif',
      title: 'Cover motif',
      type: 'string',
      description: 'A restrained stamped ornament for the composed cover.',
      initialValue: 'double-rule',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Double rule', value: 'double-rule'},
          {title: 'Centered dot', value: 'centered-dot'},
          {title: 'Corner rules', value: 'corner-rules'},
        ],
        layout: 'radio',
      },
      group: 'cover',
    }),
    defineField({
      name: 'coverImage',
      title: 'Uploaded cover',
      type: 'cover',
      description: 'Optional edge-to-edge artwork that replaces the composed typographic cover.',
      group: 'cover',
    }),
    defineField({
      name: 'summary',
      type: 'array',
      description: 'A short project-page introduction with optional emphasis and links.',
      of: [inlineRichText],
      group: 'page',
    }),
    defineField({
      name: 'liveDemoUrl',
      title: 'Live demo URL',
      type: 'url',
      description: 'The primary live experience linked as a prominent button on the first slide.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
      group: 'meta',
    }),
    defineField({
      name: 'repoUrl',
      title: 'Repository URL',
      type: 'url',
      description: 'The public source repository, when one can be shared.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
      group: 'meta',
    }),
    defineField({
      name: 'role',
      type: 'string',
      description: 'Your role on the project, written as a short phrase.',
      group: 'meta',
    }),
    defineField({
      name: 'tools',
      type: 'array',
      description: 'Tools, methods, and technologies used on the project.',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      group: 'meta',
    }),
    defineField({
      name: 'slides',
      type: 'array',
      description: 'Drag slides into the exact chronological order for the project story.',
      of: [defineArrayMember({type: 'slide'})],
      group: 'page',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
      description: 'Optional search/share description; otherwise the plain-text summary is used.',
      group: 'meta',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social sharing image',
      type: 'image',
      description: 'Optional social image; otherwise the cover or site default is used.',
      options: {hotspot: true},
      group: 'meta',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'year',
      media: 'coverImage',
    },
  },
})
