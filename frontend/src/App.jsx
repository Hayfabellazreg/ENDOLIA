import { useState, useEffect } from 'react'
import { checkHealth, getUsers } from './api'
import './App.css'

function StatusBadge({ status }) {
  const isOk = status === 'ok'
  return (
    <span className={`badge ${isOk ? 'badge-ok' : 'badge-error'}`}>
      {isOk ? '✅ Connecté' : '❌ Erreur'}
    </span>
  )
}

function App() {
  const [health, setHealth] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    try {
      const res = await checkHealth()
      setHealth(res.data)
    } catch (err) {
      setHealth({ status: 'error', api: 'running', database: 'disconnected' })
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users')
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchHealth()
      await fetchUsers()
      setLoading(false)
    }
    init()
  }, [])


  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">ENDOLIA</span>
          </div>
          <p className="header-sub">Flask · React · PostgreSQL</p>
        </div>
      </header>

      <main className="main">
        {/* Status Cards */}
        <section className="section">
          <h2 className="section-title">État du système</h2>
          {loading ? (
            <div className="skeleton-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : (
            <div className="status-grid">
              <div className="status-card">
                <div className="status-icon">🐍</div>
                <div className="status-info">
                  <h3>Flask API</h3>
                  <StatusBadge status={health?.api === 'running' ? 'ok' : 'error'} />
                </div>
              </div>
              <div className="status-card">
                <div className="status-icon">🐘</div>
                <div className="status-info">
                  <h3>PostgreSQL</h3>
                  <StatusBadge status={health?.database === 'connected' ? 'ok' : 'error'} />
                </div>
              </div>
              <div className="status-card">
                <div className="status-icon">⚛️</div>
                <div className="status-info">
                  <h3>React App</h3>
                  <StatusBadge status="ok" />
                </div>
              </div>
            </div>
          )}
        </section>


        {/* Users List */}
        <section className="section">
          <h2 className="section-title">Utilisateurs ({users.length})</h2>
          {users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👤</span>
              <p>Aucun utilisateur pour l'instant. Créez-en un ci-dessus !</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-avatar">{user.username[0].toUpperCase()}</div>
                  <div className="user-info">
                    <h4>{user.username}</h4>
                    <p>{user.email}</p>
                    <span className="user-date">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>ENDOLIA Stack — Flask {' '}<span>·</span>{' '} React {' '}<span>·</span>{' '} PostgreSQL</p>
      </footer>
    </div>
  )
}

export default App
