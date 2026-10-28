import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * ToastContext
 *
 * Provides a global `addToast(message, type)` function.
 * type: 'success' | 'error' | 'info' | 'warning'
 */
const ToastContext = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // useMemo keeps the same object reference as long as addToast doesn't change.
  // Since addToast is memoized with useCallback([]), it NEVER changes.
  // So this context value is created ONCE and consumers never re-render
  // just because toasts were added/removed.
  // useMemo checks the dependencies array and only recalculates the value if addToast changes, which it won't due to useCallback with an empty dependency array. This optimization prevents unnecessary re-renders of components that consume the context, improving performance.
  // In addToast, state updates (setToasts) are handled internally, so consumers don't need to re-render when the toast list changes.
  //We are sending function reference in context value instead of the actual state, so that consumers can call addToast without re-rendering when toasts change because addToast have [] as dependency and it will never change.
  const contextValue = useMemo(
    () => ({ addToast }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/** Hook to access addToast from any component */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx.addToast
}

// ── Toast Container (rendered at root) ──────────────────────────────────────

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span className="toast-icon">{ICONS[toast.type] ?? 'ℹ️'}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => onRemove(toast.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

