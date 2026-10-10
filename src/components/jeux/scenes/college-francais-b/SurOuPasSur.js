import { avecVisuel, designer } from '../base';
import { ECHELLES, NUANCES, PHRASES } from '../../../../lib/jeux/college/sur-ou-pas-sur';
import { eclairer, libelleDe, premierPiege, sansLeMot } from './commun';

/**
 * LE PHARE DANS LA BRUME — « Sûr ou pas sûr ? », 3e (09/10/2026). La
 * couverture : une fille accoudée à un muret au-dessus de la mer, un phare
 * sur la falaise, une jetée qui se perd dans la brume du soir.
 *   - LA QUESTION : la phrase dans le carnet du gardien de phare ; au-dessus,
 *     le phare balaie la mer de son faisceau, à travers des bancs de brume
 *     qui dérivent — la certitude, c'est la lumière ; le doute, la brume ;
 *   - LES RÉPONSES : des bouées (`objets`), qui dansent sur l'eau ;
 *   - APRÈS LA RÉPONSE : pour une certitude, la brume se lève et le faisceau
 *     brille plein ; pour un doute, elle s'épaissit, des « ? » y flottent ;
 *     pour un jugement, un fanion en forme de cœur se hisse. Le mot qui
 *     nuance s'allume dans le faisceau, et la phrase revient sans lui. Pour
 *     « la plus sûre », les trois phrases se rangent sur l'échelle du phare,
 *     de la pleine lumière à la brume.
 */

const P = 'sc-sur-ou-pas-sur';

/** Les modalisateurs qu'on ne peut pas ôter sans casser la phrase (des verbes). */
const VERBES = new Set(['aurait', 'semble']);

/** Le phare, son faisceau qui tourne, la mer et la brume. */
function Phare({ humeur }) {
  return (
    <div className={`${P}__mer${humeur ? ` ${P}__mer--${humeur}` : ''}`} aria-hidden="true">
      <svg className={`${P}__decor`} viewBox="0 0 900 90" preserveAspectRatio="xMinYMax slice" focusable="false">
        <path className={`${P}__faisceau`} d="M62 22 L900 -40 L900 70 Z" fill="rgba(255, 240, 170, 0.45)" />
        <path className={`${P}__houle`} d="M90 76 q25 -7 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V90 H90 Z" fill="#2a5f8a" />
        <path d="M600 74 h180 v-4 h-180 z M620 74 v14 M660 74 v14 M700 74 v14 M740 74 v14" stroke="#3a2a2a" strokeWidth="3" fill="#3a2a2a" opacity="0.6" />
        <path d="M0 90 V64 Q30 52 60 56 Q90 60 120 72 V90 Z" fill="#4a3a2a" />
        <path d="M50 62 L55 24 h14 l5 38 Z" fill="#f4efe6" stroke="#5a4a3a" />
        <rect x="54" y="33" width="16" height="6" fill="#d0102a" />
        <rect x="52" y="47" width="20" height="6" fill="#d0102a" />
        <rect x="56" y="13" width="12" height="11" fill="#ffe7a0" className={`${P}__lampe`} />
        <path d="M53 13 l9 -9 l9 9 z" fill="#3a2a2a" />
      </svg>
      <span className={`${P}__brume`}>
        {[0, 1, 2].map((i) => <span key={i} style={{ '--n': i }} />)}
      </span>
      {humeur === 'doute' && (
        <span className={`${P}__questions`}>
          {['?', '?', '?'].map((q, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} style={{ '--n': i }}>{q}</span>
          ))}
        </span>
      )}
      {humeur === 'jugement' && <span className={`${P}__fanion`}>♥</span>}
    </div>
  );
}

/** Après la plus ou la moins sûre : les trois phrases sur l'échelle du phare. */
function Echelle({ m }) {
  const trois = ECHELLES.find((e) => e.includes(m.bonne));
  if (!trois) return null;
  const crans = ['certain', 'probable', 'possible'];
  return (
    <ol className={`${P}__echelle`}>
      {trois.map((p, i) => (
        <li key={p} className={`${P}__cran ${P}__cran--${crans[i]}${p === m.bonne ? ' est-bonne' : ''}`} style={{ '--n': i }}>
          <span className={`${P}__niveau`}>{crans[i]}</span>
          <span>{p}</span>
        </li>
      ))}
    </ol>
  );
}

function Explication({ m }) {
  if (m.consigne === 'nuance') {
    const regle = PHRASES[premierPiege(m)] ?? PHRASES['nuance-regle'];
    return (
      <div className={`${P}__explication`} role="status">
        <strong className={`${P}__verdict ${P}__verdict--${m.bonne}`}>{NUANCES[m.bonne] ?? m.bonne}</strong>
        {regle && <p className={`${P}__regle`}>{regle}</p>}
      </div>
    );
  }
  if (m.consigne === 'mot-qui-nuance') {
    const sans = VERBES.has(m.bonne) ? null : sansLeMot(m.question, m.bonne);
    return (
      <div className={`${P}__explication`} role="status">
        <p className={`${P}__allume`}>{eclairer(m.question, m.bonne, `${P}__faisceau-mot`)}</p>
        <p className={`${P}__regle`}>
          {sans ? (
            <>
              <span className={`${P}__titre`}>Sans lui, une simple affirmation :</span>
              {`« ${sans} »`}
            </>
          ) : PHRASES['mot-qui-nuance-regle']}
        </p>
      </div>
    );
  }
  return (
    <div className={`${P}__explication`} role="status">
      <Echelle m={m} />
      <strong className={`${P}__verdict`}>{libelleDe(m, m.bonne)}</strong>
    </div>
  );
}

export function QuestionSur({ m, termine }) {
  const humeur = termine && m.consigne === 'nuance' && NUANCES[m.bonne] ? m.bonne : null;
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Phare humeur={humeur} />
      <div className={`${P}__carnet`}>
        <span className={`${P}__spirale`} aria-hidden="true" />
        <p className={`${P}__texte`}>{designer(m.question)}</p>
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

const scene = {
  question: (m, termine) => <QuestionSur m={m} termine={termine} />,
  // Le verdict, le mot allumé ou l'échelle montrent déjà la bonne réponse.
  apres: () => null,
  objets: P,
};

export default scene;
