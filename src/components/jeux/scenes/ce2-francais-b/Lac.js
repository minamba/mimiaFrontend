import { Fragment } from 'react';
import { phrase as phraseDe } from '../../../../lib/jeux/phraseQuiDitNon';
import {
  BoutonGlissable, Cligne, Decor, Fete, Mascotte, humeurDe,
} from './communs';

/**
 * TRANSFORME LA PHRASE (« la phrase qui dit non » au CE2), SON UNIVERS
 * (09/10/2026). La couverture : un grand tableau noir au bord d'un lac, des
 * montagnes et un village au clocher au loin, une vigne qui grimpe, une
 * lanterne, « Transforme la phrase ! » écrit en craies de toutes les
 * couleurs, une ampoule dessinée, un nuage de craie « Même phrase, plusieurs
 * possibilités ! », un seau de craies au cœur sur la table, et une pancarte
 * « Les mots changent tout ! ». La scène reprend :
 *   - LE DÉCOR : le ciel, les nuages qui passent, les montagnes, le lac qui
 *     scintille, le clocher, la vigne qui se balance, la lanterne, des
 *     pâquerettes ;
 *   - LA PHRASE s'écrit à la craie sur LE TABLEAU, avec sa forme ; dessous,
 *     une ligne vide attend, la craie clignote ;
 *   - LES RÉPONSES sont les NUAGES DE CRAIE de la couverture : ils flottent
 *     doucement ; on en touche un, ou on le GLISSE sur la ligne vide ;
 *   - APRÈS LA RÉPONSE : la bonne phrase s'écrit à la craie sur la ligne,
 *     et CE QUI A CHANGÉ s'allume en craie de couleur (« ne… pas », « Est-ce
 *     que… ? », « Comme… ! ») — les mots changent tout ;
 *   - LA MASCOTTE : le seau de craies au cœur, posé sur le rebord du tableau
 *     — ses craies se dandinent ; à la réussite elles jaillissent ; après une
 *     erreur, il penche et un cœur flotte ;
 *   - LA FÊTE : une gerbe de bâtons de craie de toutes les couleurs.
 */

const CLE = 'sc-phrase-qui-dit-non-ce2';

const NOMS = { negative: 'négative', interrogative: 'interrogative', exclamative: 'exclamative' };

/** La phrase de départ d'une manche, telle que l'écran l'a toujours écrite. */
export function phraseDeDepart(m) {
  try {
    return phraseDe(m.phrase).mots.join(' ');
  } catch {
    return '';
  }
}

/** La bonne transformation d'une manche (celle qui n'a pas de faute). */
export function bonneTransformation(m) {
  return (m?.choix ?? []).find((c) => !c.faute)?.texte ?? '';
}

const nu = (mot) => String(mot ?? '').toLowerCase().replace(/[.!?,;:]/g, '');

/**
 * CE QUI A CHANGÉ, MORCEAU PAR MORCEAU. Le texte transformé, découpé ; chaque
 * morceau qui n'était pas dans la phrase de départ est `ajout` — « ne »,
 * « pas », « n’ », « Est-ce », « que », « qu’ », « Comme », et le point final
 * s'il a changé. Une phrase qu'on ne sait pas lire reste d'un seul morceau.
 */
export function morceauxTransformes(texte, mots = []) {
  const t = String(texte ?? '');
  const connus = new Set(mots.map(nu).filter(Boolean));
  const pointDeDepart = /([.!?])\s*$/.exec(mots.join(' '))?.[1] ?? '.';
  const morceaux = [];
  t.split(/(\s+)/).forEach((tok) => {
    if (!tok) return;
    if (/^\s+$/.test(tok)) {
      morceaux.push({ t: tok });
      return;
    }
    const [, corps, point] = /^(.*?)([.!?]?)$/u.exec(tok);
    if (corps) {
      const elision = /^(\p{L}+[’'])(.+)$/u.exec(corps);
      if (connus.has(nu(corps))) morceaux.push({ t: corps });
      else if (elision && connus.has(nu(elision[2]))) {
        morceaux.push({ t: elision[1], ajout: true });
        morceaux.push({ t: elision[2] });
      } else morceaux.push({ t: corps, ajout: true });
    }
    if (point) morceaux.push({ t: point, ajout: point !== pointDeDepart, point: true });
  });
  return morceaux.length ? morceaux : [{ t }];
}

/** La bonne phrase, écrite à la craie : ce qui a changé s'allume en couleur. */
export function PhraseALaCraie({ texte, mots }) {
  const morceaux = morceauxTransformes(texte, mots);
  let n = 0;
  return morceaux.map((m, i) => {
    // Les morceaux d'une phrase peuvent se répéter : la place est l'identité.
    /* eslint-disable react/no-array-index-key */
    if (!m.ajout) return <Fragment key={i}>{m.t}</Fragment>;
    n += 1;
    return (
      <strong key={i} className={`${CLE}__ajout${m.point ? ' est-point' : ''}`} style={{ '--n': n }}>
        {m.t}
      </strong>
    );
    /* eslint-enable react/no-array-index-key */
  });
}

function Paquerette({ x, delai }) {
  return (
    <span className={`${CLE}__paquerette`} style={{ '--x': `${x}%`, '--delai': `${-delai}s` }}>
      <svg viewBox="0 0 30 50" focusable="false">
        <path d="M15 50 Q13 34 15 18" stroke="#4c8a35" strokeWidth="3" fill="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx="15" cy="8" rx="3" ry="6" transform={`rotate(${a} 15 14)`} fill="#fff" stroke="#e2d6c4" strokeWidth="0.8" />
        ))}
        <circle cx="15" cy="14" r="3.5" fill="#f7c51e" />
      </svg>
    </span>
  );
}

const FEUILLES = [18, 52, 86, 120, 154, 188, 222, 256, 290];

/** La vigne qui grimpe au bord, comme sur la couverture : une tige, des feuilles, trois fleurs. */
function Vigne({ cote }) {
  return (
    <svg className={`${CLE}__vigne ${CLE}__vigne--${cote}`} viewBox="0 0 40 320" focusable="false">
      <path d="M14 0 Q4 40 14 80 T14 160 T14 240 T14 320" stroke="#4c8a35" strokeWidth="3" fill="none" />
      {FEUILLES.map((y, i) => {
        const s = i % 2 ? 1 : -1;
        const x = 14 + (i % 2 ? 2 : -2);
        return (
          <path
            key={y}
            className={`${CLE}__feuille`}
            style={{ '--n': i }}
            d={`M${x} ${y} Q${x + s * 14} ${y - 12} ${x + s * 22} ${y + 1} Q${x + s * 11} ${y + 11} ${x} ${y} Z`}
            fill={i % 2 ? '#6cb04a' : '#4f9a3a'}
          />
        );
      })}
      {[70, 180, 280].map((y) => (
        <g key={y}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="24" cy={y - 5} rx="3" ry="4.5" transform={`rotate(${a} 24 ${y})`} fill={y === 180 ? '#ffb0cf' : '#fff'} stroke="#e2c6d0" strokeWidth="0.6" />
          ))}
          <circle cx="24" cy={y} r="2.6" fill="#f7c51e" />
        </g>
      ))}
    </svg>
  );
}

/** Le bord du lac, derrière le tableau. */
export function DecorLac({ fete = false }) {
  return (
    <Decor className={`${CLE}__decor${fete ? ' est-fete' : ''}`}>
      <span className={`${CLE}__nuage ${CLE}__nuage--a`} />
      <span className={`${CLE}__nuage ${CLE}__nuage--b`} />
      <svg className={`${CLE}__montagnes`} viewBox="0 0 400 120" preserveAspectRatio="none" focusable="false">
        <path d="M0 120 V70 L50 30 L80 56 L130 8 L180 62 L220 38 L270 74 L320 20 L360 54 L400 40 V120 Z" fill="#a9c1de" />
        <path d="M120 18 L130 8 L141 22 Z M311 30 L320 20 L330 32 Z" fill="#fff" />
        <path d="M0 120 V92 L70 70 L140 96 L210 78 L290 98 L360 80 L400 90 V120 Z" fill="#7fa86a" />
        <rect x="52" y="74" width="9" height="24" fill="#efe2cf" />
        <path d="M50 75 L56.5 58 L63 75 Z" fill="#3f6b4a" />
        <rect x="66" y="84" width="16" height="13" fill="#f4e6d2" />
        <path d="M64 85 L74 77 L84 85 Z" fill="#d1654a" />
      </svg>
      <span className={`${CLE}__lac`}>
        <span className={`${CLE}__reflet`} style={{ '--x': '18%', '--delai': '0s' }} />
        <span className={`${CLE}__reflet`} style={{ '--x': '52%', '--delai': '-1.4s' }} />
        <span className={`${CLE}__reflet`} style={{ '--x': '80%', '--delai': '-2.6s' }} />
      </span>
      <Vigne cote="g" />
      <Vigne cote="d" />
      <span className={`${CLE}__lanterne`}>
        <svg viewBox="0 0 50 80" focusable="false">
          <path d="M25 0 V12" stroke="#4a3a28" strokeWidth="2.5" />
          <path d="M13 16 H37 L33 10 H17 Z" fill="#2f2f2f" />
          <rect x="12" y="16" width="26" height="34" rx="4" fill="#ffe6a3" stroke="#2f2f2f" strokeWidth="2.5" />
          <path className={`${CLE}__flamme`} d="M25 25c4 4.5 5 8 2.5 11-1.3 1.6-3.7 1.6-5 0-2.5-3-1.5-6.5 2.5-11z" fill="#ff9f1c" />
          <path d="M10 50 H40 L35 58 H15 Z" fill="#2f2f2f" />
        </svg>
      </span>
      {[[3, 0], [8, 1], [91, 0.5], [96, 1.5]].map(([x, d]) => <Paquerette key={x} x={x} delai={d} />)}
    </Decor>
  );
}

/** Le seau de craies au cœur, posé sur le rebord du tableau. */
export function SeauDeCraies({ humeur, declic }) {
  return (
    <Mascotte nom="seau" humeur={humeur} declic={declic} className={`${CLE}__seau`}>
      <svg viewBox="0 0 110 120" focusable="false">
        <g className={`${CLE}__craies`}>
          <rect className={`${CLE}__baton`} style={{ '--n': 0 }} x="24" y="14" width="11" height="50" rx="4" fill="#ff8fb8" />
          <rect className={`${CLE}__baton`} style={{ '--n': 1 }} x="38" y="6" width="11" height="56" rx="4" fill="#ffe066" />
          <rect className={`${CLE}__baton`} style={{ '--n': 2 }} x="52" y="12" width="11" height="52" rx="4" fill="#74c0fc" />
          <rect className={`${CLE}__baton`} style={{ '--n': 3 }} x="66" y="4" width="11" height="58" rx="4" fill="#8ce99a" />
          <rect className={`${CLE}__baton`} style={{ '--n': 4 }} x="78" y="16" width="10" height="48" rx="4" fill="#d0bfff" />
        </g>
        <path d="M14 46 H96 L88 114 Q87 118 82 118 H28 Q23 118 22 114 Z" fill="#b8c2cc" stroke="#5f6b76" strokeWidth="3" strokeLinejoin="round" />
        <path d="M14 46 H96" stroke="#e6ebf0" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 60 L22 108 M88 60 L86 108" stroke="#fff" strokeWidth="2" opacity="0.4" />
        <path d="M55 82 C47 76 45 70 49 67 C52 65 54 66 55 69 C56 66 58 65 61 67 C65 70 63 76 55 82 Z" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" transform="translate(-4 -4) scale(1.08)" />
        <Cligne decalage={1.6}>
          <ellipse cx="42" cy="84" rx="4.5" ry="6" fill="#20262c" />
          <ellipse cx="68" cy="84" rx="4.5" ry="6" fill="#20262c" />
          <circle cx="43.5" cy="81.5" r="1.6" fill="#fff" />
          <circle cx="69.5" cy="81.5" r="1.6" fill="#fff" />
        </Cligne>
        <ellipse cx="33" cy="96" rx="5.5" ry="3.2" fill="#ff9aa8" opacity="0.75" />
        <ellipse cx="77" cy="96" rx="5.5" ry="3.2" fill="#ff9aa8" opacity="0.75" />
        <path className="sc-ce2-francais-b__sourire" d="M48 96 Q55 102 62 96" fill="none" stroke="#20262c" strokeWidth="2.4" strokeLinecap="round" />
        <path className="sc-ce2-francais-b__bouche" d="M47 95 Q55 109 63 95 Z" fill="#c2334f" stroke="#20262c" strokeWidth="2" />
      </svg>
    </Mascotte>
  );
}

/** L'humeur du seau, tirée de ce que l'écran sait de la manche. */
export function humeurDuSeau(termine, extra = {}) {
  return humeurDe({
    reussi: Boolean(termine && extra?.trouve),
    montre: Boolean(termine && !extra?.trouve),
    faute: Boolean(!termine && extra?.derniereFaute),
  });
}

/**
 * LA QUESTION : le tableau. La phrase de départ et sa forme (le dessin
 * d'origine, gardé), une flèche de craie, puis la ligne où s'écrira la
 * phrase transformée — vide et clignotante tant que la manche n'est pas finie.
 */
export function TableauTransforme({ m, termine, extra = {} }) {
  const depart = phraseDeDepart(m);
  let mots = [];
  try {
    mots = phraseDe(m.phrase).mots;
  } catch {
    mots = depart.split(' ');
  }
  const bonne = bonneTransformation(m);
  const humeur = humeurDuSeau(termine, extra);
  return (
    <>
      <DecorLac fete={Boolean(termine && extra?.trouve)} />
      <div className={`${CLE}__tableau ${CLE}__tableau--${m.forme}${termine ? ' est-termine' : ''}`}>
        <span className={`${CLE}__gribouillis`} aria-hidden="true">
          <span className={`${CLE}__ampoule`} />
          <span className={`${CLE}__eclats`} />
        </span>
        {/* LE DESSIN D'ORIGINE, gardé : la forme demandée et la phrase qui dit oui. */}
        <p className="non__oui">
          <span className="non__marque">{NOMS[m.forme] ?? m.forme}</span> {depart}
        </p>
        <svg className={`${CLE}__fleche`} viewBox="0 0 60 40" aria-hidden="true" focusable="false">
          <path d="M30 2 Q22 18 30 34 M20 26 L30 36 L40 26" />
        </svg>
        <p className={`${CLE}__ligne${termine ? ' est-ecrite' : ''}`}>
          {termine && bonne ? (
            <span className={`${CLE}__ecrite`}><PhraseALaCraie texte={bonne} mots={mots} /></span>
          ) : (
            <span className={`${CLE}__curseur`} aria-hidden="true" />
          )}
        </p>
        <SeauDeCraies humeur={humeur} declic={extra?.derniereFaute ?? ''} />
        {termine && extra?.trouve && (
          <Fete forme="craie" teintes={['#ff8fb8', '#ffe066', '#74c0fc', '#8ce99a', '#d0bfff', '#ffffff']} />
        )}
      </div>
    </>
  );
}

/**
 * LES RÉPONSES : LES NUAGES DE CRAIE. Chacun flotte doucement à son rythme ;
 * on le touche, ou on le glisse sur la ligne vide du tableau. Un nuage faux
 * reste barré et terni.
 */
export function NuagesDeCraie({ choix, fautes = [], choisir }) {
  return (
    <ul className={`${CLE}__nuages`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <BoutonGlissable
              cible={`.${CLE}__ligne`}
              choisir={() => choisir(cle)}
              disabled={faux}
              className={`${CLE}__nuage-choix ${CLE}__teinte--${i % 3}${faux ? ' est-fausse' : ''}`}
            >
              {libelle}
            </BoutonGlissable>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine, extra) => <TableauTransforme m={m} termine={termine} extra={extra} />,
  choix: ({ choix, fautes, choisir }) => <NuagesDeCraie choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
