import { INDICES, REGISTRES, VISEES } from '../../../../lib/jeux/lycee/genres-et-registres';
import { libelleBon } from './commun';

/**
 * LE THÉÂTRE AU BORD DE LA MER — « Genres et registres » (2de). La couverture :
 * de lourds rideaux de velours bleu frangés d'or, une scène de marbre, la mer
 * déchaînée au couchant. La scène la reprend :
 *   - LA QUESTION : l'extrait se joue sur scène, dans la lumière d'une
 *     poursuite, entre deux rideaux de velours qui ondulent ;
 *   - LES RÉPONSES : des billets de théâtre (`objets`), perforés, au nom de
 *     chaque registre ou genre ;
 *   - APRÈS LA RÉPONSE : les rideaux s'ouvrent grand et LE MASQUE DU REGISTRE
 *     descend des cintres — larmes du pathétique, poignard du tragique, épée
 *     de l'épique, cœur du lyrique, rire du comique, regard creux du
 *     fantastique, lunettes du didactique, sourire en coin du satirique, cri
 *     du polémique —, avec l'indice qui le trahit et l'effet qu'il cherche.
 *     Une question de genre affiche, elle, l'affiche du spectacle.
 * Le masque n'apparaît qu'après la réponse : il la dirait.
 */

const P = 'sc-genres-et-registres';

/** Les couleurs de chaque masque : le fond, le trait. */
const TEINTES = {
  tragique: ['#3a1d4a', '#d9c3ff'],
  pathetique: ['#cfe3ff', '#1f3f73'],
  epique: ['#ffd36b', '#6b3a00'],
  lyrique: ['#ffd1e1', '#8a1c4a'],
  satirique: ['#d8f5c4', '#2f5d1a'],
  polemique: ['#ff9f8a', '#6b0f05'],
  comique: ['#fff1a8', '#6b4a00'],
  fantastique: ['#1f3b46', '#9ff3ff'],
  didactique: ['#e4ecff', '#1b3a8a'],
};

/** Ce que chaque masque montre de son registre : sourcils, bouche, et son attribut. */
function Traits({ registre, trait }) {
  const t = { stroke: trait, strokeWidth: 3.5, fill: 'none', strokeLinecap: 'round' };
  switch (registre) {
    case 'tragique':
      return (
        <>
          <path d="M30 40 L44 36 M70 36 L84 40" {...t} />
          <path d="M40 82 Q57 70 74 82" {...t} />
          <path d="M42 48 q2 10 0 14" stroke="#9ff3ff" strokeWidth="3" fill="none" />
          <path d="M96 20 L118 60 M92 24 L100 18" stroke="#d9c3ff" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case 'pathetique':
      return (
        <>
          <path d="M30 36 L44 42 M70 42 L84 36" {...t} />
          <path d="M42 84 Q57 74 72 84" {...t} />
          <circle className={`${P}__larme`} cx="38" cy="60" r="4" fill="#3d7fd1" />
          <circle className={`${P}__larme`} cx="76" cy="60" r="4" fill="#3d7fd1" style={{ animationDelay: '-0.8s' }} />
        </>
      );
    case 'epique':
      return (
        <>
          <path d="M30 40 L44 38 M70 38 L84 40" {...t} />
          <path d="M40 74 Q57 86 74 74" {...t} />
          <path d="M20 22 Q57 -4 94 22" stroke="#2f7d32" strokeWidth="5" fill="none" />
          <path d="M100 70 L122 18 M96 60 L110 66" stroke="#6b3a00" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case 'lyrique':
      return (
        <>
          <path d="M32 46 Q38 50 44 46 M70 46 Q76 50 82 46" {...t} />
          <path d="M44 76 Q57 84 70 76" {...t} />
          <path className={`${P}__coeur`} d="M108 34 c-6 -10 -20 -4 -12 8 l12 12 l12 -12 c8 -12 -6 -18 -12 -8 z" fill="#e0336e" />
        </>
      );
    case 'satirique':
      return (
        <>
          <path d="M30 40 L44 40 M70 34 L84 40" {...t} />
          <path d="M42 78 Q60 80 76 70" {...t} />
        </>
      );
    case 'polemique':
      return (
        <>
          <path d="M30 34 L46 42 M68 42 L84 34" {...t} />
          <ellipse cx="57" cy="80" rx="12" ry="9" fill={trait} />
          <path d="M100 40 l14 -6 M102 52 l16 0 M100 64 l14 6" stroke="#6b0f05" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case 'comique':
      return (
        <>
          <path d="M30 40 Q37 32 44 40 M70 40 Q77 32 84 40" {...t} />
          <path d="M38 70 Q57 96 76 70 Z" fill={trait} />
        </>
      );
    case 'fantastique':
      return (
        <>
          <ellipse className={`${P}__lueur`} cx="38" cy="50" rx="7" ry="9" fill="#9ff3ff" />
          <ellipse className={`${P}__lueur`} cx="76" cy="50" rx="7" ry="9" fill="#9ff3ff" />
          <path d="M46 82 Q57 76 68 82" {...t} />
          <path d="M98 30 q10 10 0 20 q-10 10 0 20" stroke="#9ff3ff" strokeWidth="3" fill="none" opacity="0.7" />
        </>
      );
    case 'didactique':
      return (
        <>
          <circle cx="38" cy="50" r="10" {...t} />
          <circle cx="76" cy="50" r="10" {...t} />
          <path d="M48 50 L66 50" {...t} />
          <path d="M44 78 L70 78" {...t} />
          <path d="M98 50 h22 v26 h-22 z M109 50 v26" stroke="#1b3a8a" strokeWidth="3" fill="#fff" />
        </>
      );
    default:
      return null;
  }
}

/** Le masque d'un registre, qui descend des cintres au bout de ses fils. */
function Masque({ registre }) {
  const [fond, trait] = TEINTES[registre] ?? ['#fffaf0', '#2a1600'];
  return (
    <svg className={`${P}__masque`} viewBox="0 0 126 112" aria-hidden="true" focusable="false">
      <path d="M30 0 L34 14 M84 0 L80 14" stroke="#e8c15a" strokeWidth="1.5" />
      <path d="M14 20 Q57 6 100 20 Q104 70 80 96 Q57 112 34 96 Q10 70 14 20 Z" fill={fond} stroke="#e8c15a" strokeWidth="3" />
      {registre !== 'fantastique' && registre !== 'didactique' && (
        <>
          <ellipse cx="37" cy="52" rx="7" ry="5" fill={trait} />
          <ellipse cx="77" cy="52" rx="7" ry="5" fill={trait} />
        </>
      )}
      <Traits registre={registre} trait={trait} />
    </svg>
  );
}

/** Le registre d'une manche : la bonne réponse, pour un extrait, un indice ou un effet. */
const registreDe = (m) => (REGISTRES[m.bonne] ? m.bonne : null);

/** Après la réponse : le masque, son nom, l'indice qui le trahit et l'effet qu'il cherche. */
function Revelation({ m }) {
  const registre = registreDe(m);
  if (!registre) {
    // Une question de genre : l'affiche du spectacle.
    return (
      <div className={`${P}__affiche`} role="status">
        <span className={`${P}__affiche-titre`}>À l’affiche ce soir</span>
        <strong className={`${P}__affiche-genre`}>{libelleBon(m)}</strong>
      </div>
    );
  }
  return (
    <div className={`${P}__revelation`} role="status">
      <Masque registre={registre} />
      <div className={`${P}__carton`}>
        <strong className={`${P}__nom`}>{`Registre ${REGISTRES[registre][1]}`}</strong>
        <span className={`${P}__ligne`}>
          <em>L’indice :</em>
          {` ${INDICES[registre]}`}
        </span>
        <span className={`${P}__ligne`}>
          <em>L’effet :</em>
          {` ${VISEES[registre]}`}
        </span>
      </div>
    </div>
  );
}

export function QuestionGenres({ m, termine }) {
  const extrait = m.consigne === 'registre';
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__scene`}>
        <span className={`${P}__rideau ${P}__rideau--gauche`} aria-hidden="true" />
        <span className={`${P}__rideau ${P}__rideau--droite`} aria-hidden="true" />
        <span className={`${P}__lambrequin`} aria-hidden="true" />
        <span className={`${P}__poursuite`} aria-hidden="true" />
        <div className={`${P}__planches`}>
          <p className={`${P}__texte${extrait ? ` ${P}__texte--extrait` : ''}`}>{m.question}</p>
        </div>
      </div>
      {termine && <Revelation m={m} />}
    </div>
  );
}
