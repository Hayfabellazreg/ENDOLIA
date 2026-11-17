import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { UserPlus, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'doctor', label: 'Médecin' },
  { value: 'secretaire', label: 'Secrétaire médicale' },
]

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']

export default function AdminUsers() {
  const { getUsers, addUser, deleteUser } = useApp()
  const [users, setUsers] = useState(() => getUsers().filter(u => u.role !== 'admin'))
  const [showForm, setShowForm] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [filter, setFilter] = useState('tous')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'doctor', specialty: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  const refresh = () => setUsers(getUsers().filter(u => u.role !== 'admin'))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Le nom est requis'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide'
    if (form.password.length < 6) e.password = 'Minimum 6 caractères'
    if (users.find(u => u.email === form.email)) e.email = 'Cet email existe déjà'
    return e
  }

  const handleCreate = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    addUser(form)
    setSuccess(`Compte "${form.name}" créé avec succès !`)
    setForm({ name: '', email: '', password: '', role: 'doctor', specialty: '' })
    setErrors({})
    setShowForm(false)
    refresh()
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Supprimer le compte de ${name} ?`)) return
    deleteUser(id)
    refresh()
  }

  const filtered = users.filter(u => filter === 'tous' || u.role === filter)

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Gestion des utilisateurs</h1>
          <p>Créez et gérez les comptes médecins et secrétaires.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <UserPlus size={16} /> Nouveau compte
        </button>
      </div>

      {success && (
        <div className="form-error animate-in" style={{ background: 'var(--success-soft)', borderColor: 'rgba(16,185,129,.3)', color: '#34d399', marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.5rem' }}>Créer un nouveau compte</h3>
          <form onSubmit={handleCreate}>
            <div className="section-grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nom complet *</label>
                <input className="form-input" placeholder="Dr. Prénom Nom" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
                {errors.name && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.name}</div>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rôle *</label>
                <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Adresse e-mail *</label>
                <input className="form-input" type="email" placeholder="exemple@endolia.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
                {errors.email && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.email}</div>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 caractères"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.password}</div>}
              </div>
              {form.role === 'doctor' && (
                <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label className="form-label">Spécialité</label>
                  <input className="form-input" placeholder="ex: Gastro-entérologue" value={form.specialty}
                    onChange={e => setForm({ ...form, specialty: e.target.value })} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setErrors({}) }}>Annuler</button>
              <button type="submit" className="btn btn-primary"><UserPlus size={15} /> Créer le compte</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div className="filter-tabs">
          {[{ key: 'tous', label: 'Tous' }, { key: 'doctor', label: 'Médecins' }, { key: 'secretaire', label: 'Secrétaires' }].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <span className="table-count">{filtered.length} compte{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Utilisateur</th><th>Rôle</th><th>Spécialité</th><th>Créé le</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>Aucun compte trouvé</td></tr>
            ) : filtered.map((u, i) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={`patient-avatar ${COLORS[i % COLORS.length]}`}>
                      {u.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="td-primary">{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${u.role === 'doctor' ? 'badge-blue' : 'badge-purple'}`}>
                    <span className="badge-dot" />{u.role === 'doctor' ? 'Médecin' : 'Secrétaire'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-300)', fontSize: '0.875rem' }}>{u.specialty || '—'}</td>
                <td style={{ color: 'var(--text-400)', fontSize: '0.8rem' }}>{u.createdAt}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.name)}>
                    <Trash2 size={13} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="card" style={{ marginTop: '1.5rem', background: 'var(--accent-soft)', borderColor: 'var(--border-accent)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle size={16} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-300)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent-light)' }}>Accès immédiat.</strong> Les comptes créés ici peuvent se connecter immédiatement avec leur email et mot de passe.
            Le rôle détermine l'interface affichée : Médecin pour les examens et analyses IA, Secrétaire pour la gestion des patients et RDV.
          </div>
        </div>
      </div>
    </div>
  )
}
