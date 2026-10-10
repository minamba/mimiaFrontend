import { useEffect, useState } from 'react';
import { avecVisuel, classeQuestion } from '../base';

/**
 * LES BRIQUES COMMUNES DES SCÈNES DU GROUPE « LYCÉE, MATHS A » (09/10/2026).
 * Chaque jeu a son univers (voir les fichiers voisins) ; ici, seulement ce
 * qu'ils partagent : lire un nombre écrit à la française, dérouler une
 * explication pas à pas, des réponses qui restent des boutons, un petit repère.
 * Les classes partagées portent le préfixe du groupe, `sc-lycee-maths-a` :
 * aucun jeu ne s'appelle ainsi, rien ne peut entrer en collision.
 */

export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * UN DÉROULÉ PAS À PAS : un compteur qui monte de 0 à `total`, un pas toutes
 * les `cadence` millisecondes, puis s'arrête (aucune minuterie sans fin). En
 * mouvement réduit, on arrive directement à la fin.
 */
export function useDeroule(total, cadence = 650) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence]);
  return n;
}

/** Un nombre écrit à la française (« −3,5 », « 9/2 », « 12 % ») → nombre, ou NaN. */
export function nombre(texte) {
  const t = String(texte ?? '')
    .replace(/[−–]/g, '-')
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[%€]/g, '')
    .replace(/^\+/, '');
  const f = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (f) return Number(f[1]) / Number(f[2]);
  if (!/^-?\d+(\.\d+)?$/.test(t)) return NaN;
  return Number(t);
}

/** Un nombre → texte à la française, arrondi au dix-millième, avec le vrai signe moins. */
export function ecrire(x, chiffres = 4) {
  if (!Number.isFinite(x)) return '?';
  const arrondi = Math.round(x * 10 ** chiffres) / 10 ** chiffres;
  const t = String(Object.is(arrondi, -0) ? 0 : arrondi).replace('.', ',');
  return t.replace('-', '−');
}

/** Tous les nombres d'un texte, dans l'ordre (signes « − » compris). */
export function nombresDe(texte) {
  return (String(texte ?? '').match(/[−-]?\d+(?:,\d+)?/g) ?? []).map(nombre);
}

/**
 * CE QUI S'AFFICHE SOUS LA QUESTION une fois la manche finie : rien quand la
 * scène montre déjà la bonne réponse (`montre(m)` vrai), sinon la bonne
 * réponse dans sa bulle, comme l'écran commun.
 */
export const apresSauf = (montre) => (m) => {
  if (sur(() => montre(m), false)) return null;
  const bonne = m.choix.find((c) => String(c.cle) === String(m.bonne));
  return bonne ? <div className="scene__reponse">{bonne.libelle}</div> : null;
};

/** Un calcul qui ne doit jamais casser la scène : son résultat, ou `repli`. */
export function sur(calcul, repli = null) {
  try {
    const r = calcul();
    return r ?? repli;
  } catch {
    return repli;
  }
}

/**
 * LE TEXTE DE LA QUESTION, ENTIER, dans le panneau du jeu (son parchemin, son
 * écran, sa plaque…). Rien n'est retiré : c'est lui que l'enfant lit.
 */
export function Texte({ m, classe }) {
  return <p className={`${classeQuestion(m.question)} ${classe}`}>{m.question}</p>;
}

/** Le texte et, s'il existe, le dessin du module (courbe, figure) — toujours gardé. */
export const texteEtVisuel = (m, classe) => avecVisuel(m, <Texte m={m} classe={classe} />);

/**
 * DES RÉPONSES QUI RESTENT DES BOUTONS, quelle que soit leur forme (levier,
 * bateau, vanne…) : un `<button>` par réponse, nommé par son libellé, qui
 * appelle `choisir(cle)`, désactivé et barré une fois écarté. `decor(i, c)`
 * ajoute le dessin (caché aux lecteurs d'écran) autour du libellé.
 */
export function Reponses({
  choix, fautes, choisir, prefixe, decor, apresLibelle, etiquette = 'Choisis ta réponse', classe = '',
}) {
  return (
    <ul className={`${prefixe}__reponses ${classe}`} aria-label={etiquette}>
      {choix.map((c, i) => {
        const faute = fautes.includes(c.cle);
        return (
          <li key={c.cle} className={`${prefixe}__place`} style={{ '--i': i }}>
            <button
              type="button"
              className={`sc-lycee-maths-a__bouton ${prefixe}__bouton${faute ? ' est-fausse' : ''}`}
              onClick={() => choisir(c.cle)}
              disabled={faute}
            >
              {decor ? decor(i, c) : null}
              <span className={`${prefixe}__libelle`}>{c.libelle}</span>
              {apresLibelle ? apresLibelle(i, c) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * UN PETIT REPÈRE EN SVG, pour rejouer une droite, des vecteurs, une parabole
 * après la réponse. `fenetre` : { xmin, xmax, ymin, ymax } ; `children(X, Y)`
 * dessine dans le repère. Le quadrillage est à l'unité quand il le peut.
 */
export function Repere({
  fenetre, largeur = 300, hauteur = 220, prefixe, children, graduer = true,
}) {
  const {
    xmin, xmax, ymin, ymax,
  } = fenetre;
  const m = 18;
  const X = (x) => m + ((x - xmin) / (xmax - xmin)) * (largeur - 2 * m);
  const Y = (y) => hauteur - m - ((y - ymin) / (ymax - ymin)) * (hauteur - 2 * m);
  const pasX = Math.max(1, Math.ceil((xmax - xmin) / 14));
  const pasY = Math.max(1, Math.ceil((ymax - ymin) / 12));
  const lignes = [];
  for (let x = Math.ceil(xmin / pasX) * pasX; x <= xmax; x += pasX) lignes.push(['x', x]);
  for (let y = Math.ceil(ymin / pasY) * pasY; y <= ymax; y += pasY) lignes.push(['y', y]);
  const x0 = Math.min(Math.max(0, xmin), xmax);
  const y0 = Math.min(Math.max(0, ymin), ymax);
  return (
    <svg className={`sc-lycee-maths-a__repere ${prefixe}__repere`} viewBox={`0 0 ${largeur} ${hauteur}`} aria-hidden="true" focusable="false">
      {lignes.map(([axe, v]) => (axe === 'x'
        ? <line key={`x${v}`} className="sc-lycee-maths-a__grille" x1={X(v)} x2={X(v)} y1={m} y2={hauteur - m} />
        : <line key={`y${v}`} className="sc-lycee-maths-a__grille" x1={m} x2={largeur - m} y1={Y(v)} y2={Y(v)} />))}
      <line className="sc-lycee-maths-a__axe" x1={m - 4} x2={largeur - m + 6} y1={Y(y0)} y2={Y(y0)} />
      <line className="sc-lycee-maths-a__axe" x1={X(x0)} x2={X(x0)} y1={hauteur - m + 4} y2={m - 6} />
      {graduer && (
        <>
          <text className="sc-lycee-maths-a__graduation" x={X(x0 + pasX)} y={Y(y0) + 13} textAnchor="middle">{x0 + pasX}</text>
          <text className="sc-lycee-maths-a__graduation" x={X(x0) - 4} y={Y(y0 + pasY) + 4} textAnchor="end">{y0 + pasY}</text>
        </>
      )}
      {children(X, Y)}
    </svg>
  );
}

/** Une fenêtre qui contient tous les points donnés (et l'origine), avec une marge. */
export function fenetreAutour(points, marge = 1.5) {
  const xs = [0, ...points.map((p) => p[0])].filter(Number.isFinite);
  const ys = [0, ...points.map((p) => p[1])].filter(Number.isFinite);
  let xmin = Math.min(...xs) - marge;
  let xmax = Math.max(...xs) + marge;
  let ymin = Math.min(...ys) - marge;
  let ymax = Math.max(...ys) + marge;
  if (xmax - xmin < 6) { xmin -= 2; xmax += 2; }
  if (ymax - ymin < 6) { ymin -= 2; ymax += 2; }
  return {
    xmin: Math.floor(xmin), xmax: Math.ceil(xmax), ymin: Math.floor(ymin), ymax: Math.ceil(ymax),
  };
}

/** Les coordonnées nommées d'un texte : « A(−5 ; 2) » → { A: [−5, 2] }. */
export function pointsNommes(texte) {
  const points = {};
  const re = /([A-Za-z][′']?)\s*(?:⃗)?\(\s*([−-]?\d+(?:,\d+)?)\s*;\s*([−-]?\d+(?:,\d+)?)\s*\)/g;
  let r = re.exec(texte);
  while (r) {
    points[r[1]] = [nombre(r[2]), nombre(r[3])];
    r = re.exec(texte);
  }
  return points;
}
