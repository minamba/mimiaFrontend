/**
 * LES ILLUSTRATIONS DES JEUX QUESTION-RÉPONSE — Camara, le 09/10/2026 :
 * « rends-les plus visuels selon le thème : pour une boule de rayon 6 cm, une
 * boule animée avec ses dimensions ». Étape 2 : la géométrie et les courbes.
 *
 * UN JEU NE DESSINE RIEN LUI-MÊME : sa manche porte un champ `visuel`, de
 * simples données, et l'écran (`components/jeux/Visuel.js`) le dessine et
 * l'anime. Une manche sans `visuel` reste une question écrite, comme avant.
 *
 * DES DONNÉES, JAMAIS DE FONCTION : les tests comparent deux parties de même
 * graine avec `toEqual` ; une fonction n'est jamais égale à une autre.
 *
 * LES COTES SONT DES TEXTES (« 6 cm », « ? », « x ») : on écrit ce que la
 * question dit, et « ? » pour ce qu'on cherche. Les nombres servent au dessin.
 *
 * LES FORMES
 * ----------
 * { type: 'solide', forme, cotes, unite? }
 *   forme : 'boule' | 'cube' | 'pave' | 'cylindre' | 'cone' | 'pyramide' | 'prisme'
 *   cotes : boule { rayon } · cube { cote } · pave { longueur, largeur, hauteur }
 *           cylindre { rayon, hauteur } · cone { rayon, hauteur } ·
 *           pyramide { cote | longueur + largeur, hauteur } · prisme { base, hauteur, longueur }
 *           (+ angleDroit: true pour une base en triangle rectangle) ;
 *           boule, cylindre, cône : { diametre } au lieu de { rayon } trace la cote
 *           de bord à bord ; pavé et cube : { diagonale } trace la grande diagonale.
 *
 * { type: 'figure', forme, cotes?, angle?, noms? }
 *   'triangle-rectangle' — cotes { horizontal, vertical, hypotenuse }, angle
 *        { sommet: 'bas' | 'haut', valeur }, noms ['A', 'B', 'C'] (haut, angle
 *        droit, bas-droite) ;
 *   'echelle' et 'toboggan' — le même triangle, avec le mur et le sol dessinés ;
 *   'triangle-quelconque' — cotes { AB, BC, AC }, angle { A?, B?, C? } (textes),
 *        noms (['A', 'B', 'C'] par défaut) : Al-Kashi, loi des sinus, périmètre ;
 *   'triangle' { base, hauteur } · 'rectangle' { longueur, largeur, diagonale? } ·
 *   'carre' { cote, aire? } · 'parallelogramme' { base, hauteur } ·
 *   'trapeze' { grandeBase, petiteBase, hauteur } · 'disque' { rayon? diametre? } ;
 *   'angle' — angle { mesure: nombre en degrés (pour le dessin), valeur: texte },
 *        rapporteur: true pour poser le rapporteur ;
 *   'thales' — cotes { AM, AB, AN, AC, MN, BC } (M sur [AB], N sur [AC], (MN) ∥ (BC)) ;
 *        noms [A, B, C, M, N] pour d'autres lettres ; papillon: true pour M et N
 *        au-delà de A (configuration en papillon) ;
 *   'angle' accepte aussi cotes { u, v } : les longueurs des deux côtés ;
 *   'disque' { rayon, diametre } ensemble : le rayon descend, le diamètre traverse ;
 *   'angles-adjacents' — angle { mesure1, mesure2 (nombres), valeur1, valeur2 } ;
 *   'secante' — deux droites coupées par une sécante : angles [{ point: 1 | 2,
 *        coin: 'ne' | 'no' | 'se' | 'so', valeur }], paralleles: false pour
 *        des droites qui ne le sont pas ;
 *   'deux-carres' — cotes { aire1, aire2, cote1?, cote2? }.
 *
 * { type: 'courbe', fenetre, fonctions?, points?, tangente?, aire?, suite?, nuage?, droite? }
 *   fenetre : { xmin, xmax, ymin, ymax }
 *   fonctions : [{ forme, ...params, etiquette? }] avec forme :
 *     'affine' { a, b } · 'poly' { coefs: [c0, c1, c2…] } (c0 + c1 x + c2 x²…) ·
 *     'carre' · 'cube' · 'inverse' · 'racine' · 'exp' { a?, k? } (a e^(kx)) ·
 *     'ln' { a? } · 'cos' et 'sin' { a?, k? } (a cos(kx)) ·
 *     'morceaux' { points: [[x, y]…] } (une ligne brisée : assez de points la font courbe)
 *   points : [{ x, y, etiquette? }] — des points marqués ;
 *   tangente : { x, y, pente } — la droite qui touche la courbe en (x ; y) ;
 *   aire : { fonction: indice, a, b } — l'aire sous la courbe, qui se remplit ;
 *   suite : [u0, u1, u2…] — des termes placés en n = 0, 1, 2… ;
 *   nuage : [[x, y]…] — un nuage de points ; droite : { a, b, etiquette? } — son ajustement ;
 *   verticales : [{ x, etiquette? }] et horizontales : [{ y, etiquette? }] — des droites
 *     x = a et y = k en pointillés ; nomsDeLaSuite: true nomme les termes u₀, u₁…
 *   Tout ce qui se trace est coupé au cadre du repère.
 */

const FORMES_SOLIDES = ['boule', 'cube', 'pave', 'cylindre', 'cone', 'pyramide', 'prisme'];
const FORMES_FIGURES = ['angles-adjacents', 'secante', 'deux-carres', 'triangle-quelconque', 'triangle-rectangle', 'echelle', 'toboggan', 'triangle', 'rectangle', 'carre', 'parallelogramme', 'trapeze', 'disque', 'angle', 'thales'];
const FORMES_FONCTIONS = ['affine', 'poly', 'carre', 'cube', 'inverse', 'racine', 'exp', 'ln', 'cos', 'sin', 'morceaux'];

/** La valeur d'une fonction décrite en données ; NaN hors de son domaine. */
export function valeur(f, x) {
  switch (f.forme) {
    case 'affine': return f.a * x + f.b;
    case 'poly': return f.coefs.reduce((s, c, i) => s + c * x ** i, 0);
    case 'carre': return x * x;
    case 'cube': return x * x * x;
    case 'inverse': return x === 0 ? NaN : 1 / x;
    case 'racine': return x < 0 ? NaN : Math.sqrt(x);
    case 'exp': return (f.a ?? 1) * Math.exp((f.k ?? 1) * x);
    case 'ln': return x <= 0 ? NaN : (f.a ?? 1) * Math.log(x);
    case 'cos': return (f.a ?? 1) * Math.cos((f.k ?? 1) * x);
    case 'sin': return (f.a ?? 1) * Math.sin((f.k ?? 1) * x);
    case 'morceaux': {
      const p = f.points;
      if (x < p[0][0] || x > p[p.length - 1][0]) return NaN;
      for (let i = 1; i < p.length; i += 1) {
        if (x <= p[i][0]) {
          const [x0, y0] = p[i - 1];
          const [x1, y1] = p[i];
          return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        }
      }
      return NaN;
    }
    default: return NaN;
  }
}

const estTexte = (v) => typeof v === 'string' && v.length > 0;
const estNombre = (v) => typeof v === 'number' && Number.isFinite(v);

/** Ce qui ne va pas dans un `visuel` : une liste vide quand il est bon. Pour les tests. */
export function erreursDuVisuel(v) {
  const e = [];
  if (!v || typeof v !== 'object') return ['pas un objet'];
  if (v.type === 'solide') {
    if (!FORMES_SOLIDES.includes(v.forme)) e.push(`forme de solide inconnue : ${v.forme}`);
    if (!v.cotes || !Object.values(v.cotes).every(estTexte)) e.push('cotes : des textes attendus');
  } else if (v.type === 'figure') {
    if (!FORMES_FIGURES.includes(v.forme)) e.push(`forme de figure inconnue : ${v.forme}`);
    if (v.cotes && !Object.values(v.cotes).every(estTexte)) e.push('cotes : des textes attendus');
    if (v.forme === 'angle' && !estNombre(v.angle?.mesure)) e.push('angle.mesure : un nombre attendu');
  } else if (v.type === 'courbe') {
    const w = v.fenetre;
    if (!w || ![w.xmin, w.xmax, w.ymin, w.ymax].every(estNombre) || w.xmin >= w.xmax || w.ymin >= w.ymax) e.push('fenetre invalide');
    (v.fonctions ?? []).forEach((f, i) => {
      if (!FORMES_FONCTIONS.includes(f.forme)) e.push(`fonction ${i} : forme inconnue ${f.forme}`);
      if (typeof f === 'function') e.push(`fonction ${i} : une fonction JavaScript, pas des données`);
    });
    (v.points ?? []).forEach((p, i) => { if (!estNombre(p.x) || !estNombre(p.y)) e.push(`point ${i} invalide`); });
    if (v.suite && !v.suite.every(estNombre)) e.push('suite : des nombres attendus');
    if (v.nuage && !v.nuage.every((p) => estNombre(p[0]) && estNombre(p[1]))) e.push('nuage invalide');
  } else e.push(`type inconnu : ${v.type}`);
  return e;
}
