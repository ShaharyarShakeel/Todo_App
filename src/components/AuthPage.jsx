import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, signupUser } from '../store/authSlice.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * AuthPage
 *
 * Handles both Sign Up and Log In.
 * Dispatches loginUser / signupUser thunks to the Redux store.
 * No props needed — auth state lives in Redux.
 */
export default function AuthPage() {
  const dispatch = useDispatch()
  const addToast = useToast()
  const { status } = useSelector((state) => state.auth)

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isSignup = mode === 'signup'
  const loading = status === 'loading'

  async function handleSubmit(e) {
    e.preventDefault()
    const thunk = isSignup ? signupUser : loginUser
    try {
      // .unwrap() throws if the thunk rejected, so we can catch the error
      await dispatch(thunk({ email, password })).unwrap()
      addToast(isSignup ? 'Account created! Welcome 🎉' : 'Logged in successfully!', 'success')
      // App.jsx reads user from Redux — it automatically switches to Dashboard
    } catch (errMessage) {
      addToast(errMessage, 'error')
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
