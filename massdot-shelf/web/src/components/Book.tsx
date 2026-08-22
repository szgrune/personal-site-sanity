import Link from 'next/link'
import type {CSSProperties} from 'react'

import {leanFor} from '@/lib/lean'

import {BookCover} from './BookCover'
import type {ShelfItemData} from './Bookshelf'
import styles from './Book.module.css'

type BookStyle = CSSProperties & {'--lean': string}

export function Book({project}: {project: ShelfItemData}) {
  const style: BookStyle = {'--lean': `${leanFor(project.slug)}deg`}

  return (
    <Link
      className={styles.book}
      href={`/work/${project.slug}`}
      aria-label={`View ${project.title}`}
      style={style}
      // No prefetch: as a static export there is no RSC payload to be had at
      // these URLs, so the probe only aborts. Clicks still navigate client-side.
      prefetch={false}
    >
      <span className={styles.cover}>
        <BookCover project={project} />
        <span className={styles.spineFold} aria-hidden="true" />
        <span className={styles.pageBlock} aria-hidden="true" />
      </span>
    </Link>
  )
}
