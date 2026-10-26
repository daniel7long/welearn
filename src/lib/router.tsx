import { useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react'

/* A tiny History-API router (no dependency). Supports :params, query strings, back(). */

type HistState = { idx: number } | null
let currentIdx = (window.history.state as HistState)?.idx ?? 0
const subs = new Set<() => void>()
const notify = () => subs.forEach((s) => s())

window.addEventListener('popstate', (e) => {
  currentIdx = (e.state as HistState)?.idx ?? 0
  notify()
})

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) {
    window.history.replaceState({ idx: currentIdx }, '', to)
  } else {
    currentIdx += 1
    window.history.pushState({ idx: currentIdx }, '', to)
  }
  window.scrollTo(0, 0)
  notify()
}

/** Go back inside the app, or to `fallback` if there's nowhere in-app to go back to. */
export function goBack(fallback = '/') {
  if (currentIdx > 0) window.history.back()
  else navigate(fallback, { replace: true })
}

const subscribe = (cb: () => void) => {
  subs.add(cb)
  return () => subs.delete(cb)
}
const getHref = () => window.location.pathname + window.location.search

export function useLocation() {
  const href = useSyncExternalStore(subscribe, getHref)
  const [path, search = ''] = href.split('?')
  return { path: path.replace(/\/+$/, '') || '/', search: new URLSearchParams(search) }
}

export function Link({ to, replace, onClick, children, ...rest }: { to: string; replace?: boolean; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        navigate(to, { replace })
      }}
    >
      {children}
    </a>
  )
}

export function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to])
  return null
}

export type Params = Record<string, string>

export function matchPath(pattern: string, path: string): Params | null {
  const a = pattern.split('/').filter(Boolean)
  const b = path.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params: Params = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}
