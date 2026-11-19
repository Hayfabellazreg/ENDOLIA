import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Microscope, Phone, Mail, MapPin } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
const STATUS_CFG = { en_analyse: { label: 'En analyse', cls: 'badge-warning' }, termine: { label: 'Terminé', cls: 'badge-success' }, en_attente: { label: 'En attente', cls: 'badge-blue' } }

export default function DossierPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, examens, rapports } = useApp()
  const { currentUser } = useAuth()
  const [tab, setTab] = useState('informations')

  const myPatients = patients.filter(p => p.doctorId === currentUser?.id)
  const patient = id ? patients.find(p => p.id === id) : myPatients[0]

  if (!patient) return (
    <div className="empty-state">
      <div className="empty-icon"><Microscope size={24} /></div>
      <div className="empty-title">Aucun patient sélectionné</div>
      <div className="empty-desc" style={{ marginBottom: '1.25rem' }}>Sélectionnez un patient depuis la liste.</div>
      <button className="btn btn-primary" onClick={() => navigate('/doctor/patients')}>Voir mes patients</button>
    </div>
  )

  const patientExamens = examens.filter(e => e.patientId === patient.id)
  const patientRapports = rapports.filter(r => r.patientId === patient.id)
  const avatarColor = COLORS[myPatients.indexOf(patient) % COLORS.length] || COLORS[0]
  const initials = patient.name.split(' ').map(w => w[0]).join('')

  return (
    <div className="animate-in">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/doctor/patients')}>
        <ArrowLeft size={15} /> Retour
      </button>

      <div className="patient-header-card">
        <div className={`patient-header-avatar ${avatarColor}`}>{initials}</div>
        <div className="patient-header-info">
          <div className="patient-header-name">{patient.name}</div>
          <div className="patient-header-meta">
            {patient.dob && <span>{patient.dob}{patient.age ? ` (${patient.age} ans)` : ''}</span>}
            <span className="meta-sep">·</span>
            <span>ID : {patient.id}</span>
          </div>
        </div>
        <span className={`badge ${patient.status === 'actif' ? 'badge-success' : patient.status === 'en_cours' ? 'badge-warning' : 'badge-blue'}`} style={{ fontSize: '0.8rem' }}>
          <span className="badge-dot" />{patient.status === 'actif' ? 'Actif' : patient.status === 'en_cours' ? 'En cours' : 'Nouveau'}
        </span>
      </div>

      <div className="detail-tabs">
        {['informations', 'examens', 'historique', 'comptes-rendus'].map(t => (
          <button key={t} className={`detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'comptes-rendus' ? 'Comptes rendus' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'informations' && (
        <div className="info-grid">
          <div className="card">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Coordonnées</div>
            {[
              { label: 'Téléphone', value: patient.phone || '—', icon: Phone },
              { label: 'Email', value: patient.email || '—', icon: Mail },
              { label: 'Adresse', value: patient.address || '—', icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="info-row">
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon size={12} /> {label}
                </span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Antécédents médicaux</div>
            <div className="info-row">
              <span className="info-label">Antécédents</span>
              <span className="info-value">{patient.antecedents || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Allergies</span>
              <span className="info-value">{patient.allergies || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Examens</span>
              <span className="info-value" style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{patientExamens.length}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Comptes rendus</span>
              <span className="info-value" style={{ color: 'var(--success)', fontWeight: 700 }}>{patientRapports.length}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'examens' && (
        <div>
          {patientExamens.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Microscope size={24} /></div>
              <div className="empty-title">Aucun examen</div>
              <div className="empty-desc">Aucun examen enregistré pour ce patient.</div>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/doctor/examens')}>Ajouter un examen</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {patientExamens.map(ex => {
                const s = STATUS_CFG[ex.status] || STATUS_CFG.en_attente
                return (
                  <div key={ex.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate('/doctor/examens')}>
                    <div className="exam-thumb"><Microscope size={18} color="var(--accent-light)" /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{ex.type}</div>
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
          {patientExamens.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-title">Aucun historique</div>
            </div>
          ) : patientExamens.map((ex, i) => {
            const s = STATUS_CFG[ex.status] || STATUS_CFG.en_attente
            return (
              <div key={ex.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-soft)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Microscope size={13} color="var(--accent-light)" />
                  </div>
                  {i < patientExamens.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--border)', marginTop: '0.5rem' }} />}
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
      )}

      {tab === 'comptes-rendus' && (
        <div>
          {patientRapports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Microscope size={24} /></div>
              <div className="empty-title">Aucun compte rendu</div>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/doctor/comptes-rendus')}>Générer un rapport</button>
            </div>
          ) : patientRapports.map(r => (
            <div key={r.id} className="rapport-card">
              <div className="rapport-card-header">
                <div>
                  <div className="rapport-id">{r.id}</div>
                  <div className="rapport-title">{r.type}</div>
                  <div className="rapport-meta">{r.date}</div>
                </div>
                <span className="badge badge-success"><span className="badge-dot" />Validé</span>
              </div>
              <div className="rapport-conclusion">{r.conclusion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
