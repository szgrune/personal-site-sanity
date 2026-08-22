import {defineQuery} from 'next-sanity'

const coverImageFields = /* groq */ `
  asset->{
    _id,
    url,
    metadata {
      lqip,
      dimensions {
        width,
        height,
        aspectRatio
      }
    }
  },
  alt,
  showTitleOverlay,
  crop,
  hotspot
`

const projectImageFields = /* groq */ `
  asset->{
    _id,
    url,
    metadata {
      lqip,
      dimensions {
        width,
        height,
        aspectRatio
      }
    }
  },
  crop,
  hotspot
`

export const SITE_METADATA_QUERY = defineQuery(/* groq */ `
  *[_id == "siteSettings"][0]{
    siteTitle,
    tagline,
    ogImage{
      ${projectImageFields}
    },
    favicon{
      asset->{
        url,
        mimeType
      }
    }
  }
`)

export const SHELF_PAGE_QUERY = defineQuery(/* groq */ `
  {
    "settings": *[_id == "siteSettings"][0]{
      siteTitle,
      tagline,
      intro,
      colophon,
      email,
      githubUrl,
      linkedinUrl
    },
    "shelves": *[_type == "shelf"] | order(order asc){
      _id,
      title,
      "slug": slug.current,
      caption,
      itemStyle,
      order,
      items[]{
        _key,
        ...@->{
          _id,
          title,
          "slug": slug.current,
          comingSoon,
          coverTitle,
          subtitle,
          year,
          presentation,
          clothColor,
          coverMotif,
          coverImage{
            ${coverImageFields}
          }
        }
      }
    }
  }
`)

export const PROJECT_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "project" && defined(slug.current)]{
    "slug": slug.current
  }
`)

export const PROJECT_PAGE_QUERY = defineQuery(/* groq */ `
  {
    "project": *[_type == "project" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      year,
      summary,
      liveDemoUrl,
      repoUrl,
      role,
      tools,
      seoDescription,
      coverImage{
        ${coverImageFields}
      },
      ogImage{
        ${projectImageFields}
      },
      slides[]{
        _key,
        title,
        body,
        layout,
        image{
          ${projectImageFields},
          alt,
          caption,
          displaySize
        }
      }
    },
    "settings": *[_id == "siteSettings"][0]{
      siteTitle,
      ogImage{
        ${projectImageFields}
      }
    }
  }
`)
