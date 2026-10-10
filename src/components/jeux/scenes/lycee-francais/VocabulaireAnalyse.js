import { REPERES } from '../../../../lib/jeux/lycee/vocabulaire-analyse';
import { libelleBon, surligner } from './commun';

/**
 * L'OBSERVATOIRE DES LENTILLES — « Le vocabulaire de l'analyse » (2de). La
 * couverture : un observatoire de cuivre, de grandes lentilles rondes où se
 * reflète un château, une sphère de cristal, un prisme. La scène la reprend :
 *   - LA QUESTION : le texte sous une grande loupe cerclée de cuivre, où
 *     passe un reflet ; une lunette et une sphère de cristal veillent ;
 *   - LES RÉPONSES : des lentilles de cuivre et de verre (`objets`) ;
 *   - APRÈS LA RÉPONSE : une seconde lentille grossit CE QUI A PERMIS DE
 *     RÉPONDRE. La focalisation montre où est l'œil qui voit (dans le
 *     personnage, dehors, au-dessus de tout) ; l'énonciation allume ses
 *     repères (je, tu, demain… ou il, ce jour-là, la veille) ; la
 *     modalisation allume son mot et place l'aiguille entre doute et
 *     certitude ; l'étymologie décompose le mot en ses racines.
 * Avant la réponse, rien n'est grossi : la loupe ne montre que le texte.
 */

const P = 'sc-vocabulaire-analyse';

/** Les repères ancrés dans la situation : qui parle, à qui, quand, où. */
const ANCRE = /(?<![\p{L}])(?:(?:je|tu|nous|vous|me|moi|te|ici|demain|hier|maintenant|aujourd’hui|ce matin|ton|ta|tes|mon|ma|mes)(?![\p{L}])|j’|t’|m’)/giu;
/** Les repères d'un récit coupé de la situation : la troisième personne, les dates, « ce jour-là ». */
const COUPE = /(?<![\p{L}])(il|elle|ils|le lendemain|ce jour-là|la veille|en 1821|la reine|le marchand|napoléon|les soldats)(?![\p{L}])/giu;

/** Le mot qui modalise, dans chaque phrase du module. */
const MODALISATEURS = {
  'Il viendra certainement.': 'certainement',
  'Il est évident que tu as raison.': 'Il est évident',
  'Il réussira sans aucun doute.': 'sans aucun doute',
  'Il est certain que la crise durera.': 'Il est certain',
  'Sans doute viendra-t-il demain.': 'Sans doute',
  'Il est peut-être malade.': 'peut-être',
  'Le ministre serait sur le départ.': 'serait',
  'Il semble que la situation s’améliore.': 'Il semble',
  'Il est probable que le match sera reporté.': 'Il est probable',
  'Heureusement, personne n’a été blessé.': 'Heureusement',
  'Ce film est hélas bien trop long.': 'hélas',
  'Ce discours magnifique a ému toute la salle.': 'magnifique',
  'Cette décision est scandaleuse.': 'scandaleuse',
};

const phraseDe = (m) => /^« (.+) »$/.exec(m.question)?.[1] ?? null;
const marque = (role) => `${P}__allume ${P}__allume--${role}`;

/** Ce qui s'allume dans le texte de la loupe, après la réponse. */
function morceaux(m) {
  const phrase = phraseDe(m);
  if (!phrase) return [];
  if (m.consigne === 'enonciation') {
    const re = m.bonne === 'ancre' ? ANCRE : COUPE;
    return [...phrase.matchAll(re)].map((r) => [r[0], m.bonne]);
  }
  if (m.consigne === 'modalisation' && MODALISATEURS[phrase]) return [[MODALISATEURS[phrase], 'modal']];
  return [];
}

/** Les trois places de l'œil qui raconte : dans le personnage, dehors, au-dessus. */
function Regards({ bonne }) {
  const places = [
    ['interne', 'Interne : on voit par les yeux d’un personnage'],
    ['externe', 'Externe : on voit du dehors, comme une caméra'],
    ['zero', 'Zéro : le narrateur sait tout, voit tout'],
  ];
  return (
    <ul className={`${P}__regards`} aria-label="Où est l’œil qui raconte ?">
      {places.map(([cle, dit], i) => (
        <li key={cle} className={`${P}__regard${cle === bonne ? ` ${P}__regard--ici` : ''}`} style={{ '--k': i }}>
          <svg viewBox="0 0 80 60" aria-hidden="true" focusable="false">
            {/* Le personnage. */}
            <circle cx="40" cy="22" r="10" fill="#f3d9c0" stroke="#5a3a1a" strokeWidth="2" />
            <path d="M24 56 Q40 30 56 56 Z" fill="#7a2e3a" />
            {cle === 'interne' && <ellipse className={`${P}__oeil`} cx="40" cy="22" rx="6" ry="4" fill="#fff" stroke="#1b3a8a" strokeWidth="2" />}
            {cle === 'externe' && (
              <>
                <ellipse className={`${P}__oeil`} cx="8" cy="30" rx="6" ry="4" fill="#fff" stroke="#1b3a8a" strokeWidth="2" />
                <path d="M15 30 L30 26" stroke="#c99a3a" strokeWidth="2" strokeDasharray="3 2" />
              </>
            )}
            {cle === 'zero' && (
              <>
                <ellipse className={`${P}__oeil`} cx="40" cy="5" rx="9" ry="5" fill="#fff" stroke="#1b3a8a" strokeWidth="2" />
                <path d="M30 8 L18 16 M50 8 L62 16 M40 10 L40 12" stroke="#c99a3a" strokeWidth="2" />
              </>
            )}
          </svg>
          <span>{dit}</span>
        </li>
      ))}
    </ul>
  );
}

/** L'aiguille de la modalisation : du doute à la certitude, ou le jugement à part. */
function Aiguille({ bonne }) {
  const angle = { doute: -50, certitude: 50, jugement: 0 }[bonne] ?? 0;
  return (
    <div className={`${P}__cadran`}>
      <svg viewBox="0 0 160 90" aria-hidden="true" focusable="false">
        <path d="M14 82 A66 66 0 0 1 146 82" fill="none" stroke="#c99a3a" strokeWidth="8" strokeLinecap="round" />
        <text x="10" y="64" fontSize="11" fill="#1b2a4a">doute</text>
        <text x="112" y="64" fontSize="11" fill="#1b2a4a">certitude</text>
        <g className={`${P}__aiguille`} style={{ '--a': `${angle}deg` }}>
          <path d="M80 82 L80 26" stroke={bonne === 'jugement' ? '#c0392b' : '#1b3a8a'} strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="80" cy="82" r="6" fill="#5a3a1a" />
      </svg>
      {bonne === 'jugement' && <span className={`${P}__cadran-note`}>Ni doute ni certitude : une appréciation, bonne ou mauvaise.</span>}
    </div>
  );
}

/** Le mot et ses racines : « démocratie » = dêmos (le peuple) + kratos (le pouvoir). */
function Racines({ m }) {
  const r = /^« (.+?) » : du (grec|latin) (.+?)…$/.exec(m.question);
  if (!r) return null;
  const parties = r[3].split(/,? et /).map((p, i, toutes) => {
    const [racine, ...sens] = p.split(',').map((x) => x.trim()).filter(Boolean);
    return { racine, sens: sens.join(', ') || (i === toutes.length - 1 ? m.bonne : '') };
  });
  return (
    <div className={`${P}__racines`}>
      <span className={`${P}__mot`}>{r[1]}</span>
      <span className={`${P}__egal`} aria-hidden="true">=</span>
      {parties.map((x, i) => (
        <span key={x.racine} className={`${P}__racine`} style={{ '--k': i }}>
          <em>{x.racine}</em>
          <span>{x.sens.charAt(0).toLowerCase() + x.sens.slice(1)}</span>
        </span>
      ))}
      <span className={`${P}__langue`}>{`(${r[2]})`}</span>
    </div>
  );
}

/** Le repère de l'énonciation, face à ses équivalents d'un récit coupé. */
function Reperes({ m }) {
  const ligne = REPERES.find(([bon]) => bon === m.bonne);
  if (!ligne) return null;
  return (
    <div className={`${P}__deux`}>
      <span className={`${P}__colonne ${P}__colonne--ancre`}>
        <em>Dépend de qui parle</em>
        {ligne[0]}
      </span>
      <span className={`${P}__colonne`}>
        <em>Dans un récit coupé</em>
        {ligne[1].join(', ')}
      </span>
    </div>
  );
}

/** La seconde lentille : ce qui a permis de répondre, grossi. */
function Lentille({ m }) {
  let dessin = null;
  if (m.consigne === 'focalisation') dessin = <Regards bonne={m.bonne} />;
  else if (m.consigne === 'modalisation') dessin = <Aiguille bonne={m.bonne} />;
  else if (m.consigne === 'etymologie') dessin = <Racines m={m} />;
  else if (m.consigne === 'repere') dessin = <Reperes m={m} />;
  return (
    <div className={`${P}__lentille`} role="status">
      {dessin}
      <strong className={`${P}__verdict`}>{libelleBon(m)}</strong>
    </div>
  );
}

export function QuestionVocabulaire({ m, termine }) {
  const allumes = termine ? morceaux(m) : [];
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__observatoire`}>
        <span className={`${P}__lunette`} aria-hidden="true" />
        <div className={`${P}__loupe`}>
          <span className={`${P}__reflet`} aria-hidden="true" />
          <p className={`${P}__texte`}>{allumes.length ? surligner(m.question, allumes, marque) : m.question}</p>
        </div>
        <span className={`${P}__sphere`} aria-hidden="true" />
      </div>
      {termine && <Lentille m={m} />}
    </div>
  );
}
