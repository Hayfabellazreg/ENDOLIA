import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FolderOpen, Microscope,
  Brain, FileText, Calendar, LogOut, Stethoscope
} from 'lucide-react'
import { doctor } from '../data/mockData'

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, to: '/doctor/dashboard' },
  { label: 'Patients', icon: Users, to: '/doctor/patients', badge: 5 },
  { label: 'Dossier patient', icon: FolderOpen, to: '/doctor/dossier' },
  { label: 'Examens', icon: Microscope, to: '/doctor/examens' },
  { label: 'Analyse IA', icon: Brain, to: '/doctor/analyse' },
  { label: 'Comptes rendus', icon: FileText, to: '/doctor/comptes-rendus' },
  { label: 'Rendez-vous', icon: Calendar, to: '/doctor/rendezvous' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const initials = doctor.name.split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Stethoscope size={18} color="#fff" />
        </div>
        <span className="sidebar-logo-text">ENDOLIA</span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navigation</span>
        {navItems.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="sidebar-link-icon" />
            <span>{label}</span>
            {badge && <span className="sidebar-link-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-doctor-card">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-doctor-info">
            <div className="sidebar-doctor-name">{doctor.name}</div>
            <div className="sidebar-doctor-role">{doctor.specialty}</div>
          </div>
        </div>
        <button
          className="sidebar-link"
          style={{ marginTop: '0.5rem', color: '#f87171' }}
          onClick={() => navigate('/login')}
        >
          <LogOut className="sidebar-link-icon" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
