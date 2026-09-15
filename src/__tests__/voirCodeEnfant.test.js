/**
 * « VOIR SON CODE », SOUS CHAQUE ENFANT DE « VOS ENFANTS ».
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 *   1. LE CODE N'EST PAS CHARGÉ D'AVANCE. Une liste de six enfants afficherait
 *      sinon six codes d'accès, et lancerait six requêtes pour une information
 *      qu'on regarde deux fois par an (voir `CodeEnfant.js`).
 *   2. LA FENÊTRE SERT À LIRE ET COPIER, RIEN D'AUTRE. « Suspendre l'accès » et
 *      « Nouveau code » cassent quelque chose : ils restent dans « Mon compte ».
 *   3. ÉCHAP REFERME, comme toutes les fenêtres de l'application.
 */

import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListeEleves from '../components/ListeEleves';

// Le vrai routeur ne se charge pas sous Jest dans ce projet (« Cannot find
// module 'react-router/dom' ») : même remplacement que les autres tests.
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, state, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => () => {},
}));

const mockEleves = [
  { id: 1, prenom: 'Bilal', niveauLibelle: '3e', age: 14, derniereActivite: null },
  { id: 2, prenom: 'Zakariya', niveauLibelle: 'CP', age: 7, derniereActivite: null },
];

let mockAppelsCode;

// LA MÊME FONCTION À CHAQUE RENDU, comme le vrai `dispatch` de Redux. Une
// nouvelle à chaque appel relançait l'effet de chargement de `ListeEleves`
// (qui dépend de `dispatch`) à chaque rendu : boucle sans fin, test bloqué.
const mockDispatch = () => {};

jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({ eleves: { liste: mockEleves, loading: false, error: null } }),
  useDispatch: () => mockDispatch,
}));

jest.mock('../lib/actions/elevesActions', () => ({
  chargerEleves: () => ({ type: 'test/charger' }),
  selectionnerEleve: () => ({ type: 'test/selectionner' }),
}));

jest.mock('../lib/api/abonnementApi', () => ({
  getCapaciteEnfants: () => Promise.resolve({ data: { peutAjouter: true } }),
}));

jest.mock('../lib/api/elevesApi', () => ({
  getCodeEleve: (id) => {
    mockAppelsCode.push(id);
    return Promise.resolve({ data: { code: 'K7P2QX', suspendu: false } });
  },
  regenererCodeEleve: () => Promise.resolve({ data: {} }),
  changerAccesEleve: () => Promise.resolve({}),
}));

// Le bouton de thème lit le stockage et le DOM racine : sans rapport ici.
jest.mock('../components/BoutonTheme', () => () => null);

beforeEach(() => {
  mockAppelsCode = [];
});

// Dans un `act` asynchrone : la liste charge sa capacité au montage, et cette
// mise à jour doit se terminer PENDANT le test, pas après lui.
const monter = async () => {
  await act(async () => { render(<ListeEleves />); });
};

// LE CLIC DANS UN `act` ASYNCHRONE. Le faux serveur répond sur-le-champ : le
// code arrivait donc juste après le clic, avant même que `findByText` ne
// commence à attendre — hors de tout `act`. Ici sa réponse se traite pendant
// le clic.
const ouvrirCode = async (rang) => {
  const bandeau = screen.getAllByRole('button', { name: /voir son code/i })[rang];
  await act(async () => { await userEvent.click(bandeau); });
};

const attendreCode = (fenetre) => within(fenetre).findByText('K7P2QX');

test('chaque enfant a son bandeau « Voir son code », et aucun code n’est chargé d’avance', async () => {
  await monter();

  expect(screen.getAllByRole('button', { name: /voir son code/i })).toHaveLength(2);
  expect(mockAppelsCode).toEqual([]);
});

test('le bandeau ouvre le code du BON enfant, avec « Copier » et sans les gestes qui cassent', async () => {
  await monter();

  await ouvrirCode(1);

  const fenetre = screen.getByRole('dialog', { name: 'Le code de Zakariya' });

  expect(await attendreCode(fenetre)).toBeInTheDocument();
  expect(mockAppelsCode).toEqual([2]);

  expect(within(fenetre).getByRole('button', { name: 'Copier' })).toBeInTheDocument();
  expect(within(fenetre).queryByRole('button', { name: /nouveau code/i })).not.toBeInTheDocument();
  expect(within(fenetre).queryByRole('button', { name: /suspendre/i })).not.toBeInTheDocument();
});

test('Échap referme la fenêtre', async () => {
  await monter();

  await ouvrirCode(0);

  // Le code d'abord : fermer pendant son chargement laisserait `CodeEnfant` se
  // mettre à jour après la fin du test.
  expect(await attendreCode(screen.getByRole('dialog'))).toBeInTheDocument();

  await userEvent.keyboard('{Escape}');

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
