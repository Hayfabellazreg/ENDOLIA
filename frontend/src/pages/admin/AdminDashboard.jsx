import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, UserCheck, ArrowRight, TrendingUp, UserPlus } from 'lucide-react'

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']

export default function AdminDashboard() {
  const { getUsers } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const users = getUsers()
  const doctors = users.filter(u => u.role === 'doctor')
  const secretaires = users.filter(u => u.role === 'secretaire')
  const recentUsers = [...users]
    .filter(u => u.role !== 'admin')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  const stats = [
    { label: 'Médecins', value: doctors.length, icon: UserCheck, color: 'blue', sub: 'comptes actifs' },
    { label: 'Secrétaires', value: secretaires.length, icon: Users, color: 'purple', sub: 'comptes actifs' },
  ]

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Tableau de bord Admin 🛡️</h1>
          <p>Vue d'ensemble du système ENDOLIA.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
          <UserPlus size={16} /> Créer un compte
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card stat-card-${s.color}`}>
            <div className={`stat-icon stat-icon-${s.color}`}><s.icon size={20} /></div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-trend stat-trend-neutral"><TrendingUp size={11} />{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent users table */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Comptes du personnel</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}>
            Gérer <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Spécialité</th><th>Créé le</th></tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
                  Aucun compte créé. <button className="btn btn-primary btn-sm" style={{ marginLeft: '0.75rem' }} onClick={() => navigate('/admin/users')}>Créer maintenant</button>
                </td></tr>
              ) : recentUsers.map((u, i) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div className={`patient-avatar ${COLORS[i % COLORS.length]}`} style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {u.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="td-primary">{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-400)', fontSize: '0.82rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'doctor' ? 'badge-blue' : 'badge-purple'}`}>
                      <span className="badge-dot" />
                      {u.role === 'doctor' ? 'Médecin' : 'Secrétaire'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-300)', fontSize: '0.82rem' }}>{u.specialty || '—'}</td>
                  <td style={{ color: 'var(--text-500)', fontSize: '0.78rem' }}>{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  )
}
