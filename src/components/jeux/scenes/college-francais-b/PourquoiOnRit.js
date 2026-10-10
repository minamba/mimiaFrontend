import { avecVisuel, designer } from '../base';
import { COMIQUES, PHRASES } from '../../../../lib/jeux/college/pourquoi-on-rit';
import { BoutonsReponses, premierPiege } from './commun';

/**
 * LA CUISINE EN FOLIE — « Pourquoi on rit ? », 5e (09/10/2026). La
 * couverture : une fille assise sur le plan de travail d'une cuisine jaune
 * et turquoise, une théière qui verse toute seule, une pile de bols qui
 * penche, une orange qui roule.
 *   - LA QUESTION : la saynète sur une fiche de recette épinglée au mur de
 *     carreaux ; au-dessus, l'étagère : la pile de bols vacille, l'orange
 *     roule, la théière fume ;
 *   - LES RÉPONSES : des bocaux d'épices sur l'étagère (`choix`), chacun
 *     son étiquette, qui gigotent comme s'ils allaient tomber ;
 *   - APRÈS LA RÉPONSE : la pile de bols s'effondre, des « Ha ! » jaillissent,
 *     et un petit tableau montre le comique trouvé — la peau de banane
 *     (geste), les lettres qui se mélangent (mots), les deux masques
 *     échangés (situation), la loupe sur le grand nez (caractère), la même
 *     bulle trois fois (répétition).
 */

const P = 'sc-pourquoi-on-rit';

const EN_TETE = {
  saynete: 'La saynète du jour',
  moliere: 'Chez Molière',
  definition: 'Le dictionnaire du rire',
};

/** L'étagère : la pile de bols qui vacille, l'orange qui roule, la théière qui fume. */
function Etagere({ tombe }) {
  return (
    <svg className={`${P}__etagere${tombe ? ' est-tombee' : ''}`} viewBox="0 0 300 70" aria-hidden="true" focusable="false">
      <rect x="0" y="60" width="300" height="8" rx="2" fill="#8a5a2b" />
      <g className={`${P}__pile`}>
        <path d="M30 60 h44 l-6 -12 h-32 z" fill="#ffd43b" stroke="#b88a0a" />
        <path className={`${P}__bol-2`} d="M33 48 h38 l-5 -11 h-28 z" fill="#3fb6b0" stroke="#1f6d6a" />
        <path className={`${P}__bol-3`} d="M36 37 h32 l-5 -10 h-22 z" fill="#fff" stroke="#3a6fb0" />
        <path className={`${P}__bol-4`} d="M39 27 h26 l-4 -9 h-18 z" fill="#ffd43b" stroke="#b88a0a" />
      </g>
      <circle className={`${P}__orange`} cx="130" cy="51" r="9" fill="#ff9a1f" stroke="#c96a00" />
      <g transform="translate(220 22)">
        <path d="M0 38 q-4 -30 26 -30 q30 0 26 30 z" fill="#f4f7fb" stroke="#3a6fb0" strokeWidth="1.5" />
        <path d="M52 22 q14 -2 16 -12" stroke="#3a6fb0" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M2 18 q-10 0 -8 12" stroke="#3a6fb0" strokeWidth="3" fill="none" />
        <circle cx="26" cy="6" r="4" fill="#3a6fb0" />
        <path className={`${P}__vapeur`} d="M70 4 q-4 -6 0 -12 q4 -6 0 -12" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Le petit tableau du comique trouvé. */
function Tableau({ comique }) {
  if (comique === 'geste') {
    return (
      <svg className={`${P}__tableau`} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
        <path d="M70 62 q8 -10 18 -2 q-8 2 -10 6 z" fill="#ffd43b" stroke="#b88a0a" />
        <g className={`${P}__glisse`}>
          <circle cx="50" cy="22" r="7" fill="#3a2410" />
          <path d="M50 29 v18 M50 34 l-12 6 M50 34 l12 -4 M50 47 l-10 12 M50 47 l14 8" stroke="#3a2410" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  if (comique === 'mots') {
    return (
      <svg className={`${P}__tableau`} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
        <rect x="8" y="10" width="104" height="40" rx="16" fill="#fff" stroke="#3a2410" strokeWidth="2" />
        <path d="M30 50 l-6 12 l16 -12" fill="#fff" stroke="#3a2410" strokeWidth="2" />
        {['A', 'b', 'C', '?!'].map((l, i) => (
          <text key={l} className={`${P}__lettre`} style={{ '--n': i }} x={26 + i * 22} y="38" textAnchor="middle" fontSize="20" fontWeight="900" fill={['#e0335e', '#2a7fd4', '#17a868', '#f0a019'][i]}>{l}</text>
        ))}
      </svg>
    );
  }
  if (comique === 'situation') {
    return (
      <svg className={`${P}__tableau`} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
        <g className={`${P}__masque-a`}>
          <ellipse cx="34" cy="34" rx="18" ry="22" fill="#ffd43b" stroke="#b88a0a" strokeWidth="2" />
          <path d="M24 40 q10 10 20 0" stroke="#3a2410" strokeWidth="3" fill="none" />
        </g>
        <g className={`${P}__masque-b`}>
          <ellipse cx="86" cy="34" rx="18" ry="22" fill="#3fb6b0" stroke="#1f6d6a" strokeWidth="2" />
          <path d="M76 44 q10 -8 20 0" stroke="#3a2410" strokeWidth="3" fill="none" />
        </g>
        <path d="M50 14 q10 -8 20 0 l-4 -6 M70 14 l-6 1" stroke="#e0335e" strokeWidth="2.5" fill="none" />
        <path d="M70 58 q-10 8 -20 0 l4 6 M50 58 l6 -1" stroke="#e0335e" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }
  if (comique === 'caractere') {
    return (
      <svg className={`${P}__tableau`} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
        <circle cx="50" cy="36" r="24" fill="#ffdcb8" stroke="#a5532c" strokeWidth="2" />
        <circle cx="42" cy="30" r="3" fill="#3a2410" />
        <circle cx="58" cy="30" r="3" fill="#3a2410" />
        <ellipse className={`${P}__nez`} cx="50" cy="42" rx="7" ry="6" fill="#ff8f70" />
        <g className={`${P}__loupe`}>
          <circle cx="86" cy="30" r="14" fill="rgba(200, 235, 255, 0.5)" stroke="#3a2410" strokeWidth="4" />
          <path d="M96 40 l14 14" stroke="#8a5a2b" strokeWidth="6" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  return (
    <svg className={`${P}__tableau`} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((i) => (
        <g key={i} className={`${P}__echo`} style={{ '--n': i }}>
          <rect x={6 + i * 38} y={14 + (i % 2) * 14} width="32" height="20" rx="9" fill="#fff" stroke="#3a2410" strokeWidth="2" />
          <text x={22 + i * 38} y={29 + (i % 2) * 14} textAnchor="middle" fontSize="13" fontWeight="900" fill="#e0335e">!!</text>
        </g>
      ))}
    </svg>
  );
}

/** Après : les bols tombent, et le comique trouvé se montre. */
function Explication({ m }) {
  const comique = COMIQUES[m.bonne] ? m.bonne : null;
  const regle = PHRASES[premierPiege(m)] ?? PHRASES['comique-regle'];
  return (
    <div className={`${P}__explication`} role="status">
      <span className={`${P}__rires`} aria-hidden="true">
        {['Ha !', 'Hi hi !', 'Ha ha !'].map((r, i) => <span key={r} style={{ '--n': i }}>{r}</span>)}
      </span>
      <div className={`${P}__verdict`}>
        {comique && <Tableau comique={comique} />}
        <strong>{COMIQUES[m.bonne] ?? m.bonne}</strong>
      </div>
      {regle && <p className={`${P}__regle`}>{regle}</p>}
    </div>
  );
}

export function QuestionRire({ m, termine }) {
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Etagere tombe={termine} />
      <div className={`${P}__mur`}>
        <div className={`${P}__fiche`}>
          <span className={`${P}__punaise`} aria-hidden="true" />
          <span className={`${P}__entete`} aria-hidden="true">{EN_TETE[m.consigne] ?? 'La scène'}</span>
          <p className={`${P}__texte`}>{designer(m.question)}</p>
        </div>
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** Le couvercle d'un bocal d'épices, et son col de verre (le verre, c'est le libellé dessous). */
function Couvercle({ i }) {
  const tissu = ['#c0392b', '#2a7fd4', '#17a868', '#f0a019'][i % 4];
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" width="100%" height="26" focusable="false">
      <path d="M10 14 Q50 -2 90 14 Z" fill={tissu} />
      <rect x="8" y="11" width="84" height="7" rx="2" fill={tissu} stroke="rgba(0, 0, 0, 0.3)" />
      <path d="M12 18 h76" stroke="#fff" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x="14" y="18" width="72" height="8" fill="rgba(220, 245, 255, 0.9)" stroke="#5a8aa8" />
    </svg>
  );
}

export function ChoixBocaux({ m, choix, fautes, choisir }) {
  return (
    <div className={`${P}__placard`}>
      <BoutonsReponses
        prefixe={P}
        m={m}
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        dessin={({ i }) => <Couvercle i={i} />}
      />
      <span className={`${P}__planche`} aria-hidden="true" />
    </div>
  );
}

const scene = {
  question: (m, termine) => <QuestionRire m={m} termine={termine} />,
  // Le tableau du comique le nomme déjà.
  apres: () => null,
  choix: (props) => <ChoixBocaux {...props} />,
};

export default scene;
