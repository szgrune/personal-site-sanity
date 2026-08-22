import Image from 'next/image'
import type {CSSProperties} from 'react'

import {clothInk, clothVariable, type ClothColor} from '@/lib/cloth'

import type {ShelfItemData} from './Bookshelf'
import styles from './BookCover.module.css'

type CoverStyle = CSSProperties & {
  '--cloth-color': string
  '--stamp-color': string
}

export function BookCover({project}: {project: ShelfItemData}) {
  const image = project.coverImage

  if (image?.asset?.url) {
    const lqip = image.asset.metadata?.lqip

    return (
      <div className={styles.uploaded}>
        <Image
          src={image.asset.url}
          alt={image.alt}
          fill
          sizes="(max-width: 600px) 112px, 176px"
          placeholder={lqip ? 'blur' : 'empty'}
          blurDataURL={lqip ?? undefined}
        />
        {image.showTitleOverlay ? (
          <span className={styles.uploadedTitle} aria-hidden="true">
            {project.coverTitle ?? project.title}
          </span>
        ) : null}
      </div>
    )
  }

  const cloth = project.clothColor as ClothColor
  const coverStyle: CoverStyle = {
    '--cloth-color': `var(${clothVariable(cloth)})`,
    '--stamp-color': `var(${clothInk(cloth)})`,
  }
  const motif = project.coverMotif ?? 'double-rule'

  return (
    <div className={styles.composed} style={coverStyle}>
      <span
        className={`${styles.motif} ${styles[motif]}`}
        aria-hidden="true"
      />
      <div className={styles.titleBlock}>
        <span className={styles.title}>
          {project.coverTitle ?? project.title}
        </span>
        {project.subtitle ? (
          <span className={styles.subtitle}>{project.subtitle}</span>
        ) : null}
      </div>
      <div className={styles.imprint}>
        <span>The Lab @ MassDOT</span>
        {project.year ? <span>{project.year}</span> : null}
      </div>
    </div>
  )
}
