import {defineType, defineField} from 'sanity'
import {CogIcon} from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteTitle',
      type: 'string',
      description: 'Wordmark in the site header, e.g. "samuel z grunebaum"',
    }),
    defineField({
      name: 'cvFile',
      title: 'CV (PDF)',
      type: 'file',
      options: {accept: 'application/pdf'},
      description: 'Opened by the "cv" link in the header',
    }),
    defineField({
      name: 'portfolioFile',
      title: 'Portfolio (PDF)',
      type: 'file',
      options: {accept: 'application/pdf'},
      description: 'Opened by the "portfolio" link in the header',
    }),
    defineField({
      name: 'contactHeading',
      type: 'string',
      description: 'Heading on the contact page, e.g. "Get in touch:"',
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site Settings'}),
  },
})
