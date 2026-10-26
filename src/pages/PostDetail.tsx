import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Avatar, PageHeader, PostCard } from '../components/ui'
import { timeAgo } from '../lib/dates'
import type { Params } from '../lib/router'
import { addComment, useMe, type Comment } from '../lib/store'

const LIMIT = 140

export default function PostDetail({ params }: { params: Params }) {
  const { data } = useMe()!
  const post = data.posts.find((p) => p.id === params.id)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)

  if (!post) return <><PageHeader title="Comments" fallback="/community" /><p className="hint pad">This post is no longer available.</p></>

  const top = post.comments.filter((c) => !c.parentId)
  const repliesOf = (id: string) => post.comments.filter((c) => c.parentId === id)

  function send() {
    const parent = replyTo ? replyTo.parentId ?? replyTo.id : undefined
    const prefix = replyTo ? `@${replyTo.authorName} ` : ''
    if (addComment(post!.id, prefix + text, parent)) {
      setText('')
      setReplyTo(null)
    }
  }

  const row = (c: Comment, nested = false) => (
    <div className={`comment ${nested ? 'nested' : ''}`} key={c.id}>
      <Avatar name={c.authorName} color={c.authorColor} size={nested ? 28 : 34} />
      <div className="grow">
        <div className="comment-head">
          <strong>{c.mine ? `${c.authorName} (you)` : c.authorName}</strong>
          <span>{timeAgo(c.at)}</span>
        </div>
        <p>{c.text}</p>
      </div>
      <button className="icon-btn" aria-label={`Reply to ${c.authorName}`} onClick={() => setReplyTo(c)}>
        <Icon name="reply" size={18} />
      </button>
    </div>
  )

  return (
    <>
      <PageHeader title="Comments" fallback="/community" />
      <div className="pad">
        <PostCard post={post} detail />
        <h2 className="section-label">{post.comments.length} comment{post.comments.length === 1 ? '' : 's'}</h2>
        {top.length === 0 && <p className="hint">Be the first to leave some encouragement.</p>}
        <div className="comments">
          {top.map((c) => (
            <div key={c.id}>
              {row(c)}
              {repliesOf(c.id).map((r) => row(r, true))}
            </div>
          ))}
        </div>
      </div>
      <div className="reply-bar">
        {replyTo && (
          <div className="replying">
            Replying to <b>@{replyTo.authorName}</b>
            <button className="icon-btn" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        <div className="reply-input">
          <textarea
            value={text}
            maxLength={LIMIT}
            rows={1}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyTo ? `Reply to ${replyTo.authorName}…` : 'Write a comment (max 140 characters)'}
            aria-label="Comment"
          />
          <button className="send" onClick={send} disabled={!text.trim()} aria-label="Send comment">
            <Icon name="send" size={20} />
          </button>
        </div>
        <small className="counter">{text.length}/{LIMIT}</small>
      </div>
    </>
  )
}
