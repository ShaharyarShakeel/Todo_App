import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout, unauthorized } from './store/authSlice.js'
import AuthPage from './components/AuthPage.jsx'
import Dashboard from './components/Dashboard.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

/**
 * App — Root component
 *
 * Reads auth state from Redux store.
 * Decides what to render:
 *   • user === null  →  AuthPage  (login / signup)
 *   • user exists    →  Dashboard (todo CRUD)
 */
export default function App() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  /**
   * Cross-tab logout sync.
   * When user_email is removed from localStorage in another tab,
   * dispatch logout() here too so this tab also shows AuthPage.
   */
  useEffect(() => {
    function onStorageChange(e) {
      if (e.key === 'user_email' && e.newValue === null) {
        dispatch(logout())
      }
    }
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  }, [dispatch])

  return (
    <ToastProvider>
      {user
        ? <Dashboard />
        : <AuthPage />}
    </ToastProvider>
  )
}
