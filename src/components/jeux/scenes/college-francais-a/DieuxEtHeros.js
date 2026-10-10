import { laBonne } from './commun';

/**
 * LE TEMPLE SOUS L'ORAGE — « Dieux et héros » (6e). La couverture : un jeune
 * héros grec gravit les marches d'un temple, un bouclier de bronze au soleil
 * levant, la foudre de Zeus dans un ciel violet, la mer qui gronde.
 *   - LA QUESTION : gravée en lettres d'or sur une stèle de marbre, entre deux
 *     colonnes, sous un ciel d'orage où les éclairs claquent ;
 *   - LES RÉPONSES : des boucliers de bronze frappés du soleil
 *     (`objets: 'sc-dieux-et-heros'`) ;
 *   - APRÈS LA RÉPONSE : un médaillon d'or tourne sur lui-même et révèle
 *     l'attribut du dieu, du héros ou de l'épisode (la foudre, le trident, la
 *     chouette, le fil d'Ariane, le cheval de bois…), couronné de laurier.
 */

const P = 'sc-dieux-et-heros';

/** L'attribut de chaque réponse, d'après la phrase du fait juste (`m.aide`). */
const ATTRIBUTS = {
  'qui-zeus': '⚡',
  'qui-poseidon': '🔱',
  'qui-athena': '🦉',
  'qui-hades': '🌑',
  'qui-hermes': '🕊️',
  'qui-heracles': '🦁',
  'qui-thesee': '🧵',
  'qui-persee': '🐍',
  'qui-ulysse': '⛵',
  'qui-penelope': '🧶',
  'qui-promethee': '🔥',
  'qui-circe': '🐖',
  'qui-polypheme': '👁️',
  'qui-aphrodite': '🌹',
  'qui-icare': '☀️',
  'qui-jupiter': '⚡',
  'ep-cyclope': '🐏',
  'ep-personne': '🗣️',
  'ep-sirenes': '🧜‍♀️',
  'ep-argos': '🐕',
  'ep-arc': '🏹',
  'ep-daphne': '🌿',
  'ep-midas': '👑',
  'ep-narcisse': '💧',
  'ep-arachne': '🕷️',
  'ep-six-jours': '🌍',
  'ep-eden': '🍎',
  'ep-noe': '🚢',
  'ep-cheval': '🐴',
  'ep-pandore': '🏺',
  'ep-babel': '🗼',
  'mot-panique': '🐐',
  'mot-echo': '🗣️',
  'mot-odyssee': '⛵',
  'mot-achille': '🦶',
  'mot-hercule': '💪',
  'mot-dedale': '🌀',
  'mot-narcisse': '💧',
  'mot-pandore': '🏺',
  'mot-meduse': '🐍',
  'mot-ariane': '🧵',
  'mot-tantale': '🍇',
};

/** Le ciel d'orage : les éclairs qui claquent, le soleil qui perce sur la mer. */
function Ciel() {
  return (
    <svg className={`${P}__ciel`} viewBox="0 0 320 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-dieux-et-heros-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b1d52" />
          <stop offset="70%" stopColor="#6741d9" />
          <stop offset="100%" stopColor="#f59f00" />
        </linearGradient>
      </defs>
      <rect width="320" height="70" fill="url(#sc-dieux-et-heros-ciel)" />
      <circle className={`${P}__soleil`} cx="250" cy="66" r="14" fill="#ffd43b" />
      <path className={`${P}__eclair`} d="M70 0 L58 22 L68 22 L54 48 L80 18 L70 18 L80 0 Z" fill="#e5dbff" />
      <path className={`${P}__eclair`} style={{ '--n': 1 }} d="M200 0 L192 16 L200 16 L188 36 L208 12 L200 12 L208 0 Z" fill="#e5dbff" />
      <path className={`${P}__vague`} d="M0 64 Q20 58 40 64 T80 64 T120 64 T160 64 T200 64 T240 64 T280 64 T320 64 V70 H0 Z" fill="#1c7ed6" opacity="0.8" />
    </svg>
  );
}

export function QuestionDieux({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-revele' : ''}`}>
      <Ciel />
      <div className={`${P}__temple`}>
        <span className={`${P}__colonne`} aria-hidden="true" />
        <div className={`${P}__stele`}>
          <p className={`${P}__phrase`}>{m.question}</p>
        </div>
        <span className={`${P}__colonne`} aria-hidden="true" />
      </div>
      {termine && (
        <div className={`${P}__oracle`} role="status">
          <span className={`${P}__medaillon`}>
            <span className={`${P}__attribut`} aria-hidden="true">{ATTRIBUTS[m.aide] ?? '🏛️'}</span>
          </span>
          <strong className={`${P}__nom`}>{laBonne(m)}</strong>
        </div>
      )}
    </div>
  );
}
