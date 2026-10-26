import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Empty } from '../components/ui'
import { classesFor, hasEnded, tasksFor } from '../lib/curriculum'
import { addDays, dow, fmtDate, fromISO, mondayOf, to12h, todayISO, WEEKDAYS_SHORT, diffDays } from '../lib/dates'
import { Link } from '../lib/router'
import { firstName, levelOf, MAKEUP_WINDOW_DAYS, pointsOf, POINTS_PER_LEVEL, signIntoClass, streakOf, useMe } from '../lib/store'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Today() {
  const me = useMe()!
  const today = todayISO()
  const [selected, setSelected] = useState(today)
  const { account, data } = me

  const points = pointsOf(data.checkins)
  const streak = streakOf(data.checkins)
  const level = levelOf(points)

  const week = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(selected), i))
  const doneByTask = new Map(data.checkins.map((c) => [c.taskId, c]))
  const tasks = tasksFor(selected)
  const doneCount = tasks.filter((t) => doneByTask.has(t.id)).length
  const classes = classesFor(selected, data.courseStart)
  const isToday = selected === today
  const isPast = selected < today
  const isFuture = selected > today
  const lateDays = isPast ? diffDays(selected, today) : 0

  return (
    <>
      <header className="hero">
        <p className="hero-sub">{greeting()},</p>
        <h1>{firstName(account.name)}</h1>
        <div className="stats">
          <span className="stat">
            <Icon name="flame" size={16} /> {streak}-day streak
          </span>
          <span className="stat">
            <Icon name="star" size={16} /> {points} pts
          </span>
          <span className="stat">LV.{level}</span>
        </div>
        <div className="level-bar" aria-label={`${points % POINTS_PER_LEVEL} of ${POINTS_PER_LEVEL} points to next level`}>
          <span style={{ width: `${((points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100}%` }} />
        </div>
      </header>

      <section className="card week">
        <div className="week-nav">
          <button className="icon-btn" onClick={() => setSelected(addDays(selected, -7))} aria-label="Previous week">
            <Icon name="back" />
          </button>
          <strong>{fmtDate(week[0], { month: 'short', day: 'numeric' })} – {fmtDate(week[6], { month: 'short', day: 'numeric' })}</strong>
          <button className="icon-btn" onClick={() => setSelected(addDays(selected, 7))} aria-label="Next week">
            <Icon name="next" />
          </button>
        </div>
        <div className="week-days">
          {week.map((d) => {
            const n = data.checkins.filter((c) => c.date === d).length
            return (
              <button key={d} className={`day ${d === selected ? 'selected' : ''} ${d === today ? 'is-today' : ''}`} onClick={() => setSelected(d)} aria-pressed={d === selected}>
                <small>{WEEKDAYS_SHORT[dow(d)]}</small>
                <b>{fromISO(d).getDate()}</b>
                <i className={n ? 'dot on' : 'dot'} />
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>{isToday ? 'Today’s check-ins' : fmtDate(selected, { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
          <span className="muted">
            {doneCount}/{tasks.length} done
          </span>
        </div>
        <div className="card list">
          {tasks.map((t, i) => {
            const done = doneByTask.get(t.id)
            return (
              <div className={`row task ${done ? 'done' : ''}`} key={t.id}>
                <span className={`tick ${done ? 'on' : ''}`}>{done && <Icon name="check" size={14} />}</span>
                <div className="grow">
                  <div className="row-title">{t.title}</div>
                  {!done && isPast && <div className="row-sub">{lateDays <= MAKEUP_WINDOW_DAYS ? 'Make up now to still earn points' : 'More than 3 days ago · no points'}</div>}
                  {done && <div className="row-sub">{done.points ? `+${done.points} pts` : 'Made up · no points'}</div>}
                </div>
                {done ? (
                  <span className="pill pill-muted">Done</span>
                ) : isFuture ? (
                  <span className="pill pill-muted">Upcoming</span>
                ) : (
                  <Link to={`/checkin/${selected}/${i}`} className={`pill ${isPast ? 'pill-warm' : 'pill-primary'}`}>
                    {isPast ? 'Make up' : 'Check in'}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
        {isPast && <p className="hint">Make-ups within {MAKEUP_WINDOW_DAYS} days earn full points. After that they still count toward your streak and rank, but earn no points.</p>}
      </section>

      <section>
        <div className="section-title">
          <h2>Classes</h2>
        </div>
        {classes.length === 0 ? (
          <Empty icon="book" title={dow(selected) === 6 ? 'Rest day' : 'No classes'} hint={dow(selected) === 6 ? 'No classes on Sundays — enjoy the break.' : 'Nothing scheduled for this day.'} />
        ) : (
          <div className="card timeline">
            {classes.map((c) => {
              const signed = data.signins.includes(c.id)
              const ended = hasEnded(c)
              return (
                <div className="tl-item" key={c.id}>
                  <span className={`tl-dot ${ended ? 'past' : ''}`} />
                  <div className="grow">
                    <div className={`row-title ${ended && !isToday ? 'muted' : ''}`}>{c.title}</div>
                    <div className="row-sub">
                      <Icon name="clock" size={14} /> {to12h(c.start)} – {to12h(c.end)} <span className="sep" /> <Icon name="pin" size={14} /> {c.room}
                    </div>
                  </div>
                  {isToday && !ended && !signed && (
                    <button className="pill pill-primary" onClick={() => signIntoClass(c.id)}>
                      Sign in
                    </button>
                  )}
                  {isToday && signed && <span className="pill pill-muted">Signed in</span>}
                  {ended && (
                    <Link to={`/class/${encodeURIComponent(c.id)}`} className="link-sm">
                      Feedback
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
