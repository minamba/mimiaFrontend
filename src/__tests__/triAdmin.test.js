import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { trier, inverser } from '../lib/utils/tri';
import IdeesAdmin from '../components/IdeesAdmin';
import * as api from '../lib/api/ideesApi';

/**
 * LE TRI DES TABLEAUX DE L'ADMINISTRATION — Camara, le 17/09/2026 : trier les
 * parents par type d'utilisateur, date de création, dernière connexion,
 * dernière activité et coût ; et dans le carnet d'idées, « de base les idées
 * doivent être classées du plus récent au plus vieux », avec un tri par date de
 * création et par auteur.
 *
 * CE QUE CES TESTS PROTÈGENT
 * -------------------------
 * 1. LES TROUS RESTENT EN BAS, DANS LES DEUX SENS. C'est la règle qui décide si
 *    ces tris servent à quelque chose : sur « dernière connexion », la moitié
 *    des comptes n'ont rien, et les traiter comme une date très ancienne
 *    remplirait l'écran de tirets en tête de tri croissant. Or on cherche le
 *    parent qui n'est pas revenu depuis longtemps, pas ceux qu'on n'a jamais
 *    mesurés.
 * 2. LE TRI NE MODIFIE PAS LA LISTE D'ORIGINE. Elle vient du magasin Redux ;
 *    `sort` trie en place, et réordonner l'état partagé sans passer par un
 *    réducteur est le genre de mutation qui se voit trois écrans plus loin.
 * 3. LE CARNET S'OUVRE DU PLUS RÉCENT AU PLUS ANCIEN, écrit dans l'écran et non
 *    supposé du serveur.
 */

describe('trier', () => {
  const lignes = [
    { nom: 'a', valeur: 3 },
    { nom: 'b', valeur: 1 },
    { nom: 'c', valeur: 2 },
  ];

  const noms = (liste) => liste.map((l) => l.nom).join('');

  test('décroissant par défaut', () => {
    expect(noms(trier(lignes, (l) => l.valeur))).toBe('acb');
  });

  test('croissant sur demande', () => {
    expect(noms(trier(lignes, (l) => l.valeur, 'asc'))).toBe('bca');
  });

  test('la liste d’origine n’est pas touchée', () => {
    const original = [...lignes];
    trier(lignes, (l) => l.valeur, 'asc');

    expect(lignes).toEqual(original);
  });

  test('les dates ISO se classent comme des dates, pas comme du texte', () => {
    const dates = [
      { nom: 'a', d: '2026-09-02T10:00:00Z' },
      { nom: 'b', d: '2026-09-17T10:00:00Z' },
      { nom: 'c', d: '2026-08-30T10:00:00Z' },
    ];

    expect(noms(trier(dates, (l) => l.d))).toBe('bac');
  });

  test('les textes se comparent en français, accents compris', () => {
    const mots = [
      { nom: 'a', t: 'Zoé' },
      { nom: 'b', t: 'Élodie' },
      { nom: 'c', t: 'Adrien' },
    ];

    // « É » se range avec « E », donc avant « Z » — pas après, comme le ferait
    // une comparaison d'octets.
    expect(noms(trier(mots, (l) => l.t, 'asc'))).toBe('cba');
  });

  test('un booléen classe les vrais en tête, en décroissant', () => {
    const roles = [
      { nom: 'a', admin: false },
      { nom: 'b', admin: true },
      { nom: 'c', admin: false },
    ];

    expect(trier(roles, (l) => l.admin)[0].nom).toBe('b');
  });

  describe('les trous', () => {
    const avecTrous = [
      { nom: 'a', d: '2026-09-02T10:00:00Z' },
      { nom: 'vide1', d: null },
      { nom: 'b', d: '2026-09-17T10:00:00Z' },
      { nom: 'vide2', d: undefined },
    ];

    test('ils restent en bas en décroissant', () => {
      expect(noms(trier(avecTrous, (l) => l.d))).toBe('bavide1vide2');
    });

    test('ils restent en bas en croissant AUSSI — c’est le point', () => {
      expect(noms(trier(avecTrous, (l) => l.d, 'asc'))).toBe('abvide1vide2');
    });

    test('un zéro n’est pas un trou : zéro euro est une mesure', () => {
      const couts = [
        { nom: 'a', c: 2.5 },
        { nom: 'zero', c: 0 },
        { nom: 'inconnu', c: null },
      ];

      expect(noms(trier(couts, (l) => l.c, 'asc'))).toBe('zeroainconnu');
    });
  });
});

describe('inverser', () => {
  test('les deux sens se répondent', () => {
    expect(inverser('desc')).toBe('asc');
    expect(inverser('asc')).toBe('desc');
  });
});

// ------------------------------------------------------------- le carnet

jest.mock('../lib/api/ideesApi');
jest.mock('../lib/impression', () => ({
  imprimerSous: jest.fn(),
  nomDocument: jest.fn(() => 'Mimia--test'),
}));

const idee = (id, titre, jour, prenom) => ({
  id,
  titre,
  urgence: 'Moyenne',
  statut: 'Nouvelle',
  description: '',
  auteurPrenom: prenom,
  auteurNom: 'Test',
  dateCreation: `2026-09-${jour}T10:00:00Z`,
  pieces: [],
});

// Volontairement donnnées dans le désordre : c'est l'écran qui doit classer,
// pas l'API.
const CARNET = [
  idee(1, 'Idée du 2', '02', 'Zoé'),
  idee(2, 'Idée du 17', '17', 'Adrien'),
  idee(3, 'Idée du 9', '09', 'Minamba'),
];

beforeEach(() => {
  jest.clearAllMocks();
  api.getIdees.mockResolvedValue({ data: CARNET });
  api.getIdee.mockResolvedValue({ data: CARNET[0] });
});

const titresAffiches = () => screen.getAllByRole('row')
  .slice(1)
  .map((ligne) => within(ligne).getAllByRole('cell')[0].textContent);

describe('Le carnet d’idées', () => {
  test('s’ouvre du plus récent au plus ancien', async () => {
    render(<IdeesAdmin />);
    await screen.findByText('Idée du 17');

    expect(titresAffiches()).toEqual(['Idée du 17', 'Idée du 9', 'Idée du 2']);
  });

  test('le sens s’inverse', async () => {
    render(<IdeesAdmin />);
    await screen.findByText('Idée du 17');

    await userEvent.click(screen.getByRole('button', { name: /décroissant/i }));

    expect(titresAffiches()).toEqual(['Idée du 2', 'Idée du 9', 'Idée du 17']);
  });

  test('se trie par auteur, du dernier au premier', async () => {
    render(<IdeesAdmin />);
    await screen.findByText('Idée du 17');

    await userEvent.selectOptions(screen.getByLabelText(/trier par/i), 'auteur');

    // Changer de critère repart en décroissant : Zoé, Minamba, Adrien.
    expect(titresAffiches()).toEqual(['Idée du 2', 'Idée du 9', 'Idée du 17']);
  });

  test('et dans l’autre sens : Adrien, Minamba, Zoé', async () => {
    render(<IdeesAdmin />);
    await screen.findByText('Idée du 17');

    await userEvent.selectOptions(screen.getByLabelText(/trier par/i), 'auteur');

    // Le bouton porte le sens ACTUEL ; cliquer dessus le renverse.
    await userEvent.click(screen.getByRole('button', { name: /décroissant/i }));

    expect(titresAffiches()).toEqual(['Idée du 17', 'Idée du 9', 'Idée du 2']);
  });
});
