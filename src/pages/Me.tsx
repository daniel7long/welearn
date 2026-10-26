import { useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { Avatar, PageHeader, Empty } from '../components/ui'
import { hoursDone, pastClasses } from '../lib/curriculum'
import { colorFor } from '../lib/classmates'
import { fmtDate, to12h } from '../lib/dates'
import { Link, navigate } from '../lib/router'
import { levelOf, logOut, pointsOf, POINTS_PER_LEVEL, resetMyData, streakOf, useMe } from '../lib/store'

function MenuLink({ to, icon, label, meta }: { to: string; icon: IconName; label: string; meta?: string }) {
  return (
    <Link to={to} className="menu-row">
      <span className="menu-icon">
        <Icon name={icon} size={20} />
      </span>
      <span className="grow">{label}</span>
      {meta && <span className="muted">{meta}</span>}
      <Icon name="next" size={18} />
    </Link>
  )
}

export default function Me() {
  const { account, data } = useMe()!
  const points = pointsOf(data.checkins)
  const level = levelOf(points)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <header className="hero hero-me">
        <Avatar name={account.name} color={colorFor(account.name)} size={64} />
        <h1>{account.name}</h1>
        <p className="hero-sub">{account.email}</p>
      </header>

      <section className="card me-stats">
        <div>
          <b>LV.{level}</b>
          <small>{POINTS_PER_LEVEL - (points % POINTS_PER_LEVEL)} pts to next</small>
        </div>
        <div>
          <b>{points}</b>
          <small>Points</small>
        </div>
        <div>
          <b>{streakOf(data.checkins)}</b>
          <small>Day streak</small>
        </div>
        <div>
          <b>{hoursDone(data.courseStart)}h</b>
          <small>Class hours</small>
        </div>
      </section>

      <nav className="card menu">
        <MenuLink to="/my-checkins" icon="list" label="My check-ins" meta={String(data.checkins.length)} />
        <MenuLink to="/records" icon="history" label="Learning records" />
        <MenuLink to="/community?board=1" icon="trophy" label="Leaderboard" />
        <MenuLink to="/about" icon="info" label="About WeLearn" />
      </nav>

      <div className="pad">
        <button
          className="btn btn-outline"
          onClick={() => {
            logOut()
            navigate('/welcome', { replace: true })
          }}
        >
          <Icon name="logout" size={18} /> Log out
        </button>
        <div className="reset">
          {confirmReset ? (
            <>
              <span>Reset your check-ins, posts and points?</span>
              <button className="link-sm" onClick={() => { resetMyData(); setConfirmReset(false) }}>Yes, reset</button>
              <button className="link-sm muted" onClick={() => setConfirmReset(false)}>Cancel</button>
            </>
          ) : (
            <button className="link-sm muted" onClick={() => setConfirmReset(true)}>Reset my demo data</button>
          )}
        </div>
      </div>
    </>
  )
}

export function MyCheckins() {
  const { data } = useMe()!
  const items = data.checkins.slice().sort((a, b) => b.at - a.at)
  return (
    <>
      <PageHeader title="My check-ins" fallback="/me" />
      <div className="pad">
        {items.length === 0 ? (
          <Empty icon="list" title="No check-ins yet" hint="Head to the Today tab to post your first one." />
        ) : (
          <div className="card list">
            {items.map((c) => (
              <Link key={c.id} to={`/post/${c.postId}`} className="row">
                <div className="grow">
                  <div className="row-title">{c.taskTitle}</div>
                  <div className="row-sub">
                    {fmtDate(c.date, { month: 'short', day: 'numeric' })}
                    {c.makeup ? ' · make-up' : ''}
                  </div>
                </div>
                <span className={`pill ${c.points ? 'pill-primary-soft' : 'pill-muted'}`}>{c.points ? `+${c.points}` : '0'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function Records() {
  const { data } = useMe()!
  const list = pastClasses(data.courseStart)
  return (
    <>
      <PageHeader title="Learning records" fallback="/me" />
      <div className="pad">
        {list.length === 0 ? (
          <Empty icon="history" title="No classes yet" />
        ) : (
          <div className="card list">
            {list.map((c) => (
              <Link key={c.id} to={`/class/${encodeURIComponent(c.id)}`} className="row">
                <div className="grow">
                  <div className="row-title">{c.title}</div>
                  <div className="row-sub">
                    {fmtDate(c.date, { weekday: 'short', month: 'short', day: 'numeric' })} · {to12h(c.start)}
                  </div>
                </div>
                <span className="link-sm">Feedback</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function About() {
  return (
    <>
      <PageHeader title="About WeLearn" fallback="/me" />
      <div className="pad stack about">
        <section className="card">
          <h2>Introduction</h2>
          <p>WeLearn Education was founded by a group of teachers passionate about education. Our core team has worked in international education for more than 10 years, and we have helped over 1,500 families and 2,000 children build structured English and subject-learning plans.</p>
        </section>
        <section className="card">
          <h2>Mission</h2>
          <p>To empower every student aged 9–18 with professional teaching and cutting-edge technology — improving English, academic performance and overall skills — so they grow into globally minded people.</p>
        </section>
        <section className="card">
          <h2>Contact</h2>
          <dl className="facts">
            <dt>Website</dt>
            <dd>www.hao-edu.cn</dd>
            <dt>Address</dt>
            <dd>Unit 1915, Tower A, International Chamber of Commerce Building, 138 Fuhua 1st Road, Futian District, Shenzhen</dd>
            <dt>WeChat</dt>
            <dd>Official account: WeLearn_SZ</dd>
          </dl>
        </section>
      </div>
    </>
  )
}
