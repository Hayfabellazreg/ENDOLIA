import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, Microscope, Brain, Calendar, ArrowRight, TrendingUp, Clock } from 'lucide-react'

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']

export default function Dashboard() {
  const { patients, appointments, examens, rapports } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const myPatients = patients.filter(p => p.doctorId === currentUser?.id)
  const myExamens = examens.filter(e => e.doctorId === currentUser?.id)
  const myAppointments = appointments.filter(a => a.doctorId === currentUser?.id)
  const myRapports = rapports.filter(r => r.doctorId === currentUser?.id)

  const today = new Date().toISOString().split('T')[0]
  const todayRdv = myAppointments.filter(a => a.date === today)
  const upcoming = [...myAppointments]
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .filter(a => a.date >= today)
    .slice(0, 4)
  const recentExamens = [...myExamens].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4)

  const stats = [
    { label: 'Mes patients', value: myPatients.length, icon: Users, color: 'blue', sub: 'enregistrés' },
    { label: 'Examens', value: myExamens.length, icon: Microscope, color: 'purple', sub: 'réalisés' },
    { label: 'Analyses IA', value: myExamens.filter(e => e.status === 'termine').length, icon: Brain, color: 'cyan', sub: 'complètes' },
    { label: 'Prochains RDV', value: upcoming.length, icon: Calendar, color: 'green', sub: 'planifiés' },
  ]

  const statusConfig = {
    en_analyse: { label: 'En analyse', cls: 'badge-warning' },
    termine: { label: 'Terminé', cls: 'badge-success' },
    en_attente: { label: 'En attente', cls: 'badge-blue' },
  }

  const rdvTypeColor = { Coloscopie: 'badge-blue', Consultation: 'badge-success', Suivi: 'badge-warning', Gastroscopie: 'badge-purple' }

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Bonjour, {currentUser?.name?.split(' ').slice(-1)[0]}</h1>
          <p>Voici un aperçu de votre activité médicale.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/doctor/rendezvous')}>
          <Calendar size={16} /> Voir mes RDV
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

      <div className="section-grid-2" style={{ gap: '1.5rem' }}>
        {/* Upcoming appointments */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Prochains rendez-vous</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/rendezvous')}>
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
              Aucun rendez-vous à venir
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {upcoming.map((rdv, i) => (
                <div key={rdv.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`patient-avatar ${COLORS[i % COLORS.length]}`}>
                    {rdv.patientName.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{rdv.patientName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Clock size={11} /> {rdv.time} · {rdv.date}
                    </div>
                  </div>
                  <span className={`badge ${rdvTypeColor[rdv.type] || 'badge-blue'}`}>
                    <span className="badge-dot" /> {rdv.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent examens */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Examens récents</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/examens')}>
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          {recentExamens.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
              Aucun examen enregistré
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentExamens.map(ex => {
                const s = statusConfig[ex.status] || statusConfig.en_attente
                return (
                  <div key={ex.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                    onClick={() => navigate('/doctor/examens')}>
                    <div className="exam-thumb"><Microscope size={18} color="var(--accent-light)" /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ex.type}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-400)' }}>{ex.date} · {ex.patient}</div>
                    </div>
                    <span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Accès rapide</h2>
        <div className="section-grid-3">
          {[
            { label: 'Nouvelle analyse IA', desc: 'Importer et analyser une image', icon: Brain, color: 'cyan', path: '/doctor/analyse' },
            { label: 'Dossier patient', desc: `${myPatients.length} patients enregistrés`, icon: Users, color: 'blue', path: '/doctor/dossier' },
            { label: 'Générer un rapport', desc: `${myRapports.length} rapport${myRapports.length > 1 ? 's' : ''} rédigé${myRapports.length > 1 ? 's' : ''}`, icon: Microscope, color: 'purple', path: '/doctor/comptes-rendus' },
          ].map(({ label, desc, icon: Icon, color, path }) => (
            <div key={label} className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              onClick={() => navigate(path)}>
              <div className={`stat-icon stat-icon-${color}`}><Icon size={20} /></div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-100)' }}>{label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', marginTop: '0.15rem' }}>{desc}</div>
              </div>
              <ArrowRight size={15} style={{ marginLeft: 'auto', color: 'var(--text-500)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
