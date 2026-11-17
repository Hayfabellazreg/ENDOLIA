import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const TYPE_CLS = { Coloscopie: 'cal-event-colonoscopie', Consultation: 'cal-event-consultation', Suivi: 'cal-event-suivi', Gastroscopie: 'cal-event-gastroscopie' }
const STATUS_CFG = { confirme: { label: 'Confirmé', cls: 'badge-success' }, en_attente: { label: 'En attente', cls: 'badge-warning' }, annule: { label: 'Annulé', cls: 'badge-danger' } }

function getWeekDates(offset = 0) {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d })
}

export default function Rendezvous() {
  const { appointments } = useApp()
  const { currentUser } = useAuth()
  const [view, setView] = useState('semaine')
  const [weekOffset, setWeekOffset] = useState(0)
  const weekDates = getWeekDates(weekOffset)

  const myRdv = appointments.filter(a => a.doctorId === currentUser?.id)
  const rdvForDay = (date) => {
    const ds = date.toISOString().split('T')[0]
    return myRdv.filter(a => a.date === ds).sort((a, b) => a.time.localeCompare(b.time))
  }

  const monthLabel = weekDates[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Mes rendez-vous</h1>
          <p>Consultez votre agenda. Les rendez-vous sont gérés par la secrétaire.</p>
        </div>
        <div className="filter-tabs">
          {['semaine', 'liste'].map(v => (
            <button key={v} className={`filter-tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: myRdv.length },
          { label: 'Confirmés', value: myRdv.filter(a => a.status === 'confirme').length },
          { label: 'En attente', value: myRdv.filter(a => a.status === 'en_attente').length },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-light)' }}>{s.value}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-400)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft size={15} /></button>
        <span style={{ fontWeight: 600, fontSize: '1rem', textTransform: 'capitalize' }}>{monthLabel}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight size={15} /></button>
        {weekOffset !== 0 && <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(0)}>Aujourd'hui</button>}
      </div>

      {view === 'semaine' && (
        <div className="calendar-grid">
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString()
            const dayRdv = rdvForDay(date)
            return (
              <div key={i} className={`cal-day ${isToday ? 'today' : ''}`}>
                <div className="cal-day-header">{DAYS[i]}</div>
                <div className="cal-day-number">{date.getDate()}</div>
                {dayRdv.map(rdv => (
                  <div key={rdv.id} className={`cal-event ${TYPE_CLS[rdv.type] || 'cal-event-colonoscopie'}`}>
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
      )}

      {view === 'liste' && (
        <div className="table-container">
          <div className="table-header">
            <span className="table-title">Mes rendez-vous</span>
            <span className="table-count">{myRdv.length} rendez-vous</span>
          </div>
          {myRdv.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-400)' }}>
              Aucun rendez-vous planifié. Contactez la secrétaire pour en ajouter.
            </div>
          ) : (
            <table>
              <thead><tr><th>Patient</th><th>Date</th><th>Heure</th><th>Type</th><th>Statut</th></tr></thead>
              <tbody>
                {[...myRdv].sort((a, b) => new Date(a.date) - new Date(b.date)).map((rdv, i) => {
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
                      <td style={{ color: 'var(--text-300)' }}>{rdv.date}</td>
                      <td style={{ color: 'var(--text-200)', fontWeight: 600 }}>{rdv.time}</td>
                      <td><span className={`cal-event ${TYPE_CLS[rdv.type]}`} style={{ display: 'inline-block', borderRadius: 6, fontSize: '0.75rem' }}>{rdv.type}</span></td>
                      <td><span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
