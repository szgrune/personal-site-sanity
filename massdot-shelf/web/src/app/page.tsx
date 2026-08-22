import {Bookshelf} from '@/components/Bookshelf'
import {Colophon} from '@/components/Colophon'
import {Header} from '@/components/Header'
import {client} from '@/sanity/client'
import {SHELF_PAGE_QUERY} from '@/sanity/queries'

import styles from './page.module.css'

export default async function HomePage() {
  const {settings, shelves} = await client.fetch(SHELF_PAGE_QUERY)
  const intro = plainText(settings?.intro)

  return (
    <div className={styles.page}>
      <Header
        siteTitle={settings?.siteTitle ?? 'MassDOT Shelf'}
        tagline={settings?.tagline}
        intro={intro}
      />
      <main>
        {shelves.length ? (
          <div className={styles.cabinet}>
            <div className={styles.shelves}>
              {shelves.map((shelf) => (
                <Bookshelf shelf={shelf} key={shelf._id} />
              ))}
            </div>
          </div>
        ) : (
          <p className={styles.empty}>
            No shelves are published yet. Add one in Sanity Studio.
          </p>
        )}
      </main>
      <Colophon
        text={settings?.colophon}
        email={settings?.email}
        githubUrl={settings?.githubUrl}
        linkedinUrl={settings?.linkedinUrl}
      />
    </div>
  )
}

function plainText(
  blocks:
    | {
        children?: Array<{text?: string}>
      }[]
    | null
    | undefined,
): string | null {
  if (!blocks?.length) return null

  const text = blocks
    .map((block) =>
      (block.children ?? []).map((child) => child.text ?? '').join(''),
    )
    .filter(Boolean)
    .join('\n\n')

  return text || null
}
