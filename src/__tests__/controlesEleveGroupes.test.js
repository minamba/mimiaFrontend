/**
 * LA PAGE « MES CONTRÔLES » : REGROUPÉE PAR MATIÈRE.
 *
 * Voulu par Camara le 13/09/2026 : la liste mélangeait toutes les matières à
 * la suite, sans repère. Un enfant qui a trois contrôles cette semaine doit
 * voir d'un coup d'œil combien lui reviennent dans chaque matière.
 *
 * L'ORDRE DES GROUPES SUIT L'URGENCE : la matière dont le PROCHAIN contrôle
 * est le plus proche vient en premier — c'est celle qui presse. Le serveur
 * trie déjà par date ; le premier contrôle rencontré pour une matière est
 * donc le sien.
 */

import { render, screen } from '@testing-library/react';
import ControlesEleve from '../components/ControlesEleve';
import { getControles, getMatieresEleve } from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi', () => ({
  getControles: jest.fn(),
  getMatieresEleve: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '9' }),
  useNavigate: () => jest.fn(),
}));

const CONTROLE = (id, matiereId, matiereLibelle, joursRestants) => ({
  id,
  matiereId,
  matiereLibelle,
  sujet: `Contrôle ${id}`,
  dateControle: '2026-09-20T00:00:00',
  joursRestants,
  nombrePreparations: 0,
  preparation: { pourcent: 0, perimetreConnu: false, total: 0, acquises: 0, notions: [] },
});

beforeEach(() => {
  jest.clearAllMocks();
  getMatieresEleve.mockResolvedValue({ data: [] });
});

test('les contrôles sont groupés par matière, sous un titre qui porte le compte', async () => {
  getControles.mockResolvedValue({
    data: [
      CONTROLE(1, 1, 'Mathématiques', 2),
      CONTROLE(2, 2, 'Histoire-Géographie', 5),
      CONTROLE(3, 1, 'Mathématiques', 9),
    ],
  });

  render(<ControlesEleve />);

  const titres = await screen.findAllByRole('heading', { level: 2 });

  // Deux contrôles de maths, un d'histoire-géo : le compte est écrit, pas
  // seulement suggéré par le nombre de cartes. Ciblé sur le TITRE DE GROUPE,
  // pas sur le nom de matière déjà répété sur chaque carte.
  const maths = titres.find((t) => t.textContent.startsWith('Mathématiques'));
  expect(maths.textContent).toContain('2');
  expect(titres.some((t) => t.textContent.startsWith('Histoire-Géographie'))).toBe(true);
});

/**
 * DEUX PROFESSEURS D'UNE MÊME MATIÈRE (les deux Yann) restent deux groupes
 * distincts : le regroupement se fait sur l'identifiant, jamais sur le
 * libellé affiché, qui peut se répéter.
 */
test('deux matières de même libellé mais d’identifiants différents restent deux groupes', async () => {
  getControles.mockResolvedValue({
    data: [
      CONTROLE(1, 10, 'Anglais', 2),
      CONTROLE(2, 11, 'Anglais', 4),
    ],
  });

  render(<ControlesEleve />);

  await screen.findByText('Contrôle 1');

  const titres = screen.getAllByRole('heading', { level: 2 });
  const anglais = titres.filter((t) => t.textContent.startsWith('Anglais'));
  expect(anglais).toHaveLength(2);
  anglais.forEach((titre) => expect(titre.textContent).toContain('1'));
});

test('le groupe dont le prochain contrôle est le plus proche vient en premier', async () => {
  // Le serveur rend déjà les contrôles triés par date : Mathématiques (2
  // jours) avant Histoire-Géographie (9 jours). Le regroupement ne trie rien
  // lui-même — il garde le premier contrôle rencontré pour chaque matière
  // comme date de référence du groupe, donc cet ordre doit survivre.
  getControles.mockResolvedValue({
    data: [
      CONTROLE(1, 1, 'Mathématiques', 2),
      CONTROLE(2, 2, 'Histoire-Géographie', 9),
    ],
  });

  render(<ControlesEleve />);

  const titres = await screen.findAllByRole('heading', { level: 2 });
  expect(titres[0].textContent).toContain('Mathématiques');
  expect(titres[1].textContent).toContain('Histoire-Géographie');
});
