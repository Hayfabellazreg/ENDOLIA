import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { getStoredUsers, saveUsers, DEFAULT_USERS } from './AuthContext'

const AppContext = createContext(null)
const STORAGE_KEY = 'endolia_app_data'

// ─── Seed data ─────────────────────────────────────────────
const SEED = {
  patients: [
    { id: 'P-001', name: 'Sofia Trabelsi', dob: '22/07/1990', age: 34, phone: '96 765 432', email: 'sofia.trabelsi@email.com', address: 'Tunis, Tunisie', status: 'actif', antecedents: 'Aucun notable', allergies: 'Aucune connue', doctorId: 'USR-002', createdAt: '2025-03-01' },
    { id: 'P-002', name: 'Karim Mekni', dob: '15/03/1978', age: 47, phone: '71 234 567', email: 'karim.mekni@email.com', address: 'Sousse, Tunisie', status: 'en_cours', antecedents: 'Polype 2022', allergies: 'Pénicilline', doctorId: 'USR-002', createdAt: '2025-02-15' },
    { id: 'P-003', name: 'Youssef Hammami', dob: '08/11/1965', age: 59, phone: '23 456 789', email: 'y.hammami@email.com', address: 'Sfax, Tunisie', status: 'nouveau', antecedents: 'HTA, Diabète type 2', allergies: 'Aucune connue', doctorId: 'USR-002', createdAt: '2025-03-10' },
  ],
  appointments: [
    { id: 'RDV-001', patientId: 'P-001', patientName: 'Sofia Trabelsi', doctorId: 'USR-002', doctorName: 'Dr. Sarah Benali', date: '2025-04-25', time: '09:00', type: 'Coloscopie', status: 'confirme', notes: '' },
    { id: 'RDV-002', patientId: 'P-002', patientName: 'Karim Mekni', doctorId: 'USR-002', doctorName: 'Dr. Sarah Benali', date: '2025-04-25', time: '11:00', type: 'Suivi', status: 'confirme', notes: '' },
    { id: 'RDV-003', patientId: 'P-003', patientName: 'Youssef Hammami', doctorId: 'USR-002', doctorName: 'Dr. Sarah Benali', date: '2025-04-21', time: '10:00', type: 'Consultation', status: 'confirme', notes: '' },
  ],
  examens: [
    { id: 'EX-4587', type: 'Coloscopie', date: '03/04/2025', time: '10:24', patientId: 'P-001', patient: 'Sofia Trabelsi', doctorId: 'USR-002', status: 'en_analyse' },
    { id: 'EX-4521', type: 'Coloscopie', date: '28/03/2025', time: '14:10', patientId: 'P-002', patient: 'Karim Mekni', doctorId: 'USR-002', status: 'termine' },
    { id: 'EX-4480', type: 'Coloscopie', date: '15/03/2025', time: '09:45', patientId: 'P-003', patient: 'Youssef Hammami', doctorId: 'USR-002', status: 'termine' },
  ],
  rapports: [
    { id: 'RPT-021', examenId: 'EX-4521', patientId: 'P-002', patient: 'Karim Mekni', doctorId: 'USR-002', date: '28/03/2025', type: 'Coloscopie', conclusion: "Polype sessile 6mm retiré au niveau du côlon transverse. Biopsie envoyée. Contrôle dans 3 ans.", status: 'valide' },
    { id: 'RPT-020', examenId: 'EX-4480', patientId: 'P-003', patient: 'Youssef Hammami', doctorId: 'USR-002', date: '15/03/2025', type: 'Coloscopie', conclusion: "Examen sans anomalie. Muqueuse d'aspect normal sur toute la longueur explorée. Pas de polype détecté.", status: 'valide' },
  ],
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

// ─── Reducer ────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    // Patients
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] }
    case 'UPDATE_PATIENT':
      return { ...state, patients: state.patients.map(p => p.id === action.id ? { ...p, ...action.payload } : p) }
    case 'DELETE_PATIENT':
      return { ...state, patients: state.patients.filter(p => p.id !== action.id) }
    // Appointments
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] }
    case 'UPDATE_APPOINTMENT':
      return { ...state, appointments: state.appointments.map(a => a.id === action.id ? { ...a, ...action.payload } : a) }
    case 'DELETE_APPOINTMENT':
      return { ...state, appointments: state.appointments.filter(a => a.id !== action.id) }
    // Examens
    case 'ADD_EXAMEN':
      return { ...state, examens: [...state.examens, action.payload] }
    case 'UPDATE_EXAMEN':
      return { ...state, examens: state.examens.map(e => e.id === action.id ? { ...e, ...action.payload } : e) }
    // Rapports
    case 'ADD_RAPPORT':
      return { ...state, rapports: [...state.rapports, action.payload] }
    case 'UPDATE_RAPPORT':
      return { ...state, rapports: state.rapports.map(r => r.id === action.id ? { ...r, ...action.payload } : r) }
    default:
      return state
  }
}

function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return SEED
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  // Persist to localStorage on every state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // ── Patients ──────────────────────────────────────────────
  const addPatient = useCallback((data) => {
    const patient = { ...data, id: genId('P'), createdAt: new Date().toISOString().split('T')[0] }
    dispatch({ type: 'ADD_PATIENT', payload: patient })
    return patient
  }, [])

  const updatePatient = useCallback((id, data) => {
    dispatch({ type: 'UPDATE_PATIENT', id, payload: data })
  }, [])

  const deletePatient = useCallback((id) => {
    dispatch({ type: 'DELETE_PATIENT', id })
  }, [])

  // ── Appointments ──────────────────────────────────────────
  const addAppointment = useCallback((data) => {
    const appt = { ...data, id: genId('RDV'), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_APPOINTMENT', payload: appt })
    return appt
  }, [])

  const updateAppointment = useCallback((id, data) => {
    dispatch({ type: 'UPDATE_APPOINTMENT', id, payload: data })
  }, [])

  const deleteAppointment = useCallback((id) => {
    dispatch({ type: 'DELETE_APPOINTMENT', id })
  }, [])

  // ── Examens ───────────────────────────────────────────────
  const addExamen = useCallback((data) => {
    const ex = { ...data, id: genId('EX'), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_EXAMEN', payload: ex })
    return ex
  }, [])

  const updateExamen = useCallback((id, data) => {
    dispatch({ type: 'UPDATE_EXAMEN', id, payload: data })
  }, [])

  // ── Rapports ──────────────────────────────────────────────
  const addRapport = useCallback((data) => {
    const r = { ...data, id: genId('RPT'), date: new Date().toLocaleDateString('fr-FR'), status: 'valide', createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_RAPPORT', payload: r })
    return r
  }, [])

  // ── Users (admin) ─────────────────────────────────────────
  const getUsers = useCallback(() => getStoredUsers(), [])

  const addUser = useCallback((data) => {
    const users = getStoredUsers()
    const newUser = { ...data, id: genId('USR'), createdAt: new Date().toISOString().split('T')[0] }
    saveUsers([...users, newUser])
    return newUser
  }, [])

  const deleteUser = useCallback((id) => {
    const users = getStoredUsers().filter(u => u.id !== id)
    saveUsers(users)
  }, [])

  const value = {
    // State
    patients: state.patients,
    appointments: state.appointments,
    examens: state.examens,
    rapports: state.rapports,
    // Patient actions
    addPatient, updatePatient, deletePatient,
    // Appointment actions
    addAppointment, updateAppointment, deleteAppointment,
    // Examen actions
    addExamen, updateExamen,
    // Rapport actions
    addRapport,
    // User actions (admin)
    getUsers, addUser, deleteUser,
    // Helpers
    getPatientById: (id) => state.patients.find(p => p.id === id),
    getExamenById: (id) => state.examens.find(e => e.id === id),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
