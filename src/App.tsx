import type { ReactElement } from 'react'
import { TabBar } from './components/ui'
import { matchPath, Redirect, useLocation, type Params } from './lib/router'
import { useMe } from './lib/store'
import { Login, Signup, Welcome } from './pages/Auth'
import CheckIn from './pages/CheckIn'
import ClassFeedback from './pages/ClassFeedback'
import Community from './pages/Community'
import Me, { About, MyCheckins, Records } from './pages/Me'
import PostDetail from './pages/PostDetail'
import Schedule from './pages/Schedule'
import Today from './pages/Today'

interface Route {
  pattern: string
  render: (p: Params) => ReactElement
  access: 'public' | 'tab' | 'private'
}

const ROUTES: Route[] = [
  { pattern: '/welcome', access: 'public', render: () => <Welcome /> },
  { pattern: '/login', access: 'public', render: () => <Login /> },
  { pattern: '/signup', access: 'public', render: () => <Signup /> },
  { pattern: '/', access: 'tab', render: () => <Today /> },
  { pattern: '/schedule', access: 'tab', render: () => <Schedule /> },
  { pattern: '/community', access: 'tab', render: () => <Community /> },
  { pattern: '/me', access: 'tab', render: () => <Me /> },
  { pattern: '/checkin/:date/:idx', access: 'private', render: (p) => <CheckIn key={p.date + p.idx} params={p} /> },
  { pattern: '/post/:id', access: 'private', render: (p) => <PostDetail params={p} /> },
  { pattern: '/class/:id', access: 'private', render: (p) => <ClassFeedback params={p} /> },
  { pattern: '/my-checkins', access: 'private', render: () => <MyCheckins /> },
  { pattern: '/records', access: 'private', render: () => <Records /> },
  { pattern: '/about', access: 'private', render: () => <About /> },
]

export default function App() {
  const { path } = useLocation()
  const me = useMe()

  let route: Route | undefined
  let params: Params = {}
  for (const r of ROUTES) {
    const m = matchPath(r.pattern, path)
    if (m) {
      route = r
      params = m
      break
    }
  }

  if (!route) return <Redirect to={me ? '/' : '/welcome'} />
  if (route.access === 'public') return me ? <Redirect to="/" /> : <div className="app">{route.render(params)}</div>
  if (!me) return <Redirect to="/welcome" />

  return (
    <div className="app">
      <main className={route.access === 'tab' ? 'screen has-tabbar' : 'screen'}>{route.render(params)}</main>
      {route.access === 'tab' && <TabBar />}
    </div>
  )
}
