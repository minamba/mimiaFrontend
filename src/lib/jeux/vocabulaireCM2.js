/**
 * LE VOCABULAIRE DU CM2 — contraires et jumeaux au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_VOC_SYNONYMES — « Employer synonymes, antonymes et mots
 *                                polysémiques »
 *   FR_CM2_LANG_SENS          — « Distinguer sens propre et sens figuré, et
 *                                les niveaux de langue »
 *
 * TROIS SORTES DE MANCHES :
 *   - UN MOT, PLUSIEURS SENS (3) : dans « la souris de l'ordinateur », souris
 *     n'est pas l'animal. Le piège : le premier sens du mot ;
 *   - LE NIVEAU DE LANGUE (3) : « bagnole » est familier, « voiture » courant,
 *     « demeure » soutenu ;
 *   - LE CONTRAIRE (2) : généreux → avare. Pièges : un synonyme, et un mot de
 *     la même famille.
 * Le sens figuré des expressions est au jeu « Comme une image » du CM2.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

/** [phrase, mot, le bon sens, le premier sens, un autre sens]. */
export const POLYSEMIE = [
  ['Clique avec la souris de l’ordinateur.', 'souris', 'un petit appareil qu’on tient dans la main', 'un petit animal gris', 'un morceau de fromage'],
  ['Prends une feuille et un crayon.', 'feuille', 'un morceau de papier', 'la partie verte d’un arbre', 'une page de journal plié'],
  ['Il a un bouton sur le nez.', 'bouton', 'un petit gonflement de la peau', 'ce qui ferme une chemise', 'une touche qu’on presse'],
  ['Regarde-toi dans la glace.', 'glace', 'un miroir', 'un dessert froid', 'de l’eau gelée'],
  ['Le vol pour Paris part à midi.', 'vol', 'un voyage en avion', 'le fait de voler un objet', 'le mouvement d’un oiseau'],
  ['Le moteur de la voiture tourne.', 'tourner', 'fonctionner', 'changer de direction', 'faire un tour sur soi-même'],
];

/** [mot, niveau]. */
export const NIVEAUX = [
  ['une bagnole', 'familier'], ['un bouquin', 'familier'], ['la frousse', 'familier'], ['le boulot', 'familier'],
  ['une voiture', 'courant'], ['un livre', 'courant'], ['la peur', 'courant'], ['le travail', 'courant'],
  ['une demeure', 'soutenu'], ['un ouvrage', 'soutenu'], ['l’effroi', 'soutenu'], ['un labeur', 'soutenu'],
];

/** [mot, contraire, synonyme, même famille]. */
export const CONTRAIRES = [
  ['généreux', 'avare', 'gentil', 'générosité'],
  ['courageux', 'peureux', 'brave', 'courage'],
  ['ancien', 'moderne', 'vieux', 'anciennement'],
  ['accepter', 'refuser', 'admettre', 'acceptation'],
  ['rapide', 'lent', 'vif', 'rapidité'],
  ['calme', 'agité', 'tranquille', 'calmement'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const liste = [];
  melanger(POLYSEMIE).slice(0, 3).forEach(([phrase, mot, bonne, premier, autre]) => {
    liste.push({
      consigne: 'polysemie',
      question: `« ${phrase} » Ici, « ${mot} » veut dire…`,
      bonne,
      choix: melanger([bonne, premier, autre]).map((c) => ({ cle: c, libelle: c })),
    });
  });
  const niveaux = melanger(['familier', 'courant', 'soutenu']);
  niveaux.forEach((n) => {
    const [mot] = melanger(NIVEAUX.filter(([, x]) => x === n))[0];
    liste.push({
      consigne: 'niveau',
      question: `« ${mot} » : ce mot est…`,
      bonne: n,
      choix: ['familier', 'courant', 'soutenu'].map((c) => ({ cle: c, libelle: c })),
    });
  });
  melanger(CONTRAIRES).slice(0, 2).forEach(([mot, bonne, synonyme, famille]) => {
    liste.push({
      consigne: 'contraire',
      question: `Le contraire de « ${mot} »`,
      bonne,
      choix: melanger([bonne, synonyme, famille]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [synonyme]: 'contraire-synonyme', [famille]: 'contraire-famille' },
    });
  });
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'polysemie') return 'polysemie-contexte';
  if (m.consigne === 'niveau') return `niveau-${m.bonne}`;
  return m.pieges[cle];
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  polysemie: 'Un mot peut avoir plusieurs sens. Que veut-il dire dans cette phrase ?',
  niveau: 'Ce mot est-il familier, courant, ou soutenu ?',
  contraire: 'Trouve le mot qui veut dire le contraire.',
  'polysemie-contexte': 'C’est bien un sens de ce mot, mais pas celui de la phrase. Relis-la : de quoi parle-t-on ?',
  'niveau-familier': 'Ce mot se dit entre copains, pas dans un devoir : il est familier.',
  'niveau-courant': 'Ce mot se dit partout, à la maison comme à l’école : il est courant.',
  'niveau-soutenu': 'Ce mot se trouve plutôt dans les livres, il est recherché : il est soutenu.',
  'contraire-synonyme': 'Ce mot veut dire presque la même chose : c’est un synonyme. On cherche le contraire.',
  'contraire-famille': 'Ce mot est de la même famille : il garde le même sens. On cherche le contraire.',
};
