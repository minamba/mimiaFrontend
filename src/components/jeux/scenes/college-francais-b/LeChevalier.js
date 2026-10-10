import { avecVisuel, designer } from '../base';
import { PHRASES, VALEURS } from '../../../../lib/jeux/college/le-chevalier';
import { BoutonsReponses, libelleDe, premierPiege } from './commun';

/**
 * LA COUR DE LA TABLE RONDE — « Le chevalier », 5e (09/10/2026). La
 * couverture : un jeune chevalier en cape verte brodée d'un arbre d'argent,
 * des bannières vertes, la Table ronde sous les arches, une épée posée.
 *   - LA QUESTION : écrite sur une bannière verte à l'arbre d'argent, qui
 *     flotte au vent entre deux hampes ;
 *   - LES RÉPONSES : des épées plantées dans la pierre (`choix`) — la
 *     légende d'Arthur : on tire l'épée de la bonne pierre ; l'épée d'une
 *     mauvaise pierre reste coincée, et la pierre se fend ;
 *   - APRÈS LA RÉPONSE : l'épée sort de la pierre et se dresse dans la
 *     lumière, à côté d'un écu peint à l'emblème de la valeur (le lion du
 *     courage, les anneaux liés de la loyauté, la rose de la courtoisie, la
 *     chandelle de la foi, le pain partagé de la générosité) ; un parchemin
 *     dit pourquoi.
 */

const P = 'sc-le-chevalier';

/** L'arbre d'argent de la bannière (repris de la cape de la couverture). */
function Arbre() {
  return (
    <svg className={`${P}__arbre`} viewBox="0 0 40 44" aria-hidden="true" focusable="false">
      <path d="M20 42 V22 M20 30 L12 22 M20 28 L28 20 M20 24 L14 14 M20 22 L26 12" stroke="#e8eef0" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="12" r="10" fill="none" stroke="#e8eef0" strokeWidth="1.6" strokeDasharray="3 3" />
    </svg>
  );
}

/** L'emblème peint sur l'écu, selon la valeur ; une couronne pour le reste. */
function Embleme({ valeur }) {
  switch (valeur) {
    case 'courage':
      return (
        <g>
          <circle cx="30" cy="30" r="12" fill="#f0a019" />
          {Array.from({ length: 10 }, (_, k) => (
            <path key={k} d="M30 14 l3 -6 l3 6 z" fill="#c96a00" transform={`rotate(${k * 36} 30 30)`} />
          ))}
          <circle cx="26" cy="28" r="1.8" fill="#3a2410" />
          <circle cx="34" cy="28" r="1.8" fill="#3a2410" />
          <path d="M27 35 q3 3 6 0" stroke="#3a2410" strokeWidth="1.6" fill="none" />
        </g>
      );
    case 'loyaute':
      return (
        <g fill="none" strokeWidth="4">
          <circle cx="24" cy="30" r="9" stroke="#f0d36b" />
          <circle cx="36" cy="30" r="9" stroke="#ffffff" />
        </g>
      );
    case 'courtoisie':
      return (
        <g>
          <path d="M30 48 V32" stroke="#2e7d32" strokeWidth="3" />
          <path d="M30 34 q-8 -2 -8 -10 q0 -8 8 -8 q8 0 8 8 q0 8 -8 10 z" fill="#e0335e" />
          <path d="M26 24 q4 4 8 0" stroke="#8c1238" strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'foi':
      return (
        <g>
          <rect x="25" y="26" width="10" height="20" rx="2" fill="#fff8e0" />
          <path className={`${P}__flamme`} d="M30 14 q6 7 0 12 q-6 -5 0 -12 z" fill="#ffc94a" />
        </g>
      );
    case 'generosite':
      return (
        <g>
          <path d="M14 36 q0 -12 16 -12 q16 0 16 12 z" fill="#d99a4e" stroke="#8a5a2b" strokeWidth="1.5" />
          <path d="M22 30 l3 -3 M30 29 l3 -3 M38 30 l-2 -3" stroke="#8a5a2b" strokeWidth="1.5" />
          <path d="M30 24 V40" stroke="#fff8e0" strokeWidth="2" strokeDasharray="2 2" />
        </g>
      );
    default:
      return (
        <path d="M18 38 L18 24 L24 30 L30 20 L36 30 L42 24 L42 38 Z" fill="#f0d36b" stroke="#a8700f" strokeWidth="1.5" />
      );
  }
}

/** L'écu : un blason vert et argent, l'emblème au centre. */
function Ecu({ valeur }) {
  return (
    <svg className={`${P}__ecu`} viewBox="0 0 60 70" aria-hidden="true" focusable="false">
      <path d="M4 6 H56 V34 Q56 58 30 66 Q4 58 4 34 Z" fill="#1f5a3a" stroke="#c9c9c9" strokeWidth="3" />
      <path d="M4 6 H30 V66 Q4 58 4 34 Z" fill="#2c7a50" />
      <Embleme valeur={valeur} />
    </svg>
  );
}

/** Une épée, la lame vers le bas. */
function Epee({ classe = '' }) {
  return (
    <svg className={classe} viewBox="0 0 24 90" aria-hidden="true" focusable="false">
      <path d="M12 30 L17 34 V84 L12 90 L7 84 V34 Z" fill="#dfe6ee" stroke="#7a8796" strokeWidth="1.2" />
      <path d="M12 34 V86" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
      <rect x="1" y="24" width="22" height="6" rx="3" fill="#c9962b" stroke="#7a5a12" />
      <rect x="9" y="6" width="6" height="18" rx="2" fill="#5b3a1a" />
      <circle cx="12" cy="5" r="5" fill="#c9962b" stroke="#7a5a12" />
    </svg>
  );
}

function Explication({ m }) {
  const raison = m.consigne === 'valeur' ? PHRASES[`valeur-${m.bonne}`] : PHRASES[premierPiege(m)];
  return (
    <div className={`${P}__explication`} role="status">
      <div className={`${P}__trophee`}>
        <Epee classe={`${P}__epee-levee`} />
        <Ecu valeur={m.consigne === 'valeur' && VALEURS[m.bonne] ? m.bonne : null} />
        <strong className={`${P}__devise`}>{libelleDe(m, m.bonne)}</strong>
      </div>
      {raison && <p className={`${P}__parchemin`}>{raison}</p>}
    </div>
  );
}

export function QuestionChevalier({ m, termine }) {
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__hampes`} aria-hidden="true" />
      <div className={`${P}__banniere`}>
        <Arbre />
        <p className={`${P}__texte`}>{designer(m.question)}</p>
        <span className={`${P}__franges`} aria-hidden="true" />
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** Les réponses : des épées plantées dans la pierre, la réponse gravée sur la pierre. */
export function ChoixEpees({ m, choix, fautes, choisir }) {
  return (
    <BoutonsReponses
      prefixe={P}
      m={m}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      dessin={() => <Epee classe={`${P}__lame`} />}
    />
  );
}

const scene = {
  question: (m, termine) => <QuestionChevalier m={m} termine={termine} />,
  // L'épée tirée et sa devise montrent déjà la bonne réponse.
  apres: () => null,
  choix: (props) => <ChoixEpees {...props} />,
};

export default scene;
