import {
  useCallback, useLayoutEffect, useRef, useState,
} from 'react';

/**
 * LES BRIQUES DES SCÈNES DU FRANÇAIS AU CM1 ET AU CM2 (09/10/2026) — ce que
 * plusieurs jeux du groupe partagent : le trou d'une phrase, le fil qui relie
 * deux mots, le glisser-déposer, les lettres en mots. Chaque jeu garde SON
 * univers ; seules ces mécaniques sont communes. Classes préfixées
 * `sc-primaire-francais` (voir `primaire-francais.css`).
 */

export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/** « Les fillettes, ___ par la marche. » → ['Les fillettes, ', ' par la marche.'] ; null sans trou. */
export function autourDuTrou(texte) {
  const t = String(texte ?? '');
  const i = t.indexOf('___');
  if (i < 0) return null;
  return [t.slice(0, i), t.slice(i + 3)];
}

/**
 * LE TROU GARDE SES « ___ » DANS LE TEXTE — c'est la question que l'enfant lit,
 * elle ne change pas. Rempli, le trou cache ses tirets et montre le mot par le
 * CSS (`data-mot`, `::after`) : le mot se pose dans la phrase sans réécrire le
 * texte de la question.
 */
export function Trou({ mot = null, className = '' }) {
  return (
    <span
      className={`sc-primaire-francais__trou${mot ? ' est-rempli' : ''}${className ? ` ${className}` : ''}`}
      data-mot={mot ?? undefined}
    >
      <span className="sc-primaire-francais__tirets">___</span>
    </span>
  );
}

/** La phrase et son trou ; sans trou, la phrase telle quelle. */
export function PhraseATrou({ texte, mot = null, classeTrou = '' }) {
  const autour = autourDuTrou(texte);
  if (!autour) return texte;
  return (
    <>
      {autour[0]}
      <Trou mot={mot} className={classeTrou} />
      {autour[1]}
    </>
  );
}

/**
 * Les mots d'un texte, ponctuation comprise : « Il pleut, alors » → ['Il', ' ',
 * 'pleut', ', ', 'alors']. Une élision est un mot à part : « j’ai » → ['j’', 'ai'].
 */
export function enMorceaux(texte) {
  return String(texte ?? '').split(/([\p{L}-]+[’']|[\p{L}-]+)/u).filter((m) => m !== '');
}

export const estUnMot = (m) => /^[\p{L}’'-]+$/u.test(m);

const DETERMINANTS = new Set([
  'le', 'la', 'les', 'l’', 'un', 'une', 'des', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
  'ce', 'cet', 'cette', 'ces', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs',
]);

/**
 * LE GROUPE DU DÉBUT DE LA PHRASE : « Les fillettes, fatiguées… » → « Les
 * fillettes » ; « Léa est… » → « Léa ». Un déterminant prend son nom ; sinon,
 * le premier mot seul. Null si la phrase ne commence pas par un mot.
 */
export function groupeDuDebut(texte) {
  const mots = String(texte ?? '').trim().match(/^([\p{L}’'-]+)(\s+([\p{L}’'-]+))?/u);
  if (!mots) return null;
  if (DETERMINANTS.has(mots[1].toLowerCase()) && mots[3]) return `${mots[1]} ${mots[3]}`;
  return mots[1];
}

/** « ...[Il] tenait... » → l'indice du premier mot (entier, insensible à la casse) dans le texte, ou -1. */
export function chercherMot(texte, mot) {
  if (!mot) return -1;
  const echappe = mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^\\p{L}])(${echappe})(?=$|[^\\p{L}])`, 'iu');
  const r = re.exec(texte);
  return r ? r.index + r[1].length : -1;
}

/** La première lettre en capitale. */
export const capitale = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

/**
 * LE FIL ENTRE DEUX MOTS (pronom → nom, adjectif → nom) : une courbe qui part
 * d'un élément et arrive à un autre, dans le repère du conteneur. On mesure
 * après le rendu, et à chaque changement de taille de la fenêtre ; sans mesure
 * possible (tests, écran caché), pas de fil — jamais d'erreur.
 */
export function useFil(actif, depart, arrivee) {
  const conteneur = useRef(null);
  const [fil, setFil] = useState(null);

  const mesurer = useCallback(() => {
    const boite = conteneur.current;
    if (!boite || !actif) {
      setFil(null);
      return;
    }
    const a = boite.querySelector(depart);
    const b = boite.querySelector(arrivee);
    const r = boite.getBoundingClientRect();
    if (!a || !b || !r.width) {
      setFil(null);
      return;
    }
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    // Le dessin se place dans la boîte intérieure : on retire la bordure du conteneur.
    const gauche = r.left + (boite.clientLeft || 0);
    const haut0 = r.top + (boite.clientTop || 0);
    const x1 = ra.left + ra.width / 2 - gauche;
    const y1 = ra.top - haut0;
    const x2 = rb.left + rb.width / 2 - gauche;
    const y2 = rb.top - haut0;
    // Une arche bien visible au-dessus des mots ; elle peut mordre un peu sur le cadre.
    const haut = Math.max(-16, Math.min(y1, y2) - 48 - Math.abs(x2 - x1) * 0.06);
    setFil({
      d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${((x1 + x2) / 2).toFixed(1)} ${haut.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      largeur: r.width,
      hauteur: r.height,
      x1,
      y1,
      x2,
      y2,
    });
  }, [actif, depart, arrivee]);

  useLayoutEffect(() => {
    mesurer();
    if (!actif) return undefined;
    // Le mot qui se pose dans son trou change la largeur de la ligne : on remesure ensuite.
    const id = setTimeout(mesurer, 450);
    window.addEventListener('resize', mesurer);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', mesurer);
    };
  }, [actif, mesurer]);

  return [conteneur, fil];
}

/** Le dessin du fil : un trait qui se trace, et une flèche au bout. */
export function DessinDuFil({ fil, className }) {
  if (!fil) return null;
  return (
    <svg
      className={`sc-primaire-francais__fil ${className ?? ''}`}
      width={fil.largeur}
      height={fil.hauteur}
      viewBox={`0 0 ${fil.largeur} ${fil.hauteur}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className="sc-primaire-francais__fil-trait" d={fil.d} pathLength="100" />
      <circle className="sc-primaire-francais__fil-bout" cx={fil.x2} cy={fil.y2 - 2} r="6" />
    </svg>
  );
}

/**
 * GLISSER… OU CLIQUER. Un bouton-réponse qu'on peut traîner jusqu'à la cible
 * (le trou de la phrase, le groupe à étiqueter) ; lâché dessus, c'est la
 * réponse. Le simple clic suffit TOUJOURS : glisser est un plus, jamais une
 * obligation. Lâché ailleurs, l'objet revient à sa place.
 */
export function BoutonGlissable({
  cible, choisir, disabled, className, style, children, ...reste
}) {
  const bouton = useRef(null);
  const geste = useRef(null);
  const ignorerClic = useRef(false);
  const [decalage, setDecalage] = useState(null);

  const laCible = () => {
    const racine = bouton.current?.closest('.jeu') ?? document;
    return racine.querySelector(cible);
  };
  const surCible = (x, y) => {
    const c = laCible();
    if (!c) return false;
    const r = c.getBoundingClientRect();
    const marge = 28;
    return x >= r.left - marge && x <= r.right + marge && y >= r.top - marge && y <= r.bottom + marge;
  };
  const marquer = (allume) => laCible()?.classList.toggle('est-survolee', allume);

  const onPointerDown = (e) => {
    ignorerClic.current = false;
    if (disabled || (e.button !== undefined && e.button !== 0)) return;
    geste.current = {
      x0: e.clientX, y0: e.clientY, id: e.pointerId, bouge: false,
    };
  };
  const onPointerMove = (e) => {
    const g = geste.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    if (!g.bouge && Math.hypot(dx, dy) < 8) return;
    if (!g.bouge) {
      g.bouge = true;
      try { bouton.current?.setPointerCapture?.(e.pointerId); } catch { /* pas de capture : tant pis */ }
    }
    setDecalage({ dx, dy });
    marquer(surCible(e.clientX, e.clientY));
  };
  const finir = (e, lache) => {
    const g = geste.current;
    geste.current = null;
    if (!g?.bouge) return;
    ignorerClic.current = true;
    setDecalage(null);
    marquer(false);
    if (lache && surCible(e.clientX, e.clientY)) choisir();
  };

  return (
    <button
      ref={bouton}
      type="button"
      className={`${className}${decalage ? ' est-glisse' : ''}`}
      style={decalage ? { ...style, transform: `translate(${decalage.dx}px, ${decalage.dy}px) scale(1.06)` } : style}
      disabled={disabled}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finir(e, true)}
      onPointerCancel={(e) => finir(e, false)}
      onClick={() => {
        if (ignorerClic.current) {
          ignorerClic.current = false;
          return;
        }
        choisir();
      }}
      {...reste}
    >
      {children}
    </button>
  );
}
