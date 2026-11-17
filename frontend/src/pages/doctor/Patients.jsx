import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, Eye, Phone, Mail } from 'lucide-react'
import { patients } from '../../data/mockData'

const avatarColors = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']

const statusConfig = {
  actif:    { label: 'Actif',     cls: 'badge-success' },
  en_cours: { label: 'En cours',  cls: 'badge-warning' },
  nouveau:  { label: 'Nouveau',   cls: 'badge-blue' },
}

export default function Patients() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('tous')

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'tous' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Patients</h1>
          <p>Gérez et consultez les dossiers de vos patients.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={16} /> Nouveau patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ maxWidth: '340px' }}>
          <Search className="search-bar-icon" />
          <input
            placeholder="Rechercher un patient…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {[
            { key: 'tous', label: 'Tous' },
            { key: 'actif', label: 'Actifs' },
            { key: 'en_cours', label: 'En cours' },
            { key: 'nouveau', label: 'Nouveaux' },
          ].map(f => (
            <button key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Liste des patients</span>
          <span className="table-count">{filtered.length} patient{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date de naissance</th>
              <th>Contact</th>
              <th>Dernière visite</th>
              <th>Examens</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const s = statusConfig[p.status]
              return (
                <tr key={p.id} onClick={() => navigate(`/doctor/dossier/${p.id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`patient-avatar ${avatarColors[i % avatarColors.length]}`}>
                        {p.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div>
                        <div className="td-primary">{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-400)' }}>{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.dob} <span style={{ color: 'var(--text-400)', fontSize: '0.8rem' }}>({p.age} ans)</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-300)' }}>
                        <Phone size={11} /> {p.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-400)' }}>
                        <Mail size={11} /> {p.email}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-300)' }}>{p.lastVisit}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-100)' }}>{p.examens}</span>
                    <span style={{ color: 'var(--text-500)', fontSize: '0.8rem' }}> examen{p.examens > 1 ? 's' : ''}</span>
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
