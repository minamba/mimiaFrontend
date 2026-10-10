import { Cligne, Decor, Mascotte } from './communs';

/**
 * FÉMININ ET PLURIEL (« un ou des ? » au CE2), SON UNIVERS (09/10/2026). La
 * couverture : un tableau noir sous une tonnelle fleurie, une lanterne
 * accrochée à la poutre, des fleurs roses qui grimpent, des cœurs dessinés à
 * la craie, « une fleur » d'un côté et « des fleurs » de l'autre, un pot de
 * craies au cœur rose posé sur la table, un village et ses montagnes au loin.
 * La scène reprend :
 *   - LE DÉCOR : la poutre et ses guirlandes de fleurs qui se balancent, la
 *     lanterne qui oscille, des pétales qui tombent, le village au loin, la
 *     table et ses craies ;
 *   - LE GROUPE (le départ et l'étiquette) s'écrit sur LE TABLEAU, à la craie ;
 *   - LA MASCOTTE : Fleurette, la fleur du pot au cœur — elle se balance,
 *     cligne des yeux ; à la bonne étiquette, elle saute et, au pluriel, DEUX
 *     SŒURS POUSSENT à côté d'elle (une fleur → des fleurs) ; au féminin, un
 *     NŒUD ROSE se pose sur sa tête. Après une erreur, elle penche la tête ;
 *   - APRÈS LA RÉPONSE : le tableau montre ce qui a changé, mot par mot — la
 *     fin effacée du mot de départ, la nouvelle fin écrite en craie de
 *     couleur (« cheva̶l̶ → chevaux ») ;
 *   - LA FÊTE : des cœurs et des pétales (voir `AccordsCE2.js`).
 */

const CLE = 'sc-un-ou-des-ce2';

const PETALES = [[6, 0, 9], [19, 3.5, 11], [33, 6, 10], [58, 1.8, 12], [71, 5, 9.5], [86, 2.6, 10.5], [95, 7.2, 11.5]];
const FLEURS_VIGNE = [[40, 18], [110, 26], [180, 14], [255, 30], [330, 16], [405, 24], [480, 12], [555, 28]];

/** Une fleur de la vigne : cinq pétales roses et un cœur jaune. */
function FleurRose({ x, y, r = 9 }) {
  return (
    <g className={`${CLE}__fleur-vigne`} style={{ transformOrigin: `${x}px ${y}px` }}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={x} cy={y - r * 0.7} rx={r * 0.55} ry={r * 0.75} transform={`rotate(${a} ${x} ${y})`} fill="#ff9cc2" stroke="#e0679a" strokeWidth="0.8" />
      ))}
      <circle cx={x} cy={y} r={r * 0.4} fill="#ffd84d" />
    </g>
  );
}

/** La poutre de la tonnelle et sa vigne fleurie, qui se balance doucement. */
function Vigne() {
  return (
    <svg className={`${CLE}__vigne`} viewBox="0 0 600 60" preserveAspectRatio="none" focusable="false">
      <path d="M0 10 Q75 40 150 14 T300 16 T450 12 T600 18" fill="none" stroke="#4c8a35" strokeWidth="3" />
      {[30, 70, 95, 140, 205, 230, 290, 350, 372, 430, 470, 520, 575].map((x, i) => (
        <ellipse key={x} cx={x} cy={18 + (i % 3) * 6} rx="9" ry="5" transform={`rotate(${(i % 2 ? 1 : -1) * 30} ${x} ${18 + (i % 3) * 6})`} fill={i % 2 ? '#6cb04a' : '#4f9a3a'} />
      ))}
      {FLEURS_VIGNE.map(([x, y]) => <FleurRose key={x} x={x} y={y} />)}
    </svg>
  );
}

/** Le village au bord du lac, au loin : les montagnes et le clocher. */
function Village() {
  return (
    <svg className={`${CLE}__village`} viewBox="0 0 200 110" focusable="false">
      <path d="M0 80 L40 30 L62 52 L92 14 L130 64 L150 48 L200 86 V110 H0 Z" fill="#9db7d6" />
      <path d="M86 22 L92 14 L99 24 Z" fill="#fff" />
      <rect x="0" y="86" width="200" height="24" fill="#7fb6e0" />
      <rect x="70" y="58" width="12" height="30" fill="#e9d8c4" />
      <path d="M68 58 L76 38 L84 58 Z" fill="#3f6b4a" />
      <rect x="40" y="70" width="22" height="18" fill="#f2e3d0" />
      <path d="M38 71 L51 60 L64 71 Z" fill="#d1654a" />
      <rect x="88" y="72" width="26" height="16" fill="#f2e3d0" />
      <path d="M86 73 L101 62 L116 73 Z" fill="#c95a43" />
    </svg>
  );
}

/** La lanterne accrochée à la poutre : elle oscille, sa flamme danse. */
function Lanterne() {
  return (
    <span className={`${CLE}__lanterne`}>
      <svg viewBox="0 0 50 90" focusable="false">
        <path d="M25 0 V14" stroke="#4a3a28" strokeWidth="2.5" />
        <path d="M13 18 H37 L33 12 H17 Z" fill="#2f2f2f" />
        <rect x="12" y="18" width="26" height="38" rx="4" fill="#ffe6a3" stroke="#2f2f2f" strokeWidth="2.5" />
        <path className={`${CLE}__flamme`} d="M25 28c4.5 5 5.5 9 2.7 12.5-1.4 1.8-4 1.8-5.4 0-2.7-3.5-1.8-7.5 2.7-12.5z" fill="#ff9f1c" />
        <path d="M10 56 H40 L35 64 H15 Z" fill="#2f2f2f" />
      </svg>
      <span className={`${CLE}__halo`} />
    </span>
  );
}

/** Une craie de la table. */
function Craie({ couleur, x, angle }) {
  return <span className={`${CLE}__craie`} style={{ '--x': `${x}%`, '--angle': `${angle}deg`, '--couleur': couleur }} />;
}

/** La tonnelle fleurie, derrière le tableau. `fete` : les fleurs s'ouvrent, la lanterne brille. */
export function DecorTonnelle({ fete = false }) {
  return (
    <Decor className={`${CLE}__decor${fete ? ' est-fete' : ''}`}>
      <span className={`${CLE}__poutre`} />
      <Vigne />
      <Village />
      <Lanterne />
      {PETALES.map(([x, delai, duree]) => (
        <span key={x} className={`${CLE}__petale`} style={{ '--x': `${x}%`, '--delai': `${-delai}s`, '--duree': `${duree}s` }} />
      ))}
      <span className={`${CLE}__table`} />
      <Craie couleur="#ff8fb8" x={6} angle={-8} />
      <Craie couleur="#c9a7ff" x={12} angle={12} />
      <Craie couleur="#fff" x={18} angle={-4} />
    </Decor>
  );
}

/** Les dessins à la craie du tableau : des cœurs et des traits d'éclat, comme sur la couverture. */
export function DessinsDeCraie() {
  return (
    <span className={`${CLE}__dessins`} aria-hidden="true">
      <span className={`${CLE}__coeur-craie ${CLE}__coeur-craie--a`} />
      <span className={`${CLE}__coeur-craie ${CLE}__coeur-craie--b`} />
      <span className={`${CLE}__coeur-craie ${CLE}__coeur-craie--c`} />
      <span className={`${CLE}__trait ${CLE}__trait--a`} />
      <span className={`${CLE}__trait ${CLE}__trait--b`} />
    </span>
  );
}

/**
 * CE QUI CHANGE D'UN MOT À L'AUTRE : la racine commune, la fin qui s'efface,
 * la fin qui s'écrit. « cheval » → « chevaux » : chev-a, « l » ôté, « ux »
 * ajouté. Un mot qui ne change pas (« souris ») n'ôte et n'ajoute rien.
 */
export function changement(avant, apres) {
  const a = String(avant ?? '');
  const b = String(apres ?? '');
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return { racine: b.slice(0, i), ote: a.slice(i), ajoute: b.slice(i) };
}

/**
 * LES TROIS PAIRES DU GROUPE : le déterminant, le nom, l'adjectif, du départ
 * à l'arrivée. Un départ qui n'aurait pas trois mots : pas d'explication
 * (jamais d'erreur), l'étiquette juste suffit.
 */
export function pairesDu(g) {
  const depart = String(g?.depart ?? '').trim().split(/\s+/);
  if (depart.length !== 3 || !g.det || !g.nom || !g.adj) return [];
  return [[depart[0], g.det], [depart[1], g.nom], [depart[2], g.adj]];
}

/**
 * L'EXPLICATION ANIMÉE, écrite à la craie sous l'étiquette une fois la manche
 * finie : pour chaque mot, la fin qui s'efface et la fin qui s'écrit, en rose
 * au féminin, en violet au pluriel. Un mot qui ne bouge pas garde son « = ».
 */
export function ExplicationAccord({ g }) {
  const paires = pairesDu(g);
  if (!paires.length) return null;
  return (
    <p className={`${CLE}__explication`}>
      {paires.map(([avant, apres], i) => {
        const c = changement(avant, apres);
        const pareil = avant === apres;
        return (
          // Les trois paires sont dans un ordre fixe : la place est l'identité.
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${CLE}__paire${pareil ? ' est-pareil' : ''}`} style={{ '--i': i }}>
            <span className={`${CLE}__avant`}>
              {c.racine}
              {c.ote && <s className={`${CLE}__ote`}>{c.ote}</s>}
            </span>
            <span className={`${CLE}__vers`} aria-hidden="true">{pareil ? '=' : '→'}</span>
            <span className={`${CLE}__apres`}>
              {c.racine}
              {c.ajoute && <b className={`${CLE}__ajoute`}>{c.ajoute}</b>}
            </span>
          </span>
        );
      })}
    </p>
  );
}

/** Une petite fleur-sœur, cachée tant que le pluriel n'est pas réussi. */
function Soeur({ x, couleur, cote }) {
  return (
    <g className={`${CLE}__soeur ${CLE}__soeur--${cote}`} style={{ transformOrigin: `${x}px 118px` }}>
      <path d={`M${x} 118 Q${x + (cote === 'g' ? 6 : -6)} 96 ${x} 78`} stroke="#4c8a35" strokeWidth="4" fill="none" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={x} cy={66} rx="6" ry="9" transform={`rotate(${a} ${x} 76)`} fill={couleur} stroke="#c2477c" strokeWidth="1" />
      ))}
      <circle cx={x} cy="76" r="7" fill="#ffd84d" />
      <circle cx={x - 2.5} cy="75" r="1.4" fill="#3b2412" />
      <circle cx={x + 2.5} cy="75" r="1.4" fill="#3b2412" />
      <path d={`M${x - 2.5} 79 Q${x} 81 ${x + 2.5} 79`} stroke="#3b2412" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

/**
 * FLEURETTE, la fleur du pot au cœur. `sens` : au pluriel, ses deux sœurs
 * poussent à la réussite ; au féminin, un nœud rose se pose sur sa tête.
 */
export function Fleurette({ humeur, declic, sens }) {
  return (
    <Mascotte nom="fleurette" humeur={humeur} declic={declic} className={`${CLE}__fleurette`} data-sens={sens}>
      <svg viewBox="0 0 140 170" focusable="false">
        <Soeur x={30} couleur="#c9a7ff" cote="g" />
        <Soeur x={110} couleur="#ffb0cf" cote="d" />
        <path d="M70 124 Q62 100 70 74" stroke="#4c8a35" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path className={`${CLE}__feuille`} d="M68 104 Q48 92 42 102 Q54 112 68 104" fill="#6cb04a" stroke="#3f7a2b" strokeWidth="1.5" />
        <path className={`${CLE}__feuille ${CLE}__feuille--d`} d="M70 94 Q90 82 98 92 Q86 102 70 94" fill="#6cb04a" stroke="#3f7a2b" strokeWidth="1.5" />
        <g className={`${CLE}__tete`}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="70" cy="28" rx="13" ry="19" transform={`rotate(${a} 70 48)`} fill="#ff8fb8" stroke="#d6578f" strokeWidth="2" />
          ))}
          <circle cx="70" cy="48" r="19" fill="#ffd84d" stroke="#e0a91c" strokeWidth="2" />
          <Cligne decalage={0.7}>
            <ellipse cx="63" cy="45" rx="2.8" ry="3.8" fill="#3b2412" />
            <ellipse cx="77" cy="45" rx="2.8" ry="3.8" fill="#3b2412" />
            <circle cx="64" cy="43.5" r="1" fill="#fff" />
            <circle cx="78" cy="43.5" r="1" fill="#fff" />
          </Cligne>
          <ellipse cx="58" cy="52" rx="3.6" ry="2.2" fill="#ff8fb1" opacity="0.8" />
          <ellipse cx="82" cy="52" rx="3.6" ry="2.2" fill="#ff8fb1" opacity="0.8" />
          <path className="sc-ce2-francais-b__sourire" d="M64 53 Q70 58 76 53" fill="none" stroke="#3b2412" strokeWidth="2" strokeLinecap="round" />
          <path className="sc-ce2-francais-b__bouche" d="M63 52 Q70 63 77 52 Z" fill="#d8455f" stroke="#3b2412" strokeWidth="1.6" />
          <g className={`${CLE}__noeud`} style={{ transformOrigin: '92px 22px' }}>
            <path d="M92 22 L78 12 L80 30 Z M92 22 L106 12 L104 30 Z" fill="#ff5fa2" stroke="#b8326d" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="92" cy="22" r="4.5" fill="#ff86bb" stroke="#b8326d" strokeWidth="1.6" />
          </g>
        </g>
        <path d="M40 122 H100 L92 166 H48 Z" fill="#ff9cc2" stroke="#c2477c" strokeWidth="3" strokeLinejoin="round" />
        <rect x="36" y="116" width="68" height="12" rx="4" fill="#ffb3d0" stroke="#c2477c" strokeWidth="3" />
        {[[50, 138], [88, 140], [56, 156], [84, 157]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#fff" opacity="0.85" />)}
        <path d="M70 158 C60 150 58 143 63 140 C66 138 69 140 70 142 C71 140 74 138 77 140 C82 143 80 150 70 158 Z" fill="#fff" />
      </svg>
    </Mascotte>
  );
}
