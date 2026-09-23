/**
 * LA PORTE DES JEUX SUR L'ACCUEIL DE L'ENFANT.
 *
 * Camara, le 21/09/2026 : « pourquoi le bouton des jeux disparaît tout le
 * temps sur la vue enfant ? ». Le réglage était allumé en base, l'API le
 * renvoyait, le cycle de l'enfant était juste, et le paquet servi par le
 * serveur de développement contenait bien le code. Tout vérifié un par un —
 * et le bouton manquait quand même.
 *
 * D'OÙ CE TEST : il monte la vraie grille, dans le vrai cas — une session
 * enfant, une classe de CP, l'interrupteur « Primaire » allumé — au lieu de
 * vérifier les morceaux séparément. C'est ce que j'aurais dû faire d'emblée :
 * chaque pièce était juste, c'est leur assemblage qui ne l'était pas.
 */

import { render, screen, waitFor } from '@testing-library/react';
import GrilleMatieres from '../components/GrilleMatieres';

const ETAT = {
  referentiel: { matieres: [] },
  eleves: { liste: [] },
  auth: { estAdmin: false },
};

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '24' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ hash: '' }),
}));

// La session de Zakariya, telle qu'elle est écrite dans le navigateur d'un
// enfant connecté AVANT que le cycle n'existe : elle ne porte que sa classe.
jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 24, prenom: 'Zakariya', niveau: 'CP' }),
  accueilEleve: (id) => `/eleves/${id}/matieres`,
}));

jest.mock('../lib/api/elevesApi', () => new Proxy({}, {
  get: () => jest.fn().mockResolvedValue({ data: [] }),
}));

jest.mock('../lib/actions/referentielActions', () => ({ chargerReferentiel: () => ({ type: 'x' }) }));
jest.mock('../lib/actions/elevesActions', () => ({ chargerEleves: () => ({ type: 'x' }) }));

jest.mock('../lib/api/reglagesApi', () => ({ getReglagesPublics: jest.fn() }));
jest.mock('../lib/storage/fluxReglages', () => ({ demarrerFluxReglages: () => () => {} }));
jest.mock('../lib/storage/styleSite', () => ({
  appliquerBlueSky: () => {},
  blueSkyEnregistre: () => false,
}));

const { getReglagesPublics } = require('../lib/api/reglagesApi');
const { oublierReglages } = require('../lib/storage/modeTest');

const reglages = (jeux) => {
  getReglagesPublics.mockResolvedValue({
    data: { jeuxPrimaire: false, jeuxCollege: false, jeuxLycee: false, ...jeux },
  });
  oublierReglages();
};

test('un CP voit sa porte quand « Primaire » est allumé', async () => {
  reglages({ jeuxPrimaire: true });

  render(<GrilleMatieres />);

  await waitFor(() => {
    expect(screen.getByRole('link', { name: /Mes jeux/ })).toBeInTheDocument();
  });
});

test('et il ne la voit pas quand l’interrupteur est éteint', async () => {
  reglages({ jeuxCollege: true });

  render(<GrilleMatieres />);

  await waitFor(() => expect(getReglagesPublics).toHaveBeenCalled());
  expect(screen.queryByRole('link', { name: /Mes jeux/ })).not.toBeInTheDocument();
});
