import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { Upload, Search, Brain, Clock, Plus } from 'lucide-react'

const STATUS_CFG = {
  en_analyse: { label: 'En analyse', cls: 'badge-warning' },
  termine: { label: 'Terminé', cls: 'badge-success' },
  en_attente: { label: 'En attente', cls: 'badge-blue' },
}
const TYPES = ['Coloscopie', 'Gastroscopie']

export default function Examens() {
  const navigate = useNavigate()
  const { examens, patients, addExamen } = useApp()
  const { currentUser } = useAuth()
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [examenForm, setExamenForm] = useState({ patientId: '', type: 'Coloscopie' })
  const [success, setSuccess] = useState('')

  const myPatients = patients.filter(p => p.doctorId === currentUser?.id)
  const myExamens = examens.filter(e => e.doctorId === currentUser?.id)

  const onDrop = useCallback(files => { if (files[0]) setUploadedFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [], 'video/*': [] }, maxFiles: 1 })

  const handleCreateExamen = () => {
    if (!examenForm.patientId) return
    const p = patients.find(p => p.id === examenForm.patientId)
    const now = new Date()
    addExamen({
      type: examenForm.type,
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      patientId: p.id,
      patient: p.name,
      doctorId: currentUser?.id,
      status: 'en_attente',
    })
    setSuccess('Examen enregistré !')
    setUploadedFile(null)
    setShowUpload(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const filtered = myExamens.filter(e => {
    const mf = filter === 'tous' || e.status === filter
    const ms = e.patient.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Examens endoscopiques</h1>
          <p>Importez et analysez les examens de vos patients.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(v => !v)}>
          <Upload size={16} /> Importer un examen
        </button>
      </div>

      {success && (
        <div className="form-error animate-in" style={{ background: 'var(--success-soft)', borderColor: 'rgba(16,185,129,.3)', color: '#34d399', marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      {showUpload && (
        <div className="card animate-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>Importer un nouvel examen</h3>
          <div className="section-grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
            <div>
              <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-over' : ''}`}>
                <input {...getInputProps()} />
                <div className="upload-zone-icon"><Upload /></div>
                {uploadedFile ? (
                  <>
                    <div className="upload-zone-title" style={{ color: 'var(--success)' }}>✓ {uploadedFile.name}</div>
                    <div className="upload-zone-sub">{(uploadedFile.size / 1024 / 1024).toFixed(2)} Mo</div>
                  </>
                ) : (
                  <>
                    <div className="upload-zone-title">Glissez vos images ou vidéos</div>
                    <div className="upload-zone-sub">JPG, PNG, DICOM, MP4, AVI</div>
                  </>
                )}
                <div className="upload-zone-formats">
                  {['JPG', 'PNG', 'DICOM', 'MP4'].map(f => <span key={f} className="format-pill">{f}</span>)}
                </div>
              </div>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-input" value={examenForm.patientId} onChange={e => setExamenForm({ ...examenForm, patientId: e.target.value })}>
                  <option value="">Sélectionner un patient</option>
                  {myPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type d'examen</label>
                <select className="form-input" value={examenForm.type} onChange={e => setExamenForm({ ...examenForm, type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => { setShowUpload(false); setUploadedFile(null) }}>Annuler</button>
                <button className="btn btn-primary" disabled={!examenForm.patientId} onClick={handleCreateExamen}>
                  <Plus size={15} /> Enregistrer l'examen
                </button>
                {uploadedFile && examenForm.patientId && (
                  <button className="btn btn-secondary" onClick={() => navigate('/doctor/analyse')}>
                    <Brain size={15} /> Analyser avec IA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search className="search-bar-icon" />
          <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {[{ key: 'tous', label: 'Tous' }, { key: 'en_analyse', label: 'En analyse' }, { key: 'termine', label: 'Terminés' }, { key: 'en_attente', label: 'En attente' }].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Mes examens</span>
          <span className="table-count">{filtered.length} examen{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <table>
          <thead><tr><th>Examen</th><th>Patient</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>Aucun examen trouvé</td></tr>
            ) : filtered.map(ex => {
              const s = STATUS_CFG[ex.status] || STATUS_CFG.en_attente
              return (
                <tr key={ex.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="exam-thumb"><span className="exam-thumb-placeholder">🔬</span></div>
                      <div>
                        <div className="td-primary">{ex.type}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>{ex.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-200)' }}>{ex.patient}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-300)' }}>
                      <Clock size={13} /> {ex.date} {ex.time ? `à ${ex.time}` : ''}
                    </span>
                  </td>
                  <td><span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/doctor/analyse')}>
                      <Brain size={13} /> Analyser
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
