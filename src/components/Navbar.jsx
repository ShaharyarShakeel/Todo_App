import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUserEmail } from '../features/auth/authSlice.js'

/**
 * Navbar
 * Reads user email from Redux store.
 * Dispatches logout() action directly — no props needed.
 */
export default function Navbar() {
  const dispatch = useDispatch()
  const email = useSelector(selectUserEmail)

  return (
    <nav className="navbar">
      <span className="navbar-brand">📝 Todo App</span>
      <div className="navbar-user">
        <span>{email}</span>
        <button className="btn btn-danger" onClick={() => dispatch(logout())}>
          Logout
        </button>
      </div>
    </nav>
  )
}
