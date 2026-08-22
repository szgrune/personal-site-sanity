import Link from 'next/link'

import styles from './SlideNav.module.css'

export function SlideNav({
  projectTitle,
  selectedIndex,
  slideCount,
  onPrevious,
  onNext,
}: {
  projectTitle: string
  selectedIndex: number
  slideCount: number
  onPrevious: () => void
  onNext: () => void
}) {
  const counterWidth = Math.max(2, String(slideCount).length)
  const current = String(selectedIndex + 1).padStart(counterWidth, '0')
  const total = String(slideCount).padStart(counterWidth, '0')

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.back} prefetch={false}>
          <span aria-hidden="true">←</span> Shelf
        </Link>
        <span className={styles.projectTitle}>{projectTitle}</span>
        <span className={styles.counter} aria-label={`Slide ${selectedIndex + 1} of ${slideCount}`}>
          {current} / {total}
        </span>
      </header>
      <nav className={styles.controls} aria-label="Slideshow controls">
        <button
          className={`${styles.arrow} ${styles.previous}`}
          type="button"
          onClick={onPrevious}
          disabled={selectedIndex === 0}
          aria-label="Previous slide"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          className={`${styles.arrow} ${styles.next}`}
          type="button"
          onClick={onNext}
          disabled={selectedIndex === slideCount - 1}
          aria-label="Next slide"
        >
          <span aria-hidden="true">›</span>
        </button>
      </nav>
    </>
  )
}
