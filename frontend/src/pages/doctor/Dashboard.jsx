import { Users, Microscope, Brain, Calendar, ArrowRight, TrendingUp, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { stats, rendezvous, examens, analyses, doctor } from '../../data/mockData'

const avatarColors = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']

function StatCard({ value, label, trend, icon: Icon, colorClass }) {
  return (
    <div className={`stat-card stat-card-${colorClass}`}>
      <div className={`stat-icon stat-icon-${colorClass}`}>
        <Icon />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && <div className={`stat-trend stat-trend-${trend.type}`}><TrendingUp size={11} />{trend.text}</div>}
      </div>
    </div>
  )
}

function rdvColor(type) {
  const map = { 'Coloscopie': 'blue', 'Consultation': 'green', 'Suivi': 'warning', 'Gastroscopie': 'purple' }
  return map[type] || 'blue'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const todayRdv = rendezvous.slice(0, 4)
  const recentExamens = examens.slice(0, 4)

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Bonjour, {doctor.name.split(' ')[1]} 👋</h1>
          <p>Voici un aperçu de votre journée et de vos activités récentes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/doctor/rendezvous')}>
          <Calendar size={16} /> Prendre un rendez-vous
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard value={stats.patientsAujourdhui} label="Patients aujourd'hui" icon={Users} colorClass="blue" trend={{ type: 'up', text: '+1 vs hier' }} />
        <StatCard value={stats.examensEnCours} label="Examens en cours" icon={Microscope} colorClass="purple" />
        <StatCard value={stats.analysesIA} label="Analyses IA réalisées" icon={Brain} colorClass="cyan" trend={{ type: 'up', text: 'Ce mois' }} />
        <StatCard value={stats.rdvSemaine} label="Rendez-vous cette semaine" icon={Calendar} colorClass="green" />
      </div>

      {/* Main grid */}
      <div className="section-grid-2" style={{ gap: '1.5rem' }}>
        {/* Rendez-vous du jour */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Rendez-vous à venir</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/rendezvous')}>
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {todayRdv.map((rdv, i) => (
              <div key={rdv.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className={`patient-avatar ${avatarColors[i % avatarColors.length]}`}>
                  {rdv.patient.split(' ').map(w => w[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-100)' }}>{rdv.patient}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={11} /> {rdv.time} · {rdv.date}
                  </div>
                </div>
                <span className={`badge badge-${rdvColor(rdv.type)}`}>
                  <span className="badge-dot" /> {rdv.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Examens récents */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Examens récents</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/examens')}>
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentExamens.map((ex) => {
              const statusMap = {
                en_analyse: { label: 'En analyse', cls: 'badge-warning' },
                termine: { label: 'Terminé', cls: 'badge-success' },
                en_attente: { label: 'En attente', cls: 'badge-blue' },
              }
              const s = statusMap[ex.status]
              return (
                <div key={ex.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => navigate('/doctor/examens')}>
                  <div className="exam-thumb">
                    <span className="exam-thumb-placeholder">🔬</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-100)' }}>{ex.type}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', marginTop: '0.15rem' }}>
                      {ex.date} · {ex.patient}
                    </div>
                  </div>
                  <span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Accès rapide</h2>
        <div className="section-grid-3">
          {[
            { label: 'Nouvelle analyse IA', desc: 'Importer et analyser une image', icon: Brain, color: 'cyan', path: '/doctor/analyse' },
            { label: 'Dossier patient', desc: 'Consulter un dossier médical', icon: Users, color: 'blue', path: '/doctor/dossier' },
            { label: 'Générer un rapport', desc: 'Créer un compte rendu', icon: Microscope, color: 'purple', path: '/doctor/comptes-rendus' },
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
