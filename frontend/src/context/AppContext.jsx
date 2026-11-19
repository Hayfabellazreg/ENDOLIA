import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { getStoredUsers, saveUsers } from './AuthContext'

const AppContext = createContext(null)
const STORAGE_KEY = 'endolia_app_data'
const DATA_VERSION = 3  // bump this to force a data reset when seed changes

// ─── Seed data ──────────────────────────────────────────────
const SEED = {
  version: DATA_VERSION,
  patients: [
    { id: 'P-001', name: 'Sofia Trabelsi', dob: '22/07/1990', age: 34, phone: '96 765 432', email: 'sofia.trabelsi@email.com', address: 'Tunis, Tunisie', status: 'actif', antecedents: 'Aucun notable', allergies: 'Aucune connue', doctorId: 'USR-002', createdAt: '2025-03-01' },
    { id: 'P-002', name: 'Karim Mekni', dob: '15/03/1978', age: 47, phone: '71 234 567', email: 'karim.mekni@email.com', address: 'Sousse, Tunisie', status: 'en_cours', antecedents: 'Polype 2022', allergies: 'Pénicilline', doctorId: 'USR-002', createdAt: '2025-02-15' },
    { id: 'P-003', name: 'Youssef Hammami', dob: '08/11/1965', age: 59, phone: '23 456 789', email: 'y.hammami@email.com', address: 'Sfax, Tunisie', status: 'nouveau', antecedents: 'HTA, Diabète type 2', allergies: 'Aucune connue', doctorId: 'USR-002', createdAt: '2025-03-10' },
    { id: 'P-004', name: 'Ahmed Bensalem', dob: '30/05/1982', age: 42, phone: '55 678 901', email: 'a.bensalem@email.com', address: 'Bizerte, Tunisie', status: 'actif', antecedents: 'Aucun notable', allergies: 'Aspirine', doctorId: 'USR-002', createdAt: '2025-03-15' },
    { id: 'P-005', name: 'Leila Gharbi', dob: '14/09/1995', age: 29, phone: '90 112 233', email: 'leila.gharbi@email.com', address: 'Nabeul, Tunisie', status: 'nouveau', antecedents: 'Aucun notable', allergies: 'Aucune connue', doctorId: 'USR-002', createdAt: '2025-03-20' },
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
    { id: 'RPT-020', examenId: 'EX-4480', patientId: 'P-003', patient: 'Youssef Hammami', doctorId: 'USR-002', date: '15/03/2025', type: 'Coloscopie', conclusion: "Examen sans anomalie. Muqueuse d'aspect normal sur toute la longueur explorée.", status: 'valide' },
  ],
  notifications: [],
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PATIENT':    return { ...state, patients: [...state.patients, action.payload] }
    case 'UPDATE_PATIENT': return { ...state, patients: state.patients.map(p => p.id === action.id ? { ...p, ...action.payload } : p) }
    case 'DELETE_PATIENT': return { ...state, patients: state.patients.filter(p => p.id !== action.id) }
    case 'ADD_APPOINTMENT':    return { ...state, appointments: [...state.appointments, action.payload] }
    case 'UPDATE_APPOINTMENT': return { ...state, appointments: state.appointments.map(a => a.id === action.id ? { ...a, ...action.payload } : a) }
    case 'DELETE_APPOINTMENT': return { ...state, appointments: state.appointments.filter(a => a.id !== action.id) }
    case 'ADD_EXAMEN':    return { ...state, examens: [...state.examens, action.payload] }
    case 'UPDATE_EXAMEN': return { ...state, examens: state.examens.map(e => e.id === action.id ? { ...e, ...action.payload } : e) }
    case 'ADD_RAPPORT':    return { ...state, rapports: [...state.rapports, action.payload] }
    // Notifications actions
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...(state.notifications || [])] }
    case 'MARK_READ':
      return { ...state, notifications: (state.notifications || []).map(n => n.id === action.id ? { ...n, read: true } : n) }
    case 'MARK_ALL_READ':
      return { ...state, notifications: (state.notifications || []).map(n => ({ ...n, read: true })) }
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }
    default: return state
  }
}

function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) {
      const parsed = JSON.parse(s)
      if (!parsed.version || parsed.version < DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEY)
        return { ...SEED }
      }
      // Preserve notifications array for older data structures
      return { notifications: [], ...parsed }
    }
  } catch {}
  return { ...SEED }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: DATA_VERSION }))
  }, [state])

  // Notification helper
  const pushNotification = useCallback((notif) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: genId('NOTIF'),
        read: false,
        createdAt: new Date().toISOString(),
        ...notif,
      },
    })
  }, [])

  const markRead = useCallback((id) => dispatch({ type: 'MARK_READ', id }), [])
  const markAllRead = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), [])
  const clearNotifications = useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), [])

  // CRUD actions with automatic notifications
  const addPatient = useCallback((data) => {
    const p = { ...data, id: genId('P'), createdAt: new Date().toISOString().split('T')[0] }
    dispatch({ type: 'ADD_PATIENT', payload: p })
    if (data.doctorId) {
      pushNotification({
        type: 'patient',
        icon: '👤',
        title: 'Nouveau patient ajouté',
        message: `${p.name} a été enregistré(e) dans votre liste de patients.`,
        targetUserId: data.doctorId,
      })
    }
    return p
  }, [pushNotification])

  const updatePatient = useCallback((id, data) => dispatch({ type: 'UPDATE_PATIENT', id, payload: data }), [])
  const deletePatient = useCallback((id) => dispatch({ type: 'DELETE_PATIENT', id }), [])

  const addAppointment = useCallback((data) => {
    const a = { ...data, id: genId('RDV'), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_APPOINTMENT', payload: a })
    if (data.doctorId) {
      pushNotification({
        type: 'rdv',
        icon: '📅',
        title: 'Nouveau rendez‑vous planifié',
        message: `${data.patientName} – ${data.type} le ${data.date} à ${data.time}.`,
        targetUserId: data.doctorId,
      })
    }
    return a
  }, [pushNotification])

  const updateAppointment = useCallback((id, data) => dispatch({ type: 'UPDATE_APPOINTMENT', id, payload: data }), [])
  const deleteAppointment = useCallback((id) => dispatch({ type: 'DELETE_APPOINTMENT', id }), [])

  const addExamen = useCallback((data) => { const e = { ...data, id: genId('EX'), createdAt: new Date().toISOString() }; dispatch({ type: 'ADD_EXAMEN', payload: e }); return e }, [])
  const updateExamen = useCallback((id, data) => dispatch({ type: 'UPDATE_EXAMEN', id, payload: data }), [])

  const addRapport = useCallback((data) => {
    const r = { ...data, id: genId('RPT'), date: new Date().toLocaleDateString('fr-FR'), status: 'valide', createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_RAPPORT', payload: r })
    return r
  }, [])

  const getUsers = useCallback(() => getStoredUsers(), [])
  const addUser = useCallback((data) => { const users = getStoredUsers(); const u = { ...data, id: genId('USR'), createdAt: new Date().toISOString().split('T')[0] }; saveUsers([...users, u]); return u }, [])
  const deleteUser = useCallback((id) => { const users = getStoredUsers().filter(u => u.id !== id); saveUsers(users) }, [])

  const value = {
    patients: state.patients,
    appointments: state.appointments,
    examens: state.examens,
    rapports: state.rapports,
    notifications: state.notifications || [],
    addPatient, updatePatient, deletePatient,
    addAppointment, updateAppointment, deleteAppointment,
    addExamen, updateExamen,
    addRapport,
    getUsers, addUser, deleteUser,
    markRead, markAllRead, clearNotifications,
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
