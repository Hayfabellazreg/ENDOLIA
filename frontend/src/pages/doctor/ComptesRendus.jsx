import { useState } from 'react'
import { FilePlus, Download, Eye, CheckCircle } from 'lucide-react'
import { comptesRendus, examens } from '../../data/mockData'

export default function ComptesRendus() {
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ patient: '', examen: '', conclusion: '' })

  return (
    <div className="animate-in">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Comptes rendus</h1>
          <p>Consultez et générez les rapports médicaux de vos patients.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(v => !v)}>
          <FilePlus size={16} /> Générer un compte rendu
        </button>
      </div>

      {/* New report form */}
      {showNew && (
        <div className="card animate-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>Nouveau compte rendu</h3>
          <div className="section-grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Patient</label>
              <select className="form-input" value={form.patient}
                onChange={e => setForm({ ...form, patient: e.target.value })}>
                <option value="">Sélectionner un patient</option>
                {['Sofia Trabelsi', 'Karim Mekni', 'Youssef Hammami', 'Ahmed Bensalem', 'Leila Gharbi'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Examen associé</label>
              <select className="form-input" value={form.examen}
                onChange={e => setForm({ ...form, examen: e.target.value })}>
                <option value="">Sélectionner un examen</option>
                {examens.map(e => (
                  <option key={e.id} value={e.id}>{e.id} — {e.type} · {e.patient}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Conclusion médicale</label>
            <textarea
              className="form-input"
              rows={5}
              placeholder="Rédigez votre conclusion médicale ici…"
              value={form.conclusion}
              onChange={e => setForm({ ...form, conclusion: e.target.value })}
              style={{ resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Annuler</button>
            <button className="btn btn-primary" disabled={!form.patient || !form.conclusion}>
              <CheckCircle size={15} /> Valider et enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: comptesRendus.length, cls: 'badge-blue' },
          { label: 'Validés', value: comptesRendus.filter(r => r.status === 'valide').length, cls: 'badge-success' },
          { label: 'En attente', value: 0, cls: 'badge-warning' },
        ].map(s => (
          <span key={s.label} className={`badge ${s.cls}`} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
            <span className="badge-dot" /> {s.label} : {s.value}
          </span>
        ))}
      </div>

      {/* Reports list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {comptesRendus.map(r => (
          <div key={r.id} className="rapport-card">
            <div className="rapport-card-header">
              <div>
                <div className="rapport-id">{r.id} · {r.examenId}</div>
                <div className="rapport-title">{r.type} — {r.patient}</div>
                <div className="rapport-meta">{r.date}</div>
              </div>
              <span className="badge badge-success"><span className="badge-dot" />Validé</span>
            </div>
            <div className="rapport-conclusion">{r.conclusion}</div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="btn btn-secondary btn-sm"><Eye size={13} /> Consulter</button>
              <button className="btn btn-secondary btn-sm"><Download size={13} /> Télécharger PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
