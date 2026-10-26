import { useSyncExternalStore } from 'react'
import { addDays, diffDays, mondayOf, todayISO } from './dates'
import { CLASSMATES, SEED_POSTS, colorFor } from './classmates'

/* ------------------------------------------------------------------ *
 * Local demo "backend".
 * Everything lives in this browser's localStorage, keyed per user, so
 * each account has its own private Hub. No server is needed, which
 * makes the app trivial to deploy on Vercel for a demo.
 * (Passwords are salted + hashed, but this is NOT production auth.)
 * ------------------------------------------------------------------ */

export interface Account {
  id: string
  name: string
  email: string
  salt: string
  hash: string
  createdAt: number
}

export interface Comment {
  id: string
  parentId?: string
  authorName: string
  authorColor: string
  text: string
  at: number
  mine?: boolean
}

export interface Post {
  id: string
  authorName: string
  authorColor: string
  taskTitle: string
  body: string
  images: string[]
  audio?: string
  at: number
  streak: number
  likes: number
  liked: boolean
  comments: Comment[]
  mine?: boolean
  points?: number
  makeup?: boolean
}

export interface Checkin {
  id: string
  taskId: string
  date: string
  taskTitle: string
  makeup: boolean
  points: number
  at: number
  postId: string
}

export interface UserData {
  courseStart: string
  checkins: Checkin[]
  signins: string[]
  posts: Post[]
}

interface DB {
  accounts: Account[]
  session: string | null
  data: Record<string, UserData>
}

const KEY = 'welearn-lms.v1'
const EMPTY: DB = { accounts: [], session: null, data: {} }

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable — fall through to in-memory */
  }
  return { ...EMPTY }
}

let db: DB = load()
const listeners = new Set<() => void>()

/** Returns false (and rolls back) if the browser refuses to save, e.g. storage is full. */
function commit(next: DB): boolean {
  const prev = db
  db = next
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    db = prev
    return false
  }
  listeners.forEach((l) => l())
  return true
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
const snapshot = () => db
export const useDB = () => useSyncExternalStore(subscribe, snapshot)

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/* ----------------------------- auth ----------------------------- */

type Result = { ok: true } | { ok: false; error: string }

export async function signUp(name: string, email: string, password: string): Promise<Result> {
  name = name.trim()
  email = email.trim().toLowerCase()
  if (!name) return { ok: false, error: 'Please enter your name.' }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Please enter a valid email address.' }
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
  if (db.accounts.some((a) => a.email === email)) return { ok: false, error: 'An account with this email already exists. Try logging in.' }
  const salt = uid()
  const account: Account = { id: uid(), name, email, salt, hash: await sha256(salt + password), createdAt: Date.now() }
  const ok = commit({
    accounts: [...db.accounts, account],
    session: account.id,
    data: { ...db.data, [account.id]: seedUser() },
  })
  return ok ? { ok: true } : { ok: false, error: 'Could not save your account (browser storage is unavailable).' }
}

export async function logIn(email: string, password: string): Promise<Result> {
  email = email.trim().toLowerCase()
  const account = db.accounts.find((a) => a.email === email)
  if (!account || (await sha256(account.salt + password)) !== account.hash) {
    return { ok: false, error: 'Incorrect email or password.' }
  }
  commit({ ...db, session: account.id })
  return { ok: true }
}

export function logOut() {
  commit({ ...db, session: null })
}

export function resetMyData() {
  const acc = db.accounts.find((a) => a.id === db.session)
  if (!acc) return
  commit({ ...db, data: { ...db.data, [acc.id]: seedUser() } })
}

/* ---------------------------- seeding ---------------------------- */

function seedUser(): UserData {
  const now = Date.now()
  const posts: Post[] = SEED_POSTS.map((p, i) => {
    const mate = CLASSMATES.find((c) => c.id === p.by)!
    const postId = `seed-${i}`
    return {
      id: postId,
      authorName: mate.name,
      authorColor: mate.color,
      taskTitle: p.task,
      body: p.body,
      images: [],
      at: now - p.hoursAgo * 3600_000,
      streak: p.streak,
      likes: p.likes,
      liked: false,
      comments: (p.comments ?? []).map((c, j) => {
        const cm = CLASSMATES.find((m) => m.id === c.by)!
        return { id: `${postId}-c${j}`, authorName: cm.name, authorColor: cm.color, text: c.text, at: now - c.hoursAgo * 3600_000 }
      }),
    }
  })
  return { courseStart: addDays(todayISO(), -21), checkins: [], signins: [], posts }
}

/* ---------------------------- selectors ---------------------------- */

export function useMe() {
  const s = useDB()
  const account = s.accounts.find((a) => a.id === s.session)
  const data = account ? s.data[account.id] : undefined
  return account && data ? { account, data } : null
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0]

export function streakOf(checkins: Checkin[]): number {
  const days = new Set(checkins.map((c) => c.date))
  let day = todayISO()
  if (!days.has(day)) day = addDays(day, -1)
  let n = 0
  while (days.has(day)) {
    n++
    day = addDays(day, -1)
  }
  return n
}

export const pointsOf = (checkins: Checkin[]) => checkins.reduce((a, c) => a + c.points, 0)
export const POINTS_PER_LEVEL = 50
export const levelOf = (points: number) => 1 + Math.floor(points / POINTS_PER_LEVEL)

export interface Row {
  name: string
  color: string
  count: number
  me: boolean
}

export function leaderboard(week: 'this' | 'last', myName: string, checkins: Checkin[]): Row[] {
  const monday = mondayOf(todayISO())
  const start = week === 'this' ? monday : addDays(monday, -7)
  const end = addDays(start, 6)
  const mine = checkins.filter((c) => c.date >= start && c.date <= end).length
  const elapsed = week === 'this' ? diffDays(monday, todayISO()) + 1 : 7
  const rows: Row[] = CLASSMATES.map((c) => ({
    name: c.name,
    color: c.color,
    count: Math.min(week === 'this' ? c.thisWeek : c.lastWeek, Math.round(((week === 'this' ? c.thisWeek : c.lastWeek) * elapsed) / 7)),
    me: false,
  }))
  rows.push({ name: myName, color: colorFor(myName), count: mine, me: true })
  // Ties: classmates first, so "me" never jumps ahead without earning it.
  return rows.sort((a, b) => b.count - a.count || Number(a.me) - Number(b.me))
}

/* ----------------------------- actions ----------------------------- */

function updateMe(fn: (d: UserData, a: Account) => UserData): boolean {
  const acc = db.accounts.find((a) => a.id === db.session)
  const data = acc && db.data[acc.id]
  if (!acc || !data) return false
  return commit({ ...db, data: { ...db.data, [acc.id]: fn(data, acc) } })
}

export const MAKEUP_WINDOW_DAYS = 3
export const CHECKIN_POINTS = 10

export function checkIn(input: {
  taskId: string
  date: string
  title: string
  body: string
  images: string[]
  audio?: string
}): { ok: true; points: number } | { ok: false; error: string } {
  const today = todayISO()
  const acc = db.accounts.find((a) => a.id === db.session)
  const data = acc && db.data[acc.id]
  if (!acc || !data) return { ok: false, error: 'You are signed out.' }
  if (input.date > today) return { ok: false, error: 'You can’t check in for a future day yet.' }
  if (data.checkins.some((c) => c.taskId === input.taskId)) return { ok: false, error: 'You already checked in for this task.' }
  if (!input.body.trim() && !input.images.length && !input.audio) return { ok: false, error: 'Add some text, a photo or a voice note first.' }

  const makeup = input.date < today
  const points = !makeup || diffDays(input.date, today) <= MAKEUP_WINDOW_DAYS ? CHECKIN_POINTS : 0
  const postId = uid()
  const at = Date.now()
  const checkin: Checkin = { id: uid(), taskId: input.taskId, date: input.date, taskTitle: input.title, makeup, points, at, postId }
  const streak = streakOf([...data.checkins, checkin])
  const post: Post = {
    id: postId,
    authorName: acc.name,
    authorColor: colorFor(acc.name),
    taskTitle: input.title,
    body: input.body.trim(),
    images: input.images,
    audio: input.audio,
    at,
    streak,
    likes: 0,
    liked: false,
    comments: [],
    mine: true,
    points,
    makeup,
  }
  const ok = updateMe((d) => ({ ...d, checkins: [...d.checkins, checkin], posts: [post, ...d.posts] }))
  return ok ? { ok: true, points } : { ok: false, error: 'Your browser’s storage is full. Try fewer or smaller photos.' }
}

export function signIntoClass(classId: string) {
  updateMe((d) => (d.signins.includes(classId) ? d : { ...d, signins: [...d.signins, classId] }))
}

export function toggleLike(postId: string) {
  updateMe((d) => ({
    ...d,
    posts: d.posts.map((p) => (p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)),
  }))
}

export function addComment(postId: string, text: string, parentId?: string): boolean {
  text = text.trim()
  if (!text || text.length > 140) return false
  return updateMe((d, a) => ({
    ...d,
    posts: d.posts.map((p) =>
      p.id === postId
        ? { ...p, comments: [...p.comments, { id: uid(), parentId, authorName: a.name, authorColor: colorFor(a.name), text, at: Date.now(), mine: true }] }
        : p,
    ),
  }))
}
