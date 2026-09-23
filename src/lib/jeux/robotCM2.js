/**
 * LE ROBOT DU CM2 — la boucle « répète ».
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_ALGO_PROGRAMME  — « Écrire un programme simple comportant une
 *                               répétition »
 *   MATH_CM2_GEO_DEPLACEMENT — « Coder et décrire un déplacement dans
 *                               l’espace »
 *
 * UN MOTIF DE FLÈCHES, RÉPÉTÉ PLUSIEURS FOIS : « répète 3 fois : → ↑ » fait
 * un escalier. Trois programmes ; un seul mène à l'étoile. Les pièges :
 *   - le NOMBRE DE RÉPÉTITIONS (une de trop, ou de moins) ;
 *   - une FLÈCHE DU MOTIF dans le mauvais sens.
 * L'écran est celui du robot du CM1 (`Robot.js`).
 */

import { executer, TAILLE } from './robot.js';
import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

const MOTIFS = ['→↑', '→→↓', '↑→', '↓↓→', '→↓', '←↑', '↑↑←', '←↓'];
const CONTRAIRE = {
  '↑': '↓', '↓': '↑', '←': '→', '→': '←',
};

/** « 3|→↑ » : répète 3 fois le motif. */
export const deplier = (programme) => {
  const [n, motif] = programme.split('|');
  return Array(Number(n)).fill([...motif]).flat();
};
export const lire = (programme) => {
  const [n, motif] = programme.split('|');
  return `Répète ${n} fois : ${[...motif].join(' ')}`;
};

const arrive = (depart, programme, cible) => {
  const fin = executer(depart, deplier(programme));
  return fin !== null && fin[0] === cible[0] && fin[1] === cible[1];
};

export function serie(graine = Date.now()) {
  const { entre, au, melanger } = outils(graine);
  const liste = [];
  while (liste.length < MANCHES) {
    const motif = au(MOTIFS);
    const n = entre(2, 4);
    const depart = [entre(0, TAILLE - 1), entre(0, TAILLE - 1)];
    const bonne = `${n}|${motif}`;
    const etoile = executer(depart, deplier(bonne));
    if (etoile) {
      // Jamais « répète 1 fois » : ce ne serait plus une boucle.
      const compte = `${n === 2 || entre(0, 1) ? n + 1 : n - 1}|${motif}`;
      const k = entre(0, motif.length - 1);
      const sens = `${n}|${[...motif].map((f, i) => (i === k ? CONTRAIRE[f] : f)).join('')}`;
      if (!arrive(depart, compte, etoile) && !arrive(depart, sens, etoile) && new Set([bonne, compte, sens]).size === 3) {
        liste.push({
          consigne: 'repete',
          depart,
          etoile,
          bonne,
          choix: melanger([bonne, compte, sens]).map((c) => ({ cle: c, libelle: lire(c) })),
          pieges: { [compte]: 'repete-compte', [sens]: 'repete-sens' },
        });
      }
    }
  }
  return liste;
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges[cle];
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  repete: 'Quel programme, avec sa boucle, mène le robot jusqu’à l’étoile ?',
  'repete-compte': 'Le motif est bon, mais pas le nombre de répétitions : compte combien de fois il faut le faire.',
  'repete-sens': 'Le nombre de répétitions est bon, mais une flèche du motif part dans le mauvais sens.',
};
