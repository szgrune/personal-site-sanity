import {CaseIcon, CogIcon, StackIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('MassDOT Shelf')
    .items([
      S.documentTypeListItem('shelf').title('Shelves').icon(StackIcon),
      S.documentTypeListItem('project').title('Projects').icon(CaseIcon),
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),
    ])
