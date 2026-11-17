import { NavLink, useNavigate } from 'react-router-dom'
import { Stethoscope, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = {
  admin: [
    { label: 'Tableau de bord', icon: '📊', to: '/admin/dashboard' },
    { label: 'Utilisateurs', icon: '👥', to: '/admin/users' },
    { label: 'Patients', icon: '🧑‍⚕️', to: '/admin/patients' },
    { label: 'Statistiques', icon: '📈', to: '/admin/stats' },
  ],
  doctor: [
    { label: 'Tableau de bord', icon: '🏠', to: '/doctor/dashboard' },
    { label: 'Patients', icon: '👤', to: '/doctor/patients' },
    { label: 'Dossier patient', icon: '📁', to: '/doctor/dossier' },
    { label: 'Examens', icon: '🔬', to: '/doctor/examens' },
    { label: 'Analyse IA', icon: '🤖', to: '/doctor/analyse' },
    { label: 'Comptes rendus', icon: '📄', to: '/doctor/comptes-rendus' },
    { label: 'Rendez-vous', icon: '📅', to: '/doctor/rendezvous' },
  ],
  secretaire: [
    { label: 'Tableau de bord', icon: '🏠', to: '/secretaire/dashboard' },
    { label: 'Patients', icon: '👤', to: '/secretaire/patients' },
    { label: 'Rendez-vous', icon: '📅', to: '/secretaire/rendezvous' },
  ],
}

const ROLE_LABEL = { admin: 'Administrateur', doctor: null, secretaire: 'Secrétaire médicale' }
const ROLE_ACCENT = { admin: '#10b981', doctor: '#2563eb', secretaire: '#8b5cf6' }

export default function AppSidebar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const role = currentUser?.role || 'doctor'
  const items = NAV[role] || NAV.doctor
  const accent = ROLE_ACCENT[role]

  const initials = currentUser?.name
    ? currentUser.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar" style={{ '--role-accent': accent }}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: `linear-gradient(135deg, ${accent}, #4f46e5)` }}>
          <Stethoscope size={18} color="#fff" />
        </div>
        <span className="sidebar-logo-text">ENDOLIA</span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">
          {role === 'admin' ? 'Administration' : role === 'secretaire' ? 'Secrétariat' : 'Navigation'}
        </span>
        {items.map(({ label, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => isActive ? { background: `${accent}18`, color: '#fff' } : {}}
          >
            <span style={{ fontSize: '1rem', width: 18, textAlign: 'center' }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-doctor-card">
          <div className="sidebar-avatar" style={{ background: `linear-gradient(135deg, ${accent}, #4f46e5)` }}>
            {initials}
          </div>
          <div className="sidebar-doctor-info">
            <div className="sidebar-doctor-name">{currentUser?.name || 'Utilisateur'}</div>
            <div className="sidebar-doctor-role">
              {currentUser?.specialty || ROLE_LABEL[role] || role}
            </div>
          </div>
        </div>
        <button className="sidebar-link" style={{ marginTop: '0.5rem', color: '#f87171' }} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
