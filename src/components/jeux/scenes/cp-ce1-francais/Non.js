import { Fragment } from 'react';
import { Cligne, Decor, Mascotte } from './communs';

/**
 * LA PHRASE QUI DIT NON, SON UNIVERS (09/10/2026). La couverture : un chemin
 * de village fleuri, une lanterne, des poteaux indicateurs, un garçon qui
 * tend la main et brandit un panneau rouge « NON », des bulles de paroles où
 * « ne » et « pas » sont écrits en rouge, et un chat roux qui somnole sur la
 * barrière. La scène reprend :
 *   - LE DÉCOR : la lanterne qui vacille, des nuages qui passent, des
 *     papillons, des fleurs qui se balancent ;
 *   - LA PHRASE devient une bulle de parole ; une fois écrite, « ne » et
 *     « pas » s'y allument en rouge, comme sur la couverture ;
 *   - LA MASCOTTE : le chat roux — la queue qui bat, les yeux qui clignent ;
 *     à la bonne phrase, il lève le panneau rouge et secoue la tête (« non ! »,
 *     joyeusement) ; après une erreur, il penche la tête ;
 *   - LA FÊTE : une pluie de pétales (voir `PhraseQuiDitNon.js`).
 */

const PAPILLONS = [[12, 30, 0, '#ffd23f'], [84, 22, 3, '#ff8fb1'], [70, 64, 6, '#8fd3ff']];
const FLEURS = [[3, 0], [9, 0.8], [15, 1.6], [86, 0.4], [92, 1.2], [97, 2]];

function Papillon({ couleur }) {
  return (
    <svg viewBox="0 0 40 30" focusable="false">
      <g className="sc-phrase-qui-dit-non__aile">
        <path d="M20 15 Q6 0 3 9 Q2 18 20 15 Q6 26 10 28 Q16 28 20 15" fill={couleur} stroke="#5b3a1a" strokeWidth="1.2" />
      </g>
      <g className="sc-phrase-qui-dit-non__aile sc-phrase-qui-dit-non__aile--d">
        <path d="M20 15 Q34 0 37 9 Q38 18 20 15 Q34 26 30 28 Q24 28 20 15" fill={couleur} stroke="#5b3a1a" strokeWidth="1.2" />
      </g>
      <path d="M20 8 V22" stroke="#3b2412" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Fleur() {
  return (
    <svg viewBox="0 0 30 60" focusable="false">
      <path d="M15 60 Q13 40 15 22" stroke="#4c8a35" strokeWidth="3" fill="none" />
      <path d="M15 44 Q6 38 4 44 Q10 48 15 44" fill="#6cb04a" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="15" cy="12" rx="5" ry="8" transform={`rotate(${a} 15 18)`} fill="#fff" stroke="#e2d6c4" strokeWidth="1" />
      ))}
      <circle cx="15" cy="18" r="4.5" fill="#f7c51e" />
    </svg>
  );
}

/** Le chemin du village, derrière la bulle. */
export function DecorVillage() {
  return (
    <Decor className="sc-phrase-qui-dit-non__decor">
      <span className="sc-phrase-qui-dit-non__nuage sc-phrase-qui-dit-non__nuage--a" />
      <span className="sc-phrase-qui-dit-non__nuage sc-phrase-qui-dit-non__nuage--b" />
      <span className="sc-phrase-qui-dit-non__halo" />
      {PAPILLONS.map(([x, y, delai, couleur]) => (
        <span key={x} className="sc-phrase-qui-dit-non__papillon" style={{ '--x': `${x}%`, '--y': `${y}%`, '--delai': `${-delai}s` }}>
          <Papillon couleur={couleur} />
        </span>
      ))}
      {FLEURS.map(([x, delai]) => (
        <span key={x} className="sc-phrase-qui-dit-non__fleur" style={{ '--x': `${x}%`, '--delai': `${-delai}s` }}>
          <Fleur />
        </span>
      ))}
    </Decor>
  );
}

/**
 * LA PHRASE NÉGATIVE, « ne » et « pas » en rouge : le texte reste le même
 * (« Il n’aime pas les épinards. »), seuls ces deux mots sont habillés.
 */
export function PhraseQuiDitNonEcrite({ texte }) {
  // Mot par mot (pas de \b : « dîne » finirait par un « ne » rouge).
  const morceaux = String(texte ?? '').split(/([\p{L}’'-]+)/u);
  const rouge = (t, k) => <strong key={k} className="sc-phrase-qui-dit-non__rouge">{t}</strong>;
  return morceaux.map((m, i) => {
    // Les morceaux d'une phrase peuvent se répéter : la place est l'identité.
    /* eslint-disable react/no-array-index-key */
    if (m === 'ne' || m === 'pas') return rouge(m, i);
    const elision = /^n[’']/u.exec(m);
    if (elision && m.length > 2) {
      return (
        <Fragment key={i}>
          {rouge(elision[0], 'n')}
          {m.slice(2)}
        </Fragment>
      );
    }
    return <Fragment key={i}>{m}</Fragment>;
    /* eslint-enable react/no-array-index-key */
  });
}

/** Le chat roux de la barrière, et le panneau qu'il lève quand la phrase dit non. */
export function Chat({ humeur, declic }) {
  return (
    <Mascotte nom="chat" humeur={humeur} declic={declic}>
      <svg className="sc-phrase-qui-dit-non__chat" viewBox="0 0 140 130" focusable="false">
        <g className="sc-phrase-qui-dit-non__panneau">
          <path d="M22 60 V126" stroke="#7a4a22" strokeWidth="6" strokeLinecap="round" />
          <path d="M10 8 H34 L46 20 V44 L34 56 H10 L-2 44 V20 Z" fill="#e5383b" stroke="#fff" strokeWidth="3.5" transform="translate(0 4)" />
          <text x="22" y="40" textAnchor="middle" className="sc-phrase-qui-dit-non__non">NON</text>
        </g>
        <path className="sc-phrase-qui-dit-non__queue" d="M110 112 Q136 104 128 78 Q124 66 132 58" fill="none" stroke="#e8893a" strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="86" cy="100" rx="30" ry="26" fill="#f29c4c" stroke="#a85a1c" strokeWidth="3" />
        <ellipse cx="86" cy="108" rx="16" ry="16" fill="#fff4e6" />
        <path d="M66 86 Q72 80 76 88 M98 84 Q104 80 106 88" stroke="#c96c25" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="72" cy="124" rx="10" ry="6" fill="#fff4e6" stroke="#a85a1c" strokeWidth="2" />
        <ellipse cx="100" cy="124" rx="10" ry="6" fill="#fff4e6" stroke="#a85a1c" strokeWidth="2" />
        <g className="sc-phrase-qui-dit-non__tete">
          <path d="M60 30 L64 4 L80 22 Z" fill="#f29c4c" stroke="#a85a1c" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M112 30 L108 4 L92 22 Z" fill="#f29c4c" stroke="#a85a1c" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M64 24 L66 12 L74 21 Z M108 24 L106 12 L98 21 Z" fill="#ffb3c0" />
          <circle cx="86" cy="44" r="28" fill="#f29c4c" stroke="#a85a1c" strokeWidth="3" />
          <path d="M80 18 L86 30 L92 18" stroke="#c96c25" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="86" cy="56" rx="14" ry="10" fill="#fff4e6" />
          <Cligne decalage={1.3}>
            <ellipse cx="74" cy="42" rx="4.5" ry="6" fill="#3c6b1e" />
            <ellipse cx="98" cy="42" rx="4.5" ry="6" fill="#3c6b1e" />
            <ellipse cx="74" cy="43" rx="1.8" ry="4.5" fill="#111" />
            <ellipse cx="98" cy="43" rx="1.8" ry="4.5" fill="#111" />
          </Cligne>
          <path d="M83 52 L89 52 L86 56 Z" fill="#e86a86" />
          <path className="sc-cp-ce1-francais__sourire" d="M80 58 Q83 62 86 58 Q89 62 92 58" fill="none" stroke="#5b2e0e" strokeWidth="2" strokeLinecap="round" />
          <path className="sc-cp-ce1-francais__bouche" d="M80 58 Q86 70 92 58 Z" fill="#c2334f" stroke="#5b2e0e" strokeWidth="1.8" />
          <path d="M60 54 H44 M60 58 L46 62 M112 54 H128 M112 58 L126 62" stroke="#5b2e0e" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </svg>
    </Mascotte>
  );
}
