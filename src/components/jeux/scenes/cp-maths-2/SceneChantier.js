import Enfant from './Enfant';
import { ETOILE, Gerbe } from './communs';
import './cp-maths-2.css';

/**
 * LE CHANTIER DES FORMES — l'univers de la couverture (09/10/2026).
 *
 * La couverture : un petit chef de chantier au casque jaune tient un cube
 * rouge ; derrière lui, une grue, des plots orange, des nuages. Le décor peint
 * reste au fond ; par-dessus, ce qui vit : les nuages passent, la caisse
 * pend au crochet de la grue et se balance, le gyrophare de la barrière
 * clignote, un peu de poussière se lève du sable.
 *
 * RIEN DANS LE DÉCOR NE MONTRE UNE FORME NOMMÉE : la caisse est une caisse,
 * la barrière une barrière. Le jeu demande de relier un MOT entendu à une
 * forme — un carré peint dans le ciel n'aiderait pas, mais il distrairait.
 *
 * À LA RÉUSSITE, la grue hisse un fanion étoilé sur sa caisse, l'enfant saute
 * en brandissant son cube, et une gerbe de pièces de chantier (des contours,
 * comme les pièces du jeu) jaillit au centre.
 */
const P = 'sc-chantier-des-formes';

export function DecorChantier({ gagne }) {
  return (
    <div className={`${P}__decor`} aria-hidden="true">
      <Nuage classe={`${P}__nuage ${P}__nuage--1`} />
      <Nuage classe={`${P}__nuage ${P}__nuage--2`} />
      <Nuage classe={`${P}__nuage ${P}__nuage--3`} />

      {/* LA GRUE : la caisse pend au crochet et se balance. */}
      <svg className={`${P}__grue`} viewBox="0 0 80 190">
        <g className={`${P}__grue-balancier`}>
          <line x1="40" y1="0" x2="40" y2="120" stroke="#4a4a4a" strokeWidth="2.5" />
          <path d="M40 120 q0 10 -7 10 q-6 0 -6 -6" stroke="#5b5b5b" strokeWidth="4" fill="none" strokeLinecap="round" />
          <line x1="40" y1="124" x2="16" y2="142" stroke="#4a4a4a" strokeWidth="2" />
          <line x1="40" y1="124" x2="64" y2="142" stroke="#4a4a4a" strokeWidth="2" />
          <rect x="10" y="140" width="60" height="40" rx="3" fill="#c98b4a" stroke="#7a4f22" strokeWidth="3" />
          <path d="M10 153 H70 M10 167 H70" stroke="#7a4f22" strokeWidth="2.5" />
          <path d="M14 144 L66 176" stroke="#a96f35" strokeWidth="4" />
          {gagne && (
            <g className={`${P}__fanion`}>
              <line x1="62" y1="140" x2="62" y2="108" stroke="#7a4f22" strokeWidth="2.5" />
              <path d="M62 108 L84 114 L62 121 Z" fill="#e84a3c" />
              <g transform="translate(66 109) scale(0.22)">{ETOILE('#fff3b0', '#fff3b0')}</g>
            </g>
          )}
        </g>
      </svg>

      {/* LA BARRIÈRE ET SON GYROPHARE. */}
      <svg className={`${P}__barriere`} viewBox="0 0 120 90">
        <circle className={`${P}__gyro-halo`} cx="60" cy="16" r="16" fill="#ffb347" />
        <rect x="52" y="8" width="16" height="16" rx="6" fill="#ff9a1f" stroke="#b35c00" strokeWidth="2" />
        <rect x="56" y="22" width="8" height="8" fill="#555" />
        <rect x="6" y="30" width="108" height="20" rx="3" fill="#fff" stroke="#9a2f22" strokeWidth="2.5" />
        <path d="M18 30 L8 50 M38 30 L28 50 M58 30 L48 50 M78 30 L68 50 M98 30 L88 50 M114 34 L108 50" stroke="#e0412f" strokeWidth="9" />
        <path d="M22 50 L12 88 M98 50 L108 88" stroke="#8a5a2b" strokeWidth="6" strokeLinecap="round" />
      </svg>

      <span className={`${P}__poussiere ${P}__poussiere--1`} />
      <span className={`${P}__poussiere ${P}__poussiere--2`} />
      <span className={`${P}__poussiere ${P}__poussiere--3`} />
    </div>
  );
}

function Nuage({ classe }) {
  return (
    <svg className={classe} viewBox="0 0 120 56">
      <path
        d="M18 50 Q2 50 4 38 Q6 26 22 28 Q24 10 44 12 Q58 0 74 12 Q94 6 98 26 Q118 26 116 40 Q114 52 98 50 Z"
        fill="#fff"
        opacity="0.92"
      />
    </svg>
  );
}

/** Le cube rouge de la couverture, tenu à bout de bras. */
const CUBE = (
  <g transform="translate(-2 -14)">
    <path d="M0 4 L12 -2 L24 4 L12 10 Z" fill="#ff6b5a" />
    <path d="M0 4 L12 10 L12 24 L0 18 Z" fill="#e0402e" />
    <path d="M24 4 L12 10 L12 24 L24 18 Z" fill="#c22f20" />
  </g>
);

export function MascotteChantier({ humeur }) {
  return (
    <Enfant
      prefixe={P}
      humeur={humeur}
      main={CUBE}
      tenue={{
        peau: '#f7d5b8',
        cheveux: '#3a2a22',
        coiffure: 'herisse',
        haut: '#3566b5',
        hautClair: '#f4f4f4',
        bas: '#2c4a85',
        chaussures: '#6b4325',
        accessoire: 'casque',
      }}
    />
  );
}

/** Les éclats de la fête : des contours de pièces, aux couleurs du chantier. */
const MOTIFS = [
  ETOILE(),
  <rect key="c" x="8" y="8" width="24" height="24" rx="2" fill="none" stroke="#e84a3c" strokeWidth="5" />,
  <polygon key="t" points="20,5 36,34 4,34" fill="none" stroke="#2fae5a" strokeWidth="5" strokeLinejoin="round" />,
  <circle key="r" cx="20" cy="20" r="13" fill="none" stroke="#2f7fe0" strokeWidth="5" />,
  <rect key="re" x="4" y="12" width="32" height="16" rx="2" fill="none" stroke="#f2a51a" strokeWidth="5" />,
];

export function FeteChantier() {
  return <Gerbe prefixe={P} motifs={MOTIFS} />;
}
