import { useEffect, useState } from 'react';
import { valeur } from '../../../../lib/jeux/visuels.js';
import { avecVisuel, classeQuestion } from '../base';

/**
 * LES OUTILS COMMUNS DES SCÈNES DU GROUPE « LYCÉE, MATHS B » (09/10/2026).
 * Aucune classe CSS ici : chaque jeu habille ses scènes avec ses propres
 * classes (`sc-<cle>__…`). On n'y trouve que des calculs sûrs — lire un nombre
 * écrit à la française, poser un repère, avancer une animation pas à pas — et
 * la question elle-même, telle que l'enfant la lit.
 */

/** L'enfant a demandé moins d'animations : tout s'affiche d'emblée, à sa place finale. */
export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * UN NOMBRE ÉCRIT À LA FRANÇAISE : « 1 234,5 », « −3 », « 0,25 ». Les espaces
 * (fines, insécables) séparent les milliers ; le vrai signe moins est compris.
 * Rend null pour tout ce qui n'est pas un nombre.
 */
export function nombreFr(texte) {
  if (texte === null || texte === undefined) return null;
  const s = String(texte).replace(/[\s   ]/g, '').replace('−', '-').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/** Tous les nombres d'un texte, dans l'ordre (« 3 boules », « 1 200 € », « −2 »). */
export function nombresDans(texte) {
  // Les milliers sont séparés par une espace fine ou insécable, jamais par une espace ordinaire :
  // « 3 boules 120 » reste deux nombres.
  const trouves = String(texte ?? '').match(/[−-]?\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|[−-]?\d+(?:,\d+)?/g) ?? [];
  return trouves.map(nombreFr).filter((v) => v !== null);
}

/** Le premier nombre d'un libellé (« 12,50 € » → 12.5), ou null. */
export function premierNombre(texte) {
  const n = nombresDans(texte);
  return n.length ? n[0] : null;
}

/** Une valeur écrite à la française, sans zéro inutile : 1.5 → « 1,5 », −2 → « −2 ». */
export function ecrireFr(x, decimales = 2) {
  if (!Number.isFinite(x)) return '';
  const r = Math.round(x * 10 ** decimales) / 10 ** decimales;
  const s = String(Math.abs(r)).replace('.', ',');
  return r < 0 ? `−${s}` : s;
}

const proche = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
export { proche };

/**
 * LA QUESTION, TELLE QUELLE — le texte entier reste à l'écran, avec le dessin
 * de la manche (`m.visuel`) s'il y en a un. `classe` habille le paragraphe.
 */
export function TexteQuestion({ m, classe = '' }) {
  return avecVisuel(m, <p className={`${classeQuestion(m.question)} ${classe}`.trim()}>{m.question}</p>);
}

/**
 * UNE ANIMATION PAS À PAS : le compteur avance de 0 à `total` toutes les
 * `cadence` millisecondes, puis s'arrête (minuterie nettoyée). En mouvement
 * réduit, il est d'emblée au bout.
 */
export function usePas(total, cadence = 500) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence]);
  return Math.min(n, total);
}

/**
 * UN REPÈRE SVG pour une fenêtre { xmin, xmax, ymin, ymax } : X et Y passent
 * des coordonnées du dessin à celles de l'image (largeur L, hauteur H, marge).
 */
export function repere(fenetre, L = 320, H = 200, marge = 14) {
  const { xmin, xmax, ymin, ymax } = fenetre;
  const lx = xmax - xmin || 1;
  const ly = ymax - ymin || 1;
  const X = (x) => marge + ((x - xmin) / lx) * (L - 2 * marge);
  const Y = (y) => H - marge - ((y - ymin) / ly) * (H - 2 * marge);
  return { X, Y, L, H };
}

/** Le tracé d'une fonction du dessinateur (`lib/jeux/visuels.js`) dans un repère ; coupé là où elle n'existe pas. */
export function tracer(f, fenetre, { X, Y }, de = fenetre.xmin, a = fenetre.xmax, pas = 72) {
  let d = '';
  let leve = true;
  const marge = (fenetre.ymax - fenetre.ymin) * 0.6;
  for (let i = 0; i <= pas; i += 1) {
    const x = de + ((a - de) * i) / pas;
    let y = NaN;
    try {
      y = valeur(f, x);
    } catch {
      y = NaN;
    }
    if (!Number.isFinite(y) || y > fenetre.ymax + marge || y < fenetre.ymin - marge) {
      leve = true;
    } else {
      d += `${leve ? 'M' : 'L'}${X(x).toFixed(1)} ${Y(y).toFixed(1)} `;
      leve = false;
    }
  }
  return d.trim();
}

/** La valeur d'une fonction du dessinateur, ou NaN : jamais d'exception. */
export function valeurSure(f, x) {
  try {
    const y = valeur(f, x);
    return Number.isFinite(y) ? y : NaN;
  } catch {
    return NaN;
  }
}

const EXPOSANTS = { '': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5 };

/**
 * UN POLYNÔME ÉCRIT « 2x³ − 5x² + 3x − 7 » (coefficients entiers ou décimaux
 * à la française) → ses coefficients, du degré 0 au plus haut : [−7, 3, −5, 2].
 * Rend null au moindre terme qu'il ne sait pas lire (une fraction, un ln…).
 */
export function lirePolynome(texte) {
  const s = String(texte).trim();
  if (s === '') return null;
  const termes = s.replace(/ ([+−]) /g, ' $1').split(' ');
  const coefs = [];
  for (const terme of termes) {
    const t = terme.match(/^([+−]?)(\d+(?:,\d+)?)?(?:x([²³⁴⁵]?))?$/);
    if (!t || (t[2] === undefined && !terme.includes('x'))) return null;
    const signe = t[1] === '−' ? -1 : 1;
    const valeur = t[2] === undefined ? 1 : nombreFr(t[2]);
    const degre = terme.includes('x') ? EXPOSANTS[t[3] ?? ''] : 0;
    if (valeur === null || degre === undefined) return null;
    coefs[degre] = (coefs[degre] ?? 0) + signe * valeur;
  }
  return Array.from({ length: coefs.length }, (_, i) => coefs[i] ?? 0);
}

/** La dérivée d'un polynôme (coefficients du degré 0 au plus haut). */
export const deriverPolynome = (coefs) => coefs.slice(1).map((c, i) => c * (i + 1));

const PUISSANCES = ['', 'x', 'x²', 'x³', 'x⁴', 'x⁵'];

/** Des coefficients (degré 0 d'abord) → « 6x² − 10x + 3 », du plus haut degré au plus bas. */
export function ecrirePolynome(coefs) {
  const morceaux = [];
  for (let d = coefs.length - 1; d >= 0; d -= 1) {
    const c = Math.round(coefs[d] * 1e6) / 1e6;
    if (c !== 0) {
      const abs = Math.abs(c);
      const corps = d === 0 ? ecrireFr(abs, 6) : `${abs === 1 ? '' : ecrireFr(abs, 6)}${PUISSANCES[d]}`;
      if (morceaux.length === 0) morceaux.push(c < 0 ? `−${corps}` : corps);
      else morceaux.push(`${c < 0 ? '−' : '+'} ${corps}`);
    }
  }
  return morceaux.length ? morceaux.join(' ') : '0';
}

/**
 * UN INTERVALLE SUR LA DROITE DES RÉELS, dessiné à partir de son écriture
 * (« ]2 ; +∞[ », « [−1 ; 3] », « ]0 ; e²[ ») : schématique, les bornes à leur
 * place relative, crochets ouverts ou fermés. Les classes viennent du jeu
 * (`P`). Rend null si l'écriture n'est pas un intervalle.
 */
export function Intervalle({ P, texte, interdit = false }) {
  const lu = String(texte).match(/^([\][])\s*(.+?)\s*;\s*(.+?)\s*([\][])$/);
  if (!lu) return null;
  const [, ouvre, gauche, droite, ferme] = lu;
  const moinsInfini = /^[−-]∞$/.test(gauche);
  const plusInfini = /^\+?∞$/.test(droite);
  const xa = moinsInfini ? 10 : 70;
  const xb = plusInfini ? 290 : 230;
  const crochet = (x, sens, estFerme) => {
    // Un crochet tourné vers l'intérieur est fermé ; vers l'extérieur, ouvert.
    const vers = estFerme ? sens : -sens;
    return <path d={`M${x + 7 * vers} 26 H${x} V54 H${x + 7 * vers}`} className={`${P}__crochet`} />;
  };
  return (
    <svg className={`${P}__intervalle`} viewBox="0 0 300 80" aria-hidden="true" focusable="false">
      {interdit && <rect x="10" y="30" width="60" height="20" className={`${P}__interdit`} />}
      <line x1="4" y1="40" x2="296" y2="40" className={`${P}__reelle`} />
      <path d="M290 34 L298 40 L290 46" className={`${P}__reelle`} fill="none" />
      <rect x={xa} y="35" width={xb - xa} height="10" rx="5" className={`${P}__plage`} />
      {!moinsInfini && crochet(xa, 1, ouvre === '[')}
      {!plusInfini && crochet(xb, -1, ferme === ']')}
      <text x={xa} y="72" textAnchor="middle" className={`${P}__borne`}>{gauche}</text>
      <text x={xb} y="72" textAnchor="middle" className={`${P}__borne`}>{droite}</text>
    </svg>
  );
}

/** Une fenêtre de dessin valide (quatre nombres, bornes dans le bon ordre), ou null. */
export function fenetreValide(v) {
  const f = v?.fenetre;
  if (!f) return null;
  const ok = ['xmin', 'xmax', 'ymin', 'ymax'].every((k) => Number.isFinite(f[k]));
  return ok && f.xmax > f.xmin && f.ymax > f.ymin ? f : null;
}
