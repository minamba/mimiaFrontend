import { PHRASES } from '../../../../lib/jeux/ouQuandComment';
import {
  BoutonGlissable, Fete, cleHumeur, humeurDe,
} from './outils';
import './ce2-francais.css';

/**
 * OÙ, QUAND, COMMENT ? (CE2) : LE TABLEAU À LA CRAIE (09/10/2026). La
 * couverture montre un grand tableau noir dans un jardin au bord du lac, une
 * lanterne accrochée au-dessus, un pot de craies, et trois cercles dessinés à
 * la craie : une épingle orange pour « Où ? », un réveil bleu pour « Quand ? »,
 * des engrenages roses pour « Comment ? ». La scène :
 *   - LA QUESTION : la phrase écrite sur le tableau, le groupe surligné comme
 *     avant ; la LANTERNE (la mascotte) se balance au-dessus — elle brille de
 *     joie à la bonne réponse, vacille gentiment à l'erreur ;
 *   - LES RÉPONSES : les trois cercles de craie de la couverture. On en
 *     touche un, ou on le GLISSE sur le groupe surligné ;
 *   - APRÈS LA RÉPONSE : la craie entoure le groupe à la couleur de sa
 *     question, une flèche le relie à son dessin qui s'anime — l'épingle se
 *     plante, le réveil sonne, les engrenages tournent.
 */

const CLE = 'sc-ou-quand-comment';

/** Les dessins des trois questions, à la craie. */
export function IconeQuestion({ type }) {
  if (type === 'ou') {
    return (
      <svg className={`${CLE}__icone ${CLE}__icone--ou`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M20 4c-7 0-12 5-12 11.5C8 24 20 36 20 36s12-12 12-20.5C32 9 27 4 20 4z" />
        <circle cx="20" cy="15.5" r="4.5" />
      </svg>
    );
  }
  if (type === 'quand') {
    return (
      <svg className={`${CLE}__icone ${CLE}__icone--quand`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M7 11a6 6 0 0 1 8-6M33 11a6 6 0 0 0-8-6" />
        <circle cx="20" cy="22" r="13" />
        <path className={`${CLE}__aiguille`} d="M20 22V14" />
        <path className={`${CLE}__aiguille ${CLE}__aiguille--petite`} d="M20 22h6" />
        <path d="M11 35l2-3M29 35l-2-3" />
      </svg>
    );
  }
  return (
    <svg className={`${CLE}__icone ${CLE}__icone--comment`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <g className={`${CLE}__engrenage`}>
        <circle cx="15" cy="17" r="8" className={`${CLE}__dents`} />
        <circle cx="15" cy="17" r="3" />
      </g>
      <g className={`${CLE}__engrenage ${CLE}__engrenage--petit`}>
        <circle cx="28" cy="28" r="5.5" className={`${CLE}__dents`} />
        <circle cx="28" cy="28" r="2" />
      </g>
    </svg>
  );
}

/** La lanterne de la couverture : elle se balance, sa flamme danse ; elle réagit à chaque réponse. */
export function Lanterne({ humeur, cle }) {
  return (
    <span className={`${CLE}__potence`} aria-hidden="true">
      <span key={cle} className={`${CLE}__lanterne est-${humeur}`}>
        <svg viewBox="0 0 60 90" focusable="false">
          <path d="M30 0v10" stroke="#5b4630" strokeWidth="3" />
          <path d="M18 14h24l-4-6H22z" fill="#3b3b3b" />
          <rect x="16" y="14" width="28" height="44" rx="5" fill="#ffe9a8" stroke="#3b3b3b" strokeWidth="3" />
          <path d="M30 14v44M16 36h28" stroke="#3b3b3b" strokeWidth="1.5" opacity="0.5" />
          <path className={`${CLE}__flamme`} d="M30 26c5 6 6 10 3 14-1.5 2-4.5 2-6 0-3-4-2-8 3-14z" fill="#ff9f1c" />
          <path d="M14 58h32l-5 8H19z" fill="#3b3b3b" />
          <g className={`${CLE}__yeux`}>
            <circle cx="25" cy="47" r="2.4" fill="#3b2a12" />
            <circle cx="35" cy="47" r="2.4" fill="#3b2a12" />
          </g>
          <path className={`${CLE}__bouche`} d="M26 52q4 3.5 8 0" stroke="#3b2a12" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <span className={`${CLE}__halo`} />
      </span>
    </span>
  );
}

export function QuestionOuQuandComment({ p, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  const libelle = { ou: 'Où ?', quand: 'Quand ?', comment: 'Comment ?' }[p.type] ?? '';
  return (
    <div className={`${CLE}${termine ? ` est-termine est-${p.type}` : ''}`}>
      <Lanterne humeur={humeur} cle={cleHumeur(humeur, extra)} />
      <div className={`${CLE}__tableau`}>
        <span className={`${CLE}__gribouillis`} aria-hidden="true" />
        <span className={`${CLE}__ampoule`} aria-hidden="true">
          <svg viewBox="0 0 40 40" focusable="false">
            <path d="M14 26c-4-3-6-7-5-11 1-5 5-8 11-8s10 3 11 8c1 4-1 8-5 11v4H14z" />
            <path d="M15 33h10M16 36h8" />
          </svg>
        </span>
        {/* LE DESSIN D'ORIGINE, gardé : la phrase et son groupe surligné. */}
        <p className={`phrase-a-trou ${CLE}__phrase`}>
          {p.avant}{p.avant && ' '}
          <mark className={`complement${termine ? ` complement--${p.type}` : ''} ${CLE}__groupe`}>{p.groupe}</mark>
          {p.apres.startsWith(',') || p.apres === '.' ? '' : ' '}{p.apres}
        </p>
        {termine && (
          <p className={`${CLE}__explication`}>
            <span className={`${CLE}__fleche`} aria-hidden="true" />
            <span className={`${CLE}__medaillon ${CLE}__teinte--${p.type}`}>
              <IconeQuestion type={p.type} />
              <strong>{libelle}</strong>
            </span>
            {/* Montrée après deux erreurs, la même phrase est déjà dans la bulle d'aide. */}
            {extra?.trouve && <span className={`${CLE}__dit`}>{PHRASES[p.type]}</span>}
          </p>
        )}
        {termine && extra?.trouve && <Fete forme="craie" />}
      </div>
      <span className={`${CLE}__pot`} aria-hidden="true">
        <span className={`${CLE}__craie ${CLE}__craie--rose`} />
        <span className={`${CLE}__craie ${CLE}__craie--jaune`} />
        <span className={`${CLE}__craie ${CLE}__craie--bleue`} />
      </span>
    </div>
  );
}

/** Les trois cercles de craie : on en touche un, ou on le glisse sur le groupe surligné. */
export function CerclesDeCraie({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__cercles`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <BoutonGlissable
              cible={`.${CLE}__groupe`}
              choisir={() => choisir(cle)}
              disabled={faux}
              className={`${CLE}__cercle ${CLE}__teinte--${cle}${faux ? ' est-fausse' : ''}`}
            >
              <IconeQuestion type={cle} />
              <span className={`${CLE}__nom`}>{libelle}</span>
            </BoutonGlissable>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (p, termine, extra) => <QuestionOuQuandComment p={p} termine={termine} extra={extra} />,
  choix: ({ choix, fautes, choisir }) => <CerclesDeCraie choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
