import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CalendarPlus, Trash2, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'

const TYPE_CLS = { Coloscopie: 'cal-event-colonoscopie', Consultation: 'cal-event-consultation', Suivi: 'cal-event-suivi', Gastroscopie: 'cal-event-gastroscopie' }
const STATUS_CFG = { confirme: { label: 'Confirmé', cls: 'badge-success' }, en_attente: { label: 'En attente', cls: 'badge-warning' }, annule: { label: 'Annulé', cls: 'badge-danger' } }
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const TYPES = ['Coloscopie', 'Gastroscopie', 'Consultation', 'Suivi']
const EMPTY_FORM = { patientId: '', doctorId: '', date: '', time: '', type: 'Coloscopie', notes: '', status: 'confirme' }

function getWeekDates(offset = 0) {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function SecretaireRendezvous() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment, patients, getUsers } = useApp()
  const doctors = getUsers().filter(u => u.role === 'doctor')
  const [view, setView] = useState('semaine')
  const [weekOffset, setWeekOffset] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM, patientId: patients[0]?.id || '', doctorId: doctors[0]?.id || '' })
  const [success, setSuccess] = useState('')
  const weekDates = getWeekDates(weekOffset)

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.patientId || !form.doctorId || !form.date || !form.time) return
    const patient = patients.find(p => p.id === form.patientId)
    const doctor = doctors.find(d => d.id === form.doctorId)
    addAppointment({ ...form, patientName: patient?.name || '', doctorName: doctor?.name || '' })
    setSuccess('Rendez-vous créé avec succès !')
    setForm({ ...EMPTY_FORM, patientId: patients[0]?.id || '', doctorId: doctors[0]?.id || '' })
    setShowForm(false)
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Annuler ce rendez-vous ?')) return
    deleteAppointment(id)
  }

  const rdvForDay = (date) => {
    const ds = date.toISOString().split('T')[0]
    return appointments.filter(a => a.date === ds).sort((a, b) => a.time.localeCompare(b.time))
  }

  const monthLabel = weekDates[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Rendez-vous</h1>
          <p>Planifiez et gérez les consultations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="filter-tabs">
            {['semaine', 'liste'].map(v => (
              <button key={v} className={`filter-tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
            <CalendarPlus size={16} /> Nouveau RDV
          </button>
        </div>
      </div>

      {success && (
        <div className="form-error animate-in" style={{ background: 'var(--success-soft)', borderColor: 'rgba(16,185,129,.3)', color: '#34d399', marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Nouveau rendez-vous</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={15} /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Patient *</label>
                <select className="form-input" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required>
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Médecin *</label>
                <select className="form-input" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })} required>
                  <option value="">Sélectionner un médecin</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Heure *</label>
                <input className="form-input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Statut</label>
                <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="confirme">Confirmé</option>
                  <option value="en_attente">En attente</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
                <label className="form-label">Notes (optionnel)</label>
                <input className="form-input" placeholder="Informations complémentaires…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary"><Check size={15} /> Confirmer</button>
            </div>
          </form>
        </div>
      )}

      {/* Week nav */}
      {view === 'semaine' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft size={15} /></button>
            <span style={{ fontWeight: 600, fontSize: '1rem', textTransform: 'capitalize' }}>{monthLabel}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight size={15} /></button>
            {weekOffset !== 0 && <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(0)}>Aujourd'hui</button>}
          </div>
          <div className="calendar-grid">
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString()
              const dayRdv = rdvForDay(date)
              return (
                <div key={i} className={`cal-day ${isToday ? 'today' : ''}`}>
                  <div className="cal-day-header">{DAYS[i]}</div>
                  <div className="cal-day-number">{date.getDate()}</div>
                  {dayRdv.map(rdv => (
                    <div key={rdv.id} className={`cal-event ${TYPE_CLS[rdv.type] || 'cal-event-colonoscopie'}`}
                      title={`${rdv.patientName} · ${rdv.type}`} style={{ cursor: 'pointer' }}>
                      <div style={{ fontWeight: 600 }}>{rdv.time}</div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rdv.patientName.split(' ')[1]} · {rdv.type}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* List view */}
      {view === 'liste' && (
        <div className="table-container">
          <div className="table-header">
            <span className="table-title">Tous les rendez-vous</span>
            <span className="table-count">{appointments.length} rendez-vous</span>
          </div>
          <table>
            <thead><tr><th>Patient</th><th>Médecin</th><th>Date</th><th>Heure</th><th>Type</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {[...appointments].sort((a, b) => new Date(a.date) - new Date(b.date)).map((rdv, i) => {
                const s = STATUS_CFG[rdv.status] || STATUS_CFG.confirme
                const COLORS = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
                return (
                  <tr key={rdv.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className={`patient-avatar ${COLORS[i % COLORS.length]}`} style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {rdv.patientName.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="td-primary">{rdv.patientName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-300)', fontSize: '0.82rem' }}>{rdv.doctorName}</td>
                    <td style={{ color: 'var(--text-300)' }}>{rdv.date}</td>
                    <td style={{ color: 'var(--text-200)', fontWeight: 600 }}>{rdv.time}</td>
                    <td><span className={`cal-event ${TYPE_CLS[rdv.type]}`} style={{ display: 'inline-block', borderRadius: 6, fontSize: '0.75rem' }}>{rdv.type}</span></td>
                    <td><span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => updateAppointment(rdv.id, { status: rdv.status === 'confirme' ? 'en_attente' : 'confirme' })}>
                          {rdv.status === 'confirme' ? 'Mettre en attente' : 'Confirmer'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rdv.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        {Object.entries(TYPE_CLS).map(([type, cls]) => (
          <span key={type} className={`cal-event ${cls}`} style={{ display: 'inline-block', borderRadius: 6, fontSize: '0.75rem' }}>{type}</span>
        ))}
      </div>
    </div>
  )
}
