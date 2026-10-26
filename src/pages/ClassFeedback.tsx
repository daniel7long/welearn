import { Icon } from '../components/Icon'
import { PageHeader } from '../components/ui'
import { classById, feedbackFor, hasEnded } from '../lib/curriculum'
import { fmtDate, to12h } from '../lib/dates'
import type { Params } from '../lib/router'
import { CLASSMATES } from '../lib/classmates'
import { firstName, useMe } from '../lib/store'

export default function ClassFeedback({ params }: { params: Params }) {
  const { account, data } = useMe()!
  const c = classById(params.id, data.courseStart)

  if (!c) return <><PageHeader title="Class feedback" /><p className="hint pad">We couldn’t find that class.</p></>

  const ended = hasEnded(c)
  const fb = feedbackFor(c, firstName(account.name))
  const students = [account.name, ...CLASSMATES.slice(0, 3).map((m) => m.name)]

  return (
    <>
      <PageHeader title="Class feedback" />
      <div className="pad stack">
        <section className="card">
          <h2>Class</h2>
          <dl className="facts">
            <dt>Title</dt>
            <dd>{c.title}</dd>
            <dt>Date</dt>
            <dd>{fmtDate(c.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</dd>
            <dt>Time</dt>
            <dd>
              <Icon name="clock" size={14} /> {to12h(c.start)} – {to12h(c.end)} · {c.room}
            </dd>
            <dt>Teacher</dt>
            <dd>{c.teacher}</dd>
            <dt>Classmates</dt>
            <dd>{students.join(', ')}</dd>
          </dl>
        </section>

        {!ended ? (
          <section className="card">
            <p className="hint">Feedback from your teacher appears here after the class ends.</p>
          </section>
        ) : (
          <>
            <section className="card">
              <h2>Homework review</h2>
              <p className="accent-text">{fb.homeworkReview}</p>
            </section>
            <section className="card">
              <h2>What we covered</h2>
              <ol className="covered">
                {fb.covered.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
            </section>
            <section className="card">
              <h2>In-class performance</h2>
              <p className="accent-text">{fb.performance}</p>
            </section>
            <section className="card">
              <h2>Homework</h2>
              <dl className="facts">
                <dt>Assignment</dt>
                <dd>{fb.assignment}</dd>
                <dt>Due</dt>
                <dd>{fmtDate(fb.due, { month: 'short', day: 'numeric', year: 'numeric' })}, 10:00 AM</dd>
              </dl>
            </section>
            <p className="hint">Sample feedback for the demo — real notes from teachers will appear here.</p>
          </>
        )}
      </div>
    </>
  )
}
