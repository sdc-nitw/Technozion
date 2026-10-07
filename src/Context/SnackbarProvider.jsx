
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const SnackbarContext = createContext()
export const useSnackbar = () => useContext(SnackbarContext)

// Improved snackbar provider using Tailwind classes (if available).
// Features: stacked toasts, close button, pause on hover, simple slide/fade animation.
const SnackbarProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const notify = useCallback((message, { variant = 'default', duration = 4000 } = {}) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, variant, duration }])
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  useEffect(() => {
    // start timers for new toasts
    toasts.forEach((t) => {
      if (!timers.current[t.id]) {
        timers.current[t.id] = setTimeout(() => remove(t.id), t.duration)
      }
    })
    // cleanup on unmount
    return () => {
      Object.values(timers.current).forEach(clearTimeout)
      timers.current = {}
    }
  }, [toasts, remove])

  // Pause auto-hide when hovering over a toast
  const pause = (id) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }

  const resume = (id, duration) => {
    if (!timers.current[id]) {
      timers.current[id] = setTimeout(() => remove(id), duration)
    }
  }

  // Use Tailwind color classes defined in tailwind.config.js
  const variantClass = (variant) => {
    switch (variant) {
      case 'success':
        return 'bg-cyanDark'
      case 'error':
        return 'bg-red-700'
      case 'info':
        return 'bg-cyanLight'
      default:
        return 'bg-darkGray'
    }
  }

  return (
    <SnackbarContext.Provider value={{ notify, remove }}>
      {children}

      {/* Toast container */}
      <div className="fixed right-4 bottom-6 z-[4000] flex flex-col items-end gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onMouseEnter={() => pause(t.id)}
            onMouseLeave={() => resume(t.id, t.duration)}
            className={`pointer-events-auto w-full max-w-[420px] transform transition duration-300 ease-out translate-y-0 opacity-100`}
          >
            <div className={`${variantClass(t.variant)} flex items-start gap-3 p-3 pr-2 rounded-lg shadow-lg text-white`}>
              <div className="flex-1 text-sm leading-tight break-words">{t.message}</div>
              <button
                aria-label="dismiss"
                onClick={() => remove(t.id)}
                className="ml-2 text-white/80 hover:text-white rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  )
}

export default SnackbarProvider
