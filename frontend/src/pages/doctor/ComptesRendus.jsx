import { useState } from 'react'
import { FilePlus, Download, Eye, CheckCircle, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

export default function ComptesRendus() {
  const { rapports, examens, patients, addRapport } = useApp()
  const { currentUser } = useAuth()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ patientId: '', examenId: '', type: 'Coloscopie', conclusion: '' })
  const [success, setSuccess] = useState('')

  const myRapports = rapports.filter(r => r.doctorId === currentUser?.id)
  const myExamens = examens.filter(e => e.doctorId === currentUser?.id)
  const myPatients = patients.filter(p => p.doctorId === currentUser?.id)

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.patientId || !form.conclusion.trim()) return
    const p = patients.find(p => p.id === form.patientId)
    addRapport({
      examenId: form.examenId || '—',
      patientId: form.patientId,
      patient: p?.name || '',
      doctorId: currentUser?.id,
      type: form.type,
      conclusion: form.conclusion,
    })
    setSuccess('Compte rendu enregistré avec succès !')
    setForm({ patientId: '', examenId: '', type: 'Coloscopie', conclusion: '' })
    setShowNew(false)
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Comptes rendus</h1>
          <p>Rédigez et consultez les rapports médicaux.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(v => !v)}>
          <FilePlus size={16} /> Nouveau compte rendu
        </button>
      </div>

      {success && (
        <div className="form-error animate-in" style={{ background: 'var(--success-soft)', borderColor: 'rgba(16,185,129,.3)', color: '#34d399', marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      {showNew && (
        <div className="card animate-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Nouveau compte rendu</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNew(false)}><X size={15} /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="section-grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Patient *</label>
                <select className="form-input" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required>
                  <option value="">Sélectionner un patient</option>
                  {myPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Examen associé</label>
                <select className="form-input" value={form.examenId} onChange={e => setForm({ ...form, examenId: e.target.value })}>
                  <option value="">Sans examen spécifique</option>
                  {myExamens.filter(e => !form.patientId || e.patientId === form.patientId).map(e => (
                    <option key={e.id} value={e.id}>{e.id} — {e.type} · {e.patient}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option>Coloscopie</option>
                  <option>Gastroscopie</option>
                  <option>Consultation</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Conclusion médicale *</label>
              <textarea className="form-input" rows={5} placeholder="Rédigez votre conclusion…" required
                value={form.conclusion} onChange={e => setForm({ ...form, conclusion: e.target.value })}
                style={{ resize: 'vertical', lineHeight: 1.7 }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary"><CheckCircle size={15} /> Valider et enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: myRapports.length, cls: 'badge-blue' },
          { label: 'Validés', value: myRapports.length, cls: 'badge-success' },
        ].map(s => (
          <span key={s.label} className={`badge ${s.cls}`} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
            <span className="badge-dot" /> {s.label} : {s.value}
          </span>
        ))}
      </div>

      {/* Reports */}
      {myRapports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FilePlus size={24} /></div>
          <div className="empty-title">Aucun compte rendu</div>
          <div className="empty-desc">Cliquez sur "Nouveau compte rendu" pour en créer un.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...myRapports].reverse().map(r => (
            <div key={r.id} className="rapport-card">
              <div className="rapport-card-header">
                <div>
                  <div className="rapport-id">{r.id} {r.examenId && r.examenId !== '—' ? `· ${r.examenId}` : ''}</div>
                  <div className="rapport-title">{r.type} — {r.patient}</div>
                  <div className="rapport-meta">{r.date}</div>
                </div>
                <span className="badge badge-success"><span className="badge-dot" />Validé</span>
              </div>
              <div className="rapport-conclusion">{r.conclusion}</div>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button className="btn btn-secondary btn-sm"><Eye size={13} /> Consulter</button>
                <button className="btn btn-secondary btn-sm"><Download size={13} /> PDF</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
