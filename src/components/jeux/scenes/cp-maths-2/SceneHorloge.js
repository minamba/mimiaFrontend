import Enfant from './Enfant';
import { ETOILE, Gerbe } from './communs';
import './cp-maths-2.css';

/**
 * L'HORLOGE — l'univers de la couverture (09/10/2026).
 *
 * La couverture : une fillette au sweat rose et à la queue de cheval montre
 * du doigt une grande horloge bleue, dans une chambre baignée de soleil, avec
 * un sablier sur le bureau et l'affiche « Le temps passe… » et son réveil.
 * Par-dessus le décor peint : les rayons du soleil respirent, des grains de
 * lumière flottent, et le sablier s'écoule puis se retourne, sans fin — le
 * temps qui passe, sans un seul chiffre.
 *
 * L'HORLOGE DU JEU DEVIENT UN RÉVEIL : deux clochettes et leur marteau sur le
 * dessus du cadran. Elles se taisent pendant qu'on cherche, et SONNENT à la
 * bonne réponse — c'est le réveil qui dit « c'est l'heure ! ».
 *
 * RIEN NE DONNE L'HEURE : ni le sablier, ni les clochettes, ni les éclats de
 * la fête (des étoiles, des notes, de petits réveils sans aiguilles).
 */
const P = 'sc-horloge';

export function DecorHorloge() {
  return (
    <div className={`${P}__decor`} aria-hidden="true">
      <span className={`${P}__rayon ${P}__rayon--1`} />
      <span className={`${P}__rayon ${P}__rayon--2`} />
      <span className={`${P}__rayon ${P}__rayon--3`} />

      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span key={i} className={`${P}__grain ${P}__grain--${i}`} />
      ))}

      {/* LE SABLIER : le haut se vide, le bas se remplit, puis il se retourne. */}
      <svg className={`${P}__sablier`} viewBox="0 0 60 96">
        <g className={`${P}__sablier-tour`}>
          <rect x="4" y="2" width="52" height="9" rx="3" fill="#8a5a2b" />
          <rect x="4" y="85" width="52" height="9" rx="3" fill="#8a5a2b" />
          <path d="M12 11 Q12 40 28 48 Q12 56 12 85 H48 Q48 56 32 48 Q48 40 48 11 Z" fill="#e8f4ff" fillOpacity="0.85" stroke="#9cc3e6" strokeWidth="2" />
          <path className={`${P}__sable-haut`} d="M15 16 H45 Q44 38 30 46 Q16 38 15 16 Z" fill="#f2b632" />
          <path className={`${P}__sable-bas`} d="M14 82 Q16 62 30 56 Q44 62 46 82 Z" fill="#f2b632" />
          <line className={`${P}__sable-filet`} x1="30" y1="48" x2="30" y2="80" stroke="#f2b632" strokeWidth="2" strokeDasharray="3 4" />
        </g>
      </svg>
    </div>
  );
}

/**
 * LES CLOCHETTES DU RÉVEIL, posées au-dessus du cadran (dans `.cadran`).
 * `sonne` : la bonne heure vient d'être trouvée.
 */
export function Clochettes({ sonne }) {
  return (
    <svg className={`${P}__clochettes${sonne ? ` ${P}__clochettes--sonne` : ''}`} viewBox="0 0 200 54" aria-hidden="true">
      <g className={`${P}__ondes`} stroke="#f2b632" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M18 18 Q10 30 18 42" />
        <path d="M8 12 Q-2 30 8 48" />
        <path d="M182 18 Q190 30 182 42" />
        <path d="M192 12 Q202 30 192 48" />
      </g>
      <line x1="100" y1="54" x2="100" y2="30" stroke="#24508f" strokeWidth="5" strokeLinecap="round" />
      <g className={`${P}__marteau`}>
        <line x1="100" y1="30" x2="100" y2="12" stroke="#24508f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="11" r="6" fill="#f2b632" stroke="#b07d0e" strokeWidth="2" />
      </g>
      <g className={`${P}__clochette ${P}__clochette--g`}>
        <path d="M30 50 Q30 14 58 12 Q86 14 86 50 Z" fill="#2f6fd0" stroke="#1d4a91" strokeWidth="3" />
        <path d="M42 40 Q44 22 58 19" stroke="#8fb8f2" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="58" cy="9" r="4.5" fill="#1d4a91" />
      </g>
      <g className={`${P}__clochette ${P}__clochette--d`}>
        <path d="M114 50 Q114 14 142 12 Q170 14 170 50 Z" fill="#2f6fd0" stroke="#1d4a91" strokeWidth="3" />
        <path d="M126 40 Q128 22 142 19" stroke="#8fb8f2" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="142" cy="9" r="4.5" fill="#1d4a91" />
      </g>
    </svg>
  );
}

/**
 * LE DOIGT TENDU VERS L'HORLOGE, comme sur la couverture : dans le
 * prolongement du bras gauche, que le CSS lève vers le cadran.
 */
const DOIGT = (
  <path d="M-1.5 3 L-5.5 12" stroke="#f6d2b4" strokeWidth="4.5" strokeLinecap="round" />
);

export function MascotteHorloge({ humeur }) {
  return (
    <Enfant
      prefixe={P}
      humeur={humeur}
      mainGauche={DOIGT}
      tenue={{
        peau: '#f6d2b4',
        cheveux: '#7a4a2a',
        coiffure: 'queue',
        haut: '#f48fb1',
        hautClair: '#f8b7cd',
        bas: '#5a6f9e',
        chaussures: '#f4f4f4',
        accent: '#ff7eb3',
      }}
    />
  );
}

/** Une note de musique : le réveil chante. */
const NOTE = (
  <g fill="#7b5cd6">
    <ellipse cx="13" cy="30" rx="7" ry="5.5" transform="rotate(-20 13 30)" />
    <rect x="18" y="6" width="3.5" height="24" />
    <path d="M18 6 Q30 8 32 18 Q26 12 21.5 13 Z" />
  </g>
);

/** Un petit réveil SANS AIGUILLES : il fête, il ne dit pas d'heure. */
const REVEIL = (
  <g>
    <circle cx="20" cy="22" r="13" fill="#fffdf7" stroke="#2f6fd0" strokeWidth="4" />
    <circle cx="9" cy="8" r="5" fill="#2f6fd0" />
    <circle cx="31" cy="8" r="5" fill="#2f6fd0" />
    <circle cx="20" cy="22" r="2.5" fill="#2f6fd0" />
  </g>
);

const MOTIFS = [ETOILE(), NOTE, REVEIL, ETOILE('#ff8fb8', '#e0558a'), NOTE];

export function FeteHorloge() {
  return <Gerbe prefixe={P} motifs={MOTIFS} />;
}
