import { useState, useRef, useEffect } from 'react'
import { Search, Bell, Settings, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const ROLE_LABEL = { admin: 'Administrateur', doctor: null, secretaire: 'Secrétaire médicale' }

export default function AppTopbar() {
  const { currentUser } = useAuth()
  const { patients, appointments } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const ref = useRef(null)

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const initials = currentUser?.name?.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  const roleLabel = currentUser?.specialty || ROLE_LABEL[currentUser?.role] || currentUser?.role

  // Search results
  const q = query.trim().toLowerCase()
  const matchPatients = q.length >= 2
    ? patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.email?.toLowerCase().includes(q)).slice(0, 4)
    : []
  const matchRdv = q.length >= 2
    ? appointments.filter(a => a.patientName?.toLowerCase().includes(q) || a.type?.toLowerCase().includes(q)).slice(0, 3)
    : []
  const hasResults = matchPatients.length > 0 || matchRdv.length > 0

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowResults(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goToPatient = (p) => {
    const role = currentUser?.role
    if (role === 'doctor') navigate(`/doctor/dossier/${p.id}`)
    else if (role === 'secretaire') navigate('/secretaire/patients')
    setQuery(''); setShowResults(false)
  }

  const roleOf = currentUser?.role

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search" ref={ref} style={{ position: 'relative', maxWidth: 420 }}>
        <Search className="topbar-search-icon" />
        <input
          placeholder="Rechercher un patient, un RDV…"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true) }}
          onFocus={() => setShowResults(true)}
          style={{ paddingRight: query ? '2rem' : undefined }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setShowResults(false) }}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={14} />
          </button>
        )}

        {/* Dropdown results */}
        {showResults && q.length >= 2 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 200,
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
          }}>
            {!hasResults ? (
              <div style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-400)', textAlign: 'center' }}>
                Aucun résultat pour « {query} »
              </div>
            ) : (
              <>
                {matchPatients.length > 0 && (
                  <div>
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(0,0,0,0.15)' }}>
                      Patients
                    </div>
                    {matchPatients.map(p => (
                      <div key={p.id} onClick={() => goToPatient(p)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'var(--transition)', borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0 }}>
                          {p.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-100)' }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-400)' }}>{p.phone} · {p.id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {matchRdv.length > 0 && (
                  <div>
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(0,0,0,0.15)' }}>
                      Rendez-vous
                    </div>
                    {matchRdv.map(a => (
                      <div key={a.id}
                        onClick={() => { navigate(roleOf === 'secretaire' ? '/secretaire/rendezvous' : '/doctor/rendezvous'); setQuery(''); setShowResults(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--purple-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📅</div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-100)' }}>{a.patientName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-400)' }}>{a.type} · {a.date} {a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <span className="topbar-date">{dateStr}</span>
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={17} />
          <span className="topbar-notif-dot" />
        </button>
        <button className="topbar-icon-btn" title="Paramètres"><Settings size={17} /></button>
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
