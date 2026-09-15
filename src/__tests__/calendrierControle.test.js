/**
 * LE CONTRÔLE DANS LA GRILLE DU CALENDRIER.
 *
 * « La couleur seule ne doit pas porter toute l'information » — le fond orange
 * ne dit rien à qui ne lit pas la légende, et rien du tout à un lecteur
 * d'écran. Le mot « Contrôle » doit donc être dans le DOM, et le jour même
 * doit se distinguer des jours d'avant.
 */

import { render, screen } from '@testing-library/react';
import { CalendrierContenu } from '../components/CalendrierContenu';
import { getMatieresEleve } from '../lib/api/elevesApi';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

jest.mock('../lib/api/elevesApi', () => ({
  getMatieresEleve: jest.fn(),
  creerControle: jest.fn(),
  modifierControle: jest.fn(),
}));

// `resetMocks: true` (la configuration Jest de CRA) efface l'implémentation
// passée à `jest.fn(...)` avant CHAQUE test : elle doit donc être reposée ici,
// et pas dans la fabrique du mock.
beforeEach(() => {
  getMatieresEleve.mockResolvedValue({ data: [] });
});

/** « AAAA-MM-JJ » d'une date locale, sans passer par UTC. */
const iso = (date) => {
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-${jour}`;
};

const calendrierAvec = (controles) => () =>
  Promise.resolve({
    data: {
      zone: 'C',
      vacances: [],
      seances: [],
      evaluations: [],
      controles,
      prochaineVacances: null,
    },
  });

const controleLe = (date) => ({
  id: 42,
  matiereId: 1,
  matiereLibelle: 'Mathématiques',
  sujet: 'Les fractions',
  dateControle: `${iso(date)}T00:00:00`,
  heureControle: null,
});

test('la case porte le mot « Contrôle », pas seulement une couleur', async () => {
  // Un jour du mois courant, différent d'aujourd'hui : le 15 tombe toujours
  // dans le mois affiché, et n'est « aujourd'hui » qu'un jour sur trente.
  const aujourdhui = new Date();
  const leQuinze = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 15);

  render(
    <CalendrierContenu eleveId="9" chargerCalendrier={calendrierAvec([controleLe(leQuinze)])} />,
  );

  // Au moins deux : celui de la légende, et celui de la case.
  const marques = await screen.findAllByText('Contrôle');
  expect(marques.length).toBeGreaterThanOrEqual(2);
});

test('le jour même du contrôle est renforcé', async () => {
  const aujourdhui = new Date();

  const { container } = render(
    <CalendrierContenu eleveId="9" chargerCalendrier={calendrierAvec([controleLe(aujourdhui)])} />,
  );

  await screen.findAllByText('Contrôle');

  expect(container.querySelector('.calendrier-jour--controle-aujourdhui')).not.toBeNull();
});

test('un contrôle passé ne respire plus', async () => {
  // Le 1er du mois précédent : forcément dépassé, et hors du mois affiché…
  // on remonte donc d'abord le calendrier sur SON mois via la date du jour.
  const aujourdhui = new Date();
  const hier = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() - 1);

  // Un contrôle d'hier n'a de sens ici que si hier est dans le mois affiché.
  if (hier.getMonth() !== aujourdhui.getMonth()) return;

  const { container } = render(
    <CalendrierContenu eleveId="9" chargerCalendrier={calendrierAvec([controleLe(hier)])} />,
  );

  await screen.findAllByText('Contrôle');

  expect(container.querySelector('.calendrier-jour--controle-passe')).not.toBeNull();
  expect(container.querySelector('.calendrier-jour--controle')).toBeNull();
});
