import { useState } from 'react'
import { updateTodo, patchTodo, deleteTodo } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * TodoCard
 *
 * Renders a single todo with:
 *  - Toggle completion (PATCH)
 *  - Inline edit (PUT full update)
 *  - Delete with inline confirm (no browser dialog)
 *
 * Props:
 *  todo             — the todo object { id, title, description, completed }
 *  onUpdated        — called with the updated todo after PATCH/PUT
 *  onDeleted        — called with the todo id after DELETE
 *  onUnauthorized   — called when a 401 is received
 */
export default function TodoCard({ todo, onUpdated, onDeleted, onUnauthorized }) {
  const addToast = useToast()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editCompleted, setEditCompleted] = useState(todo.completed)
  const [loading, setLoading] = useState(false)

  function handle401(err) {
    if (err.status === 401) { onUnauthorized(); return true }
    return false
  }

  // ── Toggle completed via PATCH ────────────────────────────────────────────
  async function handleToggle() {
    setLoading(true)
    try {
      const updated = await patchTodo(todo.id, { completed: !todo.completed })
      onUpdated(updated)
    } catch (err) {
      if (handle401(err)) return
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Save edit via PUT (full update) ───────────────────────────────────────
  async function handleSave() {
    if (!editTitle.trim()) return
    setLoading(true)
    try {
      const updated = await updateTodo(
        todo.id,
        editTitle.trim(),
        editDescription.trim(),
        editCompleted
      )
      onUpdated(updated)
      setEditing(false)
    } catch (err) {
      if (handle401(err)) return
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    setConfirmDelete(false)
    setLoading(true)
    try {
      await deleteTodo(todo.id)
      onDeleted(todo.id)
    } catch (err) {
      if (handle401(err)) return
      addToast(err.message, 'error')
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

      {/* ── Action buttons (always visible in view mode) ── */}
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
