import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import todosReducer from '../features/todos/todosSlice.js'

/**
 * Redux Store
 *
 * state shape:
 * {
 *   auth:  { user, status, error }
 *   todos: { items, status, error }
 * }
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
})

