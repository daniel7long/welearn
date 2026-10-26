import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Avatar, Empty, PostCard, Segmented } from '../components/ui'
import { leaderboard, useMe } from '../lib/store'
import { useLocation } from '../lib/router'

type Tab = 'feed' | 'board'

export default function Community() {
  const { search } = useLocation()
  const [tab, setTab] = useState<Tab>(search.get('board') ? 'board' : 'feed')
  return (
    <>
      <header className="screen-title">
        <h1>Community</h1>
      </header>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'feed', label: 'Feed' },
          { value: 'board', label: 'Leaderboard' },
        ]}
      />
      {tab === 'feed' ? <Feed initialMine={!!search.get('mine')} /> : <Board />}
    </>
  )
}

function Feed({ initialMine }: { initialMine: boolean }) {
  const { data } = useMe()!
  const [mine, setMine] = useState(initialMine)
  const posts = (mine ? data.posts.filter((p) => p.mine) : data.posts).slice().sort((a, b) => b.at - a.at)
  return (
    <>
      <div className="chips">
        <button className={`filter ${!mine ? 'on' : ''}`} onClick={() => setMine(false)}>
          Everyone
        </button>
        <button className={`filter ${mine ? 'on' : ''}`} onClick={() => setMine(true)}>
          My posts
        </button>
      </div>
      {posts.length === 0 ? <Empty icon="comment" title="No posts yet" hint="Finish a check-in on the Today tab and it will appear here." /> : posts.map((p) => <PostCard key={p.id} post={p} />)}
    </>
  )
}

function Board() {
  const { account, data } = useMe()!
  const [week, setWeek] = useState<'this' | 'last'>('this')
  const rows = leaderboard(week, account.name, data.checkins)
  const myRank = rows.findIndex((r) => r.me) + 1
  const mine = rows[myRank - 1]
  return (
    <>
      <div className="seg-gap" />
      <Segmented<'this' | 'last'>
        value={week}
        onChange={setWeek}
        options={[
          { value: 'this', label: 'This week' },
          { value: 'last', label: 'Last week' },
        ]}
      />
      <div className="my-rank">
        <Icon name="trophy" size={22} />
        <div className="grow">
          <small>Your rank</small>
          <strong>#{myRank} of {rows.length}</strong>
        </div>
        <b>{mine.count} {mine.count === 1 ? 'check-in' : 'check-ins'}</b>
      </div>
      <ol className="card board">
        {rows.map((r, i) => (
          <li key={r.name + i} className={r.me ? 'me' : ''}>
            <span className={`rank r${i + 1}`}>{i + 1}</span>
            <Avatar name={r.name} color={r.color} size={36} />
            <span className="grow name">{r.me ? `${r.name} (you)` : r.name}</span>
            <b>{r.count}</b>
          </li>
        ))}
      </ol>
      <p className="hint">Ranked by check-ins completed, Monday to Sunday.</p>
    </>
  )
}
