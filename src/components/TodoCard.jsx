import { useState, useRef, useLayoutEffect } from 'react'
import { useDispatch } from 'react-redux'
import { editTodo, toggleTodo, removeTodo } from '../store/todosSlice.js'
import { unauthorized } from '../store/authSlice.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * TodoCard
 *
 * Renders a single todo with:
 *  - Toggle completion (dispatches toggleTodo)
 *  - Inline edit (dispatches editTodo)
 *  - Delete with inline confirm (dispatches removeTodo)
 *
 * Props:
 *  todo — the todo object { id, title, description, completed }
 *
 * No onUpdated / onDeleted / onUnauthorized props needed —
 * everything goes directly to the Redux store.
 */
export default function TodoCard({ todo }) {
  const dispatch = useDispatch()
  const addToast = useToast()

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editCompleted, setEditCompleted] = useState(todo.completed)
  const [loading, setLoading] = useState(false)

  const titleInputRef = useRef(null)

  /**
   * useLayoutEffect — auto-focus the title input when edit mode opens.
   * Runs before the browser paints so the input is focused immediately.
   */
  useLayoutEffect(() => {
    if (editing && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [editing])

  // Helper: handle 401 from any action
  function handle401(err) {
    if (err.status === 401) { dispatch(unauthorized()); return true }
    return false
  }

  // ── Toggle completed ──────────────────────────────────────────────────────
  async function handleToggle() {
    setLoading(true)
    try {
      await dispatch(toggleTodo({ id: todo.id, completed: !todo.completed })).unwrap()
    } catch (err) {
      if (handle401(err)) return
      addToast(err.message || 'Failed to update todo', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Save edit ─────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!editTitle.trim()) return
    setLoading(true)
    try {
      await dispatch(editTodo({
        id: todo.id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        completed: editCompleted,
      })).unwrap()
      addToast('Todo updated!', 'success')
      setEditing(false)
    } catch (err) {
      if (handle401(err)) return
      addToast(err.message || 'Failed to save todo', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    setConfirmDelete(false)
    setLoading(true)
    try {
      await dispatch(removeTodo(todo.id)).unwrap()
      addToast('Todo deleted.', 'info')
    } catch (err) {
      if (handle401(err)) return
      addToast(err.message || 'Failed to delete todo', 'error')
      setLoading(false)
    }
  }

  return (
    <div className={`todo-card ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content" style={{ width: '100%' }}>
        {/* ── View mode ── */}
        {!editing && (
          <>
            <div className="todo-title">
              {todo.title}
              {todo.completed && <span className="badge-done">Done</span>}
            </div>
            {todo.description && (
              <div className="todo-description">{todo.description}</div>
            )}
          </>
        )}

        {/* ── Edit mode ── */}
        {editing && (
          <div className="edit-form">
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              maxLength={200}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
            />
            <div className="edit-form-row">
              <input
                type="checkbox"
                id={`completed-${todo.id}`}
                checked={editCompleted}
                onChange={(e) => setEditCompleted(e.target.checked)}
              />
              <label htmlFor={`completed-${todo.id}`}>Completed</label>
            </div>
            <div className="edit-form-actions">
              <button className="btn btn-success" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Inline delete confirmation ── */}
        {confirmDelete && (
          <div className="delete-confirm">
            <span>Delete this todo?</span>
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              Yes, delete
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      {!editing && !confirmDelete && (
        <div className="todo-actions">
          <button
            className={`btn ${todo.completed ? 'btn-warning' : 'btn-success'}`}
            onClick={handleToggle}
            disabled={loading}
            title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {todo.completed ? '↩ Undo' : '✔ Done'}
          </button>
          <button
            className="btn btn-warning"
            onClick={() => setEditing(true)}
            disabled={loading}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  )
}
