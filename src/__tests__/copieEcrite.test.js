import {
  CAHIER, CLAVIER, marquerSupportEcrit, rangSupportEcrit, supportEcritChoisi,
} from '../lib/storage/supportEcrit';
import { insererLigneDans } from '../components/LignesCopie';

/**
 * LA FEUILLE D'ÉCRITURE D'UN TEXTE — Camara, le 18/09/2026 : « j'ai dit que je
 * voulais écrire au clavier, mais j'ai pas de copie comme avec la dictée. Je
 * veux exactement le même système de copie avec possibilité de modifier une
 * ligne, d'en ajouter une ou supprimer. »
 *
 * CE QU'IL AVAIT À LA PLACE : le champ de saisie ordinaire. Donc chaque phrase
 * envoyée faisait répondre le professeur au milieu de sa rédaction, rien ne se
 * relisait d'un bloc, et une phrase oubliée ne pouvait plus se glisser à sa
 * place. Les trois défauts que la dictée avait déjà réglés.
 *
 * CE QUE CES TESTS PROTÈGENT, et c'est la mécanique d'ouverture plus que le
 * panneau lui-même : `LignesCopie` est déjà éprouvé par `lignesCopie.test.js`,
 * on le réutilise tel quel. Ce qui est neuf, c'est de savoir QUAND la feuille
 * s'ouvre et QUAND elle se referme — et c'est là que la carte des vitesses
 * s'était plantée trois jours plus tôt.
 */

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

describe('Le rang de la question', () => {
  test('zéro tant qu’elle n’a pas été posée', () => {
    expect(rangSupportEcrit([prof('On révise le vocabulaire.')])).toBe(0);
    expect(rangSupportEcrit([])).toBe(0);
  });

  test('il compte les questions du professeur, pas les messages', () => {
    const fil = [
      prof('On écrit un texte ? [SUPPORT_ECRIT]'),
      eleve('J’écris au clavier.'),
      prof('Voici ta consigne.'),
      prof('On en refait un ? [SUPPORT_ECRIT]'),
    ];

    expect(rangSupportEcrit(fil)).toBe(2);
  });

  test('une balise tapée par l’élève ne compte pas', () => {
    expect(rangSupportEcrit([eleve('[SUPPORT_ECRIT] hihi')])).toBe(0);
  });
});

/**
 * LA RÈGLE D'OUVERTURE, telle que `Chat.js` l'applique : la feuille est
 * ouverte quand le clavier est choisi ET que ce texte-là n'a pas encore été
 * envoyé.
 *
 * REPRODUITE ICI PLUTÔT QUE MONTÉE DANS `Chat.js` : le composant entier
 * demande un micro, un lecteur vocal et une conversation. C'est la RÈGLE qui
 * peut se tromper, pas le JSX — et elle tient en une ligne.
 */
const feuilleOuverte = (messages, rangRendu, dicteeEnCours = false) =>
  supportEcritChoisi(messages) === CLAVIER
  && rangSupportEcrit(messages) > rangRendu
  && !dicteeEnCours;

describe('Quand la feuille s’ouvre', () => {
  const choisiClavier = [
    prof('On écrit un texte ? [SUPPORT_ECRIT]'),
    eleve(marquerSupportEcrit('', CLAVIER)),
  ];

  test('au choix du clavier', () => {
    expect(feuilleOuverte(choisiClavier, 0)).toBe(true);
  });

  test('jamais sur le cahier — là, c’est une photo qu’on attend', () => {
    const surCahier = [
      prof('[SUPPORT_ECRIT]'),
      eleve(marquerSupportEcrit('', CAHIER)),
    ];

    expect(feuilleOuverte(surCahier, 0)).toBe(false);
  });

  test('elle se referme sur l’envoi, et NE SE ROUVRE PAS', () => {
    // LE PIÈGE. `supportEcritChoisi` vaut toujours `clavier` après l'envoi :
    // c'est un fait de la séance, pas un état d'écran. Sans le rang, la
    // feuille se serait rouverte vide sur un texte déjà parti — exactement ce
    // qu'a fait la carte des vitesses le 18/09/2026.
    const apresEnvoi = [...choisiClavier, eleve('Last weekend I go to the park.')];

    expect(feuilleOuverte(apresEnvoi, 1)).toBe(false);
  });

  test('un SECOND texte dans la séance la rouvre', () => {
    const second = [
      ...choisiClavier,
      eleve('Last weekend I go to the park.'),
      prof('On en refait un ? [SUPPORT_ECRIT]'),
      eleve(marquerSupportEcrit('', CLAVIER)),
    ];

    expect(feuilleOuverte(second, 1)).toBe(true);
  });

  test('une dictée au clavier passe avant', () => {
    // Deux panneaux « Ta copie » ouverts en même temps feraient taper la
    // dictée dans le texte à rédiger : ils se ressemblent trait pour trait.
    expect(feuilleOuverte(choisiClavier, 0, true)).toBe(false);
  });
});

describe('Les lignes du texte', () => {
  test('une phrase oubliée se glisse à sa place, pas en bout', () => {
    // Le même composant que la dictée, donc la même mécanique — c'est le
    // point : l'enfant qui a déjà écrit une dictée ici sait s'en servir.
    expect(insererLigneDans(['Un', 'Trois'], 1)).toEqual(['Un', '', 'Trois']);
  });

  test('et une première phrase oubliée se glisse au-dessus', () => {
    expect(insererLigneDans(['Deux'], 0)).toEqual(['', 'Deux']);
  });
});

/**
 * LA CONSIGNE AU TABLEAU OUVRE LA FEUILLE, MÊME SANS LA BALISE.
 *
 * LE DÉFAUT, VU PAR CAMARA LE 18/09/2026 : « pourquoi la copie n'apparaît
 * toujours pas ????? ». Le professeur reprenait un texte d'une séance
 * précédente — « on reprend l'expression écrite, je te remets la consigne » —
 * et enchaînait sur « vas-y, tape ton texte directement ici ». Il n'avait
 * jamais réécrit [SUPPORT_ECRIT] : rien n'ouvrait la feuille, et chaque phrase
 * tapée partait comme un message ordinaire.
 *
 * UNE RÈGLE DE PROMPT NE VAUT PAS UN FAIT. Il fallait un second chemin qui ne
 * dépende pas de la mémoire du modèle : le tableau, qu'il écrit de toute façon.
 */
describe('Quand le professeur oublie la balise', () => {
  const consigneAuTableau = [
    prof('On reprend. [ARDOISE]\nLa consigne\nRaconte ta sortie en 4 phrases.\n[/ARDOISE]\nVas-y, tape ton texte.'),
  ];

  test('la consigne au tableau pose quand même la question', () => {
    expect(supportEcritChoisi(consigneAuTableau)).toBeNull();
    expect(rangSupportEcrit(consigneAuTableau)).toBe(1);
  });

  test('et la feuille s’ouvre une fois le clavier choisi', () => {
    const fil = [...consigneAuTableau, eleve(marquerSupportEcrit('', CLAVIER))];

    expect(feuilleOuverte(fil, 0)).toBe(true);
  });

  test('le tableau de CORRECTION ne la rouvre pas', () => {
    // Il porte « Ton texte » : la copie est déjà écrite. Rouvrir une feuille
    // vide pendant que le professeur corrige serait pire que rien.
    const correction = [
      prof('[ARDOISE]\nLa consigne\nRaconte ta sortie.\n\nTon texte\nI go to the park.\n\nÀ revoir\nI go → I went\n[/ARDOISE]'),
    ];

    expect(supportEcritChoisi(correction)).toBeUndefined();
    expect(rangSupportEcrit(correction)).toBe(0);
  });

  test('un tableau ordinaire ne déclenche rien', () => {
    const maths = [prof('[ARDOISE]\n3/4 + 1/8 = ?\n[/ARDOISE]')];

    expect(supportEcritChoisi(maths)).toBeUndefined();
  });

  test('le tableau d’une dictée non plus', () => {
    const dictee = [prof('[ARDOISE]\nLa dictée\nLes enfants sont partis.\n\nTa copie\nLes enfant son parti.\n[/ARDOISE]')];

    expect(supportEcritChoisi(dictee)).toBeUndefined();
  });
});
