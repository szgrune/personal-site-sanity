import styles from './Header.module.css'

export function Header({
  siteTitle,
  tagline,
  intro,
}: {
  siteTitle: string
  tagline?: string | null
  intro?: string | null
}) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h1>{siteTitle}</h1>
        {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
      </div>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </header>
  )
}
