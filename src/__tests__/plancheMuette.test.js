import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planches from '../components/Planches';
import * as api from '../lib/api/adminApi';
import {
  cleSchema, urlCreditPlanche, urlPlanche, varianteSchema,
} from '../lib/storage/schemas';

/**
 * UNE PLANCHE, DEUX FICHIERS — Camara, le 17/09/2026.
 *
 * La légendée sert à enseigner, la muette à interroger. Ce sont deux images
 * sous UNE SEULE clé : c'est le même document, et c'est ce qui permet à la
 * muette d'emprunter la carte des repères de sa parente — donc à l'exercice de
 * se corriger tout seul.
 *
 * CE QUE CES TESTS PROTÈGENT, ET POURQUOI CHACUN
 * ---------------------------------------------
 * 1. Le suffixe `/muette` ne doit JAMAIS remonter dans la clé du catalogue :
 *    `titreFigure`, le niveau, la ligne d'administration s'y retrouveraient
 *    avec une clé inconnue, et le tableau afficherait du vide.
 * 2. Tout ce qui a été écrit avant cette date n'a pas de suffixe et doit
 *    continuer de valoir `legende`, sans aucun changement.
 * 3. Les deux images ont deux ADRESSES distinctes. Servir la légendée à la
 *    place de la muette au milieu d'un exercice, c'est donner la réponse.
 * 4. La muette ne se dépose que SOUS une planche importée : seule, elle n'a
 *    aucune carte de repères, et l'élève cliquerait dans le vide.
 *
 * LES BOUTONS DE LA MUETTE SE TROUVENT PAR SON GROUPE, et c'est aussi ce qui
 * rend l'écran utilisable au lecteur d'écran : la ligne porte deux « Remplacer »
 * et deux « Retirer », et rien d'autre ne dit lequel agit sur quoi.
 */

jest.mock('../lib/api/adminApi');

/** La seule figure que ces tests auront à manipuler. */
const CLE = 'svt-respiratoire';

const planche = (variante) => ({
  cle: CLE,
  variante,
  matiereCode: 'SVT',
  contenu: variante === 'muette' ? null : 'Trachée, Bronches, Poumons',
  licence: 'CC BY-SA 4.0',
  auteur: 'Untel',
  maison: false,
  dateCreation: '2026-09-17T10:00:00Z',
});

beforeEach(() => {
  jest.clearAllMocks();
  api.getPlanches.mockResolvedValue({ data: [] });
  api.importerPlanche.mockResolvedValue({ data: planche('muette') });
  api.supprimerPlanche.mockResolvedValue({});
});

/** Ouvre la matière SVT sur les planches données. */
const ouvrirSvt = async (importees) => {
  api.getPlanches.mockResolvedValue({ data: importees });
  render(<Planches />);

  await userEvent.click(await screen.findByRole('button', { name: /SVT/i }));
  await screen.findByText(CLE);
};

/** Le bloc de la version muette, celui qui porte ses propres boutons. */
const blocMuette = () => screen.getByRole('group', { name: /version muette/i });

describe('La clé et sa variante', () => {
  test('le suffixe ne remonte pas dans la clé du catalogue', () => {
    expect(cleSchema(`SCHEMA:${CLE}/muette`)).toBe(CLE);
  });

  test('sans suffixe, rien ne change : la clé et « legende »', () => {
    expect(cleSchema(`SCHEMA:${CLE}`)).toBe(CLE);
    expect(varianteSchema(`SCHEMA:${CLE}`)).toBe('legende');
  });

  test('le suffixe est lu comme variante', () => {
    expect(varianteSchema(`SCHEMA:${CLE}/muette`)).toBe('muette');
  });

  test('un suffixe inconnu ne vaut jamais muette', () => {
    expect(varianteSchema(`SCHEMA:${CLE}/autre`)).toBe('legende');
  });

  test('une clé absente du catalogue reste nulle, suffixe ou pas', () => {
    expect(cleSchema('SCHEMA:cle-inventee/muette')).toBeNull();
  });
});

describe('Deux images, deux adresses', () => {
  test('la légendée garde exactement son adresse', () => {
    expect(urlPlanche(CLE)).toBe(`/planches/${CLE}`);
    expect(urlPlanche(CLE, undefined, 'legende')).toBe(`/planches/${CLE}`);
  });

  test('la muette a la sienne', () => {
    expect(urlPlanche(CLE, undefined, 'muette')).toBe(`/planches/${CLE}/muette`);
  });

  test('le jeton de version se pose après le suffixe, pas avant', () => {
    const adresse = urlPlanche(CLE, '2026-09-17T10:00:00Z', 'muette');

    expect(adresse).toMatch(new RegExp(`^/planches/${CLE}/muette\\?v=`));
  });

  test('le crédit de la muette est le sien : autre fichier, autre licence', () => {
    expect(urlCreditPlanche(CLE, 'muette')).toBe(`/planches/${CLE}/muette/credit`);
    expect(urlCreditPlanche(CLE)).toBe(`/planches/${CLE}/credit`);
  });
});

describe("L'écran d'import", () => {
  test('aucune version muette proposée tant que la planche manque', async () => {
    await ouvrirSvt([]);

    expect(screen.queryByRole('group', { name: /version muette/i })).toBeNull();
  });

  test('la planche importée ouvre son emplacement de muette', async () => {
    await ouvrirSvt([planche('legende')]);

    expect(within(blocMuette()).getByText(/à importer/i)).toBeInTheDocument();
  });

  test('déposer une muette envoie la variante au serveur', async () => {
    await ouvrirSvt([planche('legende')]);

    await userEvent.click(within(blocMuette()).getByRole('button', { name: /^Ajouter$/ }));

    const fichier = new File(['<svg />'], 'carte.svg', { type: 'image/svg+xml' });
    await userEvent.upload(screen.getByLabelText(/fichier/i), fichier);
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(api.importerPlanche).toHaveBeenCalledWith(
      expect.objectContaining({ cle: CLE, variante: 'muette' }),
    );
  });

  test('la muette importée est affichée avec ses propres boutons', async () => {
    await ouvrirSvt([planche('legende'), planche('muette')]);

    expect(within(blocMuette()).getByText(/importée/i)).toBeInTheDocument();
    expect(within(blocMuette()).getByRole('button', { name: /remplacer/i }))
      .toBeInTheDocument();
  });

  test('la muette n’est jamais comptée comme une planche du catalogue', async () => {
    await ouvrirSvt([planche('legende'), planche('muette')]);

    // Une seule figure importée, pas deux : la muette partage la clé de sa
    // parente et ne prend pas de ligne au catalogue.
    expect(screen.getByText(/1 \/ \d+ importées/)).toBeInTheDocument();
  });

  test('retirer la muette ne touche pas la planche', async () => {
    await ouvrirSvt([planche('legende'), planche('muette')]);

    jest.spyOn(window, 'confirm').mockReturnValue(true);
    await userEvent.click(within(blocMuette()).getByRole('button', { name: /retirer/i }));

    expect(api.supprimerPlanche).toHaveBeenCalledWith(CLE, 'muette');
  });

  test('retirer la planche prévient que sa muette part avec elle', async () => {
    await ouvrirSvt([planche('legende'), planche('muette')]);

    const confirmer = jest.spyOn(window, 'confirm').mockReturnValue(false);

    // Le « Retirer » hors du groupe de la muette est celui de la planche.
    const [retirerPlanche] = screen.getAllByRole('button', { name: /retirer/i });
    await userEvent.click(retirerPlanche);

    expect(confirmer).toHaveBeenCalledWith(expect.stringMatching(/muette part avec elle/i));
    expect(api.supprimerPlanche).not.toHaveBeenCalled();
  });
});
