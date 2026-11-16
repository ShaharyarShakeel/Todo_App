import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  googleSignInUser,
  completeGithubSignIn,
  loginUser,
  signupUser,
  selectAuthStatus,
} from '../features/auth/authSlice.js'
import { useToast } from '../context/ToastContext.jsx'
import { getGithubSignInUrl } from '../api.js'

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
    const params = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = params.get('github_access_token')
    const emailFromGithub = params.get('github_email')
    const idFromGithub = params.get('github_id')
    const githubError = params.get('github_error')
    const githubMessage = params.get('github_message')
    if (!accessToken && !githubError) return

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    if (accessToken && emailFromGithub && idFromGithub) {
      dispatch(completeGithubSignIn({
        access_token: accessToken,
        email: emailFromGithub,
        id: idFromGithub,
      }))
        .unwrap()
        .then(() => addToast('Signed in with GitHub successfully!', 'success'))
        .catch((error) => addToast(error, 'error'))
      return
    }

    const messages = {
      authorization_denied: 'GitHub sign-in was cancelled.',
      invalid_state: 'GitHub sign-in could not be verified. Please try again.',
      missing_code: 'GitHub did not return an authorization code.',
      sign_in_failed: 'GitHub sign-in failed. Please try again.',
    }
    addToast(githubMessage || messages[githubError] || 'GitHub sign-in failed.', 'error')
  }, [dispatch, addToast])

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
        <button
          className="github-signin-button"
          type="button"
          onClick={() => { window.location.assign(getGithubSignInUrl()) }}
          disabled={loading}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.23-1.65-1.23-1.65-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 2.2 3.3 1.56.1-.73.39-1.22.7-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.43-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3 0 4.3-2.61 5.24-5.1 5.52.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/>
          </svg>
          Continue with GitHub
        </button>

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