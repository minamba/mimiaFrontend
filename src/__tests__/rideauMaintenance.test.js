/**
 * LE RIDEAU NE DOIT JAMAIS ENFERMER L'ADMINISTRATEUR DEHORS.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Ce composant remplace le site entier par une page d'attente. S'il se trompe
 * de côté, il n'y a aucun recours par l'interface : on ne peut plus atteindre
 * l'administration pour lever le rideau, et il faut aller modifier la table des
 * réglages à la main sur la production.
 *
 * Trois façons de s'enfermer dehors, une par test :
 *
 *   1. Masquer PENDANT que la session se restaure. Le rôle n'arrive qu'après —
 *      masquer avant, c'est renvoyer l'administrateur sur la page d'attente à
 *      chaque rafraîchissement, et l'y laisser si la restauration tarde.
 *
 *   2. Masquer `/callback`. La connexion se termine là : intercepté, le retour
 *      du serveur d'identité n'établit jamais la session, et le lien « Accès
 *      administrateur » de la page d'attente tourne en rond indéfiniment.
 *
 *   3. Tirer le rideau sur une lecture de réglage qui a échoué. Une API muette
 *      rendrait `undefined` : le lire comme « vrai » fermerait le site tout
 *      seul, sur une panne de réseau.
 */

import { render, screen } from '@testing-library/react';
import VerrouMaintenance from '../components/VerrouMaintenance';

// L'état d'authentification et le drapeau, pilotés test par test.
let mockAuth = { estAdmin: false, loading: false };
let mockMaintenance = false;

jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({ auth: mockAuth }),
  useDispatch: () => jest.fn(),
}));

jest.mock('../lib/storage/modeTest', () => ({
  useMaintenance: () => mockMaintenance,
}));

// React Router v7 expose ses sous-chemins d'une façon que le résolveur de
// Jest fourni par CRA ne sait pas suivre : importer le vrai module fait
// échouer la suite AVANT le premier test. Le composant ne se sert que de
// useLocation — on le remplace, et le test reste sur ce qu'il doit prouver.
let mockChemin = '/';
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockChemin }),
}));

const CONTENU = 'le site normal';

function monter(chemin = '/') {
  mockChemin = chemin;
  return render(<VerrouMaintenance><p>{CONTENU}</p></VerrouMaintenance>);
}

beforeEach(() => {
  mockAuth = { estAdmin: false, loading: false };
  mockMaintenance = false;
});

test('rideau levé : le site s’affiche', () => {
  monter();
  expect(screen.getByText(CONTENU)).toBeInTheDocument();
});

test('rideau tiré : un visiteur voit la page d’attente', () => {
  mockMaintenance = true;
  monter();

  expect(screen.queryByText(CONTENU)).not.toBeInTheDocument();
  expect(screen.getByText(/revenons très vite/i)).toBeInTheDocument();
});

test('rideau tiré : l’administrateur passe au travers', () => {
  mockMaintenance = true;
  mockAuth = { estAdmin: true, loading: false };
  monter();

  expect(screen.getByText(CONTENU)).toBeInTheDocument();
});

test('session en cours de restauration : on ne masque pas encore', () => {
  // `estAdmin` vaut faux tant que le profil n'est pas lu. Masquer ici
  // afficherait la page d'attente à l'administrateur à chaque F5.
  mockMaintenance = true;
  mockAuth = { estAdmin: false, loading: true };
  monter();

  expect(screen.getByText(CONTENU)).toBeInTheDocument();
});

test('le retour de connexion reste ouvert', () => {
  mockMaintenance = true;
  monter('/callback');

  // Sans ça, l'administrateur qui se connecte depuis la page d'attente
  // n'établit jamais sa session : le seul chemin de retour est coupé.
  expect(screen.getByText(CONTENU)).toBeInTheDocument();
});

test('la page d’attente offre un chemin de connexion', () => {
  mockMaintenance = true;
  monter();

  expect(
    screen.getByRole('button', { name: /accès administrateur/i }),
  ).toBeInTheDocument();
});
