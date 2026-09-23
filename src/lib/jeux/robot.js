/**
 * LE ROBOT — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_ALGO_DEPLACEMENT — « Exécuter et écrire un programme de
 *                               déplacement simple »
 *
 * UN QUADRILLAGE, UN ROBOT, UNE ÉTOILE. Trois programmes en flèches ; un seul
 * mène le robot à l'étoile. Les pièges sont les deux fautes d'un programmeur :
 *   - COMPTER : une case de trop ou de moins ;
 *   - LE SENS : une flèche dans le mauvais sens.
 * Les flèches sont absolues (↑ monte, → va à droite), comme les premiers
 * programmes de l'école. L'écran dessine le quadrillage (`Robot.js`).
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;
export const TAILLE = 6;

export const PAS = {
  '↑': [0, -1], '↓': [0, 1], '←': [-1, 0], '→': [1, 0],
};
const CONTRAIRE = {
  '↑': '↓', '↓': '↑', '←': '→', '→': '←',
};

/** Où arrive le robot : null s'il sort du quadrillage. */
export function executer(depart, programme) {
  let [x, y] = depart;
  for (const f of programme) {
    x += PAS[f][0];
    y += PAS[f][1];
    if (x < 0 || y < 0 || x >= TAILLE || y >= TAILLE) return null;
  }
  return [x, y];
}

const arrive = (depart, prog, cible) => {
  const fin = executer(depart, prog);
  return fin !== null && fin[0] === cible[0] && fin[1] === cible[1];
};

export function serie(graine = Date.now()) {
  const { entre, melanger } = outils(graine);
  const liste = [];
  while (liste.length < MANCHES) {
    const depart = [entre(0, TAILLE - 1), entre(0, TAILLE - 1)];
    const etoile = [entre(0, TAILLE - 1), entre(0, TAILLE - 1)];
    const dx = etoile[0] - depart[0];
    const dy = etoile[1] - depart[1];
    if (Math.abs(dx) >= 2 && Math.abs(dy) >= 1) {
      const h = Array(Math.abs(dx)).fill(dx > 0 ? '→' : '←');
      const v = Array(Math.abs(dy)).fill(dy > 0 ? '↓' : '↑');
      // Les manches paires commencent par l'horizontale, les autres par la verticale.
      const bonne = (liste.length % 2 ? [...v, ...h] : [...h, ...v]).join('');
      const compte = (liste.length % 2 ? [...v, ...h.slice(1)] : [...h.slice(1), ...v]).join('');
      const sens = (liste.length % 2 ? [...v.map((f) => CONTRAIRE[f]), ...h] : [...h, ...v.map((f) => CONTRAIRE[f])]).join('');
      if (!arrive(depart, [...compte], etoile) && !arrive(depart, [...sens], etoile) && new Set([bonne, compte, sens]).size === 3) {
        liste.push({
          consigne: 'programme',
          depart,
          etoile,
          bonne,
          choix: melanger([bonne, compte, sens]).map((c) => ({ cle: c, libelle: [...c].join(' ') })),
          pieges: { [compte]: 'compte', [sens]: 'sens' },
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
  programme: 'Quel programme mène le robot jusqu’à l’étoile ?',
  compte: 'Suis le programme case par case avec ton doigt : il manque un pas.',
  sens: 'Suis le programme case par case : une flèche part dans le mauvais sens.',
};
