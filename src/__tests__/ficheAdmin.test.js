/**
 * LA FICHE ADMIN AFFICHE-T-ELLE CE QUE LE SERVEUR LUI DONNE ?
 *
 * Relevé en séance : depuis l'administration, « ses évaluations », « ses
 * séances » et « derniers cours » apparaissaient vides — alors que la réponse
 * du serveur, relevée dans l'onglet réseau, contenait bien six évaluations,
 * dix comptes rendus et six séances.
 *
 * Le reste de la fiche s'affichait pourtant : les chiffres clés, les matières,
 * les points fragiles, les compétences acquises. Trois sections sur douze,
 * exactement celles qui portent des listes paginées ou tabulaires.
 *
 * Ce banc monte le composant avec LA CHARGE EXACTE relevée sur la séance de
 * Bilal, dans le mode ADMIN — `avecApercuBilan`, sans `enPage`, les deux seules
 * options qui distinguent l'administration de l'espace parent. Si les tableaux
 * apparaissent ici, le défaut n'est pas dans le composant.
 */

import { render, screen } from '@testing-library/react';
import FicheEleve from '../components/FicheEleve';

jest.mock('../lib/api/adminApi', () => ({
  getApercuBilan: jest.fn(),
  envoyerBilan: jest.fn(),
}));

jest.mock('../lib/api/elevesApi', () => ({
  getCopieEvaluation: jest.fn(),
  getRapport: jest.fn(),
}));

/** Une page d'historique telle que le serveur la sert. */
const page = (elements, total) => ({ elements, total, suite: null });

const FICHE = {
  id: 9,
  prenom: 'Bilal',
  nom: 'Camara',
  age: 14,
  sexe: 2,
  niveauCode: 'TROISIEME',
  niveauLibelle: '3e',
  niveauCycle: 'College',
  parentId: 10,
  parentMail: 'ceo@mimia.fr',
  parentNomComplet: 'Camara Minamba',
  dateCreation: '2026-07-29T00:26:52Z',
  derniereActivite: '2026-08-31T19:06:05Z',
  nombreRequetes: 1495,
  nombreCours: 6,
  competencesEvaluees: 43,

  dernierCours: {
    conversationId: 7,
    matiereId: 1,
    matiereLibelle: 'Mathématiques',
    profPrenom: 'Nora',
    titre: 'Mathématiques',
    dateDernierMessage: '2026-08-31T19:06:05Z',
    nombreMessages: 1257,
  },

  matieres: [
    {
      matiereId: 1,
      matiereCode: 'MATHS',
      matiereLibelle: 'Mathématiques',
      profPrenom: 'Nora',
      nombreCours: 1,
      nombreRequetes: 710,
      competencesEvaluees: 16,
      maitriseMoyenne: 0.6,
    },
    {
      matiereId: 2,
      matiereCode: 'FRANCAIS',
      matiereLibelle: 'Français',
      profPrenom: 'Adrien',
      nombreCours: 1,
      nombreRequetes: 308,
      competencesEvaluees: 10,
      maitriseMoyenne: 0.44,
    },
  ],

  dernieresSeances: [
    {
      conversationId: 7,
      matiereId: 1,
      matiereLibelle: 'Mathématiques',
      profPrenom: 'Nora',
      titre: 'Mathématiques',
      dateDernierMessage: '2026-08-31T19:06:05Z',
      nombreMessages: 1257,
    },
    {
      conversationId: 14,
      matiereId: 2,
      matiereLibelle: 'Français',
      profPrenom: 'Adrien',
      titre: 'Français',
      dateDernierMessage: '2026-08-31T14:47:51Z',
      nombreMessages: 586,
    },
  ],

  lacunes: [],
  acquises: [],
  progression: [],

  evaluations: page([
    {
      id: 13,
      matiereId: 2,
      matiereLibelle: 'Français',
      profPrenom: 'Adrien',
      notion: 'Accord du participe passé avec avoir',
      note: 20,
      remarque: 'Bilal maîtrise désormais l’accord du participe passé.',
      aRevoir: null,
      questions: [],
      dateCreation: '2026-08-30T17:45:24Z',
    },
    {
      id: 11,
      matiereId: 1,
      matiereLibelle: 'Mathématiques',
      profPrenom: 'Nora',
      notion: 'division euclidienne',
      note: 20,
      remarque: 'Cinq calculs réussis sans erreur.',
      aRevoir: null,
      questions: [],
      dateCreation: '2026-08-05T18:43:21Z',
    },
  ], 6),

  rapports: page([
    {
      id: 47,
      matiereId: 2,
      matiereLibelle: 'Français',
      profPrenom: 'Adrien',
      travaille: 'accord du participe passé avec avoir',
      noteComprehension: 16,
      noteRevision: 15,
      remarque: 'Bilal maîtrise bien l’accord quand le COD est un pronom placé avant.',
      aRevoir: null,
      dateCreation: '2026-08-31T10:45:16Z',
      noteGlobale: 15.5,
    },
  ], 46),
};

const monterEnAdmin = () =>
  render(
    <FicheEleve
      fiche={FICHE}
      chargement={false}
      erreur={null}
      onFermer={() => {}}
      avecApercuBilan
      chargerEvaluations={jest.fn()}
      chargerRapports={jest.fn()}
    />,
  );

test('les évaluations s’affichent depuis l’administration', () => {
  monterEnAdmin();

  expect(screen.getByText('Accord du participe passé avec avoir')).toBeInTheDocument();
  expect(screen.getByText('division euclidienne')).toBeInTheDocument();
  expect(screen.queryByText(/Aucune évaluation passée/)).not.toBeInTheDocument();
});

test('les séances s’affichent depuis l’administration', () => {
  monterEnAdmin();

  expect(
    screen.getByText(/Bilal maîtrise bien l’accord quand le COD/),
  ).toBeInTheDocument();
});

test('les derniers cours s’affichent depuis l’administration', () => {
  monterEnAdmin();

  expect(screen.queryByText('Aucun cours enregistré.')).not.toBeInTheDocument();
  // 1 257 messages : le nombre qui n'apparaît que dans ce tableau-là.
  expect(screen.getAllByText(/1 257|1257/).length).toBeGreaterThan(0);
});

test('le mode parent rend exactement la même chose', () => {
  // Les deux seules options qui les distinguent sont `enPage` et
  // `avecApercuBilan`, et aucune ne devrait toucher aux listes. Si ce test
  // passe alors qu'un des trois précédents échoue, la différence est là.
  render(
    <FicheEleve
      enPage
      fiche={FICHE}
      chargement={false}
      erreur={null}
      onFermer={() => {}}
      chargerEvaluations={jest.fn()}
      chargerRapports={jest.fn()}
    />,
  );

  expect(screen.getByText('division euclidienne')).toBeInTheDocument();
});
