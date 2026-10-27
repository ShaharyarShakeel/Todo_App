import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addTodo } from '../store/todosSlice.js'
import { unauthorized } from '../store/authSlice.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * CreateTodoForm
 * Dispatches addTodo thunk directly to Redux — no callback props needed.
 */
export default function CreateTodoForm() {
  const dispatch = useDispatch()
  const addToast = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await dispatch(addTodo({ title: title.trim(), description: description.trim() })).unwrap()
      addToast('Todo created!', 'success')
      setTitle('')
      setDescription('')
    } catch (err) {
      if (err.status === 401) { dispatch(unauthorized()); return }
      addToast(err.message || 'Failed to create todo', 'error')
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
