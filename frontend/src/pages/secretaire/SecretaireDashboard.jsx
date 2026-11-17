import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { getStoredUsers } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, Clock, ArrowRight, UserPlus, Link2 } from 'lucide-react'

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
const TYPE_CLS = { Coloscopie: 'cal-event-colonoscopie', Consultation: 'cal-event-consultation', Suivi: 'cal-event-suivi', Gastroscopie: 'cal-event-gastroscopie' }

export default function SecretaireDashboard() {
  const { patients, appointments } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const users = getStoredUsers()
  const linkedDoctor = users.find(u => u.id === currentUser?.linkedUserId)

  const myPatients = patients.filter(p => p.doctorId === linkedDoctor?.id)
  const myAppointments = appointments.filter(a => a.doctorId === linkedDoctor?.id)

  const today = new Date().toISOString().split('T')[0]
  const todayRdv = myAppointments.filter(a => a.date === today)
  const upcoming = [...myAppointments]
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .filter(a => a.date >= today)
    .slice(0, 5)
  const recentPatients = [...myPatients]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Tableau de bord 👩‍💼</h1>
          <p>Secrétaire de <strong style={{ color: 'var(--accent-light)' }}>{linkedDoctor?.name || '—'}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/secretaire/patients')}>
          <UserPlus size={16} /> Nouveau patient
        </button>
      </div>

      {/* Linked doctor banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--accent-soft)', borderColor: 'var(--border-accent)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
        <Link2 size={18} color="var(--accent-light)" />
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.1rem' }}>Binôme médical</div>
          <div style={{ fontWeight: 600, color: 'var(--text-100)' }}>
            {linkedDoctor?.name}
            {linkedDoctor?.specialty && <span style={{ color: 'var(--text-400)', fontWeight: 400, marginLeft: '0.5rem' }}>· {linkedDoctor.specialty}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Patients', value: myPatients.length, icon: Users, color: 'blue' },
          { label: 'RDV aujourd\'hui', value: todayRdv.length, icon: Calendar, color: 'purple' },
          { label: 'RDV à venir', value: upcoming.length, icon: Clock, color: 'cyan' },
          { label: 'Nouveaux patients', value: myPatients.filter(p => p.status === 'nouveau').length, icon: UserPlus, color: 'green' },
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
                    {(rdv.patientName || '?').split(' ').map(w => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{rdv.patientName || '—'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-400)' }}>{rdv.date} · {rdv.time}</div>
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
          {recentPatients.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
              <div style={{ marginBottom: '0.75rem' }}>Aucun patient enregistré</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/secretaire/patients')}>
                <UserPlus size={13} /> Créer un patient
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
