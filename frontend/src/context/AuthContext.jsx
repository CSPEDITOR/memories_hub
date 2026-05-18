import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '@/services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const loadUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await authService.fetchMe()
      setUser(me)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (payload) => {
    const data = await authService.login(payload)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar,
      passoutYear: data.user.passoutYear,
      department: data.user.department,
      bio: data.user.bio,
    })
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar,
      passoutYear: data.user.passoutYear,
      department: data.user.department,
      bio: data.user.bio,
    })
    return data
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser: loadUser,
      /** True when a JWT is stored (may still be hydrating `user` from `/me`) */
      isAuthenticated: Boolean(token),
    }),
    [user, token, loading, login, register, logout, loadUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
