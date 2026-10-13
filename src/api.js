/**
 * api.js — Centralised API layer
 *
 * All backend calls live here. The JWT token is stored in an
 * httpOnly-style cookie (js-accessible cookie for this demo, since
 * our FastAPI backend returns the token in a JSON body rather than
 * setting Set-Cookie headers). We store the token in a secure cookie
 * manually from JS.
 *
 * Cookie helper functions are also in this file.
 *
 * Base URL:  http://localhost:8000
 */

const BASE_URL = 'http://localhost:8000'

// ─── Cookie helpers ─────────────────────────────────────────────────────────

/** Save the JWT token to a cookie (expires in 1 day) */
export function saveToken(token) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `access_token=${token}; expires=${expires}; path=/; SameSite=Strict`
}

/** Read the JWT token from the cookie */
export function getToken() {
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? match[1] : null
}

/** Delete the JWT cookie (logout) */
export function clearToken() {
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
}

/** Save the user's email to localStorage */
export function saveEmail(email) {
  localStorage.setItem('user_email', email)
}

/** Read the user's email from localStorage */
export function getEmail() {
  return localStorage.getItem('user_email')
}

/** Remove the user's email from localStorage (logout) */
export function clearEmail() {
  localStorage.removeItem('user_email')
}

// ─── Base fetch wrapper ──────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    // Try to get error detail from backend JSON
    let detail = `HTTP ${response.status}`
    try {
      const err = await response.json()
      detail = err.detail || detail
    } catch (_) {}
    const error = new Error(detail)
    // Mark 401 Unauthorized so callers can trigger logout
    if (response.status === 401) error.status = 401
    throw error
  }

  // 204 No Content — return null
  if (response.status === 204) return null
  return response.json()
}

// ─── Auth API ────────────────────────────────────────────────────────────────

/**
 * POST /auth/signup
 * @returns {Promise<{id, email, access_token, token_type}>}
 */
export async function signUp(email, password) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/**
 * POST /auth/login
 * @returns {Promise<{id, email, access_token, token_type}>}
 */
export async function logIn(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ─── Todo API ────────────────────────────────────────────────────────────────

/**
 * GET /todos/
 * @returns {Promise<Array<{id, title, description, completed}>>}
 */
export async function getTodos() {
  return request('/todos/')
}

/**
 * POST /todos/
 * @returns {Promise<{id, title, description, completed}>}
 */
export async function createTodo(title, description) {
  return request('/todos/', {
    method: 'POST',
    body: JSON.stringify({ title, description: description || null }),
  })
}

/**
 * PUT /todos/:id  — Full update
 * @returns {Promise<{id, title, description, completed}>}
 */
export async function updateTodo(id, title, description, completed) {
  return request(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description: description || null, completed }),
  })
}

/**
 * PATCH /todos/:id  — Partial update
 * @returns {Promise<{id, title, description, completed}>}
 */
export async function patchTodo(id, fields) {
  return request(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

/**
 * DELETE /todos/:id
 */
export async function deleteTodo(id) {
  return request(`/todos/${id}`, { method: 'DELETE' })
}

