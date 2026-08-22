import type {Metadata} from 'next'
import Link from 'next/link'

import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <h1>This work is not on the shelf.</h1>
      <p>The address may have changed, or this project may not be published yet.</p>
      <Link href="/" prefetch={false}>
        Return to the shelf
      </Link>
    </main>
  )
}
