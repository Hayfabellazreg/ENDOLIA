import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'endolia_users'

export const DEFAULT_USERS = [
  { id: 'USR-001', name: 'Mohammed Admin', email: 'admin@endolia.com', password: 'admin123', role: 'admin', createdAt: '2025-01-01' },
  { id: 'USR-002', name: 'Dr. Sarah Benali', email: 'doctor@endolia.com', password: 'doctor123', role: 'doctor', specialty: 'Gastro-entérologue', createdAt: '2025-01-05' },
  { id: 'USR-003', name: 'Nadia Khalil', email: 'secretaire@endolia.com', password: 'secretaire123', role: 'secretaire', createdAt: '2025-01-10' },
]

export function getStoredUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Always ensure default users exist
      const ids = parsed.map(u => u.id)
      const missing = DEFAULT_USERS.filter(u => !ids.includes(u.id))
      return [...parsed, ...missing]
    }
  } catch (e) {}
  return [...DEFAULT_USERS]
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem('endolia_session')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const login = useCallback((email, password) => {
    const users = getStoredUsers()
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
      const { password: _pw, ...safe } = user
      setCurrentUser(safe)
      localStorage.setItem('endolia_session', JSON.stringify(safe))
      return { success: true, user: safe }
    }
    return { success: false, error: 'Email ou mot de passe incorrect.' }
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem('endolia_session')
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
