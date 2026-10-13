import { useState } from 'react'
import { signUp, logIn, saveToken, saveEmail } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * AuthPage
 *
 * Handles both Sign Up and Log In in one component.
 * On success, saves the JWT to a cookie and calls onAuth()
 * so the parent (App) switches to the dashboard.
 */
export default function AuthPage({ onAuth }) {
  const addToast = useToast()
  const [mode, setMode] = useState('login') // 'login' | 'signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      // Call the relevant endpoint
      const data = isSignup
        ? await signUp(email, password)
        : await logIn(email, password)

      // Save JWT into a cookie
      saveToken(data.access_token)

      // Save email so it persists across page reloads
      saveEmail(data.email)

      addToast(isSignup ? 'Account created! Welcome 🎉' : 'Logged in successfully!', 'success')

      // Inform parent: authentication succeeded
      onAuth(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="auth-toggle">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="btn-sm-link" onClick={switchMode}>
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
