import {
  compteARebours, dureeEpreuve, etendueSession, heureCourte, horaireEpreuve, jourEpreuve, jourLocal, joursRestants,
} from '../lib/datesEpreuves';

// Les dates officielles des épreuves (25/11/2026) : ce que l'élève et l'administrateur lisent.
const francais = {
  nature: 'JOUR', dateEpreuve: '2027-06-24T00:00:00', heureDebut: '08:00:00', heureFin: '11:15:00',
};

test('une date du serveur se lit en date locale, sans glisser à la veille', () => {
  const d = jourLocal('2027-06-24T00:00:00');
  expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2027, 5, 24]);
  expect(jourLocal(null)).toBeNull();
});

test('un jour, un horaire, une durée', () => {
  expect(jourEpreuve(francais)).toBe('Jeudi 24 juin 2027');
  expect(heureCourte('08:00:00')).toBe('8 h');
  expect(horaireEpreuve(francais)).toBe('8 h – 11 h 15');
  expect(dureeEpreuve(francais)).toBe('3 h 15');
  expect(dureeEpreuve({ heureDebut: '08:00', heureFin: '09:00' })).toBe('1 h');
});

test('une spécialité du bac général : le 16 OU le 17', () => {
  expect(jourEpreuve({ nature: 'UN_DES_DEUX', dateEpreuve: '2027-06-16', dateFin: '2027-06-17' }))
    .toBe('Mercredi 16 ou jeudi 17 juin 2027');
});

test('une période', () => {
  expect(jourEpreuve({ nature: 'PERIODE', dateEpreuve: '2027-06-21', dateFin: '2027-07-02' }))
    .toBe('Du 21 juin au 2 juillet 2027');
});

test('le compte à rebours chauffe à l’approche, et se tait une fois l’épreuve passée', () => {
  const date = { dateEpreuve: '2027-06-24' };
  expect(joursRestants(date, new Date(2027, 5, 14))).toBe(10);
  expect(compteARebours(date, new Date(2026, 10, 25))).toMatchObject({ ton: 'loin' });
  expect(compteARebours(date, new Date(2027, 5, 1))).toMatchObject({ texte: 'J-23', ton: 'bientot' });
  expect(compteARebours(date, new Date(2027, 5, 20))).toMatchObject({ texte: 'J-4', ton: 'proche' });
  expect(compteARebours(date, new Date(2027, 5, 24))).toMatchObject({ texte: 'Aujourd’hui' });
  expect(compteARebours(date, new Date(2027, 5, 25))).toBeNull();
});

test('l’étendue de la session, d’après les dates des épreuves', () => {
  expect(etendueSession([
    francais, { dateEpreuve: '2027-06-28' }, { dateEpreuve: '2027-06-25' }, null,
  ])).toBe('Du 24 au 28 juin 2027');
  expect(etendueSession([{ nature: 'UN_DES_DEUX', dateEpreuve: '2027-06-14', dateFin: '2027-06-17' }, { dateEpreuve: '2027-06-21' }]))
    .toBe('Du 14 au 21 juin 2027');
  expect(etendueSession([])).toBeNull();
});
