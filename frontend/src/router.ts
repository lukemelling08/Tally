import { useSyncExternalStore } from 'react'

// Minimal client-side routing on the History API. Offline deep links work
// because the service worker serves index.html for every navigation.

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

export const usePathname = () => useSyncExternalStore(subscribe, () => window.location.pathname)

export function navigate(path: string) {
  if (path === window.location.pathname) return
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

export function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}
