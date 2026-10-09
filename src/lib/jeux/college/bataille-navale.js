/**
 * LA BATAILLE NAVALE — se repérer dans le plan, en 5e.
 * Professeure : Nora (mathématiques).
 *
 * Aucun dessin : le navire est donné par ses coordonnées, ou par le chemin
 * qui le rejoint depuis l'origine (« 3 à droite, 2 en bas »).
 *
 * QUATRE SORTES DE MANCHES (2 + 2 + 2 + 2, mélangées) :
 *   - LIRE (2) : du chemin aux coordonnées ;
 *   - PLACER (2) : des coordonnées au chemin ;
 *   - LA ZONE (2) : dans quel quart du repère est le point ;
 *   - LE TIR (2) : un point, un déplacement, le point d'arrivée.
 * LE PIÈGE de toutes : inverser abscisse et ordonnée. Et l'oubli du signe
 * moins vers la gauche ou vers le bas, le déplacement pris à l'envers.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'bataille-navale', titre: 'La bataille navale', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'La bataille navale',
    accroche: 'L’abscisse d’abord, puis l’ordonnée.',
    competences: ['MATH_5E_GEO_REPERAGE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « −3 » : le signe moins typographique. */
const rel = (n) => (n < 0 ? `−${-n}` : `${n}`);
/** « (2 ; −3) » */
export const pt = (x, y) => `(${rel(x)} ; ${rel(y)})`;
/** « 3 à gauche, 2 en haut » */
export const chemin = (x, y) => `${Math.abs(x)} ${x > 0 ? 'à droite' : 'à gauche'}, ${Math.abs(y)} ${y > 0 ? 'en haut' : 'en bas'}`;

export const ZONES = {
  'haut-droite': 'En haut à droite',
  'haut-gauche': 'En haut à gauche',
  'bas-gauche': 'En bas à gauche',
  'bas-droite': 'En bas à droite',
};
export const zone = (x, y) => `${y > 0 ? 'haut' : 'bas'}-${x > 0 ? 'droite' : 'gauche'}`;

/** Une manche : la bonne réponse, ses pièges (jamais justes), et des voisins s'il en manque. */
function monter(melanger, consigne, question, bonne, pieges, voisin) {
  const faux = pieges.filter(([v]) => v !== bonne);
  const cles = troisChoix(bonne, faux.map(([v]) => v), voisin);
  const lesPieges = {};
  faux.forEach(([v, phrase]) => {
    if (cles.includes(v) && !(v in lesPieges)) lesPieges[v] = phrase;
  });
  return {
    consigne, question, bonne, choix: melanger(cles).map((c) => ({ cle: c, libelle: c })), pieges: lesPieges,
  };
}

function cinquieme({ entre, melanger }) {
  const liste = [];
  const coordonnee = (n) => {
    const v = entre(1, n);
    return entre(0, 1) ? v : -v;
  };
  /** Deux coordonnées différentes, dont au moins une négative. */
  const point = () => {
    let x = coordonnee(6);
    let y = coordonnee(6);
    while (x === y || (x > 0 && y > 0)) {
      x = coordonnee(6);
      y = coordonnee(6);
    }
    return [x, y];
  };

  for (let i = 0; i < 2; i += 1) {
    const [x, y] = point();
    liste.push(monter(melanger, 'lire-point', `Depuis l’origine : ${chemin(x, y)}. Coordonnées du navire ?`, pt(x, y), [
      [pt(y, x), 'abscisse-d-abord'],
      [pt(Math.abs(x), Math.abs(y)), 'signe-gauche-bas'],
    ], (k) => pt(x + k, y)));
  }

  for (let i = 0; i < 2; i += 1) {
    const [x, y] = point();
    liste.push(monter(melanger, 'placer-point', `Le navire B${pt(x, y)} : comment le rejoindre depuis l’origine ?`, chemin(x, y), [
      [chemin(y, x), 'abscisse-d-abord'],
      [chemin(Math.abs(x), Math.abs(y)), 'signe-gauche-bas'],
    ], (k) => chemin(x + (x > 0 ? k : -k), y)));
  }

  for (let i = 0; i < 2; i += 1) {
    let x = coordonnee(8);
    let y = coordonnee(8);
    while (x === y) {
      x = coordonnee(8);
      y = coordonnee(8);
    }
    const bonne = zone(x, y);
    const inverse = zone(y, x);
    liste.push({
      consigne: 'quadrant',
      question: `Le point M${pt(x, y)} est…`,
      bonne,
      choix: melanger(Object.keys(ZONES)).map((cle) => ({ cle, libelle: ZONES[cle] })),
      pieges: inverse !== bonne ? { [inverse]: 'abscisse-d-abord' } : {},
    });
  }

  for (let i = 0; i < 2; i += 1) {
    let x; let y; let dx; let dy;
    do {
      x = coordonnee(5);
      y = coordonnee(5);
      dx = coordonnee(4);
      dy = coordonnee(4);
    } while (dx === dy || Math.abs(x + dx) > 9 || Math.abs(y + dy) > 9);
    liste.push(monter(melanger, 'deplacer', `Tir depuis A${pt(x, y)} : ${chemin(dx, dy)}. Il tombe en ?`, pt(x + dx, y + dy), [
      [pt(x + dy, y + dx), 'abscisse-d-abord'],
      [pt(x - dx, y - dy), 'sens-deplacement'],
    ], (k) => pt(x + dx + k, y + dy)));
  }
  return liste;
}

const BANQUES = { CINQUIEME: cinquieme };

export function serie(graine = Date.now(), niveau = 'CINQUIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES[CLASSES[0]];
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // Les consignes.
  'lire-point': 'Suis le chemin depuis l’origine et donne les coordonnées du navire.',
  'placer-point': 'Comment rejoindre ce navire en partant de l’origine ?',
  quadrant: 'Dans quelle zone du repère se trouve ce point ?',
  deplacer: 'Ton tir part de ce point et se déplace. Où tombe-t-il ?',

  // Les erreurs, chacune avec sa méthode.
  'abscisse-d-abord': 'D’abord l’abscisse, qui se lit sur l’axe horizontal, de gauche à droite ; puis l’ordonnée, sur l’axe vertical, de bas en haut.',
  'signe-gauche-bas': 'Vers la gauche ou vers le bas, la coordonnée est négative : n’oublie pas le signe moins.',
  'sens-deplacement': 'Vers la droite ou vers le haut, on ajoute ; vers la gauche ou vers le bas, on retire.',

  // Les replis.
  'lire-point-regle': 'Le nombre de pas vers la droite ou la gauche donne l’abscisse, celui vers le haut ou le bas donne l’ordonnée.',
  'placer-point-regle': 'L’abscisse dit combien de pas faire à droite ou à gauche, l’ordonnée combien en haut ou en bas.',
  'quadrant-regle': 'Regarde le signe de chaque coordonnée : abscisse positive à droite, négative à gauche ; ordonnée positive en haut, négative en bas.',
  'deplacer-regle': 'Ajoute le déplacement horizontal à l’abscisse, et le déplacement vertical à l’ordonnée.',
};
