import type { ReactNode } from 'react'
import { goBack, Link, useLocation } from '../lib/router'
import { timeAgo } from '../lib/dates'
import { toggleLike, type Post } from '../lib/store'
import { Icon, type IconName } from './Icon'

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

export function PageHeader({ title, right, fallback = '/' }: { title: string; right?: ReactNode; fallback?: string }) {
  return (
    <header className="page-header">
      <button className="icon-btn" onClick={() => goBack(fallback)} aria-label="Back">
        <Icon name="back" size={24} />
      </button>
      <h1>{title}</h1>
      <div className="page-header-right">{right}</div>
    </header>
  )
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} className={o.value === value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon = 'book', title, hint }: { icon?: IconName; title: string; hint?: string }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={26} />
      </span>
      <strong>{title}</strong>
      {hint && <p>{hint}</p>}
    </div>
  )
}

export function PostCard({ post, detail = false }: { post: Post; detail?: boolean }) {
  return (
    <article className="card post">
      <div className="post-head">
        <Avatar name={post.authorName} color={post.authorColor} />
        <div className="post-meta">
          <strong>{post.mine ? `${post.authorName} (you)` : post.authorName}</strong>
          <span>
            {timeAgo(post.at)} · {post.streak}-day streak
          </span>
        </div>
        {post.mine && (
          <span className={`chip ${post.makeup ? 'chip-warm' : ''}`}>
            {post.makeup ? 'Make-up ' : ''}
            {post.points ? `+${post.points}` : 'No points'}
          </span>
        )}
      </div>
      <h3 className="post-task">{post.taskTitle}</h3>
      {post.body && <p className="post-body">{post.body}</p>}
      {post.images.length > 0 && (
        <div className={`post-images n${Math.min(post.images.length, 3)}`}>
          {post.images.map((src, i) => (
            <img key={i} src={src} alt={`Attachment ${i + 1} from ${post.authorName}`} />
          ))}
        </div>
      )}
      {post.audio && <audio className="post-audio" controls src={post.audio} preload="none" />}
      <div className="post-actions">
        <button className={`action ${post.liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)} aria-pressed={post.liked} aria-label="Like">
          <Icon name="heart" size={18} fill={post.liked} /> {post.likes}
        </button>
        {detail ? (
          <span className="action static">
            <Icon name="comment" size={18} /> {post.comments.length}
          </span>
        ) : (
          <Link to={`/post/${post.id}`} className="action" aria-label="Comments">
            <Icon name="comment" size={18} /> {post.comments.length}
          </Link>
        )}
      </div>
    </article>
  )
}

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Today', icon: 'today' },
  { to: '/schedule', label: 'Schedule', icon: 'schedule' },
  { to: '/community', label: 'Community', icon: 'community' },
  { to: '/me', label: 'Me', icon: 'me' },
]

export function TabBar() {
  const { path } = useLocation()
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <Link key={t.to} to={t.to} className={path === t.to ? 'active' : ''} aria-current={path === t.to ? 'page' : undefined}>
          <Icon name={t.icon} size={22} />
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  )
}
