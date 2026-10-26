import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Empty } from '../components/ui'
import { classesFor, COURSE, hasEnded, hoursDone } from '../lib/curriculum'
import { dow, fmtDay, monthLabel, to12h, todayISO, toISO, WEEKDAYS_SHORT } from '../lib/dates'
import { Link } from '../lib/router'
import { useMe } from '../lib/store'

export default function Schedule() {
  const { data } = useMe()!
  const today = todayISO()
  const [selected, setSelected] = useState(today)
  const [view, setView] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }))

  const first = new Date(view.y, view.m, 1)
  const lead = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(view.y, view.m, i + 1)))]

  const shift = (n: number) => setView(({ y, m }) => ({ y: y + Math.floor((m + n) / 12), m: (m + n + 12) % 12 }))
  const done = hoursDone(data.courseStart)
  const classes = classesFor(selected, data.courseStart)

  return (
    <>
      <header className="screen-title">
        <h1>Schedule</h1>
      </header>

      <section className="card progress-card">
        <div className="progress-top">
          <span>
            <small>Now studying</small>
            <strong>{COURSE.name}</strong>
          </span>
          <b>{done}/{COURSE.totalHours}h</b>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={COURSE.totalHours}>
          <span style={{ width: `${(done / COURSE.totalHours) * 100}%` }} />
        </div>
      </section>

      <section className="card calendar">
        <div className="week-nav">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">
            <Icon name="back" />
          </button>
          <strong>{monthLabel(view.y, view.m)}</strong>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month">
            <Icon name="next" />
          </button>
        </div>
        <div className="cal-grid">
          {WEEKDAYS_SHORT.map((d) => (
            <span className="cal-dow" key={d}>
              {d[0]}
            </span>
          ))}
          {cells.map((d, i) =>
            d ? (
              <button key={d} className={`cal-day ${d === selected ? 'selected' : ''} ${d === today ? 'is-today' : ''}`} onClick={() => setSelected(d)} aria-pressed={d === selected} aria-label={fmtDay(d)}>
                {Number(d.slice(8))}
                {classesFor(d, data.courseStart).length > 0 && <i className="dot on" />}
              </button>
            ) : (
              <span key={`e${i}`} />
            ),
          )}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>{fmtDay(selected)}</h2>
        </div>
        {classes.length === 0 ? (
          <Empty icon="book" title={dow(selected) === 6 ? 'Rest day' : 'No classes'} hint="Nothing scheduled for this day." />
        ) : (
          <div className="card timeline">
            {classes.map((c) => (
              <div className="tl-item" key={c.id}>
                <span className={`tl-dot ${hasEnded(c) ? 'past' : ''}`} />
                <div className="grow">
                  <div className="row-title">{c.title}</div>
                  <div className="row-sub">
                    <Icon name="clock" size={14} /> {to12h(c.start)} – {to12h(c.end)} <span className="sep" /> <Icon name="pin" size={14} /> {c.room}
                  </div>
                </div>
                {hasEnded(c) ? (
                  <Link to={`/class/${encodeURIComponent(c.id)}`} className="link-sm">
                    Feedback
                  </Link>
                ) : (
                  <span className="pill pill-muted">{c.date === today ? 'Later today' : 'Upcoming'}</span>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          className="link-sm center"
          onClick={() => {
            setSelected(today)
            setView({ y: new Date().getFullYear(), m: new Date().getMonth() })
          }}
        >
          Jump to today
        </button>
      </section>
    </>
  )
}
