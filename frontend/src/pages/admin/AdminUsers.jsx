import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getStoredUsers, saveUsers } from '../../context/AuthContext'
import { UserPlus, Trash2, Eye, EyeOff, Link2 } from 'lucide-react'

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

const EMPTY = {
  doctorName: '', doctorEmail: '', doctorPassword: '', doctorSpecialty: '',
  secretaireName: '', secretaireEmail: '', secretairePassword: '',
}

export default function AdminUsers() {
  const { patients } = useApp()
  const [pairs, setPairs] = useState(() => buildPairs())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [showPwd, setShowPwd] = useState({ doc: false, sec: false })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  function buildPairs() {
    const users = getStoredUsers()
    const doctors = users.filter(u => u.role === 'doctor')
    return doctors.map(doc => ({
      doctor: doc,
      secretary: users.find(u => u.id === doc.linkedUserId) || null,
    }))
  }

  const refresh = () => setPairs(buildPairs())

  const validate = () => {
    const e = {}
    const users = getStoredUsers()
    if (!form.doctorName.trim()) e.doctorName = 'Requis'
    if (!form.doctorEmail.trim() || !/\S+@\S+\.\S+/.test(form.doctorEmail)) e.doctorEmail = 'Email invalide'
    if (form.doctorPassword.length < 6) e.doctorPassword = 'Min. 6 caractères'
    if (!form.secretaireName.trim()) e.secretaireName = 'Requis'
    if (!form.secretaireEmail.trim() || !/\S+@\S+\.\S+/.test(form.secretaireEmail)) e.secretaireEmail = 'Email invalide'
    if (form.secretairePassword.length < 6) e.secretairePassword = 'Min. 6 caractères'
    const emails = users.map(u => u.email)
    if (emails.includes(form.doctorEmail)) e.doctorEmail = 'Email déjà utilisé'
    if (emails.includes(form.secretaireEmail)) e.secretaireEmail = 'Email déjà utilisé'
    return e
  }

  const handleCreate = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const docId = genId('USR')
    const secId = genId('USR')
    const today = new Date().toISOString().split('T')[0]

    const newDoctor = {
      id: docId, name: form.doctorName, email: form.doctorEmail, password: form.doctorPassword,
      role: 'doctor', specialty: form.doctorSpecialty, linkedUserId: secId, createdAt: today,
    }
    const newSecretary = {
      id: secId, name: form.secretaireName, email: form.secretaireEmail, password: form.secretairePassword,
      role: 'secretaire', linkedUserId: docId, createdAt: today,
    }

    const users = getStoredUsers()
    saveUsers([...users, newDoctor, newSecretary])
    setSuccess(`Binôme créé : ${form.doctorName} ↔ ${form.secretaireName}`)
    setForm({ ...EMPTY })
    setErrors({})
    setShowForm(false)
    refresh()
    setTimeout(() => setSuccess(''), 5000)
  }

  const handleDeletePair = (doctor, secretary) => {
    const names = secretary ? `${doctor.name} et ${secretary.name}` : doctor.name
    if (!window.confirm(`Supprimer le binôme : ${names} ?`)) return
    const idsToDelete = [doctor.id, secretary?.id].filter(Boolean)
    const users = getStoredUsers().filter(u => !idsToDelete.includes(u.id))
    saveUsers(users)
    refresh()
  }

  const F = ({ label, field, type = 'text', placeholder, error, pwdKey }) => (
    <div className="form-group" style={{ marginBottom: '0.9rem' }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          type={pwdKey && showPwd[pwdKey] ? 'text' : type}
          placeholder={placeholder}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'off' : 'off'}
          style={pwdKey ? { paddingRight: '2.5rem' } : {}}
        />
        {pwdKey && (
          <button type="button" onClick={() => setShowPwd(p => ({ ...p, [pwdKey]: !p[pwdKey] }))}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer', display: 'flex' }}>
            {showPwd[pwdKey] ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.73rem', marginTop: '0.25rem' }}>{error}</div>}
    </div>
  )

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Gestion des binômes</h1>
          <p>Chaque médecin est associé à une secrétaire dédiée.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <UserPlus size={16} /> Créer un binôme
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
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link2 size={16} color="var(--accent-light)" /> Nouveau binôme Médecin ↔ Secrétaire
          </h3>
          <form onSubmit={handleCreate} autoComplete="off">
            {/* Dummy hidden fields to prevent browser autofill */}
            <input type="text" name="username" style={{ display: 'none' }} readOnly />
            <input type="password" name="password" style={{ display: 'none' }} readOnly />
            <div className="section-grid-2" style={{ gap: '2rem' }}>
              {/* Doctor side */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>🩺</span> Médecin
                </div>
                <F label="Nom complet *" field="doctorName" placeholder="Dr. Prénom Nom" error={errors.doctorName} />
                <F label="Spécialité" field="doctorSpecialty" placeholder="ex: Gastro-entérologue, Cardiologue…" />
                <F label="Email *" field="doctorEmail" type="email" placeholder="medecin@endolia.com" error={errors.doctorEmail} />
                <F label="Mot de passe *" field="doctorPassword" type="password" placeholder="Min. 6 caractères" error={errors.doctorPassword} pwdKey="doc" />
              </div>

              {/* Secretary side */}
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>👩‍💼</span> Secrétaire
                </div>
                <F label="Nom complet *" field="secretaireName" placeholder="Prénom Nom" error={errors.secretaireName} />
                <F label="Email *" field="secretaireEmail" type="email" placeholder="secretaire@endolia.com" error={errors.secretaireEmail} />
                <F label="Mot de passe *" field="secretairePassword" type="password" placeholder="Min. 6 caractères" error={errors.secretairePassword} pwdKey="sec" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setErrors({}) }}>Annuler</button>
              <button type="submit" className="btn btn-primary"><Link2 size={15} /> Créer le binôme</button>
            </div>
          </form>
        </div>
      )}

      {/* Pairs list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pairs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><UserPlus size={24} /></div>
            <div className="empty-title">Aucun binôme créé</div>
            <div className="empty-desc">Créez votre premier binôme médecin ↔ secrétaire.</div>
          </div>
        ) : pairs.map(({ doctor, secretary }, i) => {
          const patientsCount = patients.filter(p => p.doctorId === doctor.id).length
          return (
            <div key={doctor.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {/* Doctor card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  <div className="patient-avatar avatar-blue" style={{ width: 46, height: 46, fontSize: '1rem' }}>
                    {doctor.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem' }}>Médecin</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-100)', fontSize: '0.95rem' }}>{doctor.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-400)' }}>{doctor.specialty}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-500)', marginTop: '0.15rem' }}>{doctor.email}</div>
                  </div>
                </div>

                {/* Link icon */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <Link2 size={20} color="var(--border-hover)" />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-500)', fontWeight: 600 }}>{patientsCount} patient{patientsCount > 1 ? 's' : ''}</div>
                </div>

                {/* Secretary card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  <div className="patient-avatar avatar-violet" style={{ width: 46, height: 46, fontSize: '1rem' }}>
                    {secretary
                      ? secretary.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2)
                      : '—'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem' }}>Secrétaire</div>
                    {secretary ? (
                      <>
                        <div style={{ fontWeight: 600, color: 'var(--text-100)', fontSize: '0.95rem' }}>{secretary.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-500)', marginTop: '0.15rem' }}>{secretary.email}</div>
                      </>
                    ) : (
                      <div style={{ color: 'var(--text-500)', fontSize: '0.85rem' }}>Aucune secrétaire liée</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button className="btn btn-danger btn-sm" onClick={() => handleDeletePair(doctor, secretary)}>
                  <Trash2 size={13} /> Supprimer le binôme
                </button>
              </div>
            </div>
          )
        })}
      </div>


    </div>
  )
}
