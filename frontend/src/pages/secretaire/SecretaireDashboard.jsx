import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, Clock, ArrowRight, UserPlus } from 'lucide-react'

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
const TYPE_CLS = { Coloscopie: 'cal-event-colonoscopie', Consultation: 'cal-event-consultation', Suivi: 'cal-event-suivi', Gastroscopie: 'cal-event-gastroscopie' }

export default function SecretaireDashboard() {
  const { patients, appointments } = useApp()
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const todayRdv = appointments.filter(a => a.date === today)
  const upcoming = [...appointments].sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .filter(a => new Date(a.date) >= new Date(today)).slice(0, 5)
  const recentPatients = [...patients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Tableau de bord 👩‍💼</h1>
          <p>Gérez les patients et les rendez-vous.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/secretaire/patients')}>
          <UserPlus size={16} /> Nouveau patient
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Patients total', value: patients.length, icon: Users, color: 'blue' },
          { label: 'RDV aujourd\'hui', value: todayRdv.length, icon: Calendar, color: 'purple' },
          { label: 'RDV à venir', value: upcoming.length, icon: Clock, color: 'cyan' },
          { label: 'Nouveaux patients', value: patients.filter(p => p.status === 'nouveau').length, icon: UserPlus, color: 'green' },
        ].map(s => (
          <div key={s.label} className={`stat-card stat-card-${s.color}`}>
            <div className={`stat-icon stat-icon-${s.color}`}><s.icon size={20} /></div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-grid-2">
        {/* Upcoming appointments */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Prochains rendez-vous</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/secretaire/rendezvous')}>
              Gérer <ArrowRight size={14} />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
              Aucun rendez-vous à venir
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {upcoming.map((rdv, i) => (
                <div key={rdv.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`patient-avatar ${COLORS[i % COLORS.length]}`} style={{ fontSize: '0.75rem', width: 34, height: 34 }}>
                    {rdv.patientName.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{rdv.patientName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', display: 'flex', gap: '0.5rem' }}>
                      <span>{rdv.date}</span><span>·</span><span>{rdv.time}</span>
                    </div>
                  </div>
                  <span className={`cal-event ${TYPE_CLS[rdv.type] || 'cal-event-colonoscopie'}`} style={{ fontSize: '0.72rem', borderRadius: 6 }}>
                    {rdv.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent patients */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Patients récents</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/secretaire/patients')}>
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentPatients.map((p, i) => {
              const sc = { actif: 'badge-success', en_cours: 'badge-warning', nouveau: 'badge-blue' }
              const sl = { actif: 'Actif', en_cours: 'En cours', nouveau: 'Nouveau' }
              return (
                <div key={p.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => navigate('/secretaire/patients')}>
                  <div className={`patient-avatar ${COLORS[i % COLORS.length]}`} style={{ fontSize: '0.75rem', width: 34, height: 34 }}>
                    {p.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-400)' }}>{p.phone}</div>
                  </div>
                  <span className={`badge ${sc[p.status]}`}><span className="badge-dot" />{sl[p.status]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
