import * as temps from '../../../../lib/jeux/combienDeTemps';
import {
  Bulle, Fete, humeurDe, rangee, useDeroule,
} from './communs';
import './ce2-maths.css';

/**
 * COMBIEN DE TEMPS ? (CE2) — 09/10/2026. La couverture : un quai de gare de
 * montagne sous une marquise de bois, une grande horloge de gare suspendue, un
 * réveil rouge qui sonne, un train vert qui attend, une valise, un viaduc au
 * loin. La scène :
 *   - LA QUESTION : le tableau des départs (l'activité, « commence à »,
 *     « finit à » — le dessin d'origine, gardé), l'horloge de la gare à l'heure
 *     du début, la lanterne qui se balance, le train qui passe au loin ; Tic,
 *     le réveil rouge, mascotte du jeu, fait tic-tac sur le quai ;
 *   - LES RÉPONSES : des valises, chacune avec son étiquette de durée ;
 *   - APRÈS LA RÉPONSE : LE TRAIN DU TEMPS. Les aiguilles de l'horloge
 *     tournent jusqu'à l'heure pile, puis jusqu'à la fin, et à chaque arrêt
 *     un wagon s'accroche avec son morceau de durée (« 9 h 40 → 10 h : 20 min »),
 *     jusqu'au wagon du total — la méthode de la classe, par l'heure pile.
 * L'horloge ne bouge pas avant la réponse : la voir tourner la donnerait.
 */

/**
 * L'HORLOGE DE LA GARE. Les aiguilles tournent sur le total des minutes, sans
 * jamais revenir à zéro : elles avancent toujours dans le bon sens.
 */
export function Horloge({ minutes }) {
  return (
    <svg className="sc-combien-de-temps-ce2__horloge" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="47" className="sc-combien-de-temps-ce2__boitier" />
      <circle cx="50" cy="50" r="41" className="sc-combien-de-temps-ce2__cadran" />
      {rangee(12).map((i) => {
        const a = ((i + 1) * 30 * Math.PI) / 180;
        return (
          <text key={i} x={50 + Math.sin(a) * 32} y={50 - Math.cos(a) * 32} textAnchor="middle" dominantBaseline="central" className="sc-combien-de-temps-ce2__chiffre">
            {i + 1}
          </text>
        );
      })}
      <line x1="50" y1="50" x2="50" y2="29" className="sc-combien-de-temps-ce2__petite" style={{ transform: `rotate(${minutes * 0.5}deg)` }} />
      <line x1="50" y1="50" x2="50" y2="17" className="sc-combien-de-temps-ce2__grande" style={{ transform: `rotate(${minutes * 6}deg)` }} />
      <circle cx="50" cy="50" r="3.5" className="sc-combien-de-temps-ce2__axe" />
    </svg>
  );
}

/** Tic, le réveil rouge : il fait tic-tac, sonne à la réussite, encourage à l'erreur. */
export function Reveil({ humeur }) {
  return (
    <div className={`sc-combien-de-temps-ce2__mascotte est-${humeur}`} aria-hidden="true">
      <Bulle humeur={humeur} />
      {humeur === 'fete' && <Fete />}
      <svg className="sc-combien-de-temps-ce2__reveil" viewBox="0 0 90 96" focusable="false">
        <g className="sc-combien-de-temps-ce2__cloches">
          <circle cx="22" cy="18" r="13" fill="#f03e3e" stroke="#a51111" strokeWidth="2" />
          <circle cx="68" cy="18" r="13" fill="#f03e3e" stroke="#a51111" strokeWidth="2" />
          <rect x="41" y="4" width="8" height="10" rx="2" fill="#adb5bd" />
        </g>
        <line x1="26" y1="80" x2="16" y2="92" stroke="#495057" strokeWidth="4" strokeLinecap="round" />
        <line x1="64" y1="80" x2="74" y2="92" stroke="#495057" strokeWidth="4" strokeLinecap="round" />
        <circle cx="45" cy="50" r="34" fill="#f03e3e" stroke="#a51111" strokeWidth="3" />
        <circle cx="45" cy="50" r="27" fill="#fffaf0" />
        <g className="sc-combien-de-temps-ce2__yeux">
          <ellipse cx="35" cy="44" rx="4" ry="5" fill="#212529" />
          <ellipse cx="55" cy="44" rx="4" ry="5" fill="#212529" />
          <circle cx="36.3" cy="42.3" r="1.4" fill="#fff" />
          <circle cx="56.3" cy="42.3" r="1.4" fill="#fff" />
        </g>
        <circle cx="28" cy="54" r="3.5" fill="#ffa8a8" />
        <circle cx="62" cy="54" r="3.5" fill="#ffa8a8" />
        <path d="M37 58 q8 8 16 0" fill="none" stroke="#212529" strokeWidth="2.5" strokeLinecap="round" />
        <line className="sc-combien-de-temps-ce2__trotteuse-reveil" x1="45" y1="50" x2="45" y2="28" stroke="#e03131" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {humeur === 'fete' && <span className="sc-combien-de-temps-ce2__dring" aria-hidden="true">Dring !</span>}
    </div>
  );
}

/** Le décor : la marquise, la lanterne, les montagnes, le viaduc, le train qui passe. */
function Decor() {
  return (
    <div className="sc-combien-de-temps-ce2__decor" aria-hidden="true">
      <span className="sc-combien-de-temps-ce2__montagnes" />
      <svg className="sc-combien-de-temps-ce2__viaduc" viewBox="0 0 200 40" preserveAspectRatio="none" focusable="false">
        <path d={`M0 8 H200 V40 ${rangee(6).map((i) => `H${190 - i * 34} a14 18 0 0 0 -28 0`).join(' ')} H0 Z`} fill="rgba(120, 100, 90, 0.75)" />
      </svg>
      <div className="sc-combien-de-temps-ce2__train">
        {rangee(4).map((i) => <span key={i} className={`sc-combien-de-temps-ce2__wagon-loin${i === 0 ? ' est-loco' : ''}`} />)}
      </div>
      <span className="sc-combien-de-temps-ce2__marquise" />
      <span className="sc-combien-de-temps-ce2__lanterne" />
      <span className="sc-combien-de-temps-ce2__quai" />
    </div>
  );
}

/** Le tableau des départs : l'activité et ses deux heures (le dessin d'origine). */
function Tableau({ m }) {
  return (
    <div className="sc-combien-de-temps-ce2__tableau">
      <p className="duree__activite">{m.activite}</p>
      <div className="duree__heures">
        <p className="duree__heure"><span>commence à</span>{temps.ecrireHeure(m.debut)}</p>
        <span className="duree__fleche" aria-hidden="true">→</span>
        <p className="duree__heure"><span>finit à</span>{temps.ecrireHeure(m.fin)}</p>
      </div>
    </div>
  );
}

/**
 * APRÈS LA RÉPONSE : le train du temps. Un wagon par morceau de durée, qui
 * s'accroche quand l'horloge l'a parcouru ; le dernier porte le total.
 */
function TrainDuTemps({ m }) {
  const etapes = temps.etapes(m);
  const pas = useDeroule(etapes.length + 1, 1100, 500);
  const heure = pas === 0 ? m.debut : etapes[Math.min(pas, etapes.length) - 1].a;
  return (
    <>
      <div className="sc-combien-de-temps-ce2__ligne">
        <Horloge minutes={heure} />
        <Tableau m={m} />
      </div>
      <ol className="duree__etapes sc-combien-de-temps-ce2__convoi" aria-label="Le chemin par l’heure pile">
        {etapes.map((e, i) => (
          <li key={e.de} className={`sc-combien-de-temps-ce2__wagon${pas > i ? ' est-la' : ''}`}>
            {temps.ecrireHeure(e.de)} → {temps.ecrireHeure(e.a)} : <strong>{temps.ecrireDuree(e.a - e.de)}</strong>
          </li>
        ))}
        <li className={`duree__total sc-combien-de-temps-ce2__wagon sc-combien-de-temps-ce2__wagon--total${pas > etapes.length ? ' est-la' : ''}`}>
          En tout : <strong>{temps.ecrireDuree(m.bonne)}</strong>
        </li>
      </ol>
    </>
  );
}

/** LA QUESTION : le quai, l'horloge, le tableau des départs, et Tic. */
export function QuestionTemps({ m, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  return (
    <div className={`sc-combien-de-temps-ce2${termine ? ' est-termine' : ''}`}>
      <Decor />
      {termine ? <TrainDuTemps m={m} /> : (
        <div className="sc-combien-de-temps-ce2__ligne">
          <Horloge minutes={m.debut} />
          <Tableau m={m} />
        </div>
      )}
      <Reveil key={`${humeur}-${extra?.derniereFaute ?? ''}`} humeur={humeur} />
    </div>
  );
}

/**
 * LES RÉPONSES : des valises sur le quai, chacune avec son étiquette. Chaque
 * valise est un bouton à son libellé ; une valise fausse est barrée, ternie,
 * et ne se prend plus.
 */
export function ChoixTemps({ choix, fautes, choisir }) {
  return (
    <ul className="sc-combien-de-temps-ce2__bagages" aria-label="Choisis ta valise">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button type="button" className={`sc-combien-de-temps-ce2__valise sc-combien-de-temps-ce2__valise--${i % 3}${fausse ? ' est-fausse' : ''}`} onClick={() => choisir(cle)} disabled={fausse}>
              <span className="sc-combien-de-temps-ce2__poignee" aria-hidden="true" />
              <span className="sc-combien-de-temps-ce2__sangle" aria-hidden="true" />
              <span className="sc-combien-de-temps-ce2__etiquette">{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
