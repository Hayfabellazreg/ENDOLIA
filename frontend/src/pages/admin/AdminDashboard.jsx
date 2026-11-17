import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, UserCheck, Microscope, Calendar, ArrowRight, TrendingUp, Shield, UserPlus } from 'lucide-react'

export default function AdminDashboard() {
  const { patients, appointments, examens, rapports, getUsers } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const users = getUsers()
  const doctors = users.filter(u => u.role === 'doctor')
  const secretaires = users.filter(u => u.role === 'secretaire')
  const thisMonth = new Date().getMonth()
  const rdvThisMonth = appointments.filter(a => new Date(a.date).getMonth() === thisMonth).length
  const recentPatients = [...patients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const recentUsers = [...users].filter(u => u.role !== 'admin').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)

  const stats = [
    { label: 'Médecins', value: doctors.length, icon: UserCheck, color: 'blue', sub: 'comptes actifs' },
    { label: 'Secrétaires', value: secretaires.length, icon: Users, color: 'purple', sub: 'comptes actifs' },
    { label: 'Patients', value: patients.length, icon: Users, color: 'cyan', sub: 'enregistrés' },
    { label: 'RDV ce mois', value: rdvThisMonth, icon: Calendar, color: 'green', sub: 'rendez-vous' },
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

      <div className="section-grid-2">
        {/* Recent users */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Comptes récents</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}>
              Gérer <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Nom</th><th>Rôle</th><th>Créé le</th></tr></thead>
              <tbody>
                {recentUsers.map((u, i) => {
                  const colors = ['avatar-blue', 'avatar-violet', 'avatar-teal', 'avatar-rose']
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div className={`patient-avatar ${colors[i % colors.length]}`} style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                            {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="td-primary">{u.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'doctor' ? 'badge-blue' : 'badge-purple'}`}>
                          <span className="badge-dot" />
                          {u.role === 'doctor' ? 'Médecin' : 'Secrétaire'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-400)', fontSize: '0.8rem' }}>{u.createdAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent patients */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Patients récents</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/patients')}>
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Patient</th><th>Statut</th><th>Enregistré</th></tr></thead>
              <tbody>
                {recentPatients.map((p, i) => {
                  const colors = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
                  const sc = { actif: 'badge-success', en_cours: 'badge-warning', nouveau: 'badge-blue' }
                  const sl = { actif: 'Actif', en_cours: 'En cours', nouveau: 'Nouveau' }
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div className={`patient-avatar ${colors[i % colors.length]}`} style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                            {p.name.split(' ').map(w => w[0]).join('')}
                          </div>
                          <span className="td-primary">{p.name}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${sc[p.status]}`}><span className="badge-dot" />{sl[p.status]}</span></td>
                      <td style={{ color: 'var(--text-400)', fontSize: '0.8rem' }}>{p.createdAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System summary */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Résumé du système</h2>
        <div className="section-grid-3">
          {[
            { label: 'Examens réalisés', value: examens.length, icon: '🔬', color: 'var(--accent)' },
            { label: 'Comptes rendus', value: rapports.length, icon: '📄', color: 'var(--success)' },
            { label: 'RDV planifiés', value: appointments.filter(a => a.status === 'confirme').length, icon: '📅', color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.75rem' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
