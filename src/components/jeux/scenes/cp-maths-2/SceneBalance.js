import Enfant from './Enfant';
import { ETOILE, Gerbe } from './communs';
import './cp-maths-2.css';

/**
 * LA BALANCE — l'univers de la couverture (09/10/2026).
 *
 * La couverture : un garçon au sweat bleu, derrière une balance de laiton,
 * sur l'étal d'un marché de village — un auvent rayé bleu et blanc, des
 * cagettes de pommes, un clocher au loin. Par-dessus le décor peint : le
 * festonné de l'auvent ondule au vent, les nuages passent, un oiseau traverse
 * le ciel, une feuille tombe de l'arbre.
 *
 * L'ENFANT REGARDE LA BALANCE : ses yeux suivent le plateau qui descend. Ce
 * n'est pas un indice — la balance le montre déjà, c'est elle qui répond —,
 * c'est le geste qu'on attend de l'enfant qui joue : regarder où ça penche.
 *
 * À LA RÉUSSITE, il saute en brandissant sa pomme, la balance rebondit
 * d'un petit coup, et une gerbe de pommes et d'étoiles jaillit de l'étal.
 */
const P = 'sc-balance';

export function DecorBalance() {
  return (
    <div className={`${P}__decor`} aria-hidden="true">
      {/* L'AUVENT DE L'ÉTAL, en haut de la scène. */}
      <svg className={`${P}__auvent`} viewBox="0 0 400 34" preserveAspectRatio="none">
        <rect x="0" y="0" width="400" height="18" fill="#fff" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={i * 40} y="0" width="20" height="18" fill="#2f6fd0" />
        ))}
      </svg>
      <svg className={`${P}__feston`} viewBox="0 0 400 20" preserveAspectRatio="none">
        {Array.from({ length: 20 }, (_, i) => (
          <path
            key={i}
            d={`M${i * 20} 0 H${i * 20 + 20} V6 Q${i * 20 + 10} 22 ${i * 20} 6 Z`}
            fill={i % 2 ? '#fff' : '#2f6fd0'}
          />
        ))}
      </svg>

      <svg className={`${P}__nuage ${P}__nuage--1`} viewBox="0 0 120 56">
        <path d="M18 50 Q2 50 4 38 Q6 26 22 28 Q24 10 44 12 Q58 0 74 12 Q94 6 98 26 Q118 26 116 40 Q114 52 98 50 Z" fill="#fff" opacity="0.9" />
      </svg>
      <svg className={`${P}__nuage ${P}__nuage--2`} viewBox="0 0 120 56">
        <path d="M18 50 Q2 50 4 38 Q6 26 22 28 Q24 10 44 12 Q58 0 74 12 Q94 6 98 26 Q118 26 116 40 Q114 52 98 50 Z" fill="#fff" opacity="0.85" />
      </svg>

      {/* L'OISEAU : il traverse le ciel en battant des ailes. */}
      <div className={`${P}__vol`}>
        <svg className={`${P}__oiseau`} viewBox="0 0 40 20">
          <path className={`${P}__aile`} d="M2 10 Q10 0 20 10 Q30 0 38 10" stroke="#2b3550" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <svg className={`${P}__feuille ${P}__feuille--1`} viewBox="0 0 24 24">
        <path d="M4 20 Q2 6 20 4 Q22 18 4 20 Z" fill="#6fbf4a" />
        <path d="M4 20 L16 8" stroke="#3f8a2a" strokeWidth="1.5" />
      </svg>
      <svg className={`${P}__feuille ${P}__feuille--2`} viewBox="0 0 24 24">
        <path d="M4 20 Q2 6 20 4 Q22 18 4 20 Z" fill="#9ccc4a" />
        <path d="M4 20 L16 8" stroke="#5f9a2a" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/** La pomme rouge de l'étal, dans 40 × 40 (pour la fête). */
const POMME = (
  <g>
    <path d="M20 12 C8 6 2 22 10 32 C13 36 17 35 20 34 C23 35 27 36 30 32 C38 22 32 6 20 12 Z" fill="#e0443a" />
    <path d="M20 12 Q21 6 24 3" stroke="#6b4a2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M23 7 Q31 2 34 8 Q28 11 23 7 Z" fill="#4aa34d" />
    <ellipse cx="13" cy="19" rx="2.5" ry="4" fill="#ff8f86" />
  </g>
);

const POMME_VERTE = (
  <g>
    <path d="M20 12 C8 6 2 22 10 32 C13 36 17 35 20 34 C23 35 27 36 30 32 C38 22 32 6 20 12 Z" fill="#8cc63f" />
    <path d="M20 12 Q21 6 24 3" stroke="#6b4a2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <ellipse cx="13" cy="19" rx="2.5" ry="4" fill="#c8ec8a" />
  </g>
);

/** La pomme tenue en main par l'enfant. */
const POMME_EN_MAIN = <g transform="translate(-11 -26) scale(0.58)">{POMME}</g>;

export function MascotteBalance({ humeur, regard }) {
  return (
    <Enfant
      prefixe={P}
      humeur={humeur}
      regard={regard}
      main={POMME_EN_MAIN}
      tenue={{
        peau: '#f6d0b0',
        cheveux: '#2e211a',
        coiffure: 'herisse',
        haut: '#2456b8',
        hautClair: '#3d74d6',
        bas: '#22335c',
        chaussures: '#3a3a3a',
      }}
    />
  );
}

const MOTIFS = [POMME, ETOILE(), POMME_VERTE, POMME, ETOILE('#fff3b0', '#e0b400')];

export function FeteBalance() {
  return <Gerbe prefixe={P} motifs={MOTIFS} />;
}
