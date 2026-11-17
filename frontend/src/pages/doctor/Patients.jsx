import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { Search, Eye, Phone, Mail } from 'lucide-react'

const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
const STATUS_CFG = { actif: { label: 'Actif', cls: 'badge-success' }, en_cours: { label: 'En cours', cls: 'badge-warning' }, nouveau: { label: 'Nouveau', cls: 'badge-blue' } }

export default function Patients() {
  const { patients } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('tous')

  const myPatients = patients.filter(p => p.doctorId === currentUser?.id)
  const filtered = myPatients.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'tous' || p.status === filter
    return ms && mf
  })

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Mes patients</h1>
          <p>{myPatients.length} patient{myPatients.length > 1 ? 's' : ''} sous votre suivi.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ maxWidth: 340 }}>
          <Search className="search-bar-icon" />
          <input placeholder="Rechercher un patient…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {[{ key: 'tous', label: 'Tous' }, { key: 'actif', label: 'Actifs' }, { key: 'en_cours', label: 'En cours' }, { key: 'nouveau', label: 'Nouveaux' }].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Liste des patients</span>
          <span className="table-count">{filtered.length} patient{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <table>
          <thead><tr><th>Patient</th><th>Contact</th><th>Antécédents</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-400)' }}>
                {myPatients.length === 0 ? 'Aucun patient ne vous est assigné.' : 'Aucun résultat.'}
              </td></tr>
            ) : filtered.map((p, i) => {
              const s = STATUS_CFG[p.status] || STATUS_CFG.nouveau
              return (
                <tr key={p.id} onClick={() => navigate(`/doctor/dossier/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`patient-avatar ${COLORS[i % COLORS.length]}`}>{p.name.split(' ').map(w => w[0]).join('')}</div>
                      <div>
                        <div className="td-primary">{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-300)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {p.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={11} /> {p.phone}</span>}
                      {p.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-400)' }}><Mail size={11} /> {p.email}</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-400)', fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.antecedents}
                  </td>
                  <td><span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/doctor/dossier/${p.id}`) }}>
                      <Eye size={13} /> Dossier
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
