import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  logIn,
  signUp,
  signInWithGoogle,
  saveToken,
  saveEmail,
  getToken,
  getEmail,
  clearToken,
  clearEmail,
} from '../../api.js'

function getInitialUser() {
  const token = getToken()
  if (token) return { email: getEmail() || 'Your Account', access_token: token }
  return null
}

function persistAuthResult(data) {
  saveToken(data.access_token)
  saveEmail(data.email)
  return data
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return persistAuthResult(await logIn(email, password))
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return persistAuthResult(await signUp(email, password))
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const googleSignInUser = createAsyncThunk(
  'auth/googleSignIn',
  async (credential, { rejectWithValue }) => {
    try {
      return persistAuthResult(await signInWithGoogle(credential))
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const completeGithubSignIn = createAsyncThunk(
  'auth/completeGithubSignIn',
  async (authResult) => persistAuthResult(authResult),
)

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: getInitialUser(), status: 'idle', error: null },
  reducers: {
    logout(state) {
      clearToken()
      clearEmail()
      state.user = null
      state.status = 'idle'
      state.error = null
    },
    unauthorized(state) {
      clearToken()
      clearEmail()
      state.user = null
    },
  },
  extraReducers: (builder) => {
    const thunks = [loginUser, signupUser, googleSignInUser, completeGithubSignIn]
    for (const thunk of thunks) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading'
          state.error = null
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'idle'
          state.user = action.payload
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed'
          state.error = action.payload
        })
    }
  },
})

export const { logout, unauthorized } = authSlice.actions
export default authSlice.reducer
export const selectUser = (state) => state.auth.user
export const selectUserEmail = (state) => state.auth.user?.email
export const selectAuthStatus = (state) => state.auth.status