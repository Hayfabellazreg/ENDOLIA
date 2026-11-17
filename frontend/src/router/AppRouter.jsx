import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import AppLayout from '../components/DoctorLayout'

import Login from '../pages/Login'

// Doctor pages
import DoctorDashboard from '../pages/doctor/Dashboard'
import Patients from '../pages/doctor/Patients'
import DossierPatient from '../pages/doctor/DossierPatient'
import Examens from '../pages/doctor/Examens'
import AnalyseIA from '../pages/doctor/AnalyseIA'
import ComptesRendus from '../pages/doctor/ComptesRendus'
import Rendezvous from '../pages/doctor/Rendezvous'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsers from '../pages/admin/AdminUsers'

// Secretaire pages
import SecretaireDashboard from '../pages/secretaire/SecretaireDashboard'
import SecretairePatients from '../pages/secretaire/SecretairePatients'
import SecretaireRendezvous from '../pages/secretaire/SecretaireRendezvous'

function RootRedirect() {
  const { currentUser, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const path = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', secretaire: '/secretaire/dashboard' }
  return <Navigate to={path[currentUser.role] || '/login'} replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        {/* ── Doctor ──────────────────────────────────────── */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="dossier" element={<DossierPatient />} />
          <Route path="dossier/:id" element={<DossierPatient />} />
          <Route path="examens" element={<Examens />} />
          <Route path="analyse" element={<AnalyseIA />} />
          <Route path="comptes-rendus" element={<ComptesRendus />} />
          <Route path="rendezvous" element={<Rendezvous />} />
        </Route>

        {/* ── Admin ───────────────────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* ── Secrétaire ──────────────────────────────────── */}
        <Route path="/secretaire" element={
          <ProtectedRoute allowedRoles={['secretaire']}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SecretaireDashboard />} />
          <Route path="patients" element={<SecretairePatients />} />
          <Route path="rendezvous" element={<SecretaireRendezvous />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
