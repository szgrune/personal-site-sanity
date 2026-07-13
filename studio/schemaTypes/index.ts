import {project} from './documents/project'
import {homePage} from './documents/home-page'
import {workPage} from './documents/work-page'
import {aboutPage} from './documents/about-page'
import {siteSettings} from './documents/site-settings'
import {figure, imageRow, videoFigure, embed} from './objects/body-blocks'

export const schemaTypes = [
  // documents
  project,
  homePage,
  workPage,
  aboutPage,
  siteSettings,
  // objects / portable text blocks
  figure,
  imageRow,
  videoFigure,
  embed,
]
