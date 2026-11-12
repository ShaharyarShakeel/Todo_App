import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  googleSignInUser,
  loginUser,
  signupUser,
  selectAuthStatus,
} from '../features/auth/authSlice.js'
import { useToast } from '../context/ToastContext.jsx'

export default function AuthPage() {
  const dispatch = useDispatch()
  const addToast = useToast()
  const status = useSelector(selectAuthStatus)
  const googleButtonRef = useRef(null)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isSignup = mode === 'signup'
  const loading = status === 'loading'

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const button = googleButtonRef.current
    if (!clientId || !button) return undefined

    let active = true
    const renderGoogleButton = () => {
      if (!active || !window.google?.accounts?.id || !googleButtonRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) return
          try {
            await dispatch(googleSignInUser(credential)).unwrap()
            addToast('Signed in with Google successfully!', 'success')
          } catch (error) {
            addToast(error, 'error')
          }
        },
      })
      googleButtonRef.current.replaceChildren()
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(340, googleButtonRef.current.clientWidth || 340),
      })
    }

    let script = document.querySelector('script[data-google-identity]')
    const onLoad = () => renderGoogleButton()
    const onError = () => addToast('Google sign-in could not be loaded.', 'error')
    if (window.google?.accounts?.id) {
      renderGoogleButton()
    } else {
      if (!script) {
        script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.dataset.googleIdentity = 'true'
        document.head.appendChild(script)
      }
      script.addEventListener('load', onLoad)
      script.addEventListener('error', onError)
    }

    return () => {
      active = false
      script?.removeEventListener('load', onLoad)
      script?.removeEventListener('error', onError)
    }
  }, [dispatch, addToast])

  async function handleSubmit(event) {
    event.preventDefault()
    const thunk = isSignup ? signupUser : loginUser
    try {
      await dispatch(thunk({ email, password })).unwrap()
      addToast(isSignup ? 'Account created successfully!' : 'Logged in successfully!', 'success')
    } catch (error) {
      addToast(error, 'error')
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
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>
        <div className="google-signin-button" ref={googleButtonRef} />

        <div className="auth-toggle">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="btn-sm-link" onClick={switchMode} type="button">
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}