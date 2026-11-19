import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Brain, CheckCircle, AlertCircle, Zap, FileText,
  RotateCcw, Video, Download, Eye, Play, User, Clock
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import {
  analyzeUpload,
  analyzeSample,
  getAnalysisStatus,
  getPdfUrl,
  getVideoUrl
} from '../../api'

export default function AnalyseIA() {
  const { patients, addExamen, addRapport } = useApp()
  const { currentUser } = useAuth()

  const [step, setStep] = useState('upload') // 'upload' | 'analysing' | 'result'
  const [file, setFile] = useState(null)
  const [isDemoVideo, setIsDemoVideo] = useState(false)
  const [preview, setPreview] = useState(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [confThreshold, setConfThreshold] = useState(0.25)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('En attente...')
  const [taskId, setTaskId] = useState(null)
  const [taskData, setTaskData] = useState(null)
  const [logs, setLogs] = useState([])
  const [imageTab, setImageTab] = useState('resultat-ia')
  const [savedToDossier, setSavedToDossier] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // Local storage for history of completed analyses
  const [history, setHistory] = useState(() => {
    try {
      const h = localStorage.getItem('endolia_ai_history')
      return h ? JSON.parse(h) : [
        {
          id: 'demo-1',
          patientName: 'Sofia Trabelsi',
          patientId: 'P-001',
          date: '03/04/2025',
          confidence: 92,
          count: 1,
          videoName: 'coloscopy_sigmoide.mp4',
        },
        {
          id: 'demo-2',
          patientName: 'Youssef Hammami',
          patientId: 'P-003',
          date: '15/03/2025',
          confidence: 78,
          count: 2,
          videoName: 'colon_traverse.mp4',
        }
      ]
    } catch {
      return []
    }
  })

  // Set default patient if available
  useEffect(() => {
    if (patients?.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id)
    }
  }, [patients, selectedPatientId])

  const addLog = useCallback((msg) => {
    const time = new Date().toLocaleTimeString('fr-FR')
    setLogs((prev) => [...prev.slice(-40), `[${time}] ${msg}`])
  }, [])

  const onDrop = useCallback((files) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    setIsDemoVideo(false)
    setErrorMsg(null)
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv']
    },
    maxFiles: 1,
  })

  const useSampleVideo = () => {
    setIsDemoVideo(true)
    setFile(null)
    setPreview(null)
    setErrorMsg(null)
  }

  // Polling loop for active analysis
  const pollIntervalRef = useRef(null)

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  const startAnalysis = async () => {
    if (!file && !isDemoVideo) {
      setErrorMsg('Veuillez sélectionner un fichier ou utiliser la vidéo de démonstration.')
      return
    }

    const patient = patients.find((p) => p.id === selectedPatientId)
    const patientName = patient ? patient.name : (selectedPatientId || 'Patient P001')

    setStep('analysing')
    setProgress(5)
    setLogs([])
    setStatusMessage('Connexion au serveur IA...')
    addLog(`Démarrage de l'analyse — Patient: ${patientName} (${selectedPatientId || 'P001'})`)
    addLog(`Seuil de confiance YOLOv8: ${(confThreshold * 100).toFixed(0)}%`)

    try {
      let res
      if (isDemoVideo) {
        addLog("Chargement de la vidéo de démonstration (sample_polyp_video.mp4)...")
        res = await analyzeSample(selectedPatientId || 'P001', confThreshold)
      } else {
        addLog(`Téléversement du fichier : ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} Mo)...`)
        const fd = new FormData()
        fd.append('file', file)
        fd.append('patient_id', selectedPatientId || 'P001')
        fd.append('conf', confThreshold.toString())
        res = await analyzeUpload(fd)
      }

      const id = res.data.task_id
      setTaskId(id)
      addLog(`Tâche IA initialisée (ID: ${id})`)

      // Poll status
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await getAnalysisStatus(id)
          const data = statusRes.data
          setTaskData(data)
          setProgress(data.progress || 10)
          setStatusMessage(data.message || 'Analyse en cours...')

          if (data.captures && data.captures.length > 0) {
            const lastCap = data.captures[data.captures.length - 1]
            addLog(`Polype détecté! #${lastCap.id} (conf=${(lastCap.conf * 100).toFixed(1)}%, image=${lastCap.frame || 1})`)
          }

          if (data.status === 'completed') {
            stopPolling()
            setProgress(100)
            addLog("Analyse terminée avec succès! Rapport PDF et annotations générés.")
            setTimeout(() => {
              setStep('result')
              // Save to history
              const maxConf = data.captures?.length > 0
                ? Math.round(Math.max(...data.captures.map((c) => c.conf)) * 100)
                : 90
              const historyItem = {
                id,
                patientName,
                patientId: selectedPatientId || 'P001',
                date: new Date().toLocaleDateString('fr-FR'),
                confidence: maxConf,
                count: data.captures?.length || 0,
                videoName: data.video_name || (isDemoVideo ? 'sample_polyp_video.mp4' : file?.name),
                taskData: data
              }
              setHistory((prev) => {
                const next = [historyItem, ...prev.filter((h) => h.id !== id)]
                try { localStorage.setItem('endolia_ai_history', JSON.stringify(next)) } catch {}
                return next
              })
            }, 500)
          } else if (data.status === 'error') {
            stopPolling()
            setErrorMsg(data.error || 'Erreur lors de l’analyse IA.')
            addLog(`Erreur: ${data.error}`)
            setStep('upload')
          }
        } catch (err) {
          console.error('Polling error', err)
        }
      }, 700)
    } catch (err) {
      console.error(err)
      setErrorMsg(err.response?.data?.detail || err.message || 'Erreur de connexion au serveur IA')
      setStep('upload')
    }
  }

  const reset = () => {
    stopPolling()
    setStep('upload')
    setFile(null)
    setIsDemoVideo(false)
    setPreview(null)
    setProgress(0)
    setTaskId(null)
    setTaskData(null)
    setSavedToDossier(false)
    setErrorMsg(null)
  }

  const handleSaveToPatient = () => {
    if (!taskData) return
    const p = patients.find((pt) => pt.id === selectedPatientId)
    const patientName = p ? p.name : (selectedPatientId || 'Patient')
    const maxConf = taskData.captures?.length > 0
      ? Math.round(Math.max(...taskData.captures.map((c) => c.conf)) * 100)
      : 85

    const examen = addExamen({
      type: 'Coloscopie - IA YOLOv8',
      date: new Date().toLocaleDateString('fr-FR'),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      patientId: selectedPatientId,
      patient: patientName,
      doctorId: currentUser?.id || 'USR-002',
      status: 'termine',
    })

    addRapport({
      examenId: examen.id,
      patientId: selectedPatientId,
      patient: patientName,
      doctorId: currentUser?.id || 'USR-002',
      type: 'Coloscopie - Détection de Polypes',
      conclusion: `Analyse assistée par IA YOLOv8. ${taskData.captures?.length || 0} lésion(s) polypoïde(s) détectée(s) avec confiance maximale de ${maxConf}%. Compte-rendu médical PDF généré.`,
      status: 'valide',
    })

    setSavedToDossier(true)
  }

  // Calculate high-level summary metrics
  const captures = taskData?.captures || []
  const maxConfidence = captures.length > 0
    ? Math.round(Math.max(...captures.map((c) => c.conf)) * 100)
    : 0
  const avgAreaPct = captures.length > 0
    ? (captures.reduce((acc, c) => acc + (c.pct_image || 0), 0) / captures.length).toFixed(1)
    : '0.0'

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>⚡</span>
            <h1>Analyse IA — Détection de Polypes (YOLOv8)</h1>
          </div>
          <p>
            Analyse d'endoscopie par modèle de segmentation YOLOv8 entraîné · Génération automatique de compte-rendu médical PDF
          </p>
        </div>
        {step !== 'upload' && (
          <button className="btn btn-secondary btn-sm" onClick={reset}>
            <RotateCcw size={14} /> Nouvelle analyse
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="card" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', marginBottom: '1.5rem', color: '#f87171' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={18} />
            <div><strong>Erreur :</strong> {errorMsg}</div>
          </div>
        </div>
      )}

      {/* ──────────────── STEP 1: UPLOAD & CONFIGURATION ──────────────── */}
      {step === 'upload' && (
        <div className="section-grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
          <div>
            {/* 1. Données à analyser */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <User size={16} color="var(--accent-light)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>1. Sélection du Patient</h3>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-400)', display: 'block', marginBottom: '0.35rem' }}>
                    Dossier Patient associé
                  </label>
                  <select
                    className="input-select"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius)', background: 'var(--bg-card)', color: 'var(--text-100)', border: '1px solid var(--border)' }}
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    {patients?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) — {p.age} ans
                      </option>
                    ))}
                    <option value="P-NOUVEAU">Nouveau patient / ID externe</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Zone d'importation du média */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={16} color="var(--accent-light)" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>2. Vidéo ou Image Endoscopique</h3>
                </div>

                <button
                  type="button"
                  className={`btn btn-sm ${isDemoVideo ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={useSampleVideo}
                  style={{ gap: '0.4rem' }}
                >
                  <Play size={13} /> Vidéo démo (sample_polyp.mp4)
                </button>
              </div>

              {isDemoVideo ? (
                <div
                  style={{
                    border: '2px solid var(--accent)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2.5rem 2rem',
                    textAlign: 'center',
                    background: 'var(--accent-soft)',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <Video size={40} color="var(--accent-light)" />
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-light)', marginBottom: '0.3rem' }}>
                    Vidéo de démonstration prête
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-300)' }}>
                    Fichier : <code>sample_polyp_video.mp4</code> (Coloscopie réelle avec lésions polypoïdes)
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1rem' }}
                    onClick={() => setIsDemoVideo(false)}
                  >
                    Changer pour importer mon fichier
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`upload-zone ${isDragActive ? 'drag-over' : ''}`}
                  style={{ marginBottom: '1rem' }}
                >
                  <input {...getInputProps()} />
                  <div className="upload-zone-icon"><Upload /></div>
                  {file ? (
                    <>
                      <div className="upload-zone-title" style={{ color: 'var(--success)' }}>
                        ✓ {file.name}
                      </div>
                      <div className="upload-zone-sub">
                        {(file.size / 1024 / 1024).toFixed(2)} Mo · Prêt pour l'analyse
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="upload-zone-title">Glissez votre image ou vidéo ici</div>
                      <div className="upload-zone-sub">
                        Formats supportés :<br />
                        <strong>Images :</strong> JPG, PNG, WEBP · <strong>Vidéos :</strong> MP4, AVI, MOV
                      </div>
                      <div className="upload-zone-formats">
                        {['MP4', 'AVI', 'JPG', 'PNG', 'DICOM'].map((f) => (
                          <span key={f} className="format-pill">{f}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bouton Lancement */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem 1.5rem', fontSize: '1rem', fontWeight: 600 }}
              onClick={startAnalysis}
              disabled={!file && !isDemoVideo}
            >
              <Brain size={18} /> Lancer l'analyse endoscopique
            </button>
          </div>

          {/* Right column: Historique des analyses */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={16} color="var(--accent-light)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Analyses récentes</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((a) => (
                <div key={a.id} className="card" style={{ padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-100)' }}>
                        {a.patientName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-400)' }}>
                        {a.patientId} · {a.date} {a.videoName ? `· ${a.videoName}` : ''}
                      </div>
                    </div>
                    <span className="badge badge-warning">
                      <span className="badge-dot" />
                      {a.count > 0 ? `${a.count} Détecté(s)` : 'Négatif'}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${a.confidence}%` }} />
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Confiance max : <strong style={{ color: 'var(--success)' }}>{a.confidence}%</strong></span>
                    {a.taskData && (
                      <a
                        href={getPdfUrl(a.id)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <FileText size={12} /> Rapport PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── STEP 2: ANALYSING (REAL-TIME PROGRESS & LOGS) ──────────────── */}
      {step === 'analysing' && (
        <div className="card animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: 76,
                height: 76,
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'spin 1.8s linear infinite',
                border: '3px solid var(--accent)',
                borderTopColor: 'transparent'
              }}
            >
              <Brain size={34} color="var(--accent-light)" style={{ animation: 'none' }} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Analyse en direct par YOLOv8...
            </h2>
            <p style={{ color: 'var(--text-300)', fontSize: '0.92rem' }}>
              {statusMessage}
            </p>
          </div>

          <div className="progress-bar" style={{ height: 10, marginBottom: '0.8rem' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-400)', marginBottom: '1.5rem' }}>
            <span>Traitement des images endoscopiques</span>
            <strong style={{ color: 'var(--accent-light)' }}>{Math.round(progress)} %</strong>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {[
              { name: 'Initialisation', pct: 10 },
              { name: 'Inférence YOLOv8', pct: 40 },
              { name: 'Segmentation', pct: 75 },
              { name: 'Rapport PDF', pct: 95 }
            ].map((s) => (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: progress >= s.pct ? 'var(--success)' : 'var(--text-500)'
                }}
              >
                {progress >= s.pct ? <CheckCircle size={14} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid var(--border)' }} />}
                {s.name}
              </div>
            ))}
          </div>

          {/* Journal d'analyse en direct (terminal log) */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Journal d'analyse en direct
            </div>
            <div
              style={{
                background: '#070d18',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '0.85rem 1rem',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.76rem',
                color: '#38bdf8',
                maxHeight: 160,
                overflowY: 'auto',
                lineHeight: 1.5
              }}
            >
              {logs.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── STEP 3: RESULTS ──────────────── */}
      {step === 'result' && taskData && (
        <div className="animate-in">
          {/* Header alert */}
          <div
            className="card"
            style={{
              background: 'rgba(16,185,129,0.08)',
              borderColor: 'rgba(16,185,129,0.3)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={22} color="var(--success)" />
              <div>
                <strong style={{ color: 'var(--success)', fontSize: '0.95rem' }}>
                  Analyse terminée avec succès !
                </strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-300)', marginTop: '0.1rem' }}>
                  {captures.length > 0
                    ? `${captures.length} lésion(s) polypoïde(s) identifiée(s) par le modèle de segmentation.`
                    : 'Aucun polype détecté au-dessus du seuil configuré.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <a
                href={getPdfUrl(taskId)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem', textDecoration: 'none' }}
              >
                <FileText size={14} /> Ouvrir le Rapport PDF
              </a>

              {!taskData.is_image && (
                <a
                  href={getVideoUrl(taskId)}
                  download
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.4rem', textDecoration: 'none' }}
                >
                  <Download size={14} /> Vidéo Annotée
                </a>
              )}
            </div>
          </div>

          {/* Comparative Detail Tabs */}
          <div className="detail-tabs" style={{ marginBottom: '1.5rem' }}>
            {[
              { id: 'resultat-ia', label: 'Résultat IA (Segmentation)' },
              { id: 'originale', label: 'Vue originale' },
              { id: 'captures', label: `Captures & Zoom (${captures.length})` }
            ].map((t) => (
              <button
                key={t.id}
                className={`detail-tab ${imageTab === t.id ? 'active' : ''}`}
                onClick={() => setImageTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="section-grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
            {/* Visualizer column */}
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#000' }}>
                {imageTab === 'resultat-ia' && (
                  taskData.is_image ? (
                    <img
                      src={`/api/media/${taskId}/annotated`}
                      alt="Résultat IA"
                      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 440, objectFit: 'contain' }}
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      loop
                      src={getVideoUrl(taskId)}
                      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 440 }}
                    />
                  )
                )}

                {imageTab === 'originale' && (
                  taskData.is_image ? (
                    <img
                      src={`/api/media/${taskId}/original`}
                      alt="Original"
                      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 440, objectFit: 'contain' }}
                    />
                  ) : (
                    <video
                      controls
                      src={preview || (file ? URL.createObjectURL(file) : getVideoUrl(taskId))}
                      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 440 }}
                    />
                  )
                )}

                {imageTab === 'captures' && (
                  <div style={{ padding: '1.25rem', maxHeight: 440, overflowY: 'auto' }}>
                    {captures.length === 0 ? (
                      <p style={{ color: 'var(--text-400)', textAlign: 'center', padding: '2rem' }}>
                        Aucune capture isolée.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.85rem' }}>
                        {captures.map((c) => (
                          <div
                            key={c.id}
                            style={{
                              background: '#0a1628',
                              borderRadius: 'var(--radius)',
                              padding: '0.5rem',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <img
                              src={c.crop_url}
                              alt={`Capture ${c.id}`}
                              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.4rem' }}
                            />
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-300)' }}>
                              <div><strong>#{c.id}</strong> (T: {c.time ? `${c.time.toFixed(1)}s` : '0s'})</div>
                              <div style={{ color: 'var(--success)', fontWeight: 600 }}>
                                {(c.conf * 100).toFixed(0)} % conf.
                              </div>
                              <div style={{ color: 'var(--text-500)', fontSize: '0.68rem' }}>
                                {Math.round(c.w_px)} × {Math.round(c.h_px)} px
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons below viewer */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={getPdfUrl(taskId)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <FileText size={14} /> Voir le compte-rendu PDF complet
                </a>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleSaveToPatient}
                  disabled={savedToDossier}
                >
                  <CheckCircle size={14} color={savedToDossier ? 'var(--success)' : 'currentColor'} />
                  {savedToDossier ? '✓ Enregistré au dossier' : 'Enregistrer dans le dossier patient'}
                </button>
              </div>
            </div>

            {/* Results Details Card */}
            <div>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
                  Détails de la détection IA
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-400)', marginBottom: '0.4rem' }}>
                    Indice de confiance maximal
                  </div>
                  <div className="confidence-value" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                    {maxConfidence} %
                  </div>
                  <div className="confidence-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="confidence-fill" style={{ width: `${maxConfidence}%` }} />
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-label">Modèle utilisé</span>
                  <span className="info-value">YOLOv8n-Seg (Polyp Segmentation)</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Nombre de lésions</span>
                  <span className="info-value">{captures.length} capture(s)</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Surface relative moy.</span>
                  <span className="info-value">{avgAreaPct} % de l'image</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Taille approximative</span>
                  <span className="info-value">
                    {captures.length > 0 ? `${Math.round(captures[0].w_px)} × ${Math.round(captures[0].h_px)} px` : 'N/A'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Type morphologique</span>
                  <span className="info-value">Lésion sessile / Polype colique</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Fichier source</span>
                  <span className="info-value">{taskData.video_name}</span>
                </div>
              </div>

              {/* Warning note */}
              <div className="card" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-400)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--warning)' }}>Aide au diagnostic endoscopique.</strong>
                    {' '}Ce résultat est généré par intelligence artificielle pour assister le praticien. La décision thérapeutique et le geste d'exérèse restent sous l'entière responsabilité du gastro-entérologue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
