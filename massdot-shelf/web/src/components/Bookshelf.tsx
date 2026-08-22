import type {SHELF_PAGE_QUERY_RESULT} from '@/sanity/types'

import {Book} from './Book'
import {Manuscript} from './Manuscript'
import {Plank} from './Plank'
import styles from './Bookshelf.module.css'

export type ShelfData = SHELF_PAGE_QUERY_RESULT['shelves'][number]
export type ShelfItemData = NonNullable<ShelfData['items']>[number]

export function Bookshelf({shelf}: {shelf: ShelfData}) {
  const items = shelf.items ?? []
  const labelId = `shelf-${shelf.slug}`

  return (
    <section className={styles.shelf} aria-labelledby={labelId}>
      <div className={styles.itemRow}>
        {items.map((project) => {
          const presentation =
            project.presentation && project.presentation !== 'inherit'
              ? project.presentation
              : shelf.itemStyle

          return presentation === 'manuscript' ? (
            <Manuscript project={project} key={project._key} />
          ) : (
            <Book project={project} key={project._key} />
          )
        })}
      </div>
      <Plank />
      <div className={styles.label}>
        <div className={styles.labelLine}>
          <h2 id={labelId}>{shelf.title}</h2>
          <span>
            {items.length} {items.length === 1 ? 'work' : 'works'}
          </span>
        </div>
        {shelf.caption ? <p>{shelf.caption}</p> : null}
      </div>
    </section>
  )
}
