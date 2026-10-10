import { useRef, useState } from 'react';
import './ce2-francais-b.css';

/**
 * LES BRIQUES COMMUNES DES TROIS JEUX DE GRAMMAIRE DU CE2 (09/10/2026) —
 * Camara : « fais la même chose avec les jeux du CP, CE1, CE2 ». Féminin et
 * pluriel, le détective des classes, transforme la phrase : trois écrans,
 * trois univers (la tonnelle fleurie, le bureau de l'enquête, le tableau au
 * bord du lac). Ce qu'ils partagent seulement : la mascotte qui réagit, la
 * fête de la réussite, le calque du décor, et le geste « glisser ou cliquer ».
 * Classes préfixées `sc-ce2-francais-b` (voir `ce2-francais-b.css`).
 *
 * RIEN DU DÉCOR NI DE LA MASCOTTE NE SE LIT NI NE SE CLIQUE : tout est
 * `aria-hidden` et laisse passer le doigt. Tout est en CSS : pas de
 * minuterie, et tout s'arrête sous `prefers-reduced-motion`.
 */

/**
 * L'HUMEUR DE LA MASCOTTE : elle fête la réussite, explique quand la réponse
 * a été montrée, encourage après une erreur (jamais de moquerie), attend le
 * reste du temps.
 */
export function humeurDe({ reussi = false, montre = false, faute = false } = {}) {
  if (reussi) return 'bravo';
  if (montre) return 'montre';
  if (faute) return 'encourage';
  return 'attente';
}

/**
 * LA MASCOTTE. `declic` rejoue le geste : deux erreurs de suite, deux
 * encouragements. Autour d'elle, des étoiles quand elle fête, un cœur quand
 * elle encourage. `className` la place (en bas à droite du jeu, ou posée sur
 * le tableau).
 */
export function Mascotte({
  nom, humeur = 'attente', declic = 0, className = '', children, ...reste
}) {
  return (
    <div
      className={`sc-ce2-francais-b__mascotte ${className}`}
      data-humeur={humeur}
      data-mascotte={nom}
      aria-hidden="true"
      {...reste}
    >
      <div key={`${humeur}-${declic}`} className={`sc-ce2-francais-b__pose est-${humeur}`}>
        {children}
      </div>
      {humeur === 'bravo' && (
        <span key={`b-${declic}`} className="sc-ce2-francais-b__aureole">
          {[0, 1, 2, 3].map((i) => <span key={i} className="sc-ce2-francais-b__etoile" style={{ '--n': i }} />)}
        </span>
      )}
      {humeur === 'encourage' && <span key={`e-${declic}`} className="sc-ce2-francais-b__coeur" />}
    </div>
  );
}

/**
 * LA FÊTE DE LA RÉUSSITE : une gerbe d'éclats qui part du milieu et s'éteint
 * — cœurs et pétales, confettis de papier, bâtons de craie, selon le jeu. Une
 * seule fois (CSS, `both`) : posée à la réussite, retirée à la manche suivante.
 */
export function Fete({ forme = 'etoile', teintes, nombre = 16 }) {
  const couleurs = teintes ?? ['#ffd23f', '#ff6b8a', '#4dabf7', '#51cf66', '#cc5de8', '#ff922b'];
  return (
    <div className="sc-ce2-francais-b__fete" data-forme={forme} aria-hidden="true">
      <span className="sc-ce2-francais-b__flash" />
      {Array.from({ length: nombre }, (_, i) => (
        <span
          // Des éclats identiques : la place est la seule identité.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`sc-ce2-francais-b__eclat sc-ce2-francais-b__eclat--${forme}`}
          style={{
            '--angle': `${(i * 360) / nombre + (i % 2) * 8}deg`,
            '--dist': `${110 + (i % 4) * 38}px`,
            '--delai': `${(i % 5) * 55}ms`,
            '--teinte': couleurs[i % couleurs.length],
            '--tour': `${(i % 2 ? 1 : -1) * (150 + i * 21)}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** Le calque du décor : derrière le jeu, jamais devant. */
export function Decor({ className = '', children }) {
  return (
    <div className={`sc-ce2-francais-b__decor ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}

/** Des yeux qui clignent : un groupe SVG que le CSS referme de temps en temps. */
export function Cligne({ children, decalage = 0 }) {
  return (
    <g className="sc-ce2-francais-b__cligne" style={{ '--decalage': `${decalage}s` }}>
      {children}
    </g>
  );
}

/**
 * GLISSER… OU CLIQUER. Un bouton-réponse qu'on peut traîner jusqu'à la cible
 * (la ligne vide du tableau) ; lâché dessus, c'est la réponse. Le simple clic
 * suffit TOUJOURS : glisser est un plus, jamais une obligation. Lâché
 * ailleurs, l'objet revient à sa place.
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
  const marquer = (allume) => laCible()?.classList.toggle('sc-ce2-francais-b--survolee', allume);

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
      className={`${className}${decalage ? ' sc-ce2-francais-b--glisse' : ''}`}
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
