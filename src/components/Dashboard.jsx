import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTodos } from '../store/todosSlice.js'
import { unauthorized } from '../store/authSlice.js'
import { useToast } from '../context/ToastContext.jsx'
import Navbar from './Navbar.jsx'
import CreateTodoForm from './CreateTodoForm.jsx'
import TodoCard from './TodoCard.jsx'

/**
 * Dashboard
 *
 * Reads todos from Redux store. Dispatches fetchTodos on mount.
 * No longer manages todo state locally — Redux owns it.
 * No props needed — everything comes from the store.
 */
export default function Dashboard() {
  const dispatch = useDispatch()
  const addToast = useToast()
  const { items: todos, status, error } = useSelector((state) => state.todos)

  const loadingTodos = status === 'loading'

  // Fetch todos when the dashboard mounts
  useEffect(() => {
    async function load() {
      try {
        await dispatch(fetchTodos()).unwrap()
      } catch (err) {
        // 401 = stale token → kick to login
        if (err.status === 401) {
          dispatch(unauthorized())
          return
        }
        addToast(err.message || 'Failed to load todos', 'error')
      }
    }
    load()
  }, [dispatch])

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h2>My Todos</h2>

        {/* Create form — dispatches to Redux directly, no callback prop */}
        <CreateTodoForm />

        {/* Todo list */}
        {loadingTodos && <p className="loading">Loading todos…</p>}
        {error && <p className="error-msg">{error}</p>}

        {!loadingTodos && !error && (
          <div className="todo-list">
            {todos.length === 0 ? (
              <p className="empty">No todos yet. Create your first one above! 🎉</p>
            ) : (
              todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  // No onUpdated / onDeleted / onUnauthorized props needed!
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
