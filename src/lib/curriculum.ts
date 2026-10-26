import { addDays, diffDays, dow, todayISO, toMinutes } from './dates'

export interface Task {
  id: string
  date: string
  title: string
}

export interface ClassSession {
  id: string
  date: string
  title: string
  start: string
  end: string
  room: string
  teacher: string
  hours: number
}

export const COURSE = { name: 'TOEFL Foundation Course', totalHours: 160, spanDays: 56 }

const TASK_POOL = [
  'High-School Vocabulary List 3 · CN→EN',
  'Practice Book · Foundation · Listening L3',
  'Practice Book · Foundation · Reading U3',
  'TOEFL Reading L3 · Homework',
]

/** Daily check-in tasks are generated from the date, so every day always has work to do. */
export function tasksFor(date: string): Task[] {
  const [y, m, d] = date.split('-').map(Number)
  const n = Math.floor(Date.UTC(y, m - 1, d) / 86400000)
  const picks = [0, 1 + (n % 3), 1 + ((n + 1) % 3)]
  return picks.map((p, i) => ({ id: `${date}#${i}`, date, title: TASK_POOL[p] }))
}

export function taskById(date: string, idx: string): Task | undefined {
  return tasksFor(date).find((t) => t.id === `${date}#${idx}`)
}

const SLOTS: Record<string, { title: string; start: string; end: string }> = {
  A: { title: 'TOEFL Reading L3', start: '08:30', end: '10:00' },
  B: { title: 'Practice Book · Foundation · Reading U3', start: '14:00', end: '16:00' },
  C: { title: 'High-School Vocabulary List 3', start: '16:10', end: '18:10' },
}

// Monday–Saturday; Sunday is a rest day.
const WEEK_PLAN: string[][] = [['A', 'B', 'C'], ['A'], ['A', 'B', 'C'], ['A'], ['A', 'B', 'C'], ['A'], []]

function makeSession(date: string, slot: string): ClassSession {
  const s = SLOTS[slot]
  return {
    id: `${date}@${slot}`,
    date,
    title: s.title,
    start: s.start,
    end: s.end,
    room: 'Room 4',
    teacher: 'Mr. Li',
    hours: (toMinutes(s.end) - toMinutes(s.start)) / 60,
  }
}

export function classesFor(date: string, courseStart: string): ClassSession[] {
  const offset = diffDays(courseStart, date)
  if (offset < 0 || offset >= COURSE.spanDays) return []
  return WEEK_PLAN[dow(date)].map((slot) => makeSession(date, slot))
}

export function classById(id: string, courseStart: string): ClassSession | undefined {
  const [date, slot] = id.split('@')
  if (!date || !slot || !SLOTS[slot]) return undefined
  return classesFor(date, courseStart).find((c) => c.id === id)
}

export function hasEnded(c: ClassSession, now = new Date()): boolean {
  const today = todayISO()
  if (c.date < today) return true
  if (c.date > today) return false
  return now.getHours() * 60 + now.getMinutes() >= toMinutes(c.end)
}

export function hoursDone(courseStart: string): number {
  let total = 0
  const today = todayISO()
  for (let d = courseStart; d <= today; d = addDays(d, 1)) {
    for (const c of classesFor(d, courseStart)) if (hasEnded(c)) total += c.hours
  }
  return Math.min(total, COURSE.totalHours)
}

export function pastClasses(courseStart: string): ClassSession[] {
  const out: ClassSession[] = []
  const today = todayISO()
  for (let d = today; d >= courseStart; d = addDays(d, -1)) {
    const list = classesFor(d, courseStart)
      .filter((c) => hasEnded(c))
      .reverse()
    out.push(...list)
  }
  return out
}

/* ---------- Teacher feedback (sample content, generated deterministically) ---------- */

export interface Feedback {
  homeworkReview: string
  covered: string[]
  performance: string
  assignment: string
  due: string
}

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

const REVIEWS = [
  (n: string) => `${n} completed last week's homework well, with accuracy of about 85%. Vocabulary questions were a real strength, but main-idea questions still need more careful reading.`,
  (n: string) => `${n} handed in all of the assigned work on time. Accuracy on inference questions has improved noticeably; keep underlining the evidence sentence before choosing an answer.`,
  (n: string) => `${n}'s homework was thorough and neat. A few rhetorical-purpose questions were missed — we'll practise spotting why an author includes an example.`,
  (n: string) => `Solid effort from ${n} this week, around 90% correct. Careless slips on negative-fact questions; remember to re-read the question stem.`,
]

const COVERED = [
  ['Went over homework answers, reviewed vocabulary and main-idea questions.', 'Learned the method for rhetorical-purpose questions and practised with a short passage.'],
  ['Reviewed paragraph structure and signal words.', 'Timed reading practice, followed by a group discussion of the tricky questions.'],
  ['Checked the vocabulary list in context and built example sentences.', 'Practised summarising a paragraph in one sentence.'],
  ['Walked through inference questions step by step.', 'Compared two strategies for eliminating wrong answers.'],
]

const PERFORMANCE = [
  (n: string) => `${n} kept up with the pace of the class and asked thoughtful questions. After today's lesson ${n} understands rhetorical-purpose questions much better and can apply the teacher's method to analyse a problem. Next step: pay more attention to detail.`,
  (n: string) => `${n} was focused and participated actively. Answers in discussion were clear and well-supported. Keep building speed — aim to finish each passage in under 18 minutes.`,
  (n: string) => `${n} showed great curiosity today and volunteered twice. Pronunciation of new vocabulary is improving; try reading the word list aloud once a day.`,
  (n: string) => `A steady session for ${n}. Understanding is good; confidence in answering aloud is the next thing to work on.`,
]

const ASSIGNMENTS = ['Textbook Unit 2 after-class exercises', 'Vocabulary List 3 — write 10 example sentences', 'Reading passage 4 with questions 1–10', 'Listening L3 — transcribe the first two minutes']

export function feedbackFor(c: ClassSession, firstName: string): Feedback {
  const h = hash(c.id)
  const name = firstName || 'The student'
  return {
    homeworkReview: REVIEWS[h % REVIEWS.length](name),
    covered: COVERED[(h >>> 3) % COVERED.length],
    performance: PERFORMANCE[(h >>> 5) % PERFORMANCE.length](name),
    assignment: ASSIGNMENTS[(h >>> 7) % ASSIGNMENTS.length],
    due: addDays(c.date, 2),
  }
}
