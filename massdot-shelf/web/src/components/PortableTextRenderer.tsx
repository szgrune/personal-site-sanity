import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
} from '@portabletext/react'

import type {PROJECT_PAGE_QUERY_RESULT} from '@/sanity/types'

import styles from './PortableTextRenderer.module.css'

type ProjectData = NonNullable<PROJECT_PAGE_QUERY_RESULT['project']>
type SlideData = ProjectData['slides'][number]
type PortableTextValue = NonNullable<ProjectData['summary']> | NonNullable<SlideData['body']>

type LinkMark = {
  _type: 'link'
  _key: string
  href: string
  openInNewTab?: boolean
}

function Link({children, value}: PortableTextMarkComponentProps<LinkMark>) {
  if (!value?.href) return <>{children}</>

  const externalProps = value.openInNewTab ? {target: '_blank', rel: 'noopener noreferrer'} : {}

  return (
    <a href={value.href} {...externalProps}>
      {children}
    </a>
  )
}

const components: PortableTextComponents = {
  marks: {
    link: Link,
  },
  block: {
    h4: ({children}) => <h4>{children}</h4>,
    h5: ({children}) => <h5>{children}</h5>,
  },
}

export function PortableTextRenderer({
  value,
  className,
}: {
  value: PortableTextValue
  className?: string
}) {
  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <PortableText value={value} components={components} />
    </div>
  )
}
