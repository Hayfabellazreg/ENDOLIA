import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import '../styles/doctor.css'

export default function DoctorLayout() {
  return (
    <div className="doctor-layout">
      <Sidebar />
      <div className="doctor-main">
        <Topbar />
        <div className="doctor-content animate-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
