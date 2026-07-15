import { defineQuery } from "next-sanity";

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0]{
    siteTitle,
    contactHeading,
    email,
    githubUrl,
    linkedinUrl,
    "cvUrl": cvFile.asset->url,
    "portfolioUrl": portfolioFile.asset->url,
    "faviconUrl": favicon.asset->url,
    "faviconMimeType": favicon.asset->mimeType
  }
`);

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "homePage"][0]{
    "videoUrl": heroVideo.asset->url,
    "gifUrl": heroGif.asset->url,
    "imageUrl": heroImage.asset->url,
    "imageAlt": heroImage.alt
  }
`);

const projectCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  tags,
  cardSubtitle,
  cardDescription,
  cardMediaType,
  cardImageFit,
  comingSoon,
  "cardImageUrl": cardImage.asset->url,
  "cardVideoUrl": cardVideo.asset->url
`;

export const WORK_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "workPage"][0]{
    tagline,
    categories,
    projects[]->{
      ${projectCardFields}
    }
  }
`);

export const ABOUT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "aboutPage"][0]{
    title,
    subtitle,
    "headshotUrl": headshot.asset->url,
    "headshotAlt": headshot.alt,
    bio
  }
`);

export const PROJECT_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "project" && defined(slug.current) && comingSoon != true].slug.current
`);

export const PROJECT_QUERY = defineQuery(/* groq */ `
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    body[]{
      ...,
      _type == "figure" => {
        ...,
        "imageUrl": image.asset->url,
        "imageAlt": image.alt
      },
      _type == "imageRow" => {
        images[]{
          _key,
          alt,
          "url": asset->url
        }
      },
      _type == "videoFigure" => {
        ...,
        "videoUrl": video.asset->url
      }
    }
  }
`);
