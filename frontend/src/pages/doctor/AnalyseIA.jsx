import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Brain, CheckCircle, AlertCircle, Zap, FileText, RotateCcw } from 'lucide-react'
import { analyses } from '../../data/mockData'

const MOCK_RESULT = {
  confidence: 92,
  localisation: 'Côlon sigmoïde',
  taille: '8 mm',
  surface: '2.3 %',
  forme: 'Ovalaire',
  type: 'Polype sessile',
}

const steps = ['upload', 'analysing', 'result']

export default function AnalyseIA() {
  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progress, setProgress] = useState(0)
  const [imageTab, setImageTab] = useState('originale')
  const timerRef = useRef(null)

  const onDrop = useCallback(files => {
    const f = files[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 1,
  })

  const startAnalysis = () => {
    setStep('analysing')
    setProgress(0)
    let p = 0
    timerRef.current = setInterval(() => {
      p += Math.random() * 15
      if (p >= 100) {
        clearInterval(timerRef.current)
        setProgress(100)
        setTimeout(() => setStep('result'), 400)
      } else {
        setProgress(Math.min(p, 95))
      }
    }, 200)
  }

  const reset = () => {
    setStep('upload')
    setFile(null)
    setPreview(null)
    setProgress(0)
  }

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Analyse IA</h1>
          <p>Importez une image ou vidéo endoscopique et lancez l'analyse par intelligence artificielle.</p>
        </div>
        {step !== 'upload' && (
          <button className="btn btn-secondary btn-sm" onClick={reset}>
            <RotateCcw size={14} /> Nouvelle analyse
          </button>
        )}
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="section-grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
          <div>
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-over' : ''}`}
              style={{ marginBottom: '1rem' }}>
              <input {...getInputProps()} />
              <div className="upload-zone-icon"><Upload /></div>
              {file ? (
                <>
                  <div className="upload-zone-title" style={{ color: 'var(--success)' }}>✓ {file.name}</div>
                  <div className="upload-zone-sub">{(file.size / 1024 / 1024).toFixed(2)} Mo · Prêt pour l'analyse</div>
                </>
              ) : (
                <>
                  <div className="upload-zone-title">Glissez votre image ou vidéo ici</div>
                  <div className="upload-zone-sub">Formats supportés :<br />JPG, PNG, DICOM, MP4, AVI</div>
                  <div className="upload-zone-formats">
                    {['JPG', 'PNG', 'DICOM', 'MP4', 'AVI'].map(f => (
                      <span key={f} className="format-pill">{f}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {file && (
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={startAnalysis}>
                <Brain size={16} /> Lancer l'analyse IA
              </button>
            )}
          </div>

          {/* Previous analyses */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Analyses récentes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analyses.map(a => (
                <div key={a.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-100)' }}>{a.patient}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-400)' }}>{a.examenId} · {a.date}</div>
                    </div>
                    <span className="badge badge-warning"><span className="badge-dot" />Détecté</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${a.confidence}%` }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Confiance</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>{a.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Analysing */}
      {step === 'analysing' && (
        <div className="card animate-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: 72, height: 72, margin: '0 auto 1.5rem', borderRadius: '50%',
            background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'spin 1.5s linear infinite', border: '3px solid var(--accent)', borderTopColor: 'transparent' }}>
            <Brain size={30} color="var(--accent-light)" style={{ animation: 'none' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Analyse en cours…</h2>
          <p style={{ color: 'var(--text-400)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Le modèle IA analyse votre image endoscopique. Cela peut prendre quelques secondes.
          </p>
          <div className="progress-bar" style={{ height: 8, marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-400)' }}>
            {progress < 30 ? 'Chargement de l\'image…' :
             progress < 60 ? 'Extraction des caractéristiques…' :
             progress < 90 ? 'Détection des zones suspectes…' :
             'Génération du rapport…'}
            {' '}<strong style={{ color: 'var(--accent-light)' }}>{Math.round(progress)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {['Prétraitement', 'Segmentation', 'Classification', 'Post-traitement'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: progress > i * 25 ? 'var(--success)' : 'var(--text-500)' }}>
                {progress > i * 25 ? <CheckCircle size={12} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid var(--border)' }} />}
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && (
        <div className="animate-in">
          {/* Image tabs */}
          <div className="detail-tabs" style={{ marginBottom: '1.5rem' }}>
            {['originale', 'amelioree', 'resultat-ia'].map(t => (
              <button key={t} className={`detail-tab ${imageTab === t ? 'active' : ''}`}
                onClick={() => setImageTab(t)}>
                {t === 'originale' ? 'Image originale' : t === 'amelioree' ? 'Image améliorée' : 'Résultat IA'}
              </button>
            ))}
          </div>

          <div className="section-grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
            {/* Image viewer */}
            <div>
              <div className="ai-image-viewer">
                {preview ? (
                  <img src={preview} alt="Examen endoscopique" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a1628, #0f2040)', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '4/3' }}>
                    <span style={{ fontSize: '4rem' }}>🔬</span>
                  </div>
                )}
                {imageTab === 'resultat-ia' && (
                  <div className="ai-annotation" style={{ width: '25%', height: '30%', top: '45%', left: '38%' }} />
                )}
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                  <span className="badge badge-success"><Zap size={10} /> IA Active</span>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm"><FileText size={13} /> Voir le rapport</button>
                <button className="btn btn-primary btn-sm"><CheckCircle size={13} /> Valider le diagnostic</button>
              </div>
            </div>

            {/* Results */}
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
                  Détails de la détection
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-400)', marginBottom: '0.5rem' }}>Confiance du modèle</div>
                  <div className="confidence-value">{MOCK_RESULT.confidence} %</div>
                  <div className="confidence-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="confidence-fill" style={{ width: `${MOCK_RESULT.confidence}%` }} />
                  </div>
                </div>

                {[
                  { label: 'Localisation', value: MOCK_RESULT.localisation },
                  { label: 'Taille estimée', value: MOCK_RESULT.taille },
                  { label: 'Surface relative', value: MOCK_RESULT.surface },
                  { label: 'Forme', value: MOCK_RESULT.forme },
                  { label: 'Type suspecté', value: MOCK_RESULT.type },
                ].map(({ label, value }) => (
                  <div key={label} className="info-row">
                    <span className="info-label">{label}</span>
                    <span className="info-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-400)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--warning)' }}>Aide à la visualisation uniquement.</strong>
                    {' '}Ce résultat est généré automatiquement et ne se substitue pas au diagnostic médical du professionnel de santé.
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
