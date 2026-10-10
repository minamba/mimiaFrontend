import { avecVisuel, designer } from '../base';
import { FIGURES, IMAGES, PHRASES } from '../../../../lib/jeux/college/comme-une-image-college';
import { eclairer } from './commun';

/**
 * LA CRIQUE AUX COQUILLAGES — « Comme une image », 5e (09/10/2026). La
 * couverture : une fille accroupie sur les rochers, au coucher du soleil,
 * devant un vieux cadran couvert de coquillages ; la mer et le ciel rose.
 *   - LA QUESTION : la phrase sur un message tiré d'une bouteille, posé sur
 *     le sable mouillé ; le soleil se couche, les vagues vont et viennent, une
 *     mouette passe ;
 *   - LES RÉPONSES : des coquillages nacrés (`objets`) ;
 *   - APRÈS LA RÉPONSE : l'image se démonte. Pour une comparaison, trois
 *     galets reliés par une corde : le comparé, l'outil, le comparant ; pour
 *     une figure, son petit tableau animé (le pont « comme », la chose qui
 *     devient une autre, l'objet qui sourit, le mot qui enfle).
 * Rien n'est désigné dans la phrase avant la réponse.
 */

const P = 'sc-comme-une-image-college';

/** L'image de la banque qui correspond à la question (« … » entre guillemets), s'il y en a une. */
const imageDe = (m) => IMAGES.find(([phrase]) => `« ${phrase} »` === m.question) ?? null;

/** Le coucher de soleil sur la crique : le soleil, deux vagues, une mouette. */
function Crique() {
  // Une vague : des creux et des bosses de 40 unités, de -40 jusqu'au-delà du bord droit.
  const vague = (y) => `M-40 ${y} q20 -8 40 0${' t40 0'.repeat(22)} V80 H-40 Z`;
  return (
    <svg className={`${P}__crique`} viewBox="0 0 820 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${P}-ciel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b5bd6" />
          <stop offset="0.6" stopColor="#f59ab5" />
          <stop offset="1" stopColor="#ffd2a1" />
        </linearGradient>
      </defs>
      <rect width="820" height="80" fill={`url(#${P}-ciel)`} />
      <circle className={`${P}__soleil`} cx="640" cy="50" r="20" fill="#fff1b8" />
      <path d="M560 52 q20 -26 50 -22 q16 -10 30 4 q24 -4 30 18 z" fill="#7a5a8a" opacity="0.55" />
      <path className={`${P}__mouette`} d="M60 20 q7 -7 14 0 q7 -7 14 0" stroke="#3b2a55" strokeWidth="2.5" fill="none" />
      <path className={`${P}__vague ${P}__vague--loin`} d={vague(56)} fill="#3f7fc4" />
      <path className={`${P}__vague`} d={vague(66)} fill="#2a5f9e" />
    </svg>
  );
}

/** Le petit tableau d'une figure, une fois la réponse donnée. */
function Tableau({ figure }) {
  if (figure === 'comparaison') {
    return (
      <svg className={`${P}__tableau`} viewBox="0 0 160 60" aria-hidden="true" focusable="false">
        <circle cx="26" cy="34" r="16" fill="#8fd1c4" stroke="#1f6d63" strokeWidth="2" />
        <circle cx="134" cy="34" r="16" fill="#ffc6a8" stroke="#a5532c" strokeWidth="2" />
        <path className={`${P}__pont`} d="M42 34 Q80 6 118 34" stroke="#e0a82e" strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (figure === 'metaphore') {
    return (
      <svg className={`${P}__tableau`} viewBox="0 0 160 60" aria-hidden="true" focusable="false">
        <circle className={`${P}__fond-a`} cx="80" cy="32" r="22" fill="#8fd1c4" stroke="#1f6d63" strokeWidth="2" />
        <rect className={`${P}__fond-b`} x="58" y="10" width="44" height="44" rx="10" fill="#ffc6a8" stroke="#a5532c" strokeWidth="2" />
      </svg>
    );
  }
  if (figure === 'personnification') {
    return (
      <svg className={`${P}__tableau`} viewBox="0 0 160 60" aria-hidden="true" focusable="false">
        <g className={`${P}__visage`}>
          <circle cx="80" cy="32" r="22" fill="#ffd86b" stroke="#c98a0a" strokeWidth="2" />
          <circle cx="72" cy="28" r="3" fill="#3b2a55" />
          <circle cx="88" cy="28" r="3" fill="#3b2a55" />
          <path d="M70 38 q10 9 20 0" stroke="#3b2a55" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  return (
    <svg className={`${P}__tableau`} viewBox="0 0 160 60" aria-hidden="true" focusable="false">
      <text className={`${P}__enfle`} x="80" y="40" textAnchor="middle" fontSize="26" fontWeight="900" fill="#e0335e">×1000</text>
    </svg>
  );
}

/** Après : les trois galets de l'image — le comparé, l'outil, le comparant. */
function Galets({ image, cible }) {
  const [, compare, outil, comparant] = image;
  const galets = [
    ['compare', 'le comparé', compare],
    ['outil', outil ? 'l’outil' : 'pas d’outil', outil ?? '—'],
    ['comparant', 'le comparant', comparant],
  ];
  return (
    <ol className={`${P}__galets`}>
      {galets.map(([cle, nom, texte], i) => (
        <li key={cle} className={`${P}__galet${cle === cible ? ' est-cible' : ''}`} style={{ '--n': i }}>
          <span className={`${P}__nom`}>{nom}</span>
          <strong>{texte}</strong>
        </li>
      ))}
    </ol>
  );
}

function Explication({ m }) {
  const image = imageDe(m);
  if (m.consigne !== 'figure' && image) {
    return (
      <div className={`${P}__explication`} role="status">
        <Galets image={image} cible={m.consigne} />
        <p className={`${P}__indice`}>{PHRASES[`${m.consigne}-regle`]}</p>
      </div>
    );
  }
  const figure = FIGURES[m.bonne] ? m.bonne : null;
  return (
    <div className={`${P}__explication`} role="status">
      <div className={`${P}__figure`}>
        {figure && <Tableau figure={figure} />}
        <strong className={`${P}__nom-figure`}>{FIGURES[m.bonne] ?? m.bonne}</strong>
      </div>
      {figure && <p className={`${P}__indice`}>{PHRASES[`indice-${figure}`]}</p>}
    </div>
  );
}

export function QuestionImage({ m, termine }) {
  // Après la réponse seulement, le mot cherché brille dans la phrase.
  const texte = termine && m.consigne !== 'figure'
    ? eclairer(m.question, m.bonne, `${P}__eclat`)
    : designer(m.question);
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Crique />
      <div className={`${P}__sable`}>
        <div className={`${P}__message`}>
          <span className={`${P}__bouteille`} aria-hidden="true" />
          <p className={`${P}__phrase`}>{texte}</p>
        </div>
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

const scene = {
  question: (m, termine) => <QuestionImage m={m} termine={termine} />,
  // Les galets ou le nom de la figure montrent déjà la bonne réponse.
  apres: () => null,
  objets: P,
};

export default scene;
