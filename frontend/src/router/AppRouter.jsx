import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DoctorLayout from '../components/DoctorLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/doctor/Dashboard'
import Patients from '../pages/doctor/Patients'
import DossierPatient from '../pages/doctor/DossierPatient'
import Examens from '../pages/doctor/Examens'
import AnalyseIA from '../pages/doctor/AnalyseIA'
import ComptesRendus from '../pages/doctor/ComptesRendus'
import Rendezvous from '../pages/doctor/Rendezvous'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="dossier" element={<DossierPatient />} />
          <Route path="dossier/:id" element={<DossierPatient />} />
          <Route path="examens" element={<Examens />} />
          <Route path="analyse" element={<AnalyseIA />} />
          <Route path="comptes-rendus" element={<ComptesRendus />} />
          <Route path="rendezvous" element={<Rendezvous />} />
        </Route>
        <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
