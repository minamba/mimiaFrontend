import { avecVisuel, designer } from '../base';
import { PHRASES, TERMES } from '../../../../lib/jeux/college/poeme-theatre-college';
import { premierPiege } from './commun';

/**
 * LE THÉÂTRE DE PLEIN AIR — « Poème, théâtre ou récit ? », 5e (09/10/2026).
 * La couverture : un garçon en cape rouge qui descend vers une scène de bois,
 * rideaux de velours, lanternes, une lune peinte sur la toile du fond.
 *   - LA QUESTION : la page du texte, posée sur la scène, entre deux rideaux
 *     qui ondulent ; les noms des personnages en capitales, comme dans une
 *     vraie pièce ; le passage indiqué tombe sous un projecteur ;
 *   - LES RÉPONSES : des billets de théâtre (`objets`) ;
 *   - APRÈS LA RÉPONSE : les rideaux s'ouvrent en grand et de petites
 *     silhouettes jouent le mot trouvé — deux personnages qui se répondent
 *     (réplique), une longue bulle déroulée (tirade), un personnage seul
 *     dans la lumière (monologue), une main devant la bouche, la bulle vers
 *     le public (aparté), une note de l'auteur qu'on ne prononce pas
 *     (didascalie) ; pour la construction de la pièce, le programme
 *     d'un soir, actes et scènes.
 */

const P = 'sc-poeme-theatre-college';

/** Le nom du personnage en tête de ligne : « LE ROI », « L’HÉRITIER »… (des capitales jusqu'au « . — » ou à la parenthèse). */
const NOM = /^([^a-zà-öø-ÿ(—→«]+?)(?=\s*\(|\.\s—)/;

/** Une ligne de la page : le nom en capitales, puis la suite, le passage indiqué sous le projecteur. */
function Ligne({ texte, passage }) {
  const nom = texte.match(NOM);
  const debut = nom ? nom[1] : '';
  const reste = texte.slice(debut.length);
  const i = passage ? reste.indexOf(passage) : -1;
  return (
    <>
      {debut && <strong className={`${P}__perso`}>{debut}</strong>}
      {i >= 0 ? (
        <>
          {designer(reste.slice(0, i))}
          <mark className={`${P}__projecteur`}>{reste.slice(i, i + passage.length)}</mark>
          {designer(reste.slice(i + passage.length))}
        </>
      ) : designer(reste)}
    </>
  );
}

/** La page du texte, ligne à ligne ; la dernière flèche « → « … » » devient un signet. */
function Page({ question }) {
  const lignes = String(question).split('\n');
  const fleche = lignes.findIndex((l) => l.startsWith('→'));
  const passage = fleche >= 0 ? (lignes[fleche].match(/«\s*(.+?)\s*»\s*$/)?.[1] ?? null) : null;
  return (
    <div className={`${P}__page`}>
      {lignes.map((l, i) => {
        const vide = !l.trim();
        const signet = i === fleche;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__ligne${vide ? ' est-vide' : ''}${signet ? ` ${P}__signet` : ''}`}>
            {signet ? designer(l) : <Ligne texte={l} passage={i < fleche ? passage : null} />}
            {'\n'}
          </span>
        );
      })}
    </div>
  );
}

/** Une silhouette de comédien, à la position x. */
function Comedien({ x, couleur = '#2a1030', classe = '' }) {
  return (
    <g className={classe} transform={`translate(${x} 0)`}>
      <circle cx="0" cy="44" r="7" fill={couleur} />
      <path d="M-9 82 Q-10 58 0 54 Q10 58 9 82 Z" fill={couleur} />
    </g>
  );
}

/** Ce que jouent les silhouettes, selon le mot du théâtre. */
function Jeu({ terme }) {
  const bulle = (x, y, l, classe = '') => (
    <rect className={classe} x={x} y={y} width={l} height="16" rx="8" fill="#fff" stroke="#2a1030" strokeWidth="1.5" />
  );
  if (terme === 'replique') {
    return (
      <>
        <Comedien x={70} />
        <Comedien x={150} couleur="#5a1a2a" />
        {bulle(40, 14, 50, `${P}__bulle-a`)}
        {bulle(130, 20, 50, `${P}__bulle-b`)}
      </>
    );
  }
  if (terme === 'tirade') {
    return (
      <>
        <Comedien x={60} />
        <Comedien x={175} couleur="#5a1a2a" />
        <rect className={`${P}__rouleau`} x="70" y="10" width="92" height="32" rx="10" fill="#fff" stroke="#2a1030" strokeWidth="1.5" />
        {[16, 23, 30].map((y) => <line key={y} className={`${P}__rouleau`} x1="78" y1={y} x2="154" y2={y} stroke="#9a8aa0" strokeWidth="2" />)}
      </>
    );
  }
  if (terme === 'monologue') {
    return (
      <>
        <path className={`${P}__douche`} d="M100 0 L72 86 H148 L120 0 Z" fill="rgba(255, 236, 160, 0.55)" />
        <Comedien x={110} />
        {bulle(118, 18, 46, `${P}__bulle-a`)}
      </>
    );
  }
  if (terme === 'aparte') {
    return (
      <>
        <Comedien x={70} />
        <Comedien x={160} couleur="#5a1a2a" classe={`${P}__sourd`} />
        <path d="M78 46 l10 -6 v12 z" fill="#2a1030" />
        <path className={`${P}__vers-public`} d="M88 52 Q100 76 108 92" stroke="#ffd86b" strokeWidth="3" fill="none" strokeDasharray="4 4" />
        {bulle(36, 14, 46, `${P}__bulle-a`)}
      </>
    );
  }
  if (terme === 'didascalie') {
    return (
      <>
        <Comedien x={150} />
        <g className={`${P}__note`}>
          <rect x="34" y="18" width="78" height="44" rx="4" fill="#fff8e0" stroke="#8a6a3a" strokeWidth="1.5" />
          {[30, 40, 50].map((y) => <line key={y} x1="42" y1={y} x2="104" y2={y} stroke="#b9a37a" strokeWidth="2" />)}
        </g>
        <g transform="translate(150 22)">
          <circle r="9" fill="#fff" stroke="#e5383b" strokeWidth="2.5" />
          <path d="M-6 6 L6 -6" stroke="#e5383b" strokeWidth="2.5" />
        </g>
      </>
    );
  }
  return null;
}

/** Après : les rideaux ouverts, et le mot du théâtre joué en silhouettes. */
function Explication({ m }) {
  const regle = PHRASES[premierPiege(m)] ?? PHRASES[`${m.consigne}-regle`];
  const terme = TERMES[m.bonne] ? m.bonne : null;
  return (
    <div className={`${P}__explication`} role="status">
      {terme ? (
        <div className={`${P}__petite-scene`}>
          <svg viewBox="0 0 220 92" aria-hidden="true" focusable="false">
            <rect x="0" y="82" width="220" height="10" fill="#7a4a22" />
            <Jeu terme={terme} />
          </svg>
          <strong className={`${P}__mot`}>{TERMES[terme]}</strong>
        </div>
      ) : (
        <div className={`${P}__programme`}>
          <span className={`${P}__programme-titre`}>Programme</span>
          <span aria-hidden="true" className={`${P}__actes`}>
            {['I', 'II', 'III'].map((a) => <span key={a}>Acte {a}</span>)}
          </span>
          <strong className={`${P}__mot`}>{m.choix?.find((c) => c.cle === m.bonne)?.libelle ?? m.bonne}</strong>
        </div>
      )}
      {regle && <p className={`${P}__regle`}>{regle}</p>}
    </div>
  );
}

export function QuestionTheatre({ m, termine }) {
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-ouvert' : ''}`}>
      <div className={`${P}__cadre`}>
        <span className={`${P}__lambrequin`} aria-hidden="true" />
        <span className={`${P}__rideau ${P}__rideau--gauche`} aria-hidden="true" />
        <span className={`${P}__rideau ${P}__rideau--droite`} aria-hidden="true" />
        <span className={`${P}__lune`} aria-hidden="true" />
        <Page question={m.question} />
        <span className={`${P}__rampe`} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ '--n': i }} />)}
        </span>
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

const scene = {
  question: (m, termine) => <QuestionTheatre m={m} termine={termine} />,
  // Les silhouettes, ou le programme, nomment déjà la bonne réponse.
  apres: () => null,
  objets: P,
};

export default scene;
