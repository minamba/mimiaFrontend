import { VERBES, remplacant } from '../../../../lib/jeux/aOuA';
import {
  BoutonGlissable, Fete, cleHumeur, humeurDe,
} from './outils';
import './ce2-francais.css';

/**
 * A OU À ? ET OU EST ? (CE1) — SON OU SONT ? ON OU ONT ? (CE2) (09/10/2026).
 * Deux couvertures, deux univers :
 *   - AU CE1, LE BUREAU AUX POST-IT : un tableau vert, des post-it jaunes
 *     punaisés (« a ou à ? »), une lampe de bureau qui éclaire la table. La
 *     phrase est une feuille punaisée au tableau, le trou une place de
 *     post-it ; les réponses sont des POST-IT qu'on colle (on touche, ou on
 *     glisse jusqu'au trou). La LAMPE est la mascotte : elle regarde,
 *     hoche la tête à l'erreur, saute et s'illumine à la bonne réponse ;
 *   - AU CE2, LE TABLEAU AU SOLEIL : un tableau noir dans un jardin, un soleil
 *     dessiné à la craie dans le coin (la mascotte, qui cligne de l'œil), et
 *     un pot de craies de couleur. Les réponses sont des BÂTONS DE CRAIE : le
 *     mot choisi s'écrit à la craie dans le trou.
 * APRÈS LA RÉPONSE, LA PREUVE DU JEU SE FAIT SOUS NOS YEUX : le mot se
 * colle dans le trou, puis son remplaçant (« avait », « était », « étaient »,
 * « avaient ») vient se poser contre lui en tournant comme une carte ; un ✔
 * tombe si la phrase tient — c'est le verbe —, un ✘ sinon. La phrase récrite
 * reste dans la bulle de l'écran (`AOuA.js`).
 */

const CLE = 'sc-a-ou-a';

/** Une teinte par mot, la même d'une manche à l'autre, comme les post-it de la couverture. */
const TEINTES = {
  a: 'jaune', à: 'rose', et: 'bleu', est: 'vert', son: 'jaune', sont: 'rose', on: 'bleu', ont: 'vert',
};
const teinteDe = (mot) => TEINTES[mot] ?? 'jaune';

/** La lampe de bureau du CE1 : un abat-jour à deux yeux, un bras articulé, un rond de lumière. */
export function Lampe({ humeur, cle }) {
  return (
    <span className={`${CLE}__lampe-place`} aria-hidden="true">
      <span key={cle} className={`${CLE}__lampe est-${humeur}`}>
        <span className={`${CLE}__lumiere`} />
        <svg viewBox="0 0 90 120" focusable="false">
          <ellipse cx="58" cy="114" rx="26" ry="6" fill="#1c7ed6" stroke="#0b4f8a" strokeWidth="2" />
          <path d="M58 112V78" stroke="#dee2e6" strokeWidth="6" strokeLinecap="round" />
          <circle cx="58" cy="78" r="5" fill="#1c7ed6" />
          <g className={`${CLE}__tete-lampe`}>
            <path d="M58 78L40 46" stroke="#dee2e6" strokeWidth="6" strokeLinecap="round" />
            <circle cx="40" cy="46" r="5" fill="#1c7ed6" />
                        <path d="M44 42c-6-14-28-22-40-10l12 22z" fill="#ffd43b" stroke="#e67700" strokeWidth="2.5" />
            <ellipse cx="11" cy="52" rx="9" ry="4" fill="#fff6c8" className={`${CLE}__ampoule-lampe`} />
            <g className={`${CLE}__yeux-lampe`}>
              <circle cx="24" cy="33" r="3.6" fill="#fff" />
              <circle cx="33" cy="37" r="3.6" fill="#fff" />
              <circle cx="23.3" cy="34" r="2" fill="#1d1d24" />
              <circle cx="32.3" cy="38" r="2" fill="#1d1d24" />
            </g>
          </g>
        </svg>
      </span>
    </span>
  );
}

/** Le soleil à la craie du CE2 : des rayons qui tournent, un visage qui cligne. */
export function SoleilDeCraie({ humeur, cle }) {
  return (
    <span className={`${CLE}__soleil-place`} aria-hidden="true">
      <span key={cle} className={`${CLE}__soleil est-${humeur}`}>
        <svg viewBox="0 0 80 80" focusable="false">
          <g className={`${CLE}__rayons`}>
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d="M40 6v10" transform={`rotate(${i * 36} 40 40)`} />
            ))}
          </g>
          <circle cx="40" cy="40" r="17" />
          <g className={`${CLE}__visage-soleil`}>
            <path className={`${CLE}__oeil-soleil`} d="M33 37v2" />
            <path className={`${CLE}__oeil-soleil ${CLE}__oeil-soleil--clin`} d="M47 37v2" />
            <path d="M32 45q8 7 16 0" />
          </g>
        </svg>
      </span>
    </span>
  );
}

/** LA PREUVE : le mot se retourne et montre son remplaçant ; la phrase tient (✔) ou non (✘). */
function Preuve({ p }) {
  const verbe = VERBES.includes(p.bon);
  return (
    <span className={`${CLE}__preuve`} aria-hidden="true">
      <span className={`${CLE}__carte ${CLE}__teinte--${teinteDe(p.bon)}`}>{p.bon}</span>
      <span className={`${CLE}__echange`}>⇄</span>
      <span className={`${CLE}__carte ${CLE}__carte--remplacant`}>{remplacant(p)}</span>
      <span className={`${CLE}__verdict ${verbe ? 'est-oui' : 'est-non'}`}>{verbe ? '✔' : '✘'}</span>
    </span>
  );
}

export function QuestionAOuA({
  p, termine, extra, niveau,
}) {
  const ce2 = niveau === 'CE2';
  const humeur = humeurDe(termine, extra);
  const cle = cleHumeur(humeur, extra);
  return (
    <div className={`${CLE} ${CLE}--${ce2 ? 'ce2' : 'ce1'}${termine ? ' est-termine' : ''}`}>
      <div className={`${CLE}__tableau`}>
        {ce2 ? <SoleilDeCraie humeur={humeur} cle={cle} /> : (
          <>
            <span className={`${CLE}__deco ${CLE}__deco--1 ${CLE}__teinte--jaune`} aria-hidden="true">{'a\nà ?'}</span>
            <span className={`${CLE}__deco ${CLE}__deco--2 ${CLE}__teinte--jaune`} aria-hidden="true">{'et\nest ?'}</span>
          </>
        )}
        {/* LE DESSIN D'ORIGINE, gardé : la phrase à trou, le mot posé une fois trouvé. */}
        <p className={`phrase-a-trou ${CLE}__feuille`}>
          {p.avant}{' '}
          <span className={`phrase-a-trou__trou${termine ? ' est-rempli' : ''} ${CLE}__trou ${CLE}__teinte--${termine ? teinteDe(p.bon) : 'vide'}`}>{termine ? p.bon : '…'}</span>
          {' '}{p.apres}
        </p>
        {termine && <Preuve p={p} />}
        {termine && extra?.trouve && <Fete forme={ce2 ? 'craie' : 'papier'} />}
      </div>
      {!ce2 && <Lampe humeur={humeur} cle={cle} />}
      {ce2 && (
        <span className={`${CLE}__pot`} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}
    </div>
  );
}

/** Les réponses : des post-it à coller (CE1), des bâtons de craie (CE2) ; on touche, ou on glisse jusqu'au trou. */
export function PostItsOuCraies({
  choix, fautes, choisir, niveau,
}) {
  const ce2 = niveau === 'CE2';
  return (
    <ul className={`${CLE}__reponses ${CLE}__reponses--${ce2 ? 'craies' : 'postits'}`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <BoutonGlissable
              cible={`.${CLE}__trou`}
              choisir={() => choisir(cle)}
              disabled={faux}
              className={`${CLE}__${ce2 ? 'craie' : 'postit'} ${CLE}__teinte--${teinteDe(cle)}${faux ? ' est-fausse' : ''}`}
            >
              <span className={`${CLE}__${ce2 ? 'bout' : 'punaise'}`} aria-hidden="true" />
              {libelle}
            </BoutonGlissable>
          </li>
        );
      })}
    </ul>
  );
}

/** La scène d'une classe (CE1 ou CE2). */
export const sceneAOuA = (niveau) => ({
  question: (p, termine, extra) => <QuestionAOuA p={p} termine={termine} extra={extra} niveau={niveau} />,
  choix: ({ choix, fautes, choisir }) => <PostItsOuCraies choix={choix} fautes={fautes} choisir={choisir} niveau={niveau} />,
});

export default sceneAOuA;
