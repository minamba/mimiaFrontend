/**
 * L'ENTRÉE DE L'ADMINISTRATION, SUR « VOS ENFANTS » — Camara, le 17/09/2026 :
 * « à droite du bouton mon compte, on aura un bouton administration qui
 * emmènera dans le côté admin ».
 *
 * CE QUE CE TEST PROTÈGE
 * ----------------------
 * Jusqu'ici, un administrateur devait connaître /admin et le taper dans la
 * barre d'adresse. Un accès qu'on ouvre à quelqu'un doit se voir, sinon on le
 * lui explique à chaque fois — et le jour où Camara en nomme trois, il
 * l'expliquera trois fois.
 *
 * MONTRER N'EST PAS AUTORISER. Ce bouton ne fait qu'ouvrir une porte déjà
 * gardée : `RouteProtegee` refuse /admin à qui n'a pas le rôle, et l'API
 * revérifie à chaque appel. Le cacher à un parent ordinaire lui épargne
 * seulement un bouton qui le renverrait d'où il vient.
 */

import { render, screen } from '@testing-library/react';
import ListeEleves from '../components/ListeEleves';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, state, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => () => {},
}));

let mockEstAdmin = false;

// LA MÊME FONCTION À CHAQUE RENDU, comme le vrai `dispatch` : une nouvelle à
// chaque appel relancerait l'effet de chargement sans fin.
const mockDispatch = () => {};

jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({
    eleves: { liste: [], loading: false, error: null },
    auth: { estAdmin: mockEstAdmin },
  }),
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
  getCodeEleve: () => Promise.resolve({ data: { code: 'K7P2QX', suspendu: false } }),
}));

describe('Le bouton « Administration »', () => {
  test('un parent ordinaire ne le voit pas', () => {
    mockEstAdmin = false;
    render(<ListeEleves />);

    expect(screen.queryByRole('link', { name: /administration/i })).toBeNull();
    expect(screen.getByRole('link', { name: /mon compte/i })).toBeInTheDocument();
  });

  test('un administrateur le voit, et il mène au tableau de bord', () => {
    mockEstAdmin = true;
    render(<ListeEleves />);

    expect(screen.getByRole('link', { name: /administration/i }))
      .toHaveAttribute('href', '/admin');
  });
});
