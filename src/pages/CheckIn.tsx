import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/ui'
import { taskById } from '../lib/curriculum'
import { diffDays, fmtDate, todayISO } from '../lib/dates'
import { MAX_RECORD_SECONDS, photoToDataURL, useRecorder } from '../lib/media'
import { navigate, type Params } from '../lib/router'
import { checkIn, MAKEUP_WINDOW_DAYS, useMe } from '../lib/store'

const MAX_PHOTOS = 3
const MAX_CHARS = 500

export default function CheckIn({ params }: { params: Params }) {
  const me = useMe()!
  const task = taskById(params.date, params.idx)
  const [body, setBody] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const rec = useRecorder()

  if (!task) return <><PageHeader title="Check in" /><p className="hint pad">That task doesn’t exist.</p></>

  const today = todayISO()
  const makeup = task.date < today
  const late = makeup ? diffDays(task.date, today) : 0
  const already = me.data.checkins.some((c) => c.taskId === task.id)
  const noPoints = makeup && late > MAKEUP_WINDOW_DAYS

  async function addPhotos(files: FileList | null) {
    if (!files) return
    setError('')
    try {
      const next: string[] = []
      for (const f of Array.from(files).slice(0, MAX_PHOTOS - images.length)) next.push(await photoToDataURL(f))
      setImages((prev) => [...prev, ...next])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add that photo.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function submit() {
    setError('')
    const res = checkIn({ taskId: task!.id, date: task!.date, title: task!.title, body, images, audio: rec.audio })
    if (res.ok) navigate('/community?mine=1', { replace: true })
    else setError(res.error)
  }

  return (
    <>
      <PageHeader title={makeup ? 'Make up' : 'Check in'} />
      <div className="compose">
        <div className="task-banner">
          <small>{makeup ? `Make-up · ${fmtDate(task.date, { month: 'short', day: 'numeric' })}` : 'Today’s task'}</small>
          <strong>{task.title}</strong>
          {noPoints && <span className="chip chip-warm">No points — more than {MAKEUP_WINDOW_DAYS} days ago</span>}
        </div>

        {already ? (
          <p className="hint pad">You’ve already checked in for this task.</p>
        ) : (
          <>
            <label className="field">
              <span>What did you practise? <em className="muted">(optional if you add a photo or voice note)</em></span>
              <textarea value={body} maxLength={MAX_CHARS} onChange={(e) => setBody(e.target.value)} placeholder="New words, what was tricky, how it went…" rows={6} />
              <small className="counter">{body.length}/{MAX_CHARS}</small>
            </label>

            {images.length > 0 && (
              <div className="thumbs">
                {images.map((src, i) => (
                  <div className="thumb" key={i}>
                    <img src={src} alt={`Selected photo ${i + 1}`} />
                    <button className="thumb-x" onClick={() => setImages(images.filter((_, j) => j !== i))} aria-label="Remove photo">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {rec.state === 'done' && rec.audio && (
              <div className="voice-done">
                <audio controls src={rec.audio} />
                <button className="icon-btn" onClick={rec.discard} aria-label="Delete voice note">
                  <Icon name="close" size={18} />
                </button>
              </div>
            )}

            <div className="attach">
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
              <button className="attach-btn" onClick={() => fileRef.current?.click()} disabled={images.length >= MAX_PHOTOS}>
                <Icon name="camera" /> Photo <small>{images.length}/{MAX_PHOTOS}</small>
              </button>
              {rec.state === 'recording' ? (
                <button className="attach-btn recording" onClick={rec.stop}>
                  <Icon name="stop" fill /> Stop · {rec.seconds}s / {MAX_RECORD_SECONDS}s
                </button>
              ) : (
                <button className="attach-btn" onClick={rec.start} disabled={rec.state === 'done'}>
                  <Icon name="mic" /> Voice note
                </button>
              )}
            </div>
            {(error || rec.error) && (
              <p className="form-error" role="alert">
                {error || rec.error}
              </p>
            )}
            <button className="btn btn-primary" onClick={submit} disabled={rec.state === 'recording'}>
              Post check-in
            </button>
          </>
        )}
      </div>
    </>
  )
}
