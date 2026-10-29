import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getTodos, createTodo, updateTodo, patchTodo, deleteTodo } from '../api.js'

/**
 * todosSlice
 *
 * Manages the todo list.
 * State: { items: [], status, error }
 */

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => { //rejectWithValue() — returns custom error information if the request fails.
    try {
      return await getTodos()
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status })
    }
  }
)

export const addTodo = createAsyncThunk(
  'todos/addTodo',
  async ({ title, description }, { rejectWithValue }) => {
    try {
      return await createTodo(title, description)
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status })
    }
  }
)

export const editTodo = createAsyncThunk(
  'todos/editTodo',
  async ({ id, title, description, completed }, { rejectWithValue }) => {
    try {
      return await updateTodo(id, title, description, completed)
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status })
    }
  }
)

export const toggleTodo = createAsyncThunk(
  'todos/toggleTodo',
  async ({ id, completed }, { rejectWithValue }) => {
    try {
      return await patchTodo(id, { completed })
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status })
    }
  }
)

export const removeTodo = createAsyncThunk(
  'todos/removeTodo',
  async (id, { rejectWithValue }) => {
    try {
      await deleteTodo(id)
      return id  // return id so we know which one to remove from state
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status })
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    status: 'idle',  // 'idle' | 'loading' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTodos
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || 'Failed to load todos'
      })
      // addTodo — prepend new todo to top of list
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      // editTodo — replace the updated todo in the list
      .addCase(editTodo.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      // toggleTodo — replace the toggled todo in the list
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      // removeTodo — filter out the deleted todo
      .addCase(removeTodo.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
      })
  },
})

export default todosSlice.reducer

