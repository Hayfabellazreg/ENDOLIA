import { Outlet } from 'react-router-dom'
import AppSidebar from './Sidebar'
import AppTopbar from './Topbar'
import '../styles/doctor.css'

export default function AppLayout() {
  return (
    <div className="doctor-layout">
      <AppSidebar />
      <div className="doctor-main">
        <AppTopbar />
        <div className="doctor-content animate-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
