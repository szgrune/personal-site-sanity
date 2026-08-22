import Link from 'next/link'
import type {CSSProperties} from 'react'

import {leanFor} from '@/lib/lean'

import type {ShelfItemData} from './Bookshelf'
import styles from './Manuscript.module.css'

type SheetStyle = CSSProperties & {
  '--sheet-top': string
  '--sheet-right': string
  '--sheet-bottom': string
  '--sheet-left': string
  '--sheet-lean': string
}

const SHEET_COUNT = 4

export function Manuscript({project}: {project: ShelfItemData}) {
  const sheets = Array.from({length: SHEET_COUNT}, (_, index) => {
    const style: SheetStyle = {
      '--sheet-top': `${(SHEET_COUNT - 1 - index) * 3}px`,
      '--sheet-right': `${index * 2}px`,
      '--sheet-bottom': `${index}px`,
      '--sheet-left': `${(SHEET_COUNT - 1 - index) * 2}px`,
      '--sheet-lean': `${leanFor(`${project.slug}${index}`) * 0.8}deg`,
    }
    const isTop = index === SHEET_COUNT - 1

    return (
      <span
        className={`${styles.sheet} ${isTop ? styles.topSheet : ''}`}
        style={style}
        key={`${project.slug}-sheet-${index}`}
        aria-hidden={isTop ? undefined : true}
      >
        {isTop ? (
          <>
            <span className={styles.status}>In progress</span>
            <span className={styles.title}>
              {project.coverTitle ?? project.title}
            </span>
            <span className={styles.rules} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </>
        ) : null}
      </span>
    )
  })

  if (project.comingSoon !== false) {
    return (
      <div
        className={`${styles.manuscript} ${styles.comingSoon}`}
        role="group"
        tabIndex={0}
        aria-label={`${project.title}. Coming soon.`}
      >
        {sheets}
        <span className={styles.comingSoonMessage} aria-hidden="true">
          Coming soon...
        </span>
      </div>
    )
  }

  return (
    <Link
      className={styles.manuscript}
      href={`/work/${project.slug}`}
      aria-label={`View ${project.title}`}
      // No prefetch: as a static export there is no RSC payload to be had at
      // these URLs, so the probe only aborts. Clicks still navigate client-side.
      prefetch={false}
    >
      {sheets}
    </Link>
  )
}
