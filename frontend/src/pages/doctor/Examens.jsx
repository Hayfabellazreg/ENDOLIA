import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, Search, Filter, Eye, Brain, Clock } from 'lucide-react'
import { examens } from '../../data/mockData'

const statusConfig = {
  en_analyse: { label: 'En analyse', cls: 'badge-warning' },
  termine:    { label: 'Terminé',    cls: 'badge-success' },
  en_attente: { label: 'En attente', cls: 'badge-blue' },
}

export default function Examens() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const onDrop = useCallback(files => {
    if (files[0]) setUploadedFile(files[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 1,
  })

  const filtered = examens.filter(e => {
    const matchFilter = filter === 'tous' || e.status === filter
    const matchSearch = e.patient.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Examens endoscopiques</h1>
          <p>Consultez et analysez les examens de vos patients.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(v => !v)}>
          <Upload size={16} /> Importer un examen
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div style={{ marginBottom: '2rem' }} className="animate-in">
          <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-over' : ''}`}>
            <input {...getInputProps()} />
            <div className="upload-zone-icon"><Upload /></div>
            {uploadedFile ? (
              <>
                <div className="upload-zone-title" style={{ color: 'var(--success)' }}>✓ Fichier sélectionné</div>
                <div className="upload-zone-sub">{uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} Mo)</div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}
                  onClick={e => { e.stopPropagation(); navigate('/doctor/analyse') }}>
                  <Brain size={14} /> Lancer l'analyse IA
                </button>
              </>
            ) : (
              <>
                <div className="upload-zone-title">Glissez vos images ou vidéos ici</div>
                <div className="upload-zone-sub">
                  Ou cliquez pour sélectionner depuis votre ordinateur.<br />
                  Formats acceptés : JPG, PNG, DICOM, MP4, AVI
                </div>
                <div className="upload-zone-formats">
                  {['JPG', 'PNG', 'DICOM', 'MP4', 'AVI'].map(f => (
                    <span key={f} className="format-pill">{f}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search className="search-bar-icon" />
          <input
            placeholder="Rechercher un examen, patient…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {[
            { key: 'tous', label: 'Tous' },
            { key: 'en_analyse', label: 'En analyse' },
            { key: 'termine', label: 'Terminés' },
            { key: 'en_attente', label: 'En attente' },
          ].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Examens list */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Liste des examens</span>
          <span className="table-count">{filtered.length} examen{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Examen</th>
              <th>Patient</th>
              <th>Date et heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ex => {
              const s = statusConfig[ex.status]
              return (
                <tr key={ex.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="exam-thumb"><span className="exam-thumb-placeholder">🔬</span></div>
                      <div>
                        <div className="td-primary">{ex.type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>{ex.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-200)' }}>{ex.patient}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-300)' }}>
                      <Clock size={13} /> {ex.date} à {ex.time}
                    </div>
                  </td>
                  <td><span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/doctor/analyse')}>
                        <Brain size={13} /> Analyser
                      </button>
                      <button className="btn btn-ghost btn-sm">
                        <Eye size={13} /> Voir
                      </button>
                    </div>
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
