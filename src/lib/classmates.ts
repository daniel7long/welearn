/** Sample classmates used to make the community feed and leaderboard feel alive. */
export interface Classmate {
  id: string
  name: string
  color: string
  /** Check-ins in a full week (this week's number is scaled to how far through the week we are). */
  thisWeek: number
  lastWeek: number
}

export const AVATAR_COLORS = ['#0E8FA3', '#E07A5F', '#6C63B5', '#3A9D7B', '#D1953A', '#C44D74', '#4A7BD0', '#7A8B3C']

export const colorFor = (name: string) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

export const CLASSMATES: Classmate[] = [
  { id: 'c1', name: 'Maya Chen', color: '#E07A5F', thisWeek: 20, lastWeek: 20 },
  { id: 'c2', name: 'Leo Park', color: '#6C63B5', thisWeek: 18, lastWeek: 17 },
  { id: 'c3', name: 'Sofia Alvarez', color: '#3A9D7B', thisWeek: 16, lastWeek: 18 },
  { id: 'c4', name: 'Ethan Zhang', color: '#D1953A', thisWeek: 14, lastWeek: 14 },
  { id: 'c5', name: 'Aisha Khan', color: '#C44D74', thisWeek: 12, lastWeek: 13 },
  { id: 'c6', name: 'Noah Kim', color: '#4A7BD0', thisWeek: 10, lastWeek: 11 },
  { id: 'c7', name: 'Lina Wang', color: '#7A8B3C', thisWeek: 8, lastWeek: 9 },
  { id: 'c8', name: 'Omar Haddad', color: '#0E8FA3', thisWeek: 6, lastWeek: 7 },
]

export interface SeedPost {
  by: string
  hoursAgo: number
  streak: number
  task: string
  body: string
  likes: number
  comments?: { by: string; text: string; hoursAgo: number; replyTo?: number }[]
}

export const SEED_POSTS: SeedPost[] = [
  {
    by: 'c1',
    hoursAgo: 1,
    streak: 12,
    task: 'High-School Vocabulary List 3 · CN→EN',
    body: 'Finished List 3! My favourite new words: ubiquitous, meticulous and ephemeral. Trying to use each one in a sentence today.',
    likes: 14,
    comments: [
      { by: 'c2', text: 'Nice! I always mix up ephemeral and ethereal 😅', hoursAgo: 0.8 },
      { by: 'c4', text: 'Great streak — keep going!', hoursAgo: 0.5 },
    ],
  },
  {
    by: 'c3',
    hoursAgo: 4,
    streak: 9,
    task: 'Practice Book · Foundation · Reading U3',
    body: 'Unit 3 was tough, but the signal-word trick from class really helped. "However" and "in contrast" almost always point to the answer.',
    likes: 9,
    comments: [{ by: 'c5', text: 'Thanks for the tip, trying it tonight.', hoursAgo: 3 }],
  },
  {
    by: 'c2',
    hoursAgo: 22,
    streak: 11,
    task: 'Practice Book · Foundation · Listening L3',
    body: 'Listened twice and wrote down the key numbers first. Got 9/10 this time!',
    likes: 7,
  },
  {
    by: 'c6',
    hoursAgo: 30,
    streak: 5,
    task: 'TOEFL Reading L3 · Homework',
    body: 'Rhetorical-purpose questions finally make sense. Ask "why did the author include this?" and not "what does it say?"',
    likes: 11,
    comments: [{ by: 'c1', text: 'Exactly — that reframing helped me too.', hoursAgo: 28 }],
  },
]
