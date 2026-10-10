import { signe } from '../../../../lib/jeux/typesDePhrases';
import { Fete, cleHumeur, humeurDe } from './outils';
import './ce2-francais.css';

/**
 * RACONTE, QUESTION OU ORDRE ? (CE1) : LA LOUPE AU CARREFOUR (09/10/2026). La
 * couverture montre une petite exploratrice, une LOUPE à la main, devant un
 * poteau de flèches en bois : « Raconte ! » (orange, une bulle), « Question ? »
 * (bleu), « Ordre ! » (rouge), une lanterne et un village au loin. La scène :
 *   - LA QUESTION : la phrase sans son signe, sur la grande planche du
 *     carrefour ; la LOUPE (la mascotte, un grand œil dans son verre) la
 *     parcourt d'un bout à l'autre en cherchant l'indice. À l'erreur elle se
 *     gratte la tête et cligne ; à la bonne réponse elle file au bout de la
 *     phrase et fait un clin d'œil ;
 *   - LES RÉPONSES : les flèches du poteau, qu'on touche ; elles se balancent
 *     au vent, la fausse retombe de travers. Pas de « ! » sur la flèche de
 *     l'ordre : un ordre peut finir par un point (voir `typesDePhrases.js`) —
 *     on y dessine une main qui montre ;
 *   - APRÈS LA RÉPONSE : le signe tombe au bout de la phrase (le dessin
 *     d'origine), et l'INDICE s'allume sous la loupe : le mot qui interroge,
 *     le sujet passé derrière le verbe, ou le verbe sans personne devant.
 */

const CLE = 'sc-types-de-phrases';

const MOT_QUESTION = /^(Est-ce que|Où|Quels?|Quelles?|Qui|Pourquoi|Comment|Quand|Combien)(?=[\s,]|$)/;
const SUJET_DERRIERE = /[\p{L}]+-(?:t-)?(?:tu|il|elle|ils|elles|on|nous|vous|je)(?=[\s,]|$)/u;
const PREMIER_MOT = /^[\p{L}’'-]+/u;

/**
 * L'INDICE QUI DÉCIDE, et sa place dans le texte : { debut, fin, dit }. Une
 * phrase qui raconte n'a pas de mot-indice : c'est toute la phrase qui dit ce
 * qui se passe. Null si rien ne se reconnaît (jamais d'erreur).
 */
export function indiceDe(p) {
  const t = String(p?.texte ?? '');
  if (!t) return null;
  if (p.type === 'question') {
    const mot = MOT_QUESTION.exec(t);
    if (mot) return { debut: 0, fin: mot[0].length, dit: 'un mot qui interroge' };
    const inv = SUJET_DERRIERE.exec(t);
    if (inv) return { debut: inv.index, fin: inv.index + inv[0].length, dit: 'le sujet derrière le verbe' };
    return null;
  }
  if (p.type === 'ordre') {
    const verbe = PREMIER_MOT.exec(t);
    return verbe ? { debut: 0, fin: verbe[0].length, dit: 'personne devant le verbe' } : null;
  }
  if (p.type === 'raconte') return { debut: 0, fin: t.length, dit: 'elle dit ce qui se passe' };
  return null;
}

/** Les dessins des flèches : une bulle qui raconte, un point d'interrogation, une main qui montre. */
export function IconeType({ type }) {
  if (type === 'raconte') {
    return (
      <svg className={`${CLE}__icone`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M6 9h28a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H17l-8 7v-7H6a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z" fill="#fff" stroke="#3b2a12" strokeWidth="2.4" />
        <circle cx="13" cy="19" r="2.2" fill="#3b2a12" />
        <circle cx="20" cy="19" r="2.2" fill="#3b2a12" />
        <circle cx="27" cy="19" r="2.2" fill="#3b2a12" />
      </svg>
    );
  }
  if (type === 'question') {
    return (
      <svg className={`${CLE}__icone`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M13 14a7 7 0 1 1 10 6c-2 1-3 2.5-3 5v1" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <circle cx="20" cy="33" r="3" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg className={`${CLE}__icone`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M4 17h18a3 3 0 0 1 0 6H18v2a3 3 0 0 1 0 6h-6a6 6 0 0 1-6-6v-5" fill="#ffe0bd" stroke="#3b2a12" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 17h14a3 3 0 0 1 0 6H22" fill="#ffe0bd" stroke="#3b2a12" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

/** La loupe-mascotte : un manche de bois, un grand verre, un œil qui cherche. */
export function LoupeQuiCherche({ humeur, cle }) {
  return (
    <span className={`${CLE}__rail`} aria-hidden="true">
      <span key={cle} className={`${CLE}__loupe est-${humeur}`}>
        <svg viewBox="0 0 80 100" focusable="false">
          <path d="M52 62l20 30" stroke="#7a4a22" strokeWidth="11" strokeLinecap="round" />
          <path d="M52 62l20 30" stroke="#a8692f" strokeWidth="5" strokeLinecap="round" />
          <circle cx="36" cy="38" r="29" fill="rgba(210, 236, 255, 0.55)" stroke="#c9962f" strokeWidth="7" />
          <g className={`${CLE}__oeil`}>
            <ellipse cx="36" cy="38" rx="13" ry="11" fill="#fff" />
            <circle className={`${CLE}__pupille`} cx="38" cy="39" r="6" fill="#4a2c12" />
            <circle cx="40" cy="36.5" r="2" fill="#fff" />
          </g>
          <path className={`${CLE}__paupiere`} d="M23 38q13-14 26 0" fill="#f2c27b" stroke="#c9962f" strokeWidth="1.5" />
          <path d="M18 24q6-8 14-9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
        </svg>
      </span>
    </span>
  );
}

export function QuestionTypesDePhrases({ p, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  const t = String(p.texte ?? '');
  const indice = termine ? indiceDe(p) : null;
  return (
    <div className={`${CLE}${termine ? ` est-termine est-${p.type}` : ''}`}>
      <span className={`${CLE}__lanterne`} aria-hidden="true" />
      <div className={`${CLE}__planche`}>
        <span className={`${CLE}__corde ${CLE}__corde--g`} aria-hidden="true" />
        <span className={`${CLE}__corde ${CLE}__corde--d`} aria-hidden="true" />
        <LoupeQuiCherche humeur={humeur} cle={cleHumeur(humeur, extra)} />
        {/* LE DESSIN D'ORIGINE, gardé : la phrase, et son signe une fois trouvé. */}
        <p className={`phrase-a-trou ${CLE}__phrase`}>
          {indice ? (
            <>
              {t.slice(0, indice.debut)}
              <mark className={`${CLE}__indice ${CLE}__indice--${p.type}`} data-dit={indice.dit}>{t.slice(indice.debut, indice.fin)}</mark>
              {t.slice(indice.fin)}
            </>
          ) : t}
          <span className={`phrase-a-trou__trou phrase-a-trou__trou--signe${termine ? ' est-rempli' : ''} ${CLE}__signe`}>
            {termine ? signe(p) : '…'}
          </span>
        </p>
        {termine && extra?.trouve && <Fete forme="etoile" />}
      </div>
    </div>
  );
}

/** Le poteau du carrefour : une flèche par type, qu'on touche ; elles se balancent au vent. */
export function PoteauDesFleches({ choix, fautes, choisir }) {
  return (
    <div className={`${CLE}__carrefour`}>
      <span className={`${CLE}__poteau`} aria-hidden="true" />
      <ul className={`${CLE}__fleches`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => {
          const faux = fautes.includes(cle);
          return (
            <li key={cle} style={{ '--i': i }} className={`${CLE}__bras ${CLE}__bras--${i % 2 ? 'droite' : 'gauche'}`}>
              <button
                type="button"
                className={`${CLE}__fleche ${CLE}__fleche--${cle}${faux ? ' est-fausse' : ''}`}
                onClick={() => choisir(cle)}
                disabled={faux}
              >
                <IconeType type={cle} />
                <span className={`${CLE}__mot`}>{libelle}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const scene = {
  question: (p, termine, extra) => <QuestionTypesDePhrases p={p} termine={termine} extra={extra} />,
  choix: ({ choix, fautes, choisir }) => <PoteauDesFleches choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
