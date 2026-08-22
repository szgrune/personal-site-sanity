'use client'

import {useEffect} from 'react'

const THEME_MESSAGE = 'massdot-shelf:theme'
const READY_MESSAGE = 'massdot-shelf:ready'

/**
 * The shelf runs inside an iframe on samzgrunebaum.org, where the host page
 * owns the light/dark toggle. It posts the current theme in and we mirror it
 * onto <html data-theme>, which is what globals.css already keys off. Rendered
 * standalone (not framed) this is inert and the default light theme stands.
 */
export function EmbedThemeSync() {
  useEffect(() => {
    if (window.parent === window) return

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return

      const data = event.data as {type?: string; theme?: string} | null
      if (data?.type !== THEME_MESSAGE) return

      document.documentElement.setAttribute(
        'data-theme',
        data.theme === 'dark' ? 'dark' : 'light',
      )
    }

    window.addEventListener('message', onMessage)
    // Announce ourselves: the host may have toggled the theme before we
    // mounted, and on in-shelf navigation this is the only way to catch up.
    window.parent.postMessage({type: READY_MESSAGE}, '*')

    return () => window.removeEventListener('message', onMessage)
  }, [])

  return null
}
