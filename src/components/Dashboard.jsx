import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTodos } from '../store/todosSlice.js'
import { unauthorized } from '../store/authSlice.js'
import Navbar from './Navbar.jsx'
import CreateTodoForm from './CreateTodoForm.jsx'
import TodoCard from './TodoCard.jsx'

/**
 * Dashboard
 *
 * Three distinct screens based on Redux todos.status:
 *  'loading' → full-page spinner (no form flicker on retry)
 *  'failed'  → Server Offline screen with Retry button
 *  'idle'    → full dashboard (form + todo list)
 */
export default function Dashboard() {
  const dispatch = useDispatch()
  const { items: todos, status, error } = useSelector((state) => state.todos)

  useEffect(() => {
    loadTodos()
  }, [])

  async function loadTodos() {
    try {
      await dispatch(fetchTodos()).unwrap()
    } catch (err) {
      if (err?.status === 401) dispatch(unauthorized())
    }
  }

  // ── Loading screen (initial load AND retry) ──────────────────────────────
  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="offline-screen">
          <div className="offline-card">
            <div className="offline-icon">⏳</div>
            <h2>Loading your todos…</h2>
            <p className="offline-hint">Please wait a moment.</p>
          </div>
        </div>
      </>
    )
  }

  // ── Server Offline screen ────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <>
        <Navbar />
        <div className="offline-screen">
          <div className="offline-card">
            <div className="offline-icon">🔌</div>
            <h2>Cannot connect to server</h2>
            <p>{error || 'Failed to fetch'}</p>
            <p className="offline-hint">
              Make sure the backend server is running, then click Retry.
            </p>
            <button className="btn btn-primary offline-retry" onClick={loadTodos}>
              🔄 Retry
            </button>
          </div>
        </div>
      </>
    )
  }

  // ── Full dashboard (only when status === 'idle') ─────────────────────────
  return (
    <>
      <Navbar />
      <div className="dashboard">
        <h2>My Todos</h2>

        <CreateTodoForm />

        <div className="todo-list">
          {todos.length === 0 ? (
            <p className="empty">No todos yet. Create your first one above! 🎉</p>
          ) : (
            todos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))
          )}
        </div>
      </div>
    </>
  )
}
