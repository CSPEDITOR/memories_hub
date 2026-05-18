import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext.jsx'
import * as notificationService from '@/services/notificationService.js'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token, user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [livePing, setLivePing] = useState(0)

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const s = io(base, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    setSocket(s)
    const onNotif = () => setLivePing((p) => p + 1)
    s.on('notification', onNotif)
    return () => {
      s.off('notification', onNotif)
      s.disconnect()
    }
  }, [token])

  const value = useMemo(() => ({ socket, livePing, userId: user?._id || user?.id }), [socket, livePing, user])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  return useContext(SocketContext)
}

/** Refetch unread count when socket pings (only when logged in) */
export function useUnreadNotifications(isAuthed) {
  const { livePing } = useSocket() || {}
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isAuthed) {
      setCount(0)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { count: c } = await notificationService.fetchUnreadCount()
        if (!cancelled) setCount(c)
      } catch {
        if (!cancelled) setCount(0)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [livePing, isAuthed])

  return count
}
