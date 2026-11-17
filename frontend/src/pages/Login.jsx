import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle, Stethoscope } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../styles/doctor.css'

const ROLE_PATH = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', secretaire: '/secretaire/dashboard' }

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    const result = login(form.email, form.password)
    if (result.success) {
      navigate(ROLE_PATH[result.user.role] || '/doctor/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-bg-grid" />

      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-logo">
            <div className="login-brand-icon"><Stethoscope size={22} color="#fff" /></div>
            <span className="login-brand-name">ENDOLIA</span>
          </div>
          <h1 className="login-tagline">
            La médecine de demain,<br /><span>assistée par l'IA</span>
          </h1>
          <p className="login-desc">
            Plateforme intelligente d'aide à la gastroscopie et à la coloscopie.
            Analysez, diagnostiquez et générez vos comptes rendus en quelques clics.
          </p>
          <div className="login-features">
            {['Détection IA des lésions endoscopiques', 'Gestion complète des dossiers patients', 'Génération automatique des comptes rendus', 'Calendrier et gestion des rendez-vous'].map(f => (
              <div key={f} className="login-feature">
                <div className="login-feature-dot" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-card animate-in">
          <h2 className="login-form-title">Bienvenue 👋</h2>
          <p className="login-form-sub">Connectez-vous à votre espace médical</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse e-mail</label>
              <div className="form-input-wrap">
                <Mail className="form-input-icon" />
                <input className="form-input" type="email" placeholder="votre@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="form-input-wrap">
                <Lock className="form-input-icon" />
                <input className="form-input" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            {error && <div className="form-error"><AlertCircle size={15} />{error}</div>}
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? <><div className="spinner" /> Connexion…</> : 'Se connecter'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem', fontWeight: 600 }}>Comptes de démo</div>
            {[
              { role: 'Admin', email: 'admin@endolia.com', pwd: 'admin123' },
              { role: 'Médecin', email: 'doctor@endolia.com', pwd: 'doctor123' },
              { role: 'Secrétaire', email: 'secretaire@endolia.com', pwd: 'secretaire123' },
            ].map(d => (
              <div key={d.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', cursor: 'pointer' }}
                onClick={() => setForm({ email: d.email, password: d.pwd })}>
                <span style={{ color: 'var(--text-400)' }}>{d.role}</span>
                <span style={{ color: 'var(--text-300)', fontFamily: 'monospace' }}>{d.email}</span>
              </div>
            ))}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-500)', marginTop: '0.5rem' }}>Cliquez sur un rôle pour le remplir automatiquement</div>
          </div>
        </div>
      </div>
    </div>
  )
}
