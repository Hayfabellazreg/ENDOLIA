export const doctor = {
  name: 'Dr. Sarah Benali',
  specialty: 'Gastro-entérologue',
  avatar: null,
  id: 'DOC-001',
};

export const patients = [
  { id: 'P-001', name: 'Sofia Trabelsi', dob: '22/07/1990', age: 34, phone: '96 765 432', email: 'sofia.trabelsi@email.com', address: 'Tunis, Tunisie', status: 'actif', antecedents: 'Aucun notable', allergies: 'Aucune connue', lastVisit: '03/04/2025', examens: 2 },
  { id: 'P-002', name: 'Karim Mekni', dob: '15/03/1978', age: 47, phone: '71 234 567', email: 'karim.mekni@email.com', address: 'Sousse, Tunisie', status: 'en cours', antecedents: 'Polype 2022', allergies: 'Pénicilline', lastVisit: '28/03/2025', examens: 3 },
  { id: 'P-003', name: 'Youssef Hammami', dob: '08/11/1965', age: 59, phone: '23 456 789', email: 'y.hammami@email.com', address: 'Sfax, Tunisie', status: 'nouveau', antecedents: 'HTA, Diabète type 2', allergies: 'Aucune connue', lastVisit: '15/03/2025', examens: 1 },
  { id: 'P-004', name: 'Ahmed Bensalem', dob: '30/05/1982', age: 42, phone: '55 678 901', email: 'a.bensalem@email.com', address: 'Bizerte, Tunisie', status: 'actif', antecedents: 'Aucun notable', allergies: 'Aspirine', lastVisit: '10/03/2025', examens: 1 },
  { id: 'P-005', name: 'Leila Gharbi', dob: '14/09/1995', age: 29, phone: '90 112 233', email: 'leila.gharbi@email.com', address: 'Nabeul, Tunisie', status: 'nouveau', antecedents: 'Aucun notable', allergies: 'Aucune connue', lastVisit: '01/04/2025', examens: 1 },
];

export const examens = [
  { id: 'EX-4587', type: 'Coloscopie', date: '03/04/2025', time: '10:24', patientId: 'P-001', patient: 'Sofia Trabelsi', status: 'en_analyse', thumbnail: null, rapport: null },
  { id: 'EX-4521', type: 'Coloscopie', date: '28/03/2025', time: '14:10', patientId: 'P-002', patient: 'Karim Mekni', status: 'termine', thumbnail: null, rapport: 'RPT-021' },
  { id: 'EX-4480', type: 'Coloscopie', date: '15/03/2025', time: '09:45', patientId: 'P-003', patient: 'Youssef Hammami', status: 'en_analyse', thumbnail: null, rapport: null },
  { id: 'EX-4401', type: 'Coloscopie', date: '10/03/2025', time: '11:20', patientId: 'P-004', patient: 'Ahmed Bensalem', status: 'termine', thumbnail: null, rapport: 'RPT-018' },
  { id: 'EX-4350', type: 'Gastroscopie', date: '01/04/2025', time: '08:30', patientId: 'P-005', patient: 'Leila Gharbi', status: 'en_attente', thumbnail: null, rapport: null },
];

export const analyses = [
  { id: 'AI-001', examenId: 'EX-4587', patient: 'Sofia Trabelsi', date: '03/04/2025', confidence: 92, localisation: 'Côlon sigmoïde', taille: '8 mm', surface: '2.3 %', forme: 'Ovalaire', status: 'detecte' },
  { id: 'AI-002', examenId: 'EX-4480', patient: 'Youssef Hammami', date: '15/03/2025', confidence: 78, localisation: 'Côlon ascendant', taille: '5 mm', surface: '1.1 %', forme: 'Ronde', status: 'detecte' },
];

export const rendezvous = [
  { id: 'RDV-001', patient: 'Ahmed Bensalem', date: '2025-04-21', time: '10:00', type: 'Coloscopie', status: 'confirme' },
  { id: 'RDV-002', patient: 'Leila Gharbi', date: '2025-04-23', time: '11:00', type: 'Consultation', status: 'confirme' },
  { id: 'RDV-003', patient: 'Sofia Trabelsi', date: '2025-04-25', time: '09:00', type: 'Coloscopie', status: 'confirme' },
  { id: 'RDV-004', patient: 'Karim Mekni', date: '2025-04-25', time: '11:00', type: 'Suivi', status: 'confirme' },
  { id: 'RDV-005', patient: 'Youssef Hammami', date: '2025-04-25', time: '12:00', type: 'Suivi', status: 'en_attente' },
  { id: 'RDV-006', patient: 'Ahmed Bensalem', date: '2025-04-28', time: '14:00', type: 'Gastroscopie', status: 'confirme' },
];

export const comptesRendus = [
  { id: 'RPT-021', examenId: 'EX-4521', patient: 'Karim Mekni', date: '28/03/2025', type: 'Coloscopie', conclusion: 'Polype sessile 6mm retiré au niveau du côlon transverse. Biopsie envoyée. Contrôle dans 3 ans.', status: 'valide' },
  { id: 'RPT-018', examenId: 'EX-4401', patient: 'Ahmed Bensalem', date: '10/03/2025', type: 'Coloscopie', conclusion: 'Examen sans anomalie. Muqueuse d\'aspect normal sur toute la longueur explorée. Pas de polype détecté.', status: 'valide' },
];

export const stats = {
  patientsAujourdhui: 4,
  examensEnCours: 2,
  analysesIA: 5,
  rdvSemaine: 6,
};
