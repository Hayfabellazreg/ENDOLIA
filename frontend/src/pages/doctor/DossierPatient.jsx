import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Microscope } from 'lucide-react'
import { patients, examens } from '../../data/mockData'

const avatarColors = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']

const statusConfig = {
  en_analyse: { label: 'En analyse', cls: 'badge-warning' },
  termine:    { label: 'Terminé',    cls: 'badge-success' },
  en_attente: { label: 'En attente', cls: 'badge-blue' },
}

export default function DossierPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('informations')

  const patient = id ? patients.find(p => p.id === id) : patients[0]
  const patientExamens = examens.filter(e => e.patientId === patient?.id)
  const avatarColor = avatarColors[patients.indexOf(patient) % avatarColors.length]

  if (!patient) return (
    <div className="empty-state">
      <div className="empty-icon"><Microscope /></div>
      <div className="empty-title">Patient introuvable</div>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/doctor/patients')}>
        Retour à la liste
      </button>
    </div>
  )

  const initials = patient.name.split(' ').map(w => w[0]).join('')

  return (
    <div className="animate-in">
      {/* Back */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}
        onClick={() => navigate('/doctor/patients')}>
        <ArrowLeft size={15} /> Retour aux patients
      </button>

      {/* Patient header */}
      <div className="patient-header-card">
        <div className={`patient-header-avatar ${avatarColor}`}>{initials}</div>
        <div className="patient-header-info">
          <div className="patient-header-name">{patient.name}</div>
          <div className="patient-header-meta">
            <span>{patient.dob} ({patient.age} ans)</span>
            <span className="meta-sep">·</span>
            <span>ID : {patient.id}</span>
            <span className="meta-sep">·</span>
            <span style={{ color: 'var(--text-300)' }}>Dernière visite : {patient.lastVisit}</span>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm"><Edit size={14} /> Modifier</button>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {['informations', 'historique', 'examens', 'comptes-rendus'].map(t => (
          <button key={t} className={`detail-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'informations' && (
        <div className="info-grid">
          <div className="card">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
              Informations personnelles
            </div>
            {[
              { label: 'Téléphone', value: patient.phone, icon: Phone },
              { label: 'Email', value: patient.email, icon: Mail },
              { label: 'Adresse', value: patient.address, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="info-row">
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon size={13} /> {label}
                </span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
              Antécédents médicaux
            </div>
            <div className="info-row">
              <span className="info-label">Antécédents</span>
              <span className="info-value">{patient.antecedents}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Allergies</span>
              <span className="info-value">{patient.allergies}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Examens réalisés</span>
              <span className="info-value" style={{ color: 'var(--accent-light)', fontWeight: 700 }}>
                {patient.examens}
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === 'examens' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-400)', fontSize: '0.875rem' }}>{patientExamens.length} examen(s) trouvé(s)</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctor/examens')}>
              <Microscope size={14} /> Nouvel examen
            </button>
          </div>
          {patientExamens.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Microscope /></div>
              <div className="empty-title">Aucun examen</div>
              <div className="empty-desc">Aucun examen enregistré pour ce patient.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {patientExamens.map(ex => {
                const s = statusConfig[ex.status]
                return (
                  <div key={ex.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                    onClick={() => navigate('/doctor/examens')}>
                    <div className="exam-thumb"><span className="exam-thumb-placeholder">🔬</span></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-100)', marginBottom: '0.2rem' }}>{ex.type}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>{ex.date} · {ex.time} · {ex.id}</div>
                    </div>
                    <span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'historique' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {patientExamens.map((ex, i) => {
              const s = statusConfig[ex.status]
              return (
                <div key={ex.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-soft)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Microscope size={13} color="var(--accent-light)" />
                    </div>
                    {i < patientExamens.length - 1 && (
                      <div style={{ flex: 1, width: 2, background: 'var(--border)', marginTop: '0.5rem' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingTop: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-100)' }}>{ex.type}</span>
                      <span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>{ex.date} à {ex.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'comptes-rendus' && (
        <div className="empty-state">
          <div className="empty-icon"><Microscope /></div>
          <div className="empty-title">Aucun compte rendu</div>
          <div className="empty-desc">Les comptes rendus générés apparaîtront ici.</div>
        </div>
      )}
    </div>
  )
}
