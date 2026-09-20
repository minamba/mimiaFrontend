/**
 * L'ONGLET « PROGRAMME SCOLAIRE » DE L'ADMINISTRATION.
 *
 * Refait le 13/09/2026 à la demande de Camara : le programme entier, séparé
 * en classes, avec sous chaque matière ses notions et leur statut (à jour,
 * ajoutée, modifiée, retirée — et quand), puis l'échéance officielle et ce
 * que la veille en a constaté. La sentinelle, elle, ne se clôt pas.
 *
 * LE MOT EST TOUJOURS ÉCRIT : la couleur de la bulle ne fait que le
 * souligner. Les tests ciblent donc le texte, jamais une classe de couleur.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgrammeScolaireAdmin from '../components/ProgrammeScolaireAdmin';
import { getProgrammeScolaire, getVerificationExamens, traiterEcheanceReferentiel } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({
  getProgrammeScolaire: jest.fn(),
  traiterEcheanceReferentiel: jest.fn(),
  getVerificationExamens: jest.fn(),
}));

// L'encart de vérification des cartes d'examen se charge à part : ici, rien à
// vérifier. Posé avant chaque test, car les mocks sont remis à zéro entre deux.
beforeEach(() => {
  getVerificationExamens.mockResolvedValue({ data: [] });
});

const ECHEANCE = (id, surcharges = {}) => ({
  id,
  matiereLibelle: 'Français et mathématiques',
  niveauxConcernes: '4e',
  dateEcheance: '2027-09-01T00:00:00',
  dateConnue: true,
  sentinelle: false,
  texteOfficiel: 'BO n° 10 du 5 mars 2026',
  notes: null,
  url: 'https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A',
  dernierStatutVeille: null,
  dernierePageVerifieeLe: '2026-09-13T06:00:00',
  derniereAlerteLe: null,
  traiteeLe: null,
  ...surcharges,
});

const NOTION = (id, libelle, surcharges = {}) => ({
  id,
  code: `MATH_4E_${id}`,
  domaine: 'Nombres et calculs',
  libelle,
  ordre: id,
  actif: true,
  dateDebutValidite: null,
  dateFinValidite: null,
  dateCreation: null,
  dateModification: null,
  ...surcharges,
});

const PROGRAMME = {
  anneeScolaire: '2026-2027',
  titre: 'Programmes officiels 2026-2027',
  echeancesEnRetard: 0,
  sentinelles: [
    ECHEANCE(99, {
      matiereLibelle: 'Tous les programmes',
      niveauxConcernes: 'Toutes les classes',
      sentinelle: true,
      dateConnue: false,
      texteOfficiel: 'Page-carrefour des programmes scolaires (ministère)',
      dernierStatutVeille: 'changee',
    }),
  ],
  classes: [
    { code: 'CP', libelle: 'CP', ordre: 1, matieres: [] },
    {
      code: 'QUATRIEME',
      libelle: '4e',
      ordre: 8,
      matieres: [
        {
          matiereId: 1,
          code: 'MATHS',
          libelle: 'Mathématiques',
          couleur: '#123456',
          echeances: [ECHEANCE(1, { dernierStatutVeille: 'changee' })],
          notions: [
            NOTION(1, 'Fractions : additionner'),
            NOTION(2, 'Puissances de 10', { dateCreation: '2026-09-13T08:00:00' }),
            NOTION(3, 'Théorème de Pythagore', { dateModification: '2026-09-12T08:00:00' }),
            NOTION(4, 'Identités remarquables', { actif: false, dateFinValidite: '2026-09-13T08:00:00' }),
          ],
        },
        {
          matiereId: 2,
          code: 'HISTOIRE_GEO',
          libelle: 'Histoire-Géographie',
          couleur: null,
          echeances: [],
          notions: [NOTION(5, 'La Révolution française', { domaine: 'Histoire' })],
        },
      ],
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  getProgrammeScolaire.mockResolvedValue({ data: PROGRAMME });
});

test('le titre vient du serveur, avec l’année — et dit s’il y a du retard', async () => {
  render(<ProgrammeScolaireAdmin />);

  expect(await screen.findByRole('heading', { level: 2, name: 'Programmes officiels 2026-2027' }))
    .toBeInTheDocument();
  expect(screen.getByText('Aucune vérification en retard')).toBeInTheDocument();

  getProgrammeScolaire.mockResolvedValue({ data: { ...PROGRAMME, echeancesEnRetard: 2 } });
  render(<ProgrammeScolaireAdmin />);

  expect(await screen.findByText('2 échéances dépassées à vérifier')).toBeInTheDocument();
});

test('les classes sont des onglets ; la première est ouverte, et une classe vide le dit', async () => {
  render(<ProgrammeScolaireAdmin />);

  const cp = await screen.findByRole('tab', { name: 'CP' });
  expect(cp).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: '4e' })).toHaveAttribute('aria-selected', 'false');

  expect(screen.getByText('Aucune notion répertoriée pour cette classe.')).toBeInTheDocument();
});

test('en 4e : chaque notion porte son statut écrit, avec sa date — et la retirée reste visible', async () => {
  render(<ProgrammeScolaireAdmin />);

  await userEvent.click(await screen.findByRole('tab', { name: '4e' }));

  const maths = screen.getByRole('heading', { level: 3, name: 'Mathématiques' }).closest('section');

  expect(within(maths).getByText('À jour')).toBeInTheDocument();
  expect(within(maths).getByText('Ajoutée')).toBeInTheDocument();
  expect(within(maths).getByText('Modifiée')).toBeInTheDocument();
  expect(within(maths).getByText('Retirée')).toBeInTheDocument();

  // La retirée est toujours là — c'est ce qu'on vient voir — et datée, sur
  // SA ligne : la date vit dans la bulle « Retirée », pas ailleurs.
  const retiree = within(maths).getByText('Identités remarquables').closest('tr');
  expect(within(retiree).getByText('Retirée')).toHaveTextContent(/le 13 sept\. 2026/);

  // Le compte distingue ce qui reste de ce qui est parti.
  expect(within(maths).getByText('3 notions · 1 retirée')).toBeInTheDocument();
});

test('l’échéance de la matière montre « Mis à jour », la date de bascule et le dernier relevé', async () => {
  render(<ProgrammeScolaireAdmin />);

  await userEvent.click(await screen.findByRole('tab', { name: '4e' }));

  const maths = screen.getByRole('heading', { level: 3, name: 'Mathématiques' }).closest('section');

  expect(within(maths).getByText('Mis à jour')).toBeInTheDocument();
  expect(within(maths).getByText('Bascule le 1 septembre 2027')).toBeInTheDocument();
  expect(within(maths).getByText('13 septembre 2026')).toBeInTheDocument();
  expect(within(maths).getByRole('button', { name: 'Marquer traitée' })).toBeInTheDocument();

  // Une matière sans échéance le dit, plutôt que de laisser un blanc.
  const histoire = screen.getByRole('heading', { level: 3, name: 'Histoire-Géographie' }).closest('section');
  expect(within(histoire).getByText('Aucune bascule annoncée : programme en vigueur.')).toBeInTheDocument();
});

test('la sentinelle est en tête, se marque « vue », et ne porte pas de date de bascule', async () => {
  render(<ProgrammeScolaireAdmin />);

  const veille = (await screen.findByRole('heading', { level: 3, name: 'Veille générale' })).closest('section');

  expect(within(veille).getByText('Mis à jour')).toBeInTheDocument();
  expect(within(veille).getByRole('button', { name: 'Marquer vue' })).toBeInTheDocument();
  expect(within(veille).queryByText(/Bascule le/)).not.toBeInTheDocument();
});

test('« Marquer traitée » appelle l’API puis recharge', async () => {
  traiterEcheanceReferentiel.mockResolvedValue({});

  render(<ProgrammeScolaireAdmin />);

  await userEvent.click(await screen.findByRole('tab', { name: '4e' }));
  await userEvent.click(screen.getByRole('button', { name: 'Marquer traitée' }));

  expect(traiterEcheanceReferentiel).toHaveBeenCalledWith(1);

  // Le rechargement suit l'appel, de façon asynchrone : on l'attend.
  await waitFor(() => expect(getProgrammeScolaire).toHaveBeenCalledTimes(2));
});

/**
 * LE FILTRE PAR MATIÈRE — Camara, le 18/09/2026 : « si je cherche les notions
 * d'une matière, c'est pas évident ». Une classe de lycée empile une quinzaine
 * de matières ; il fallait toutes les faire défiler.
 */
describe('Le filtre par matière', () => {
  const PROGRAMME_DEUX_CLASSES = {
    ...PROGRAMME,
    classes: [
      PROGRAMME.classes[1],
      {
        code: 'TROISIEME',
        libelle: '3e',
        ordre: 9,
        matieres: [
          { ...PROGRAMME.classes[1].matieres[0], notions: [NOTION(10, 'Théorème de Thalès')] },
        ],
      },
    ],
  };

  test('une matière choisie masque les autres', async () => {
    render(<ProgrammeScolaireAdmin />);
    await userEvent.click(await screen.findByRole('tab', { name: '4e' }));

    const filtre = await screen.findByLabelText('Matière');
    await userEvent.selectOptions(filtre, '2');

    expect(screen.getByRole('heading', { name: 'Histoire-Géographie' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mathématiques' })).not.toBeInTheDocument();
  });

  test('le compte du menu est celui des notions ACTIVES, comme l’en-tête', async () => {
    // Mathématiques a quatre notions dont une retirée : l'en-tête dit 3.
    render(<ProgrammeScolaireAdmin />);
    await userEvent.click(await screen.findByRole('tab', { name: '4e' }));

    expect(await screen.findByRole('option', { name: 'Mathématiques (3)' })).toBeInTheDocument();
  });

  test('le filtre survit au changement de classe', async () => {
    // Comparer les maths de 4e et de 3e est justement l'usage : on ne doit pas
    // avoir à rechoisir la matière à chaque classe.
    getProgrammeScolaire.mockResolvedValue({ data: PROGRAMME_DEUX_CLASSES });
    render(<ProgrammeScolaireAdmin />);

    await userEvent.selectOptions(await screen.findByLabelText('Matière'), '1');
    await userEvent.click(screen.getByRole('tab', { name: '3e' }));

    expect(await screen.findByText('Théorème de Thalès')).toBeInTheDocument();
  });

  test('une matière absente de la nouvelle classe ramène à toutes', async () => {
    // L'histoire n'existe pas dans cette 3e : la garder choisie donnerait une
    // page vide, qu'on prendrait pour une panne.
    getProgrammeScolaire.mockResolvedValue({ data: PROGRAMME_DEUX_CLASSES });
    render(<ProgrammeScolaireAdmin />);

    await userEvent.selectOptions(await screen.findByLabelText('Matière'), '2');
    await userEvent.click(screen.getByRole('tab', { name: '3e' }));

    expect(await screen.findByRole('heading', { name: 'Mathématiques' })).toBeInTheDocument();
  });
});
