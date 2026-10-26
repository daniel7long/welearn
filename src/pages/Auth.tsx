import { useState, type FormEvent } from 'react'
import { Icon, Logo } from '../components/Icon'
import { Link, navigate } from '../lib/router'
import { logIn, signUp } from '../lib/store'

export function Welcome() {
  return (
    <main className="auth">
      <div className="auth-hero">
        <Logo size={88} />
        <h1 className="brand">WeLearn</h1>
        <p>Learn English together, one check-in at a time.</p>
      </div>
      <div className="auth-actions">
        <Link to="/signup" className="btn btn-primary">
          Create account
        </Link>
        <Link to="/login" className="btn btn-outline">
          Log in
        </Link>
      </div>
    </main>
  )
}

function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = isSignup ? await signUp(name, email, password) : await logIn(email, password)
    setBusy(false)
    if (res.ok) navigate('/', { replace: true })
    else setError(res.error)
  }

  return (
    <main className="auth">
      <Link to="/welcome" className="icon-btn auth-back" aria-label="Back">
        <Icon name="back" size={24} />
      </Link>
      <div className="auth-hero compact">
        <Logo size={56} />
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p>{isSignup ? 'Your own hub for check-ins, classes and progress.' : 'Log in to open your hub.'}</p>
      </div>
      <form className="form" onSubmit={submit} noValidate>
        {isSignup && (
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" placeholder="you@example.com" />
        </label>
        <label className="field">
          <span>Password</span>
          <div className="pw">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
            />
            <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
              <Icon name={show ? 'eyeOff' : 'eye'} size={20} />
            </button>
          </div>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
        <p className="switch">
          {isSignup ? 'Already have an account? ' : 'New to WeLearn? '}
          <Link to={isSignup ? '/login' : '/signup'} replace>
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </form>
    </main>
  )
}

export const Login = () => <AuthForm mode="login" />
export const Signup = () => <AuthForm mode="signup" />
