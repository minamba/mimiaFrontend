/**
 * L'ATTRIBUT DU SUJET — les accords (un ou des) au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_ATTRIBUT — « Identifier l'attribut du sujet et l'accorder »
 *
 * DEUX SORTES DE MANCHES :
 *   - L'ACCORDER (5) : « Mes sœurs semblent ___ » → fatiguées. Après un verbe
 *     d'état (être, sembler, paraître, devenir, rester), l'attribut s'accorde
 *     avec le sujet. Pièges : l'oubli d'accord, le genre, le nombre ;
 *   - LE RECONNAÎTRE (3) : dans « Léa est devenue [médecin] », attribut ou
 *     COD ? LE PIÈGE : « Elle reste [à la maison] » — rester n'est verbe
 *     d'état que devant ce qui décrit le sujet.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

/** [phrase, bonne forme, { forme fausse: sa faute }]. */
export const A_ACCORDER = [
  ['Mes sœurs semblent ___ ce soir.', 'fatiguées', { fatigué: 'oubli', fatigués: 'genre' }],
  ['Ces histoires paraissent ___.', 'vraies', { vrai: 'oubli', vrais: 'genre' }],
  ['Les rues restent ___ toute la nuit.', 'éclairées', { éclairé: 'oubli', éclairés: 'genre' }],
  ['Mon frère est devenu très ___.', 'grand', { grande: 'genre', grands: 'nombre' }],
  ['Les invités sont ___.', 'contents', { content: 'oubli', contentes: 'genre' }],
  ['La soupe semble trop ___.', 'chaude', { chaud: 'genre', chaudes: 'nombre' }],
  ['Tes amies deviennent ___.', 'sérieuses', { sérieux: 'genre', sérieuse: 'nombre' }],
];

/** [phrase avec le groupe entre crochets, fonction]. */
export const A_RECONNAITRE = [
  ['Léa est devenue [médecin].', 'attribut'],
  ['Le ciel paraît [gris].', 'attribut'],
  ['Ce chat semble [malade].', 'attribut'],
  ['Il reste [calme].', 'attribut'],
  ['Léa soigne [les malades].', 'cod'],
  ['Paul mange [une pomme].', 'cod'],
  ['Nous regardons [la mer].', 'cod'],
  ['Elle reste [à la maison].', 'cc'],
];

export const FONCTIONS = { attribut: 'Attribut du sujet', cod: 'COD', cc: 'Complément circonstanciel' };

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const accords = melanger(A_ACCORDER).slice(0, 5).map(([question, bonne, fautes]) => ({
    consigne: 'accorder',
    question,
    bonne,
    choix: melanger([bonne, ...Object.keys(fautes)]).map((c) => ({ cle: c, libelle: c })),
    pieges: fautes,
  }));
  const attributs = melanger(A_RECONNAITRE.filter(([, f]) => f === 'attribut'));
  const autres = melanger(A_RECONNAITRE.filter(([, f]) => f !== 'attribut'));
  const reconnaitre = [attributs[0], attributs[1], autres[0]].map(([phrase, fonction]) => ({
    consigne: 'reconnaitre',
    phrase,
    question: phrase.replace(/[[\]]/g, ''),
    bonne: fonction,
    choix: Object.entries(FONCTIONS).map(([cle, libelle]) => ({ cle, libelle })),
  }));
  return melanger([...accords, ...reconnaitre]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'reconnaitre') return `regle-${m.bonne}`;
  return m.pieges[cle];
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  accorder: 'Accorde l’attribut avec le sujet.',
  reconnaitre: 'Quelle est la fonction du groupe surligné ?',
  oubli: 'Après être, sembler, paraître, devenir ou rester, l’attribut s’accorde avec le sujet, comme un adjectif.',
  genre: 'Regarde le sujet : masculin ou féminin ?',
  nombre: 'Regarde le sujet : un seul, ou plusieurs ?',
  'regle-attribut': 'Le verbe est un verbe d’état, et le groupe dit comment est le sujet : c’est un attribut du sujet.',
  'regle-cod': 'Le verbe dit une action, et le groupe répond à quoi, ou qui : c’est un COD.',
  'regle-cc': 'Ce groupe dit où : il ne décrit pas le sujet. C’est un complément circonstanciel.',
};
