import { Search, Bell, Settings } from 'lucide-react'
import { doctor } from '../data/mockData'

export default function Topbar() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search className="topbar-search-icon" />
        <input placeholder="Rechercher un patient, un examen…" />
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: '#fff'
          }}>
            SB
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-100)', lineHeight: 1 }}>
              {doctor.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-400)', marginTop: 2 }}>
              {doctor.specialty}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
