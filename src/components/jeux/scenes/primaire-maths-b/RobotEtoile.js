import { useEffect, useMemo, useState } from 'react';
import * as regle from '../../../../lib/jeux/robot';
import * as regleCM2 from '../../../../lib/jeux/robotCM2';
import { rangee, rang } from './communs';
import './primaire-maths-b.css';

/**
 * LE ROBOT ET SON ÉTOILE — CM1 « Le robot », CM2 « La boucle du robot »
 * (09/10/2026). La couverture du CM1 montre un garçon et son petit robot
 * blanc à visière bleue, assis sur un muret au coucher du soleil, une étoile
 * filante dans le ciel ; celle du CM2, un anneau de boucle où circulent des
 * cubes lumineux sur un tapis roulant fléché.
 *   - LA QUESTION : le quadrillage devient un plateau de jeu ; le robot de la
 *     couverture (dessiné, plus d'émoji) y attend, l'étoile scintille ; à
 *     côté, son grand frère le robot compagnon cligne des yeux, et le ciel du
 *     soir s'étoile (CM1) ou l'anneau de la boucle tourne (CM2) ;
 *   - LES RÉPONSES : des CARTOUCHES DE PROGRAMME en blocs de couleur, comme
 *     en classe — au CM2, un bloc « Répète » qui enserre son motif ;
 *   - APRÈS CHAQUE PROGRAMME TOUCHÉ (Camara, 22/09/2026) : le robot le rejoue
 *     case par case en laissant sa trace ; SOUS LE PLATEAU, le programme
 *     s'affiche en blocs et le bloc en cours s'allume — au CM2, le compteur
 *     dit à quel tour de boucle on en est. On voit POURQUOI le programme
 *     arrive, ou où il se trompe.
 */

const C = 44;
const PAS_MS = 420;

/** Les flèches d'un programme : « →→↑ » au CM1, « 3|→↑ » (une boucle) au CM2. */
const fleches = (programme) => (programme.includes('|') ? regleCM2.deplier(programme) : [...programme]);

/**
 * LE CHEMIN QUE SUIT LE ROBOT, case par case. S'il sortirait du quadrillage,
 * il s'arrête au bord : `sorti` le dit, pour l'expliquer à l'enfant.
 */
export function chemin(depart, programme) {
  const cases = [depart];
  let [x, y] = depart;
  for (const f of fleches(programme)) {
    const [dx, dy] = regle.PAS[f];
    if (x + dx < 0 || y + dy < 0 || x + dx >= regle.TAILLE || y + dy >= regle.TAILLE) {
      return { cases, sorti: true };
    }
    x += dx;
    y += dy;
    cases.push([x, y]);
  }
  return { cases, sorti: false };
}

const moinsDeMouvement = () => typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const SENS = {
  '↑': 'haut', '↓': 'bas', '←': 'gauche', '→': 'droite',
};

/**
 * Un bloc de programme : une flèche dans sa couleur. Les quatre flèches sont
 * le même dessin tourné (« ↑ » et « ← » n'ont pas la même graisse dans les
 * polices) ; le nom du bouton, lui, garde le libellé du module.
 */
function Bloc({ f, etat = '' }) {
  return (
    <span className={`sc-le-robot__bloc sc-le-robot__bloc--${SENS[f] ?? 'autre'}${etat ? ` est-${etat}` : ''}`} title={f}>
      <i aria-hidden="true">{SENS[f] ? '➜' : f}</i>
    </span>
  );
}

/** Le petit robot du plateau : tête ronde, visière bleue, antenne qui clignote. */
function PionRobot({ x, y, content }) {
  return (
    <g className={`sc-le-robot__pion${content ? ' est-content' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <g className="sc-le-robot__sautille">
        <line x1="0" y1="-14" x2="0" y2="-19" className="sc-le-robot__tige" />
        <circle cx="0" cy="-20" r="2.8" className="sc-le-robot__antenne" />
        <rect x="-14" y="-14" width="28" height="22" rx="10" className="sc-le-robot__tete" />
        <rect x="-10" y="-10" width="20" height="13" rx="6" className="sc-le-robot__visiere" />
        <circle cx="-4.5" cy="-3.5" r="2.3" className="sc-le-robot__oeil" />
        <circle cx="4.5" cy="-3.5" r="2.3" className="sc-le-robot__oeil" />
        <rect x="-9" y="8" width="18" height="11" rx="4" className="sc-le-robot__ventre" />
      </g>
    </g>
  );
}

const ETOILE = 'M0 -15 L4.4 -5 L15 -4.6 L7 2.6 L9.3 13 L0 7.5 L-9.3 13 L-7 2.6 L-15 -4.6 L-4.4 -5 Z';

/** Le programme rejoué, en blocs : le bloc en cours s'allume ; au CM2, le tour de boucle. */
function ProgrammeEnBlocs({ programme, fait }) {
  if (programme.includes('|')) {
    const [n, motif] = programme.split('|');
    const taille = [...motif].length || 1;
    const tour = Math.min(Number(n), Math.floor(Math.max(fait - 1, 0) / taille) + 1);
    const ici = fait > 0 ? (fait - 1) % taille : -1;
    return (
      <div className="sc-le-robot__programme sc-le-robot__programme--boucle" aria-hidden="true">
        <span className="sc-le-robot__repete">
          {`Répète ${n} fois`}
          <b>{`tour ${fait > 0 ? tour : 0} / ${n}`}</b>
        </span>
        <span className="sc-le-robot__motif">
          {[...motif].map((f, i) => <Bloc key={`${f}${i}`} f={f} etat={i === ici ? 'en-cours' : ''} />)}
        </span>
      </div>
    );
  }
  return (
    <div className="sc-le-robot__programme" aria-hidden="true">
      {[...programme].map((f, i) => {
        let etat = '';
        if (i < fait - 1) etat = 'fait';
        if (i === fait - 1) etat = 'en-cours';
        return <Bloc key={`${f}${i}`} f={f} etat={etat} />;
      })}
    </div>
  );
}

/**
 * LE ROBOT REJOUE LE PROGRAMME TOUCHÉ — Camara, le 22/09/2026 : « montrer le
 * chemin qu'on a choisi et faire déplacer le robot case par case, pour que
 * l'enfant comprenne visuellement pourquoi c'est bon ou pas bon ». À chaque
 * programme touché, juste ou faux, le robot repart de sa case et avance d'un
 * pas toutes les 0,4 s en laissant sa trace. À l'arrivée : l'étoile s'allume
 * s'il l'atteint, sinon une croix marque où il s'est arrêté. Quand le jeu
 * montre la réponse, c'est le bon chemin qu'il rejoue. Moins d'animations
 * demandées : le chemin s'affiche d'un coup.
 */
export function Terrain({ depart, etoile, programme }) {
  const cote = regle.TAILLE * C;
  const trajet = useMemo(() => (programme ? chemin(depart, programme) : null), [depart, programme]);
  const [pas, setPas] = useState(0);

  useEffect(() => {
    if (!trajet) return undefined;
    if (moinsDeMouvement()) {
      setPas(trajet.cases.length - 1);
      return undefined;
    }
    setPas(0);
    let n = 0;
    const minuteur = setInterval(() => {
      n += 1;
      setPas(n);
      if (n >= trajet.cases.length - 1) clearInterval(minuteur);
    }, PAS_MS);
    return () => clearInterval(minuteur);
  }, [trajet]);

  const centre = ([x, y]) => [x * C + C / 2, y * C + C / 2];
  const parcourues = trajet ? trajet.cases.slice(0, pas + 1) : [depart];
  const robot = parcourues[parcourues.length - 1];
  const arrive = trajet && pas >= trajet.cases.length - 1;
  const surEtoile = arrive && !trajet.sorti && robot[0] === etoile[0] && robot[1] === etoile[1];
  const rate = arrive && !surEtoile;

  return (
    <div className="sc-le-robot__plateau">
      <svg className="robot__terrain" viewBox={`0 0 ${cote} ${cote}`} role="img" aria-label="Un robot et une étoile sur un quadrillage">
        {Array.from({ length: regle.TAILLE ** 2 }, (_, i) => (
          <rect key={i} x={(i % regle.TAILLE) * C} y={Math.floor(i / regle.TAILLE) * C} width={C} height={C} className="aires__trait" />
        ))}

        {/* LA TRACE : les cases déjà parcourues, reliées. */}
        {trajet && parcourues.length > 1 && (
          <polyline
            points={parcourues.map((c) => centre(c).join(',')).join(' ')}
            className={`robot__trace${rate ? ' est-ratee' : ''}${surEtoile ? ' est-reussie' : ''}`}
          />
        )}
        {trajet && parcourues.slice(1).map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <circle key={i} cx={centre(c)[0]} cy={centre(c)[1]} r={5} className="robot__pas" />
        ))}

        {surEtoile && <circle cx={centre(etoile)[0]} cy={centre(etoile)[1]} r={C / 2 - 3} className="robot__gagne" />}
        <g transform={`translate(${centre(etoile)[0]} ${centre(etoile)[1]})`}>
          <path d={ETOILE} className={`sc-le-robot__etoile${surEtoile ? ' est-atteinte' : ''}`} />
        </g>
        <PionRobot x={centre(robot)[0]} y={centre(robot)[1]} content={surEtoile} />

        {/* LA CROIX : là où il s'est arrêté, ou le bord qu'il allait franchir. */}
        {rate && (
          <g className="robot__croix" transform={`translate(${centre(robot)[0] + C / 3}, ${centre(robot)[1] - C / 3})`}>
            <circle r={10} />
            <path d="M-4 -4 L4 4 M4 -4 L-4 4" />
          </g>
        )}
      </svg>
      {programme && <ProgrammeEnBlocs programme={programme} fait={pas} />}
    </div>
  );
}

/** Le programme à rejouer : le bon s'il est trouvé ou montré, sinon le dernier faux. */
export function programmeARejouer(m, etat) {
  if (!etat) return null;
  if (etat.trouve || etat.montrer) return m.bonne;
  return etat.derniereFaute;
}

/** Le robot compagnon de la couverture, en grand : il cligne, son antenne clignote, il saute de joie. */
function Compagnon({ content }) {
  return (
    <svg className={`sc-le-robot__compagnon${content ? ' est-content' : ''}`} viewBox="0 0 120 150" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="144" rx="38" ry="5" className="sc-le-robot__ombre" />
      <g className="sc-le-robot__corps">
        <line x1="60" y1="22" x2="60" y2="8" className="sc-le-robot__tige" />
        <circle cx="60" cy="7" r="5" className="sc-le-robot__antenne" />
        <rect x="22" y="20" width="76" height="62" rx="30" className="sc-le-robot__tete" />
        <rect x="31" y="31" width="58" height="38" rx="18" className="sc-le-robot__visiere" />
        <g className="sc-le-robot__yeux">
          <circle cx="47" cy="50" r="8" className="sc-le-robot__oeil-anneau" />
          <circle cx="73" cy="50" r="8" className="sc-le-robot__oeil-anneau" />
          <circle cx="47" cy="50" r="3.5" className="sc-le-robot__oeil" />
          <circle cx="73" cy="50" r="3.5" className="sc-le-robot__oeil" />
        </g>
        <rect x="34" y="84" width="52" height="40" rx="16" className="sc-le-robot__tete" />
        <circle cx="60" cy="102" r="8" className="sc-le-robot__coeur" />
        <rect x="14" y="88" width="16" height="30" rx="8" className="sc-le-robot__bras sc-le-robot__bras--g" />
        <rect x="90" y="88" width="16" height="30" rx="8" className="sc-le-robot__bras sc-le-robot__bras--d" />
        <rect x="38" y="122" width="16" height="18" rx="6" className="sc-le-robot__ventre" />
        <rect x="66" y="122" width="16" height="18" rx="6" className="sc-le-robot__ventre" />
      </g>
    </svg>
  );
}

/** Le ciel du soir (CM1) : des étoiles qui scintillent, une étoile filante. */
const ETOILES_DU_CIEL = [[12, 8], [58, 6], [84, 18], [30, 24], [70, 34], [16, 44], [50, 50], [86, 56], [38, 14]];

function CielDuSoir() {
  return (
    <div className="sc-le-robot__ciel" aria-hidden="true">
      {ETOILES_DU_CIEL.map(([gauche, haut], i) => <i key={`${gauche}.${haut}`} style={{ ...rang(i), left: `${gauche}%`, top: `${haut}%` }} />)}
      <b className="sc-le-robot__filante" />
    </div>
  );
}

/** L'anneau de la boucle (CM2) : il tourne, des cubes de lumière y circulent. */
function AnneauBoucle() {
  return (
    <svg className="sc-le-robot__anneau" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="46" className="sc-le-robot__rail" />
      <g className="sc-le-robot__tourne">
        {rangee(6).map((i) => {
          const a = (i / 6) * 2 * Math.PI;
          return (
            <path
              key={i}
              d="M-5 -5 L2 0 L-5 5"
              transform={`translate(${60 + 46 * Math.cos(a)} ${60 + 46 * Math.sin(a)}) rotate(${(a * 180) / Math.PI + 90})`}
              className="sc-le-robot__chevron"
            />
          );
        })}
      </g>
      <g className="sc-le-robot__tourne sc-le-robot__tourne--lent">
        {rangee(3).map((i) => {
          const a = (i / 3) * 2 * Math.PI + 0.5;
          return <rect key={i} x={60 + 46 * Math.cos(a) - 7} y={60 + 46 * Math.sin(a) - 7} width="14" height="14" rx="3" className={`sc-le-robot__cube sc-le-robot__cube--${i}`} />;
        })}
      </g>
    </svg>
  );
}

export function QuestionRobot({ m, termine, etat }) {
  const programme = programmeARejouer(m, etat);
  const boucle = m.consigne === 'repete';
  return (
    <div className={`sc-le-robot${boucle ? ' sc-le-robot--boucle' : ' sc-le-robot--soir'}${termine ? ' est-termine' : ''}`}>
      <Compagnon content={termine && Boolean(etat?.trouve)} />
      <Terrain
        // Une nouvelle manche, ou un autre programme touché : le robot repart.
        key={`${m.depart.join('.')}-${m.etoile.join('.')}-${programme ?? 'rien'}`}
        depart={m.depart}
        etoile={m.etoile}
        programme={programme}
      />
      {boucle ? <AnneauBoucle /> : <CielDuSoir />}
    </div>
  );
}

/** Les cartouches de programme, en blocs de couleur ; au CM2, le bloc « Répète » enserre le motif. */
export function CartouchesRobot({ choix, fautes, choisir }) {
  return (
    <ul className="sc-le-robot__cartouches" aria-label="Choisis le programme">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        const programme = String(cle);
        const [n, motif] = programme.includes('|') ? programme.split('|') : [null, programme];
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              aria-label={typeof libelle === 'string' ? libelle : undefined}
              className={`sc-le-robot__cartouche${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className="sc-le-robot__fente" aria-hidden="true" />
              {n ? (
                <span className="sc-le-robot__repete-bloc">
                  <span className="sc-le-robot__repete">{`Répète ${n} fois`}</span>
                  <span className="sc-le-robot__motif">{[...motif].map((f, k) => <Bloc key={`${f}${k}`} f={f} />)}</span>
                </span>
              ) : (
                <span className="sc-le-robot__suite">{[...motif].map((f, k) => <Bloc key={`${f}${k}`} f={f} />)}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const SCENE_ROBOT = {
  rendreQuestion: (m, termine, etat) => <QuestionRobot m={m} termine={termine} etat={etat} />,
  rendreLesChoix: (props) => <CartouchesRobot {...props} />,
};
