import { Search, Bell, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL = { admin: 'Administrateur', doctor: null, secretaire: 'Secrétaire médicale' }

export default function AppTopbar() {
  const { currentUser } = useAuth()
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const initials = currentUser?.name?.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  const roleLabel = currentUser?.specialty || ROLE_LABEL[currentUser?.role] || currentUser?.role

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search className="topbar-search-icon" />
        <input placeholder="Rechercher…" />
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{dateStr}</span>
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={17} />
          <span className="topbar-notif-dot" />
        </button>
        <button className="topbar-icon-btn" title="Paramètres">
          <Settings size={17} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-100)', lineHeight: 1 }}>{currentUser?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', marginTop: 2 }}>{roleLabel}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
