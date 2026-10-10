import * as jardin from '../../../../lib/jeux/tourDuJardin';
import {
  Bulle, Fete, humeurDe, rangee, useDeroule,
} from './communs';
import './ce2-maths.css';

/**
 * LE TOUR DU JARDIN (CE2) — 09/10/2026. La couverture : un garçon qui mesure
 * au mètre ruban un carré de terre entre quatre piquets, une cabane dans
 * l'arbre, un rouge-gorge sur la palissade, un arrosoir, des fleurs. La scène :
 *   - LA QUESTION : le plan du jardin (le dessin d'origine, gardé tel quel)
 *     épinglé sur une planche, au milieu du jardin — le soleil tourne, les
 *     nuages passent, les fleurs se balancent, un papillon volette ; le
 *     rouge-gorge, mascotte du jeu, sautille sur la palissade ;
 *   - LES RÉPONSES : des rouleaux de clôture, chacun à sa longueur ;
 *   - APRÈS LA RÉPONSE : une coccinelle FAIT LE TOUR de la clôture, côté par
 *     côté ; chaque côté s'allume quand elle le parcourt, sa longueur s'écrit
 *     (même les côtés d'en face du rectangle, qui n'étaient pas écrits) et
 *     s'ajoute au calcul — on voit POURQUOI le tour fait tant de mètres.
 * Rien n'est compté avant la réponse : ce serait la donner.
 */

/** Les sommets de chaque forme, dans un carré de 200 sur 160. */
export function sommets(f) {
  if (f.forme === 'rectangle') return [[20, 30], [180, 30], [180, 130], [20, 130]];
  if (f.forme === 'carre') return [[50, 20], [150, 20], [150, 120], [50, 120]];
  if (f.forme === 'triangle') return [[100, 15], [180, 140], [20, 140]];
  return [[100, 12], [180, 68], [150, 145], [50, 145], [20, 68]];
}

/** La coccinelle qui fait le tour de la clôture. */
function Coccinelle({ x, y }) {
  return (
    <g className="sc-tour-du-jardin-ce2__coccinelle" style={{ transform: `translate(${x}px, ${y}px)` }} aria-hidden="true">
      <g className="sc-tour-du-jardin-ce2__coccinelle-corps">
        <circle cx="0" cy="-7" r="4" fill="#1b1b1b" />
        <ellipse cx="0" cy="1" rx="8" ry="9" fill="#e03131" stroke="#1b1b1b" strokeWidth="1.2" />
        <line x1="0" y1="-8" x2="0" y2="10" stroke="#1b1b1b" strokeWidth="1.2" />
        <circle cx="-4" cy="-1" r="1.8" fill="#1b1b1b" />
        <circle cx="4" cy="-1" r="1.8" fill="#1b1b1b" />
        <circle cx="-3.5" cy="5" r="1.6" fill="#1b1b1b" />
        <circle cx="3.5" cy="5" r="1.6" fill="#1b1b1b" />
      </g>
    </g>
  );
}

/**
 * LE JARDIN : de l'herbe, une clôture, et une longueur sur chaque côté — sauf
 * les côtés d'en face du rectangle, que l'enfant doit déduire. Une fois la
 * réponse donnée (`pas` défini), la coccinelle compte les côtés un à un.
 */
export function Jardin({ figure, pas = null }) {
  const pts = sommets(figure);
  const longueurs = jardin.cotes(figure);
  const enTour = pas !== null;
  const compte = (i) => enTour && i < pas;
  const visible = (i) => (figure.forme !== 'rectangle' || i < 2) && (figure.forme !== 'carre' || i === 0);
  const etiquettes = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    // L'étiquette est poussée vers l'extérieur de la figure.
    const cx = 100;
    const cy = 80;
    const dx = mx - cx;
    const dy = my - cy;
    const d = Math.hypot(dx, dy) || 1;
    return { x: mx + (dx / d) * 16, y: my + (dy / d) * 16, texte: `${longueurs[i]} m`, i };
  });
  const ici = pts[enTour ? Math.min(pas, pts.length) % pts.length : 0];
  return (
    <svg className="jardin__dessin" viewBox="-20 -10 240 180" role="img" aria-label={`Un jardin en forme de ${figure.forme}, côtés : ${longueurs.join(', ')} mètres`}>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} className="jardin__herbe" />
      <polygon points={pts.map((p) => p.join(',')).join(' ')} className="jardin__cloture" />
      {figure.forme === 'carre' && <text x="100" y="75" textAnchor="middle" className="jardin__note">4 côtés égaux</text>}
      {enTour && pts.map((p, i) => {
        const q = pts[(i + 1) % pts.length];
        // eslint-disable-next-line react/no-array-index-key
        return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className={`sc-tour-du-jardin-ce2__cote${compte(i) ? ' est-compte' : ''}`} />;
      })}
      {etiquettes.filter((e) => visible(e.i) || compte(e.i)).map((e) => (
        <text
          key={e.i}
          x={e.x}
          y={e.y}
          textAnchor="middle"
          dominantBaseline="central"
          className={`jardin__longueur${compte(e.i) ? ' sc-tour-du-jardin-ce2__longueur--comptee' : ''}${compte(e.i) && !visible(e.i) ? ' sc-tour-du-jardin-ce2__longueur--revelee' : ''}`}
        >
          {e.texte}
        </text>
      ))}
      {enTour && <Coccinelle x={ici[0]} y={ici[1]} />}
    </svg>
  );
}

/** Le rouge-gorge, mascotte du jardin : il sautille, cligne, fait la fête ou encourage. */
export function RougeGorge({ humeur }) {
  return (
    <div className={`sc-tour-du-jardin-ce2__mascotte est-${humeur}`} aria-hidden="true">
      <Bulle humeur={humeur} />
      {humeur === 'fete' && <Fete />}
      <svg className="sc-tour-du-jardin-ce2__oiseau" viewBox="0 0 90 80" focusable="false">
        <path className="sc-tour-du-jardin-ce2__queue" d="M14 44 L0 36 L4 50 Z" fill="#6b4226" />
        <ellipse cx="38" cy="46" rx="26" ry="20" fill="#8d5a35" />
        <ellipse cx="46" cy="50" rx="17" ry="15" fill="#f08c3a" />
        <path className="sc-tour-du-jardin-ce2__aile" d="M22 40 q14 -8 26 6 q-14 10 -26 -6 Z" fill="#6b4226" />
        <circle cx="58" cy="30" r="15" fill="#8d5a35" />
        <circle cx="62" cy="35" r="10" fill="#f08c3a" />
        <g className="sc-tour-du-jardin-ce2__oeil">
          <circle cx="62" cy="26" r="4" fill="#fff" />
          <circle cx="63" cy="26" r="2.3" fill="#1b1b1b" />
          <circle cx="63.8" cy="25.2" r="0.8" fill="#fff" />
        </g>
        <path d="M72 30 L82 32 L72 35 Z" fill="#f2c94c" stroke="#b8860b" strokeWidth="0.8" />
        <line x1="34" y1="65" x2="32" y2="76" stroke="#5a3a1a" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="65" x2="46" y2="76" stroke="#5a3a1a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Le décor : le ciel, le soleil, l'arbre et sa cabane, la palissade, les fleurs, le papillon. */
function Decor() {
  return (
    <div className="sc-tour-du-jardin-ce2__decor" aria-hidden="true">
      <span className="sc-tour-du-jardin-ce2__soleil" />
      {rangee(2).map((i) => <span key={i} className="sc-tour-du-jardin-ce2__nuage" style={{ '--n': i }} />)}
      <svg className="sc-tour-du-jardin-ce2__arbre" viewBox="0 0 120 200" focusable="false">
        <rect x="50" y="90" width="22" height="110" rx="6" fill="#7a4e2a" />
        <circle cx="60" cy="60" r="52" fill="#4caf50" />
        <circle cx="28" cy="80" r="30" fill="#43a047" />
        <circle cx="94" cy="78" r="30" fill="#5cbf60" />
        <rect x="34" y="62" width="54" height="34" rx="3" fill="#b07a45" stroke="#6b4226" strokeWidth="2" />
        <path d="M28 64 L61 40 L94 64 Z" fill="#c0392b" stroke="#7b241c" strokeWidth="2" />
        <rect x="54" y="72" width="14" height="24" fill="#5a3a1a" />
        <line x1="40" y1="96" x2="46" y2="160" stroke="#8d6e63" strokeWidth="3" />
        <line x1="52" y1="96" x2="58" y2="160" stroke="#8d6e63" strokeWidth="3" />
        {[108, 124, 140].map((y) => <line key={y} x1="41.5" y1={y} x2="54" y2={y} stroke="#8d6e63" strokeWidth="3" />)}
      </svg>
      <span className="sc-tour-du-jardin-ce2__palissade" />
      {rangee(5).map((i) => (
        <svg key={i} className="sc-tour-du-jardin-ce2__fleur" viewBox="0 0 30 50" style={{ '--n': i }} focusable="false">
          <line x1="15" y1="22" x2="15" y2="50" stroke="#2f9e44" strokeWidth="3" />
          {rangee(6).map((k) => <ellipse key={k} cx="15" cy="10" rx="4" ry="8" fill={i % 2 ? '#fff' : '#ff8fab'} transform={`rotate(${k * 60} 15 18)`} />)}
          <circle cx="15" cy="18" r="4.5" fill="#ffd43b" />
        </svg>
      ))}
      <svg className="sc-tour-du-jardin-ce2__papillon" viewBox="0 0 40 30" focusable="false">
        <g className="sc-tour-du-jardin-ce2__ailes">
          <ellipse cx="12" cy="11" rx="10" ry="9" fill="#ffa94d" />
          <ellipse cx="28" cy="11" rx="10" ry="9" fill="#ffa94d" />
          <ellipse cx="13" cy="22" rx="7" ry="6" fill="#ff922b" />
          <ellipse cx="27" cy="22" rx="7" ry="6" fill="#ff922b" />
        </g>
        <rect x="18.5" y="6" width="3" height="20" rx="1.5" fill="#343a40" />
      </svg>
    </div>
  );
}

/** Le calcul qui se construit à mesure que la coccinelle avance. */
function Calcul({ figure, pas }) {
  const longueurs = jardin.cotes(figure);
  const fini = pas >= longueurs.length;
  if (fini) return <p className="jardin__calcul sc-tour-du-jardin-ce2__calcul est-fini">{longueurs.join(' + ')} = {figure.bonne} m</p>;
  return (
    <p className="jardin__calcul sc-tour-du-jardin-ce2__calcul">
      {pas === 0 ? 'La coccinelle fait le tour…' : `${longueurs.slice(0, pas).join(' + ')} + …`}
    </p>
  );
}

/** APRÈS LA RÉPONSE : la coccinelle fait le tour, le calcul s'écrit. */
function TourEnMarche({ m }) {
  const n = jardin.cotes(m).length;
  const pas = useDeroule(n, 850, 450);
  return (
    <>
      <Jardin figure={m} pas={pas} />
      <Calcul figure={m} pas={pas} />
    </>
  );
}

/** LA QUESTION : le plan du jardin au milieu du jardin, et son rouge-gorge. */
export function QuestionJardin({ m, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  return (
    <div className={`sc-tour-du-jardin-ce2${termine ? ' est-termine' : ''}`}>
      <Decor />
      <div className="sc-tour-du-jardin-ce2__plan">
        <span className="sc-tour-du-jardin-ce2__punaise" aria-hidden="true" />
        {termine ? <TourEnMarche m={m} /> : <Jardin figure={m} />}
      </div>
      <RougeGorge key={`${humeur}-${extra?.derniereFaute ?? ''}`} humeur={humeur} />
    </div>
  );
}

/**
 * LES RÉPONSES : des rouleaux de clôture. Chaque rouleau est un bouton à son
 * libellé ; un rouleau faux est barré, terni, et ne se prend plus.
 */
export function ChoixJardin({ choix, fautes, choisir }) {
  return (
    <ul className="sc-tour-du-jardin-ce2__choix" aria-label="Choisis ton rouleau de clôture">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button type="button" className={`sc-tour-du-jardin-ce2__rouleau${fausse ? ' est-fausse' : ''}`} onClick={() => choisir(cle)} disabled={fausse}>
              <svg className="sc-tour-du-jardin-ce2__bobine" viewBox="0 0 70 60" aria-hidden="true" focusable="false">
                <rect x="14" y="8" width="44" height="44" fill="#c08850" stroke="#6b4226" strokeWidth="2" />
                {rangee(5).map((k) => <line key={k} x1={20 + k * 9} y1="8" x2={20 + k * 9} y2="52" stroke="#8d5a35" strokeWidth="2" />)}
                <line x1="14" y1="20" x2="58" y2="20" stroke="#6b4226" strokeWidth="2" />
                <line x1="14" y1="40" x2="58" y2="40" stroke="#6b4226" strokeWidth="2" />
                <ellipse cx="14" cy="30" rx="10" ry="22" fill="#d9a066" stroke="#6b4226" strokeWidth="2" />
                <path d="M14 30 m-2 0 a2 4 0 1 1 4 0 a5 9 0 1 1 -8 0 a8 14 0 1 1 14 0" fill="none" stroke="#6b4226" strokeWidth="1.5" />
              </svg>
              <span className="sc-tour-du-jardin-ce2__etiquette">{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
