import { useState, useCallback, useEffect } from 'react'
import { getToken, clearToken, getEmail, clearEmail } from './api.js'
import AuthPage from './components/AuthPage.jsx'
import Dashboard from './components/Dashboard.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

/**
 * App — Root component
 *
 * Decides what to render:
 *   • No token in cookie  →  AuthPage  (login / signup)
 *   • Valid token present →  Dashboard (todo CRUD)
 *
 * user state: { id, email, access_token } or null
 *
 * ALL logout side-effects live here (single source of truth):
 *   clearToken() — removes JWT cookie
 *   clearEmail() — removes email from localStorage
 *   setUser(null) — switches UI to AuthPage
 */
export default function App() {
  const [user, setUser] = useState(() => {
    const token = getToken()
    if (token) return { email: getEmail() || 'Your Account', access_token: token }
    return null
  })

  function handleAuth(userData) {
    // userData = { id, email, access_token, token_type } from backend
    setUser(userData)
  }

  /** Triggered by Navbar Logout button */
  function handleLogout() {
    clearToken()   // Remove JWT cookie
    clearEmail()   // Remove saved email
    setUser(null)  // Switch to AuthPage
  }

  /** Triggered when any API call returns 401 (stale/expired token) */
  const handleUnauthorized = useCallback(() => {
    clearToken()
    clearEmail()
    setUser(null)
  }, [])

  /**
   * Cross-tab logout sync.
   * The `storage` event fires in OTHER tabs when localStorage changes.
   * When user_email is removed (logout), redirect those tabs to AuthPage too.
   */
  useEffect(() => {
    function onStorageChange(e) {
      if (e.key === 'user_email' && e.newValue === null) {
        setUser(null)
      }
    }
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  }, [])

  return (
    <ToastProvider>
      {user
        ? <Dashboard user={user} onLogout={handleLogout} onUnauthorized={handleUnauthorized} />
        : <AuthPage onAuth={handleAuth} />}
    </ToastProvider>
  )
}
