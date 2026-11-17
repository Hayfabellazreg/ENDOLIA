import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle, Stethoscope } from 'lucide-react'
import '../../styles/doctor.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    if (form.email === 'doctor@endolia.com' && form.password === 'doctor123') {
      navigate('/doctor/dashboard')
    } else {
      setError('Email ou mot de passe incorrect.')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-bg-grid" />

      {/* Left branding */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-logo">
            <div className="login-brand-icon">
              <Stethoscope size={22} color="#fff" />
            </div>
            <span className="login-brand-name">ENDOLIA</span>
          </div>

          <h1 className="login-tagline">
            La médecine de demain,<br />
            <span>assistée par l'IA</span>
          </h1>
          <p className="login-desc">
            Plateforme intelligente d'aide à la gastroscopie et à la coloscopie.
            Analysez, diagnostiquez et générez vos comptes rendus en quelques clics.
          </p>

          <div className="login-features">
            {[
              'Détection IA des lésions endoscopiques',
              'Gestion complète des dossiers patients',
              'Génération automatique des comptes rendus',
              'Calendrier et gestion des rendez-vous',
            ].map(f => (
              <div key={f} className="login-feature">
                <div className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="login-right">
        <div className="login-form-card animate-in">
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 className="login-form-title">Bienvenue 👋</h2>
            <p className="login-form-sub">Connectez-vous à votre espace médical</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse e-mail</label>
              <div className="form-input-wrap">
                <Mail className="form-input-icon" />
                <input
                  className="form-input"
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="form-input-wrap">
                <Lock className="form-input-icon" />
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="form-error">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" /> Connexion en cours…</>
              ) : 'Se connecter'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-500)', textAlign: 'center' }}>
            Demo : <span style={{ color: 'var(--text-300)' }}>doctor@endolia.com</span> / <span style={{ color: 'var(--text-300)' }}>doctor123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
