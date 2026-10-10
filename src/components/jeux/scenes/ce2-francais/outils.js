import {
  useCallback, useLayoutEffect, useRef, useState,
} from 'react';

/**
 * LES BRIQUES DES SCÈNES DU FRANÇAIS AU CE1 ET AU CE2 (09/10/2026) — ce que
 * les cinq jeux du groupe partagent : l'humeur de la mascotte, la fête de la
 * bonne réponse, le glisser-déposer et le fil entre deux mots. Chaque jeu
 * garde SON univers (voir les fichiers voisins) ; seules ces mécaniques sont
 * communes. Classes préfixées `sc-ce2-francais` (voir `ce2-francais.css`).
 */

/**
 * L'HUMEUR DE LA MASCOTTE, tirée de ce que l'écran sait de la manche :
 *   - « attend » : rien n'est joué, elle vit doucement ;
 *   - « courage » : une réponse fausse vient d'être touchée — elle encourage,
 *     jamais elle ne se moque ;
 *   - « bravo » : la réponse est trouvée — elle fait la fête ;
 *   - « montre » : la réponse a été montrée après deux erreurs — elle
 *     explique, calmement.
 */
export function humeurDe(termine, extra = {}) {
  if (termine && extra?.trouve) return 'bravo';
  if (termine) return 'montre';
  if (extra?.derniereFaute) return 'courage';
  return 'attend';
}

/** La clé qui rejoue l'animation de la mascotte à chaque nouvelle humeur, à chaque nouvelle faute. */
export const cleHumeur = (humeur, extra = {}) => `${humeur}-${extra?.derniereFaute ?? ''}`;

/**
 * LA FÊTE DE LA BONNE RÉPONSE : des éclats aux couleurs du jeu qui partent en
 * étoile autour de la scène, une seule fois. Le dessin est dans le CSS ; la
 * forme vient du jeu (`forme` : etoile, craie, papier, note…).
 */
export function Fete({ forme = 'etoile', nombre = 10 }) {
  return (
    <span className={`sc-ce2-francais__fete sc-ce2-francais__fete--${forme}`} aria-hidden="true">
      {Array.from({ length: nombre }, (_, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className="sc-ce2-francais__eclat"
          style={{ '--angle': `${Math.round((360 / nombre) * i)}deg`, '--i': i }}
        />
      ))}
    </span>
  );
}

/**
 * GLISSER… OU CLIQUER. Un bouton-réponse qu'on peut traîner jusqu'à la cible
 * (le trou de la phrase, le groupe surligné, le panneau vide) ; lâché dessus,
 * c'est la réponse. Le simple clic suffit TOUJOURS : glisser est un plus,
 * jamais une obligation. Lâché ailleurs, l'objet revient à sa place.
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
    const marge = 30;
    return x >= r.left - marge && x <= r.right + marge && y >= r.top - marge && y <= r.bottom + marge;
  };
  const marquer = (allume) => laCible()?.classList.toggle('sc-ce2-francais--survolee', allume);

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
      className={`${className}${decalage ? ' sc-ce2-francais--glisse' : ''}`}
      style={decalage ? { ...style, translate: `${decalage.dx}px ${decalage.dy}px` } : style}
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

/**
 * LE FIL ENTRE DEUX MOTS (le verbe → son vrai sujet) : une arche qui part d'un
 * élément et arrive à un autre, dans le repère du conteneur. On mesure après
 * le rendu et à chaque changement de taille de la fenêtre ; sans mesure
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
    const gauche = r.left + (boite.clientLeft || 0);
    const haut0 = r.top + (boite.clientTop || 0);
    const x1 = ra.left + ra.width / 2 - gauche;
    const y1 = ra.top - haut0;
    const x2 = rb.left + rb.width / 2 - gauche;
    const y2 = rb.top - haut0;
    const haut = Math.max(-10, Math.min(y1, y2) - 40 - Math.abs(x2 - x1) * 0.05);
    setFil({
      d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${((x1 + x2) / 2).toFixed(1)} ${haut.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      largeur: r.width,
      hauteur: r.height,
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
export function DessinDuFil({ fil, className = '' }) {
  if (!fil) return null;
  return (
    <svg
      className={`sc-ce2-francais__fil ${className}`}
      width={fil.largeur}
      height={fil.hauteur}
      viewBox={`0 0 ${fil.largeur} ${fil.hauteur}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className="sc-ce2-francais__fil-trait" d={fil.d} pathLength="100" />
      <circle className="sc-ce2-francais__fil-bout" cx={fil.x2} cy={fil.y2 - 2} r="6" />
    </svg>
  );
}
