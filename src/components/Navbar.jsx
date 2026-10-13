/**
 * Navbar
 * Shows the app name, logged-in user email, and a Logout button.
 * All logout cleanup (cookie + localStorage) is handled by onLogout() in App.jsx.
 */
export default function Navbar({ userEmail, onLogout }) {
  return (
    <nav className="navbar">
      <span className="navbar-brand">📝 Todo App</span>
      <div className="navbar-user">
        <span>{userEmail}</span>
        <button className="btn btn-danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
