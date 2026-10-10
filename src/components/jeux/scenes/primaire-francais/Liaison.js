import { FAMILLES } from '../../../../lib/jeux/motsDeLiaison';
import { autourDuTrou, BoutonGlissable, Trou } from './outils';

/**
 * LES MOTS DE LIAISON — LES PIERRES DE LA RIVIÈRE (09/10/2026). La couverture :
 * un garçon traverse une rivière en sautant de pierre en pierre ; sur chaque
 * pierre brille un mot (car, donc, mais, ensuite…), « un petit mot… de grands
 * liens ». La scène :
 *   - LA QUESTION : les deux morceaux de la phrase sont les DEUX RIVES ; entre
 *     elles coule la rivière, et le trou est la place de la pierre qui manque ;
 *   - LES RÉPONSES : des pierres qui flottent et dansent sur l'eau, chacune
 *     son mot lumineux. On la GLISSE dans le trou de la rivière, ou on la
 *     touche. La fausse coule à moitié et se barre ;
 *   - APRÈS LA RÉPONSE : la pierre se pose et s'allume de la couleur de sa
 *     famille, un petit marcheur saute d'une rive à l'autre en passant par
 *     elle, et la famille se dit : la cause explique, la conséquence en
 *     découle, l'opposition surprend, le temps fait avancer.
 */

const CLE = 'sc-mots-de-liaison';

const FAMILLE_DIT = {
  cause: 'la cause : la suite dit POURQUOI.',
  consequence: 'la conséquence : la suite est le RÉSULTAT.',
  opposition: 'l’opposition : la suite SURPREND.',
  temps: 'le temps : la suite vient APRÈS.',
};

const familleDe = (mot) => Object.keys(FAMILLES).find((f) => FAMILLES[f].includes(String(mot).toLowerCase()));

/** Le petit marcheur de la couverture : un sac à dos, une boussole, il saute. */
function Marcheur() {
  return (
    <svg className={`${CLE}__marcheur`} viewBox="0 0 40 60" aria-hidden="true" focusable="false">
      <circle cx="20" cy="12" r="9" fill="#f6c99c" />
      <path d="M11 10 q9 -12 18 0 q-4 -4 -9 -3 q-5 -1 -9 3z" fill="#8a4b1c" />
      <rect x="11" y="21" width="18" height="20" rx="6" fill="#3d6fb4" />
      <rect x="24" y="22" width="8" height="15" rx="3" fill="#2a3b55" />
      <path d="M15 41 l-4 14 M25 41 l4 14" stroke="#4a3a2a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="17" cy="11" r="1.4" fill="#2a1a0a" />
      <circle cx="23" cy="11" r="1.4" fill="#2a1a0a" />
    </svg>
  );
}

export function QuestionLiaison({ m, termine }) {
  const autour = autourDuTrou(m.question);
  if (!autour) return <p className="phrase-a-trou">{m.question}</p>;
  const famille = familleDe(m.bonne);
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}${famille ? ` ${CLE}--${famille}` : ''}`}>
      <p className={`${CLE}__phrase`}>
        <span className={`${CLE}__rive ${CLE}__rive--gauche`}>{autour[0]}</span>
        <span className={`${CLE}__riviere`}>
          <span className={`${CLE}__eau`} aria-hidden="true" />
          <Trou mot={termine ? m.bonne : null} className={`${CLE}__gue`} />
        </span>
        <span className={`${CLE}__rive ${CLE}__rive--droite`}>{autour[1]}</span>
      </p>
      {termine && (
        <>
          {/* La traversée : rive, pierre, rive — le marcheur saute de l'une à l'autre. */}
          <span className={`${CLE}__traversee`} aria-hidden="true">
            <span className={`${CLE}__berge ${CLE}__berge--gauche`} />
            <span className={`${CLE}__courant`} />
            <span className={`${CLE}__pierre-posee`}>{m.bonne}</span>
            <span className={`${CLE}__berge ${CLE}__berge--droite`} />
            <Marcheur />
          </span>
          {famille && (
            <p className={`${CLE}__famille`}>
              <strong>{m.bonne}</strong>
              {` annonce ${FAMILLE_DIT[famille]}`}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Les pierres sur l'eau : à glisser dans la rivière, ou à toucher. */
export function PierresSurLEau({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__pierres`} aria-label="Choisis ta réponse — glisse la pierre dans la rivière, ou touche-la">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} className={`${CLE}__flot`} style={{ '--i': i }}>
            <BoutonGlissable
              cible={`.${CLE}__gue`}
              choisir={() => choisir(cle)}
              disabled={faux}
              className={`${CLE}__pierre ${CLE}__lueur--${i % 4}${faux ? ' est-fausse' : ''}`}
            >
              {libelle}
            </BoutonGlissable>
            <span className={`${CLE}__ronds`} aria-hidden="true" />
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionLiaison m={m} termine={termine} />,
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <PierresSurLEau choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
