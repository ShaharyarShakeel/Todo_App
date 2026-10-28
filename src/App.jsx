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
  // useSelector gets the current Redux state.
  // state represents the entire Redux store state.
  // state.auth accesses the auth slice in the Redux store.
  // state.auth.user accesses the user property inside the auth slice.
  // user stores the value returned by the selector function.
  const user = useSelector((state) => state.auth.user) 

  /**
   * Cross-tab logout sync.
   * When user_email is removed from localStorage in another tab,
   * dispatch logout() here too so this tab also shows AuthPage.
   */
  useEffect(() => {
    function onStorageChange(e) {
      if (e.key === 'user_email' && e.newValue === null) { //It checks if the user_email is removed from localStorage and newValue is null, which means the user has logged out in another tab. In that case, it dispatches the logout action to update the state in this tab as well.
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
