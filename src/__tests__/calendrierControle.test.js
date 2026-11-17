/**
 * LE CONTRÔLE DANS LA GRILLE DU CALENDRIER.
 *
 * « La couleur seule ne doit pas porter toute l'information » — le fond orange
 * ne dit rien à qui ne lit pas la légende, et rien du tout à un lecteur
 * d'écran. Le mot « Contrôle » doit donc être dans le DOM, et le jour même
 * doit se distinguer des jours d'avant.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { CalendrierContenu } from '../components/CalendrierContenu';
import { getMatieresEleve } from '../lib/api/elevesApi';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

jest.mock('../lib/besoins', () => ({ useAffichageEleve: () => ({ calme: false }) }));

// La fenêtre d'avant séance (durée, casque) : réduite à son bouton « Commencer ».
jest.mock('../components/OuvertureSeance', () => ({ onOuvrir }) => (
  <button type="button" onClick={() => onOuvrir(30, true)}>Commencer la séance</button>
));

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

/**
 * PRÉPARER LE CONTRÔLE, OU EN FAIRE LE POINT, DEPUIS LE CALENDRIER (Camara, le 16/11/2026) : dans la fenêtre du jour,
 * chaque contrôle a son bouton — « Préparer avec le prof » jusqu'au jour même, « Faire le point » ensuite — qui ouvre
 * la séance avec le mode du contrôle.
 */
test('« Préparer avec le prof » ouvre la séance de préparation du contrôle', async () => {
  const { container } = render(
    <CalendrierContenu eleveId="9" chargerCalendrier={calendrierAvec([controleLe(new Date())])} />,
  );
  await screen.findAllByText('Contrôle');

  fireEvent.click(container.querySelector('.calendrier-jour--controle-aujourdhui'));
  fireEvent.click(await screen.findByRole('button', { name: 'Préparer avec le prof' }));
  expect(screen.queryByRole('button', { name: 'Faire le point' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Commencer la séance' }));

  expect(mockNavigate).toHaveBeenCalledWith('/eleves/9/matieres/1/chat?duree=30&casque=1&mode=controle&controleId=42');
});

test('un contrôle passé propose « Faire le point » à la place', async () => {
  const aujourdhui = new Date();
  const hier = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() - 1);
  if (hier.getMonth() !== aujourdhui.getMonth()) return;

  const { container } = render(
    <CalendrierContenu eleveId="9" chargerCalendrier={calendrierAvec([controleLe(hier)])} />,
  );
  await screen.findAllByText('Contrôle');

  fireEvent.click(container.querySelector('.calendrier-jour--controle-passe'));
  fireEvent.click(await screen.findByRole('button', { name: 'Faire le point' }));
  expect(screen.queryByRole('button', { name: 'Préparer avec le prof' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Commencer la séance' }));

  expect(mockNavigate).toHaveBeenCalledWith('/eleves/9/matieres/1/chat?duree=30&casque=1&mode=bilan&controleId=42');
});
