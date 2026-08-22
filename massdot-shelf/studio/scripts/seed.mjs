import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-07-28'})

const projects = [
  {
    _id: 'project-rmv-driver-quiz',
    _type: 'project',
    title: 'RMV Driver Quiz',
    slug: {_type: 'slug', current: 'rmv-driver-quiz'},
    coverTitle: 'RMV Driver Quiz',
    subtitle: 'Replace this with the final one-line subtitle.',
    year: '2026',
    presentation: 'inherit',
    clothColor: 'bay-blue',
    coverMotif: 'double-rule',
    summary: provisionalText(
      'Replace this with the real project summary, context, and purpose.',
      'summary-rmv',
    ),
    repoUrl: 'https://github.com/szgrune/rmv-quiz-project',
    slides: provisionalSlides('rmv', 4),
  },
  {
    _id: 'project-ma-drivers-manual-updates-app',
    _type: 'project',
    title: "MA Driver's Manual Updates App",
    slug: {_type: 'slug', current: 'ma-drivers-manual-updates-app'},
    coverTitle: "MA Driver's Manual Updates",
    subtitle: 'Replace this with the final one-line subtitle.',
    year: '2026',
    presentation: 'inherit',
    clothColor: 'berkshires-green',
    coverMotif: 'corner-rules',
    summary: provisionalText(
      'Replace this with the real project summary, context, and purpose.',
      'summary-manual',
    ),
    repoUrl: 'https://github.com/szgrune/rmv-manual-updates',
    slides: provisionalSlides('manual', 4),
  },
  {
    _id: 'project-insurance-discounts-driver-safety',
    _type: 'project',
    title: 'Insurance Discounts for Driver Safety Education',
    slug: {
      _type: 'slug',
      current: 'insurance-discounts-for-driver-safety-education',
    },
    coverTitle: 'Insurance Discounts',
    subtitle: 'Replace this with the final one-line subtitle.',
    year: '2026',
    presentation: 'inherit',
    clothColor: 'independence-cranberry',
    coverMotif: 'centered-dot',
    summary: provisionalText(
      'Replace this with the real project summary, context, and purpose.',
      'summary-insurance',
    ),
    slides: provisionalSlides('insurance', 3),
  },
  {
    _id: 'project-massdot-job-site-soundwalk-quiz',
    _type: 'project',
    title: 'MassDOT Job Site Soundwalk Quiz',
    slug: {_type: 'slug', current: 'massdot-job-site-soundwalk-quiz'},
    coverTitle: 'Job Site Soundwalk Quiz',
    subtitle: 'Replace this with the final one-line subtitle.',
    year: '2026–',
    presentation: 'inherit',
    clothColor: 'duckling-yellow',
    coverMotif: 'double-rule',
    summary: provisionalText(
      'Replace this with the real project summary, context, and purpose.',
      'summary-soundwalk',
    ),
    repoUrl: 'https://github.com/szgrune/transit-ritual-machine',
    slides: provisionalSlides('soundwalk', 3),
  },
  {
    _id: 'project-accessible-search-municipal-codes',
    _type: 'project',
    title: 'Accessible Search for Municipal Codes & Bylaws',
    slug: {
      _type: 'slug',
      current: 'accessible-search-for-municipal-codes-and-bylaws',
    },
    coverTitle: 'Accessible Municipal Code Search',
    subtitle: 'Replace this with the final one-line subtitle.',
    year: '2026–',
    presentation: 'inherit',
    clothColor: 'ink',
    coverMotif: 'corner-rules',
    summary: provisionalText(
      'Replace this with the real project summary, context, and purpose.',
      'summary-codes',
    ),
    slides: provisionalSlides('codes', 3),
  },
]

const shelves = [
  {
    _id: 'shelf-summer-2026',
    _type: 'shelf',
    title: 'Summer 2026',
    slug: {_type: 'slug', current: 'summer-2026'},
    caption: 'Replace this with an optional finished-work caption.',
    itemStyle: 'book',
    order: 1,
    items: [
      reference('project-rmv-driver-quiz', 'summer-rmv'),
      reference('project-ma-drivers-manual-updates-app', 'summer-manual'),
      reference('project-insurance-discounts-driver-safety', 'summer-insurance'),
    ],
  },
  {
    _id: 'shelf-ongoing',
    _type: 'shelf',
    title: 'Ongoing',
    slug: {_type: 'slug', current: 'ongoing'},
    caption: 'Replace this with an optional work-in-progress caption.',
    itemStyle: 'manuscript',
    order: 2,
    items: [
      reference('project-massdot-job-site-soundwalk-quiz', 'ongoing-soundwalk'),
      reference('project-accessible-search-municipal-codes', 'ongoing-codes'),
    ],
  },
]

const settings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteTitle: 'MassDOT Shelf',
  tagline: 'Replace this with the final line introducing the Summer 2026 collection.',
  intro: provisionalText(
    'Replace this with the final introductory paragraph for the shelf.',
    'site-intro',
  ),
  colophon: 'The Lab @ MassDOT · Summer 2026',
  githubUrl: 'https://github.com/szgrune',
}

let transaction = client.transaction()

for (const document of [...projects, ...shelves, settings]) {
  transaction = transaction.createOrReplace(document)
}

const result = await transaction.commit()

console.log(`Seeded ${projects.length} projects, ${shelves.length} shelves, and site settings.`)
console.log(`Transaction ID: ${result.transactionId}`)

function reference(id, key) {
  return {_type: 'reference', _ref: id, _key: key}
}

function provisionalText(text, key) {
  return [
    {
      _type: 'block',
      _key: key,
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: `${key}-span`,
          marks: [],
          text,
        },
      ],
    },
  ]
}

function provisionalSlides(prefix, count) {
  return Array.from({length: count}, (_, index) => {
    const number = index + 1
    return {
      _type: 'slide',
      _key: `${prefix}-slide-${number}`,
      title: `Replace this slide ${number} title`,
      body: provisionalText(
        `Replace this with the real content for slide ${number}.`,
        `${prefix}-body-${number}`,
      ),
      layout: 'text-only',
    }
  })
}
