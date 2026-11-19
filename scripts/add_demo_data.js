// scripts/add_demo_data.js
// This script augments the seed data in AppContext.jsx by adding sample patients
// and associated appointments. Run with `node scripts/add_demo_data.js`.

const fs = require('fs');
const path = require('path');

const appContextPath = path.resolve(__dirname, '..', 'frontend', 'src', 'context', 'AppContext.jsx');
let content = fs.readFileSync(appContextPath, 'utf-8');

// Helper to generate a simple ID
const genId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

// New patients to add
const newPatients = [
  {
    id: genId('P'),
    name: 'Amira Saidi',
    dob: '12/06/1992',
    age: 31,
    phone: '21 345 678',
    email: 'amira.saidi@email.com',
    address: 'Sfax, Tunisie',
    status: 'nouveau',
    antecedents: 'Aucun',
    allergies: 'Aucune',
    doctorId: 'USR-002',
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: genId('P'),
    name: 'Mohamed Zair',
    dob: '05/03/1988',
    age: 35,
    phone: '56 789 012',
    email: 'mohamed.zair@email.com',
    address: 'Tunis, Tunisie',
    status: 'nouveau',
    antecedents: 'Hypertension',
    allergies: 'Pénicilline',
    doctorId: 'USR-002',
    createdAt: new Date().toISOString().split('T')[0],
  },
];

// Corresponding appointments (one per new patient)
const newAppointments = newPatients.map(p => ({
  id: genId('RDV'),
  patientId: p.id,
  patientName: p.name,
  doctorId: p.doctorId,
  doctorName: 'Dr. Sarah Benali',
  date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
  time: '10:00',
  type: 'Consultation',
  status: 'confirme',
  notes: '',
}));

// Insert patients into the SEED.patients array
content = content.replace(/patients:\s*\[/, match => {
  const patientsToInsert = newPatients.map(p => `    ${JSON.stringify(p)},`).join('\n');
  return `${match}\n${patientsToInsert}`;
});

// Insert appointments into the SEED.appointments array
content = content.replace(/appointments:\s*\[/, match => {
  const appointmentsToInsert = newAppointments.map(a => `    ${JSON.stringify(a)},`).join('\n');
  return `${match}\n${appointmentsToInsert}`;
});

fs.writeFileSync(appContextPath, content, 'utf-8');
console.log('✅ Added demo patients and appointments to AppContext seed data.');
