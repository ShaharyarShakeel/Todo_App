import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { logIn, signUp, saveToken, saveEmail, getToken, getEmail, clearToken, clearEmail } from '../api.js'

/**
 * authSlice
 *
 * Manages who is logged in.
 * State: { user: { email, access_token } | null, status, error }
 */

// Restore user from cookie + localStorage on page reload
function getInitialUser() {
  const token = getToken()
  if (token) return { email: getEmail() || 'Your Account', access_token: token }
  return null
}

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await logIn(email, password)
      saveToken(data.access_token)
      saveEmail(data.email)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await signUp(email, password)
      saveToken(data.access_token)
      saveEmail(data.email)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    status: 'idle',  // 'idle' | 'loading' | 'failed'
    error: null,
  },
  reducers: {
    /** User clicked Logout */
    logout(state) {
      clearToken()
      clearEmail()
      state.user = null
      state.status = 'idle'
      state.error = null
    },
    /** A 401 response was received — stale/expired token */
    unauthorized(state) {
      clearToken()
      clearEmail()
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // signupUser
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { logout, unauthorized } = authSlice.actions
export default authSlice.reducer

