/**
 * COMBIEN DE TEMPS — 6e, Nora. Suite de « Combien de temps » du primaire.
 *
 * COMPÉTENCE : MATH_6E_MES_DUREE.
 *
 * QUATRE SORTES DE MANCHES (tout se calcule en minutes) :
 *   - LA DURÉE ENTRE DEUX HORAIRES (3) : de 8 h 45 à 11 h 20, 2 h 35 min.
 *     Pièges : emprunter cent minutes (2 h 75 min), retourner la soustraction
 *     des minutes (3 h 25 min) ;
 *   - L'HEURE D'ARRIVÉE (3) : 14 h 50 + 1 h 25 min = 16 h 15. Pièges : garder
 *     plus de soixante minutes (15 h 75), oublier l'heure retenue (15 h 15) ;
 *   - LES HEURES DÉCIMALES (1) : 2,5 h = 2 h 30 min. LE PIÈGE : lire les
 *     chiffres après la virgule comme des minutes (2 h 50 min, 2 h 5 min) ;
 *   - LES MINUTES EN HEURES (1) : 135 min = 2 h 15 min. LE PIÈGE : compter
 *     cent minutes dans une heure (1 h 35 min).
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'combien-de-temps-college', titre: 'Combien de temps', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Combien de temps',
    accroche: 'Durées et horaires, à la minute près.',
    competences: ['MATH_6E_MES_DUREE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

function construire(melanger, consigne, question, bonne, pieges, voisin) {
  const vus = [bonne];
  const gardes = [];
  pieges.forEach(([c, phrase]) => {
    if (!vus.includes(c)) { vus.push(c); gardes.push([c, phrase]); }
  });
  const choix = troisChoix(bonne, gardes.map(([c]) => c), voisin);
  return {
    consigne,
    question,
    bonne,
    choix: melanger(choix).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(gardes.filter(([c]) => choix.includes(c))),
  };
}

/** Un horaire : « 8 h 05 ». Les minutes peuvent dépasser 59 pour écrire un piège. */
const horaire = (h, m) => `${h} h ${String(m).padStart(2, '0')}`;
/** Une durée : « 2 h 35 min », « 35 min ». */
const duree = (h, m) => (h === 0 ? `${m} min` : `${h} h ${m} min`);
const enDuree = (t) => duree(Math.floor(t / 60), t % 60);
const enHoraire = (t) => horaire(Math.floor(t / 60), t % 60);

const PARTIES_DECIMALES = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // La durée entre deux horaires : les minutes d'arrivée sont plus petites.
  for (let i = 0; i < 3; i += 1) {
    const h1 = entre(7, 17);
    const m1 = entre(4, 11) * 5;
    const h2 = h1 + entre(1, 3);
    const m2 = entre(0, m1 / 5 - 1) * 5;
    const juste = h2 * 60 + m2 - (h1 * 60 + m1);
    liste.push(construire(melanger, 'duree-entre',
      `Départ ${horaire(h1, m1)}, arrivée ${horaire(h2, m2)}. Durée ?`, enDuree(juste),
      [[duree(h2 - h1 - 1, 100 + m2 - m1), 'heure-cent'], [duree(h2 - h1, m1 - m2), 'soustraction-inversee']],
      (k) => enDuree(juste + 5 * k)));
  }

  // L'heure d'arrivée : les minutes passent l'heure.
  for (let i = 0; i < 3; i += 1) {
    const h1 = entre(7, 18);
    const m1 = entre(2, 11) * 5;
    const dh = entre(0, 3);
    // Les minutes passent soixante, sans atteindre cent (« 15 h 75 », jamais « 15 h 105 »).
    const dm = entre(Math.max(1, 13 - m1 / 5), Math.min(11, 19 - m1 / 5)) * 5;
    const arrivee = h1 * 60 + m1 + dh * 60 + dm;
    liste.push(construire(melanger, 'heure-arrivee',
      `Départ ${horaire(h1, m1)}, durée ${duree(dh, dm)}. Arrivée ?`, enHoraire(arrivee),
      [[horaire(h1 + dh, m1 + dm), 'minutes-depassent'], [horaire(h1 + dh, m1 + dm - 60), 'retenue-heure']],
      (k) => enHoraire(arrivee + 60 * k)));
  }

  // Les heures décimales.
  {
    const h = entre(1, 5);
    const p = au(PARTIES_DECIMALES);
    const pieges = [[duree(h, p), 'heure-decimale']];
    if (p % 10 === 0) pieges.push([duree(h, p / 10), 'heure-decimale']);
    const ecrit = `${h},${p % 10 === 0 ? p / 10 : p}`;
    liste.push(construire(melanger, 'convertir-duree', `${ecrit} h = ?`, duree(h, (p * 60) / 100), pieges,
      (k) => duree(h + k, (p * 60) / 100)));
  }

  // Les minutes en heures et minutes.
  {
    const h = entre(1, 4);
    const m = entre(1, 11) * 5;
    const N = 60 * h + m;
    const pieges = N >= 100 && N % 100 !== 0 ? [[duree(Math.floor(N / 100), N % 100), 'heure-cent']] : [];
    liste.push(construire(melanger, 'convertir-duree', `${N} min = ?`, duree(h, m), pieges,
      (k) => duree(h + k, m)));
  }

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'duree-entre': 'Combien de temps s’est écoulé entre ces deux horaires ?',
  'heure-arrivee': 'À quelle heure arrive-t-on ?',
  'convertir-duree': 'Écris cette durée en heures et en minutes.',

  'heure-cent': 'Une heure vaut soixante minutes, pas cent : quand tu changes une heure en minutes, compte soixante.',
  'soustraction-inversee': 'On ne retourne pas la soustraction des minutes : s’il en manque, emprunte une heure, qui vaut soixante minutes.',
  'minutes-depassent': 'Soixante minutes font une heure : quand les minutes dépassent soixante, enlève soixante et ajoute une heure.',
  'retenue-heure': 'Tu as bien retiré soixante minutes : n’oublie pas d’ajouter l’heure qu’elles forment.',
  'heure-decimale': 'Les chiffres après la virgule ne sont pas des minutes : zéro virgule cinq heure, c’est une demi-heure, trente minutes. Multiplie la partie décimale par soixante.',

  'duree-entre-regle': 'Va de l’horaire de départ jusqu’à l’heure pile suivante, puis jusqu’à l’arrivée, et additionne.',
  'heure-arrivee-regle': 'Ajoute les heures, puis les minutes ; soixante minutes forment une heure de plus.',
  'convertir-duree-regle': 'Une heure, c’est soixante minutes : compte combien de fois soixante tient dans la durée.',
};
