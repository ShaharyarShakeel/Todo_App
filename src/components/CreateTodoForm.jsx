import { useState } from 'react'
import { createTodo } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * CreateTodoForm
 * A simple form to create a new todo.
 * Calls onCreated(newTodo) after a successful API response.
 */
export default function CreateTodoForm({ onCreated, onUnauthorized }) {
  const addToast = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const newTodo = await createTodo(title.trim(), description.trim())
      onCreated(newTodo)
      // Clear form
      setTitle('')
      setDescription('')
    } catch (err) {
      if (err.status === 401) { onUnauthorized(); return }
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-todo-form">
      <h3>➕ New Todo</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label>Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short note…"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Todo'}
        </button>
      </form>
    </div>
  )
}
