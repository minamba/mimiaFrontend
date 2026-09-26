/**
 * LE RECORD PERSONNEL — Camara, le 25/09/2026, avant tout classement.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 *   1. DEUX FRÈRES SUR LA MÊME TABLETTE NE PARTAGENT PAS LEUR RECORD. C'est
 *      le cas normal, pas le cas limite. Sans séparation, le petit hérite du
 *      record du grand et ne le bat jamais — exactement l'inverse de l'effet
 *      recherché.
 *
 *   2. UN JEU QUI CHANGE DE LONGUEUR INVALIDE SON RECORD. Un « 7 sur 8 » ne
 *      se compare pas à un « 7 sur 10 ». Le jour où quelqu'un ajoute deux
 *      manches à un jeu, ce test empêche d'afficher une cible fausse.
 *
 *   3. ÉGALER N'EST PAS BATTRE. Le mot « record » ne vaut que s'il reste
 *      rare ; il s'userait en trois parties.
 *
 *   4. LA PREMIÈRE PARTIE N'ANNONCE RIEN. Il n'y a rien à battre.
 *
 *   5. LE PARENT QUI ESSAIE UN JEU NE TOUCHE À RIEN. L'aperçu parent n'ouvre
 *      pas de session élève : sans identifiant, aucun enregistrement.
 */

import { render, screen, act } from '@testing-library/react';

import RecordJeu from '../components/jeux/RecordJeu';
import { FournirJeu } from '../lib/jeux/contexteJeu';
import { enregistrer, meilleur, oublierRecords } from '../lib/jeux/record';

let mockSession = { eleveId: 'enfant-1' };
jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => mockSession,
}));

beforeEach(() => {
  oublierRecords();
  mockSession = { eleveId: 'enfant-1' };
});

const montrer = (score, total, jeuCle = 'horloge', niveau = 'CE1') =>
  render(
    <FournirJeu value={{ jeuCle, niveau }}>
      <RecordJeu score={score} total={total} />
    </FournirJeu>,
  );

describe('le magasin des records', () => {
  test('la première partie ne bat rien, mais elle est retenue', () => {
    const { precedent, record } = enregistrer('enfant-1', 'horloge', 'CE1', 7, 10);

    expect(precedent).toBeNull();
    expect(record).toBe(false);
    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBe(7);
  });

  test('un meilleur score devient le record', () => {
    enregistrer('enfant-1', 'horloge', 'CE1', 7, 10);
    const suite = enregistrer('enfant-1', 'horloge', 'CE1', 9, 10);

    expect(suite).toEqual({ precedent: 7, record: true });
    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBe(9);
  });

  test('un score plus faible ne remplace pas le record', () => {
    enregistrer('enfant-1', 'horloge', 'CE1', 9, 10);
    const suite = enregistrer('enfant-1', 'horloge', 'CE1', 4, 10);

    expect(suite).toEqual({ precedent: 9, record: false });
    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBe(9);
  });

  test('égaler son record n’est pas le battre', () => {
    enregistrer('enfant-1', 'horloge', 'CE1', 8, 10);

    expect(enregistrer('enfant-1', 'horloge', 'CE1', 8, 10).record).toBe(false);
  });

  test('deux enfants du même appareil ont chacun le leur', () => {
    enregistrer('enfant-1', 'horloge', 'CE1', 9, 10);
    const cadet = enregistrer('enfant-2', 'horloge', 'CE1', 3, 10);

    expect(cadet.precedent).toBeNull();
    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBe(9);
    expect(meilleur('enfant-2', 'horloge', 'CE1', 10)).toBe(3);
  });

  test('un même jeu à deux niveaux garde deux records', () => {
    enregistrer('enfant-1', 'horloge', 'CE1', 10, 10);

    expect(meilleur('enfant-1', 'horloge', 'CM1', 10)).toBeNull();
  });

  test('un jeu qui change de longueur perd son ancien record', () => {
    enregistrer('enfant-1', 'horloge', 'CE1', 7, 8);

    // Le même jeu passe à 10 manches : l'ancien « 7 sur 8 » ne se compare plus.
    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBeNull();
    expect(enregistrer('enfant-1', 'horloge', 'CE1', 5, 10).precedent).toBeNull();
    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBe(5);
  });

  test('sans élève identifié, rien n’est enregistré', () => {
    expect(enregistrer(null, 'horloge', 'CE1', 10, 10)).toEqual({
      precedent: null, record: false,
    });
    expect(meilleur(null, 'horloge', 'CE1', 10)).toBeNull();
  });

  test('un stockage illisible ne casse pas le jeu', () => {
    window.localStorage.setItem('mimia-records', 'ceci n’est pas du JSON');

    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBeNull();
    expect(() => enregistrer('enfant-1', 'horloge', 'CE1', 6, 10)).not.toThrow();
  });
});

describe('la ligne affichée en fin de partie', () => {
  test('rien à la première partie', () => {
    const { container } = montrer(7, 10);

    expect(container.querySelector('.jeu__record')).toBeNull();
  });

  test('la cible à battre, quand on a fait moins bien', () => {
    act(() => { enregistrer('enfant-1', 'horloge', 'CE1', 9, 10); });

    montrer(4, 10);

    expect(screen.getByText(/ton meilleur/i)).toBeInTheDocument();
    expect(screen.getByText('9 sur 10')).toBeInTheDocument();
    expect(screen.getByText(/à toi de le battre/i)).toBeInTheDocument();
  });

  test('la félicitation, et l’ancien score, quand on l’a battu', () => {
    act(() => { enregistrer('enfant-1', 'horloge', 'CE1', 6, 10); });

    montrer(9, 10);

    expect(screen.getByText(/nouveau record/i)).toBeInTheDocument();
    expect(screen.getByText(/ton ancien\s*: 6 sur 10/i)).toBeInTheDocument();
  });

  test('le parent qui essaie un jeu n’enregistre rien', () => {
    mockSession = null;

    const { container } = montrer(10, 10);

    expect(container.querySelector('.jeu__record')).toBeNull();
    expect(meilleur('enfant-1', 'horloge', 'CE1', 10)).toBeNull();
  });

  test('hors contexte de jeu — l’aperçu parent — rien ne se passe', () => {
    const { container } = render(<RecordJeu score={10} total={10} />);

    expect(container.querySelector('.jeu__record')).toBeNull();
  });
});
