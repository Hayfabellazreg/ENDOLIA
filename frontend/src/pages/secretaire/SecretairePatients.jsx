import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { getStoredUsers } from '../../context/AuthContext'
import { UserPlus, Search, Trash2, Edit, X, Check } from 'lucide-react'

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
const EMPTY_FORM = { name: '', dob: '', phone: '', email: '', address: '', status: 'nouveau', antecedents: 'Aucun notable', allergies: 'Aucune connue' }
const STATUS = { actif: { label: 'Actif', cls: 'badge-success' }, en_cours: { label: 'En cours', cls: 'badge-warning' }, nouveau: { label: 'Nouveau', cls: 'badge-blue' } }

function calcAge(dob) {
  if (!dob) return ''
  const [d, m, y] = dob.split('/')
  if (!y) return ''
  return Math.floor((Date.now() - new Date(`${y}-${m}-${d}`).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export default function SecretairePatients() {
  const { patients, addPatient, updatePatient, deletePatient } = useApp()
  const { currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('tous')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editId, setEditId] = useState(null)
  const [success, setSuccess] = useState('')

  // Find linked doctor automatically
  const users = getStoredUsers()
  const linkedDoctor = users.find(u => u.id === currentUser?.linkedUserId)

  // Show only patients of the linked doctor
  const myPatients = patients.filter(p => p.doctorId === linkedDoctor?.id)
  const filtered = myPatients.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search)
    const mf = filter === 'tous' || p.status === filter
    return ms && mf
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const age = calcAge(form.dob)
    // doctorId is automatically set to the linked doctor
    if (editId) {
      updatePatient(editId, { ...form, age })
      setSuccess('Patient modifié avec succès !')
      setEditId(null)
    } else {
      addPatient({ ...form, age, doctorId: linkedDoctor?.id || '' })
      setSuccess('Patient créé avec succès !')
    }
    setForm({ ...EMPTY_FORM })
    setShowForm(false)
    setTimeout(() => setSuccess(''), 4000)
  }

  const startEdit = (p) => {
    setForm({ name: p.name, dob: p.dob, phone: p.phone, email: p.email, address: p.address, status: p.status, antecedents: p.antecedents, allergies: p.allergies })
    setEditId(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Supprimer le patient ${name} ?`)) return
    deletePatient(id)
  }

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM }) }

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Patients</h1>
          <p>
            Patients de <strong style={{ color: 'var(--accent-light)' }}>{linkedDoctor?.name || '—'}</strong>
            {linkedDoctor?.specialty ? ` · ${linkedDoctor.specialty}` : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { cancelForm(); setShowForm(v => !v) }}>
          <UserPlus size={16} /> Nouveau patient
        </button>
      </div>

      {success && (
        <div className="form-error animate-in" style={{ background: 'var(--success-soft)', borderColor: 'rgba(16,185,129,.3)', color: '#34d399', marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{editId ? 'Modifier le patient' : 'Nouveau patient'}</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-400)', marginTop: '0.2rem' }}>
                Sera automatiquement assigné à <strong style={{ color: 'var(--accent-light)' }}>{linkedDoctor?.name}</strong>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={cancelForm}><X size={15} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Nom complet *', key: 'name', placeholder: 'Prénom Nom', type: 'text', required: true },
                { label: 'Date de naissance', key: 'dob', placeholder: 'JJ/MM/AAAA', type: 'text' },
                { label: 'Téléphone', key: 'phone', placeholder: '00 000 000', type: 'text' },
                { label: 'Email', key: 'email', placeholder: 'patient@email.com', type: 'email' },
                { label: 'Adresse', key: 'address', placeholder: 'Ville, Pays', type: 'text', span: true },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 0, ...(f.span ? { gridColumn: '1/-1' } : {}) }}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} placeholder={f.placeholder} required={f.required}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Statut</label>
                <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="nouveau">Nouveau</option>
                  <option value="actif">Actif</option>
                  <option value="en_cours">En cours</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Antécédents</label>
                <input className="form-input" value={form.antecedents} onChange={e => setForm({ ...form, antecedents: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Allergies</label>
                <input className="form-input" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>Annuler</button>
              <button type="submit" className="btn btn-primary">
                {editId ? <><Check size={15} /> Enregistrer</> : <><UserPlus size={15} /> Créer</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search className="search-bar-icon" />
          <input placeholder="Nom, email, téléphone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {[{ key: 'tous', label: 'Tous' }, { key: 'nouveau', label: 'Nouveaux' }, { key: 'actif', label: 'Actifs' }, { key: 'en_cours', label: 'En cours' }].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Patients de {linkedDoctor?.name || '—'}</span>
          <span className="table-count">{filtered.length} patient{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <table>
          <thead><tr><th>Patient</th><th>Contact</th><th>Date de naissance</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
                {myPatients.length === 0 ? 'Aucun patient enregistré. Créez le premier patient.' : 'Aucun résultat.'}
              </td></tr>
            ) : filtered.map((p, i) => {
              const s = STATUS[p.status] || STATUS.nouveau
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`patient-avatar ${COLORS[i % COLORS.length]}`}>
                        {p.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div>
                        <div className="td-primary">{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-300)' }}>
                    <div>{p.phone}</div>
                    <div style={{ color: 'var(--text-500)' }}>{p.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-300)' }}>
                    {p.dob} {p.age ? <span style={{ color: 'var(--text-500)', fontSize: '0.8rem' }}>({p.age} ans)</span> : ''}
                  </td>
                  <td><span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}><Edit size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}><Trash2 size={13} /></button>
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
