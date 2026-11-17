import { useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { rendezvous } from '../../data/mockData'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const WEEK_DATES = ['21', '22', '23', '24', '25', '26', '27']
const FULL_DAYS = ['Lundi 21', 'Mardi 22', 'Mercredi 23', 'Jeudi 24', 'Vendredi 25', 'Samedi 26', 'Dimanche 27']

const typeConfig = {
  Coloscopie:   'cal-event-colonoscopie',
  Consultation: 'cal-event-consultation',
  Suivi:        'cal-event-suivi',
  Gastroscopie: 'cal-event-gastroscopie',
}

const statusConfig = {
  confirme:   { label: 'Confirmé',   cls: 'badge-success' },
  en_attente: { label: 'En attente', cls: 'badge-warning' },
}

function rdvByDay(date) {
  return rendezvous.filter(r => r.date.endsWith(date))
}

export default function Rendezvous() {
  const [view, setView] = useState('semaine')
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Rendez-vous</h1>
          <p>Planifiez et gérez vos consultations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="filter-tabs">
            {['semaine', 'liste'].map(v => (
              <button key={v} className={`filter-tab ${view === v ? 'active' : ''}`}
                onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew(v => !v)}>
            <CalendarPlus size={16} /> Prendre un rendez-vous
          </button>
        </div>
      </div>

      {/* New RDV form */}
      {showNew && (
        <div className="card animate-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>Nouveau rendez-vous</h3>
          <div className="section-grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Patient</label>
              <select className="form-input">
                <option value="">Sélectionner un patient</option>
                {['Sofia Trabelsi', 'Karim Mekni', 'Youssef Hammami', 'Ahmed Bensalem', 'Leila Gharbi'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-input">
                <option>Coloscopie</option>
                <option>Consultation</option>
                <option>Suivi</option>
                <option>Gastroscopie</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Heure</label>
              <input className="form-input" type="time" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary">Confirmer le rendez-vous</button>
          </div>
        </div>
      )}

      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <button className="btn btn-secondary btn-sm"><ChevronLeft size={15} /></button>
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Calendrier · Avril 2025</span>
        <button className="btn btn-secondary btn-sm"><ChevronRight size={15} /></button>
      </div>

      {/* Calendar view */}
      {view === 'semaine' && (
        <div className="calendar-grid">
          {DAYS.map((day, i) => {
            const dateNum = WEEK_DATES[i]
            const isToday = dateNum === '25'
            const dayRdv = rdvByDay(`-04-${dateNum}`)
            return (
              <div key={day} className={`cal-day ${isToday ? 'today' : ''}`}>
                <div className="cal-day-header">{day}</div>
                <div className="cal-day-number">{dateNum}</div>
                {dayRdv.map(rdv => (
                  <div key={rdv.id} className={`cal-event ${typeConfig[rdv.type] || 'cal-event-colonoscopie'}`}>
                    <div style={{ fontWeight: 600 }}>{rdv.time}</div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                      {rdv.patient.split(' ')[1]} · {rdv.type}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'liste' && (
        <div className="table-container">
          <div className="table-header">
            <span className="table-title">Tous les rendez-vous</span>
            <span className="table-count">{rendezvous.length} rendez-vous</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rendezvous.map((rdv, i) => {
                const s = statusConfig[rdv.status]
                const avatarColors = ['avatar-blue', 'avatar-teal', 'avatar-violet', 'avatar-rose', 'avatar-amber']
                return (
                  <tr key={rdv.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className={`patient-avatar ${avatarColors[i % avatarColors.length]}`} style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {rdv.patient.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="td-primary">{rdv.patient}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-300)' }}>{rdv.date}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-200)' }}>
                        <Clock size={12} /> {rdv.time}
                      </span>
                    </td>
                    <td>
                      <span className={`cal-event ${typeConfig[rdv.type]}`}
                        style={{ display: 'inline-block', borderRadius: 6 }}>
                        {rdv.type}
                      </span>
                    </td>
                    <td><span className={`badge ${s.cls}`}><span className="badge-dot" />{s.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm">Modifier</button>
                        <button className="btn btn-danger btn-sm">Annuler</button>
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
        {[
          { type: 'Coloscopie', cls: 'cal-event-colonoscopie' },
          { type: 'Consultation', cls: 'cal-event-consultation' },
          { type: 'Suivi', cls: 'cal-event-suivi' },
          { type: 'Gastroscopie', cls: 'cal-event-gastroscopie' },
        ].map(l => (
          <span key={l.type} className={`cal-event ${l.cls}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
            {l.type}
          </span>
        ))}
      </div>
    </div>
  )
}
