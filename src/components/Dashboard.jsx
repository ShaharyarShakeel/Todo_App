import { useEffect, useState } from 'react'
import { getTodos } from '../api.js'
import Navbar from './Navbar.jsx'
import CreateTodoForm from './CreateTodoForm.jsx'
import TodoCard from './TodoCard.jsx'
import { useToast } from '../context/ToastContext.jsx'

/**
 * Dashboard
 *
 * Main authenticated view. Fetches all todos on mount,
 * and keeps local state in sync after every create/update/delete.
 */
export default function Dashboard({ user, onLogout, onUnauthorized }) {
  const addToast = useToast()
  const [todos, setTodos] = useState([])
  const [loadingTodos, setLoadingTodos] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // ── Fetch todos on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTodos() {
      try {
        const data = await getTodos()
        setTodos(data)
      } catch (err) {
        // Stale / invalid token → kick back to login
        if (err.status === 401) {
          onUnauthorized()
          return
        }
        setFetchError(err.message)
        addToast(err.message, 'error')
      } finally {
        setLoadingTodos(false)
      }
    }
    fetchTodos()
  }, [])

  // ── Handlers passed down to children ─────────────────────────────────────

  function handleCreated(newTodo) {
    // Add new todo to the top of the list
    setTodos((prev) => [newTodo, ...prev])
    addToast('Todo created!', 'success')
  }

  function handleUpdated(updatedTodo) {
    setTodos((prev) =>
      prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
    )
    addToast('Todo updated!', 'success')
  }

  function handleDeleted(deletedId) {
    setTodos((prev) => prev.filter((t) => t.id !== deletedId))
    addToast('Todo deleted.', 'info')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar userEmail={user.email} onLogout={onLogout} />

      <div className="dashboard">
        <h2>My Todos</h2>

        {/* Create form */}
        <CreateTodoForm onCreated={handleCreated} onUnauthorized={onUnauthorized} />

        {/* Todo list */}
        {loadingTodos && <p className="loading">Loading todos…</p>}
        {fetchError && <p className="error-msg">{fetchError}</p>}

        {!loadingTodos && !fetchError && (
          <div className="todo-list">
            {todos.length === 0 ? (
              <p className="empty">No todos yet. Create your first one above! 🎉</p>
            ) : (
              todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                  onUnauthorized={onUnauthorized}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
