'use client'

import useEmblaCarousel from 'embla-carousel-react'
import {useRouter} from 'next/navigation'
import {useCallback, useEffect, useState, useSyncExternalStore, type KeyboardEvent} from 'react'

import {parseSlideHash, serializeSlideHash} from '@/lib/slideHash'
import sanityImageLoader from '@/sanity/imageLoader'
import type {PROJECT_PAGE_QUERY_RESULT} from '@/sanity/types'

import {Slide} from './Slide'
import styles from './SlideDeck.module.css'
import {SlideNav} from './SlideNav'

type ProjectData = NonNullable<PROJECT_PAGE_QUERY_RESULT['project']>
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function SlideDeck({project}: {project: ProjectData}) {
  const router = useRouter()
  const slides = project.slides
  const [selectedIndex, setSelectedIndex] = useState(0)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    reducedMotionSnapshot,
    serverReducedMotionSnapshot,
  )
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    duration: prefersReducedMotion ? 0 : 25,
    loop: false,
  })

  const updateSelection = useCallback((index: number) => {
    setSelectedIndex(index)

    const nextHash = serializeSlideHash(index)
    if (window.location.hash !== nextHash) {
      window.history.replaceState(window.history.state, '', nextHash)
    }
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      updateSelection(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    const initialIndex = parseSlideHash(window.location.hash, slides.length)
    emblaApi.scrollTo(initialIndex, true)
    emblaApi.emit('select')

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, slides.length, updateSelection])

  useEffect(() => {
    const nextImageUrl = slides[selectedIndex + 1]?.image?.asset?.url
    if (!nextImageUrl) return

    const preload = new window.Image()
    preload.src = sanityImageLoader({
      src: nextImageUrl,
      width: 1600,
      quality: 78,
    })
  }, [selectedIndex, slides])

  const previous = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const next = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        previous()
        break
      case 'ArrowRight':
        event.preventDefault()
        next()
        break
      case 'Home':
        event.preventDefault()
        emblaApi?.scrollTo(0)
        break
      case 'End':
        event.preventDefault()
        emblaApi?.scrollTo(slides.length - 1)
        break
      case 'Escape':
        event.preventDefault()
        router.push('/')
        break
    }
  }

  const selectedSlide = slides[selectedIndex]
  const announcement = `Slide ${selectedIndex + 1} of ${slides.length}${
    selectedSlide?.title ? `: ${selectedSlide.title}` : ''
  }`

  return (
    <main className={styles.deck} onKeyDown={onKeyDown} tabIndex={0} autoFocus>
      <SlideNav
        projectTitle={project.title}
        selectedIndex={selectedIndex}
        slideCount={slides.length}
        onPrevious={previous}
        onNext={next}
      />
      <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <div
        className={styles.viewport}
        ref={viewportRef}
        aria-roledescription="carousel"
        aria-label={`${project.title} slides`}
      >
        <div className={styles.container}>
          {slides.map((slide, index) => (
            <Slide
              project={project}
              slide={slide}
              index={index}
              total={slides.length}
              isActive={index === selectedIndex}
              key={slide._key}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  mediaQuery.addEventListener('change', onStoreChange)

  return () => {
    mediaQuery.removeEventListener('change', onStoreChange)
  }
}

function reducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function serverReducedMotionSnapshot() {
  return false
}
