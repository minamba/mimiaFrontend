import { avecVisuel } from '../base';
import { FAUTES, PHRASES } from '../../../../lib/jeux/college/chasse-aux-fautes';
import { premierPiege } from './commun';

/**
 * LE PATIO AUX AZULEJOS — « La chasse aux fautes », 3e (09/10/2026). La
 * couverture : un garçon à genoux, une loupe à la main, sur un sol de
 * carreaux bleus et blancs ; un seul carreau est rouge.
 *   - LA QUESTION : chaque mot de la phrase est un carreau bleu et blanc ;
 *     une loupe glisse lentement, d'un bout à l'autre, sans jamais s'arrêter
 *     (elle ne désigne rien : elle invite à relire mot à mot) ;
 *   - LES RÉPONSES (`choix`) : des carreaux à retourner — un mot par
 *     carreau ; pour « la phrase sans faute », trois rangées de carreaux. Un
 *     mauvais carreau se fêle ;
 *   - APRÈS LA RÉPONSE : le carreau fautif vire au rouge, comme sur la
 *     couverture, puis se retourne pour montrer la bonne orthographe ; pour
 *     les trois phrases, le mot qui change devient rouge dans les phrases
 *     fautives et bleu dans la juste ; une phrase de méthode dit comment
 *     vérifier.
 */

const P = 'sc-chasse-aux-fautes';

/** Les mots d'une phrase, l'apostrophe gardée dans son mot (« j’ai », « c’est »). */
const mots = (phrase) => String(phrase ?? '').split(/\s+/).filter(Boolean);

/** Un mot sans sa ponctuation finale, pour le comparer au mot d'une réponse. */
const nu = (mot) => mot.replace(/[.,;:!?…]+$/, '');

/** Une rangée de carreaux, un mot chacun ; `etat(i, mot)` donne la classe d'un carreau. */
function Carreaux({ phrase, etat = () => '', loupe = false }) {
  const liste = mots(phrase);
  return (
    <p className={`${P}__rangee`}>
      {liste.map((mot, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>
          <span className={`${P}__carreau ${etat(i, mot)}`.trim()} style={{ '--n': i }}>{mot}</span>
          {i < liste.length - 1 ? ' ' : ''}
        </span>
      ))}
      {loupe && (
        <svg className={`${P}__loupe`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <circle cx="16" cy="16" r="11" fill="rgba(210, 240, 255, 0.35)" stroke="#c9962b" strokeWidth="4" />
          <path d="M24 24 l12 12" stroke="#6b3f1f" strokeWidth="6" strokeLinecap="round" />
        </svg>
      )}
    </p>
  );
}

/** L'index du mot fautif (ou du trou) dans la phrase : le premier mot nu égal à `cible`. */
const indexDe = (phrase, cible) => mots(phrase).findIndex((mot) => nu(mot) === cible);

/** Après « trouve la faute » : le carreau rouge, puis retourné. */
function Correction({ m }) {
  const faute = FAUTES.find(([p]) => p === m.question);
  const sorte = faute?.[3] ?? premierPiege(m);
  return (
    <div className={`${P}__correction`} role="status">
      {faute && (
        <p className={`${P}__retourne`}>
          <span className={`${P}__carreau est-rouge`}>{faute[1]}</span>
          <span className={`${P}__fleche`} aria-hidden="true">→</span>
          <span className={`${P}__carreau est-juste`}>{faute[2]}</span>
        </p>
      )}
      {PHRASES[sorte] && <p className={`${P}__methode`}>{PHRASES[sorte]}</p>}
    </div>
  );
}

/** Après « la phrase sans faute » : les trois rangées, le mot qui change en couleur. */
function Comparaison({ m }) {
  const juste = mots(m.bonne);
  const autres = (m.choix ?? []).map((c) => c.libelle).filter((l) => l !== m.bonne);
  return (
    <div className={`${P}__correction`} role="status">
      <div className={`${P}__comparaison`}>
        <Carreaux phrase={m.bonne} etat={(i, mot) => (autres.some((a) => mots(a)[i] !== mot) ? 'est-juste' : '')} />
        {autres.map((a) => (
          <div key={a} className={`${P}__barree`}>
            <Carreaux phrase={a} etat={(i, mot) => (juste[i] !== mot ? 'est-rouge' : 'est-terne')} />
          </div>
        ))}
      </div>
      {PHRASES[premierPiege(m)] && <p className={`${P}__methode`}>{PHRASES[premierPiege(m)]}</p>}
    </div>
  );
}

/** Après « le bon mot » : le trou comblé. */
function Comble({ m }) {
  const remplie = String(m.question).replace('…', m.bonne);
  const k = indexDe(remplie, m.bonne);
  const methode = PHRASES[premierPiege(m)] ?? PHRASES['bon-mot-regle'];
  return (
    <div className={`${P}__correction`} role="status">
      <Carreaux phrase={remplie} etat={(i) => (i === k ? 'est-juste est-retourne' : '')} />
      {methode && <p className={`${P}__methode`}>{methode}</p>}
    </div>
  );
}

function Explication({ m }) {
  if (m.consigne === 'sans-faute') return <Comparaison m={m} />;
  if (m.consigne === 'bon-mot') return <Comble m={m} />;
  return <Correction m={m} />;
}

export function QuestionFautes({ m, termine }) {
  // Après la réponse, le carreau fautif vire au rouge dans la phrase même.
  const fautif = termine && m.consigne === 'trouver' ? indexDe(m.question, m.bonne) : -1;
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__patio`}>
        <Carreaux
          phrase={m.question}
          loupe={!termine}
          etat={(i, mot) => (i === fautif ? 'est-rouge' : mot.includes('…') ? 'est-trou' : '')}
        />
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** Les réponses : des carreaux à retourner, ou des rangées pour les phrases entières. */
export function ChoixCarreaux({ m, choix, fautes, choisir }) {
  const phrases = m.consigne === 'sans-faute';
  return (
    <ul className={`${P}__reponses${phrases ? ` ${P}__reponses--phrases` : ''}`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${P}__reponse${fausse ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={fausse}
            >
              <span className={`${P}__motif`} aria-hidden="true" />
              <span className={`${P}__libelle`}>{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionFautes m={m} termine={termine} />,
  // Le carreau retourné, ou les rangées comparées, montrent la bonne réponse.
  apres: () => null,
  choix: (props) => <ChoixCarreaux {...props} />,
};

export default scene;
