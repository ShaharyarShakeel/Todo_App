import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import todosReducer from './todosSlice.js'

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

