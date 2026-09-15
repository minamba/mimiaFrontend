/**
 * UNE NOTION SORTIE DU PROGRAMME RESTE SUR LA CARTE DE L'ENFANT.
 *
 * Décidé par Camara le 13/09/2026 : « une notion valable à N-1 mais plus à N,
 * il faut l'enlever ; par contre pour les élèves de N-1 qui ont travaillé
 * dessus, il ne faut pas supprimer les traces. La notion restera en tant
 * qu'obsolète. »
 *
 * Le serveur la renvoie avec `ancienProgramme: true` et `autreNiveau: true` :
 * elle quitte la liste de l'année — elle n'est plus sur son chemin — et
 * rejoint ce qu'il a consolidé avant, dite comme telle. Le mot est écrit :
 * une bordure en pointillés ne se devine pas.
 */

import { render, screen, within } from '@testing-library/react';
import Progression from '../components/Progression';
import { getProgression } from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi', () => ({
  getProgression: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useParams: () => ({ eleveId: '9' }),
  useNavigate: () => jest.fn(),
}));

const NOTION = (id, libelle, surcharges = {}) => ({
  id,
  libelle,
  domaine: 'Nombres et calculs',
  matiere: 'Mathématiques',
  etat: 'a-decouvrir',
  niveau: '4e',
  niveauOrdre: 8,
  autreNiveau: false,
  ancienProgramme: false,
  ...surcharges,
});

test('la notion obsolète est signalée « ancien programme », hors de la liste de l’année', async () => {
  getProgression.mockResolvedValue({
    data: {
      acquises: 0,
      total: 1,
      acquisesAutresAnnees: 1,
      nouvelles: [],
      niveau: '4e',
      matieres: [
        {
          matiereId: 1,
          libelle: 'Mathématiques',
          couleur: null,
          total: 1,
          acquises: 0,
          competences: [
            NOTION(1, 'Calcul littéral : identités remarquables', {
              etat: 'acquise',
              autreNiveau: true,
              ancienProgramme: true,
            }),
            NOTION(2, 'Fractions : additionner'),
          ],
        },
      ],
    },
  });

  render(<Progression />);

  const marque = await screen.findByText('ancien programme');
  expect(marque).toBeInTheDocument();

  // Elle vit dans la section des années précédentes, à côté de la notion.
  const avant = marque.closest('.parcours__avant');
  expect(avant).not.toBeNull();
  expect(within(avant).getByText('Calcul littéral : identités remarquables')).toBeInTheDocument();

  // Et elle n'est PAS dans le programme de l'année : le compte de la matière
  // ne la compte pas — 0 acquise sur 1, la notion active restante.
  expect(screen.getByText('0 / 1')).toBeInTheDocument();

  // Une notion active de l'année ne porte pas la marque.
  expect(screen.getAllByText('ancien programme')).toHaveLength(1);
});

test('sans notion obsolète, la marque n’apparaît nulle part', async () => {
  getProgression.mockResolvedValue({
    data: {
      acquises: 1,
      total: 2,
      acquisesAutresAnnees: 0,
      nouvelles: [],
      niveau: '4e',
      matieres: [
        {
          matiereId: 1,
          libelle: 'Mathématiques',
          couleur: null,
          total: 2,
          acquises: 1,
          competences: [
            NOTION(1, 'Fractions : additionner', { etat: 'acquise' }),
            NOTION(2, 'Fractions : comparer'),
          ],
        },
      ],
    },
  });

  render(<Progression />);

  await screen.findByText('Fractions : additionner');
  expect(screen.queryByText('ancien programme')).not.toBeInTheDocument();
});
