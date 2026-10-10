import { enLettres } from '../../../../lib/jeux/nombresEnLettres';
import { enClasses, rangee, useDeroule } from './communs';
import './primaire-maths-a.css';

/**
 * LES GRANDS NOMBRES (CM1 ET CM2) — 09/10/2026. La couverture du CM1 est un
 * observatoire, la nuit : un écran lumineux montre « 1 234 567 890 » et des
 * accolades rangent ses classes (millions, milliers, unités) ; au CM2, les
 * puissances de dix flottent parmi les étoiles. La scène :
 *   - LA QUESTION sur l'écran de l'observatoire, sous un ciel qui scintille
 *     (une étoile filante passe), à côté d'un hibou astronome qui cligne des
 *     yeux. En chiffres, chaque classe a son accolade et son nom — c'est la
 *     méthode du CM1, pas la réponse ; en lettres, les mots « millions » et
 *     « mille » brillent : ce sont eux qui découpent le nombre ;
 *   - LES RÉPONSES : des plaques d'étoiles (`objets: 'sc-grands-nombres'`) ;
 *   - APRÈS LA RÉPONSE : les classes s'allument une à une, chacune avec sa
 *     lecture (« trois millions », « quarante-cinq mille », « deux cents ») ;
 *     pour « lequel est le plus grand ? », on compte les chiffres, on écarte
 *     le plus court, puis on compare chiffre à chiffre depuis la gauche.
 */

const NOMS_DES_CLASSES = ['unités', 'mille', 'millions', 'milliards'];

/** Le hibou astronome : il cligne et penche la tête. */
function Hibou() {
  return (
    <svg className="sc-grands-nombres__hibou" viewBox="0 0 70 80" aria-hidden="true" focusable="false">
      <g className="sc-grands-nombres__tete">
        <path d="M14 18 l4 -14 l9 10 Z M56 18 l-4 -14 l-9 10 Z" fill="#7a5230" />
        <ellipse cx="35" cy="26" rx="23" ry="19" fill="#9b6b3f" stroke="#5a3a1c" strokeWidth="2" />
        <g className="sc-grands-nombres__yeux">
          <circle cx="25" cy="25" r="9" fill="#fff6d8" stroke="#5a3a1c" strokeWidth="1.5" />
          <circle cx="45" cy="25" r="9" fill="#fff6d8" stroke="#5a3a1c" strokeWidth="1.5" />
          <circle cx="26" cy="26" r="4.6" fill="#1b1d3a" />
          <circle cx="46" cy="26" r="4.6" fill="#1b1d3a" />
          <circle cx="27.4" cy="24.4" r="1.5" fill="#fff" />
          <circle cx="47.4" cy="24.4" r="1.5" fill="#fff" />
        </g>
        <path d="M32 33 l3 6 l3 -6 Z" fill="#ffb703" stroke="#a86b00" strokeWidth="1" />
      </g>
      <ellipse cx="35" cy="58" rx="21" ry="19" fill="#9b6b3f" stroke="#5a3a1c" strokeWidth="2" />
      <ellipse cx="35" cy="61" rx="13" ry="13" fill="#e8cfa4" />
      <path d="M28 56 q3 3 6 0 M36 62 q3 3 6 0 M28 66 q3 3 6 0" fill="none" stroke="#b38a5a" strokeWidth="1.5" />
      <path className="sc-grands-nombres__aile" d="M14 50 q-8 14 4 24 q2 -12 4 -20 Z" fill="#7a5230" />
      <path d="M28 76 l-3 4 M32 77 l0 3 M42 76 l3 4 M38 77 l0 3" stroke="#ffb703" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Le ciel de l'observatoire : des étoiles, la lune, une étoile filante, la coupole et sa lunette. */
function Observatoire() {
  const etoiles = [[18, 14], [62, 30], [96, 10], [140, 26], [188, 12], [230, 34], [268, 16], [312, 30], [352, 12], [384, 36], [120, 46], [210, 52]];
  return (
    <svg className="sc-grands-nombres__ciel" viewBox="0 0 400 96" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-grands-nombres-nuit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1440" />
          <stop offset="1" stopColor="#24307a" />
        </linearGradient>
      </defs>
      <rect width="400" height="96" fill="url(#sc-grands-nombres-nuit)" />
      {etoiles.map(([x, y], i) => (
        <circle key={`${x}-${y}`} className="sc-grands-nombres__etoile" cx={x} cy={y} r={i % 3 ? 1.6 : 2.4} fill="#fff" style={{ '--n': i }} />
      ))}
      <circle cx="346" cy="40" r="15" fill="#fff4c2" />
      <circle cx="352" cy="36" r="13" fill="#24307a" opacity="0.9" />
      <line className="sc-grands-nombres__filante" x1="60" y1="10" x2="100" y2="22" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M0 96 q60 -26 120 -8 t140 -4 t140 -10 V96 Z" fill="#141b3f" />
      <g transform="translate(36 52)">
        <g className="sc-grands-nombres__lunette">
          <rect x="16" y="-10" width="40" height="11" rx="4" fill="#c9a86a" stroke="#6d5326" strokeWidth="1.5" />
          <rect x="52" y="-12" width="8" height="15" rx="2" fill="#e3c88d" stroke="#6d5326" strokeWidth="1.5" />
        </g>
        <path d="M-4 44 v-22 a26 26 0 0 1 52 0 v22 Z" fill="#8e9ab8" stroke="#495675" strokeWidth="2" />
        <rect x="18" y="-2" width="8" height="20" fill="#2a3358" />
        <rect x="-8" y="40" width="60" height="6" rx="2" fill="#5d6886" />
      </g>
    </svg>
  );
}

/** Un nombre en chiffres : chaque classe porte son accolade et son nom (dessinés en CSS). */
function EnChiffres({ texte }) {
  const classes = String(texte).split(' ');
  const n = classes.length;
  return (
    <p className="sc-grands-nombres__nombre">
      {classes.map((c, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>
          {i > 0 ? ' ' : ''}
          <span className={`sc-grands-nombres__classe sc-grands-nombres__classe--${n - 1 - i}`} data-classe={NOMS_DES_CLASSES[n - 1 - i] ?? ''}>{c}</span>
        </span>
      ))}
    </p>
  );
}

/** Un nombre en lettres : les mots qui découpent les classes brillent. */
function EnLettres({ texte }) {
  return (
    <p className="sc-grands-nombres__lettres">
      {String(texte).split(/(millions?|mille)/).map((x, i) => (/^(millions?|mille)$/.test(x)
        // eslint-disable-next-line react/no-array-index-key
        ? <span key={i} className={`sc-grands-nombres__mot sc-grands-nombres__mot--${x === 'mille' ? 1 : 2}`}>{x}</span>
        : x))}
    </p>
  );
}

/** LA QUESTION : l'écran lumineux de l'observatoire. */
export function QuestionNombres({ m, termine }) {
  // eslint-disable-next-line no-use-before-define
  if (termine) return <ApresNombres m={m} />;
  const q = String(m.question ?? '');
  let ecran;
  if (/^\d{1,3}( \d{3})*$/.test(q)) ecran = <EnChiffres texte={q} />;
  else if (m.consigne === 'comparer') {
    ecran = (
      <>
        <p className="sc-grands-nombres__titre">{q}</p>
        <p className="sc-grands-nombres__repere" aria-hidden="true">
          <span className="sc-grands-nombres__mot--2">millions</span>
          <span className="sc-grands-nombres__mot--1">mille</span>
          <span className="sc-grands-nombres__mot--0">unités</span>
        </p>
      </>
    );
  } else ecran = <EnLettres texte={q} />;
  return (
    <div className="sc-grands-nombres">
      <Observatoire />
      <div className="sc-grands-nombres__scene">
        <Hibou />
        <div className="sc-grands-nombres__ecran">{ecran}</div>
      </div>
    </div>
  );
}

/**
 * Les classes d'un nombre, de gauche à droite, chacune avec sa lecture —
 * prise dans la lecture entière, pour ne jamais en écrire une autre.
 */
export function classesDe(n) {
  const morceaux = [];
  const millions = Math.floor(n / 1000000);
  const mille = Math.floor(n / 1000) % 1000;
  const unites = n % 1000;
  if (millions > 0) morceaux.push({ nom: 'millions', chiffres: String(millions), dit: `${enLettres(millions)} million${millions > 1 ? 's' : ''}` });
  if (millions > 0 || mille > 0) {
    const dit = mille === 0 ? '' : mille === 1 ? 'mille' : `${enLettres(mille).replace(/cents$/, 'cent').replace(/vingts$/, 'vingt')} mille`;
    morceaux.push({ nom: 'mille', chiffres: millions > 0 ? String(mille).padStart(3, '0') : String(mille), dit });
  }
  morceaux.push({ nom: 'unités', chiffres: n >= 1000 ? String(unites).padStart(3, '0') : String(unites), dit: unites === 0 ? '' : enLettres(unites) });
  return morceaux;
}

function ApresLecture({ m, n }) {
  let classes = null;
  let entier = '';
  try {
    entier = enLettres(n);
    classes = classesDe(n);
    if (classes.map((c) => c.dit).filter(Boolean).join(' ') !== entier) classes = null;
  } catch {
    classes = null;
  }
  const total = classes ? classes.length + 1 : 1;
  const pas = useDeroule(total, 1100, 450);
  return (
    <div className="sc-grands-nombres sc-grands-nombres--apres">
      <Observatoire />
      <div className="sc-grands-nombres__scene">
        <Hibou />
        <div className="sc-grands-nombres__ecran">
          <p className="sc-grands-nombres__rappel">{m.question}</p>
          {classes && (
            <ol className="sc-grands-nombres__tableau" aria-label="Le nombre, classe par classe">
              {classes.map((c, i) => (
                <li key={c.nom} className={`sc-grands-nombres__case sc-grands-nombres__case--${classes.length - 1 - i}${pas > i ? ' est-allumee' : ''}`}>
                  <span className="sc-grands-nombres__nom">{c.nom}</span>
                  <strong>{c.chiffres}</strong>
                  <span className="sc-grands-nombres__dit">{pas > i ? (c.dit || '(rien à dire)') : '…'}</span>
                </li>
              ))}
            </ol>
          )}
          {pas >= total && entier && (
            <p className="sc-grands-nombres__lecture">
              <span>{enClasses(n)}</span>
              <span aria-hidden="true"> ➜ </span>
              <span>{entier}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Pour comparer : on compte les chiffres, puis on compare depuis la gauche. */
function ApresComparaison({ m }) {
  const nombres = m.choix.map((c) => Number(c.cle)).filter((x) => Number.isInteger(x) && x >= 0);
  const pas = useDeroule(3, 1300, 450);
  if (nombres.length < 2) return <ApresSimple m={m} />;
  const longueur = Math.max(...nombres.map((x) => String(x).length));
  const longs = nombres.filter((x) => String(x).length === longueur);
  // Le premier rang (depuis la gauche) où les plus longs diffèrent.
  const differe = (k) => new Set(longs.map((x) => String(x)[k])).size > 1;
  const trouve = rangee(longueur).find(differe);
  const rang = trouve ?? longueur;
  const plusGrand = Math.max(...nombres);
  return (
    <div className="sc-grands-nombres sc-grands-nombres--apres">
      <Observatoire />
      <div className="sc-grands-nombres__scene">
        <Hibou />
        <div className="sc-grands-nombres__ecran">
          <p className="sc-grands-nombres__titre">{m.question}</p>
          <ul className="sc-grands-nombres__lignes" aria-label="Les nombres, rangés par classes">
            {nombres.map((x) => {
              const chiffres = String(x).padStart(longueur, ' ').split('');
              const court = String(x).length < longueur;
              return (
                <li
                  key={x}
                  className={`sc-grands-nombres__ligne${pas >= 1 && court ? ' est-ecarte' : ''}${pas >= 3 && x === plusGrand ? ' est-gagnant' : ''}`}
                >
                  <span className="sc-grands-nombres__chiffres">
                    {chiffres.map((ch, i) => (
                      <span
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        className={`sc-grands-nombres__chiffre${(longueur - i) % 3 === 0 && i > 0 ? ' est-debut-de-classe' : ''}${pas >= 2 && !court && i === rang ? ' est-compare' : ''}`}
                      >
                        {ch === ' ' ? ' ' : ch}
                      </span>
                    ))}
                  </span>
                  <span className="sc-grands-nombres__compte">{pas >= 1 ? `${String(x).length} chiffres` : ''}</span>
                  {pas >= 3 && x === plusGrand && <span className="sc-grands-nombres__couronne" aria-hidden="true">★</span>}
                </li>
              );
            })}
          </ul>
          <p className="sc-grands-nombres__legende">
            {pas >= 3 ? `Le plus grand : ${enClasses(plusGrand)}` : pas >= 2 ? 'Autant de chiffres : on compare depuis la gauche.' : 'D’abord, on compte les chiffres.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ApresSimple({ m }) {
  return (
    <div className="sc-grands-nombres">
      <div className="sc-grands-nombres__scene">
        <div className="sc-grands-nombres__ecran">
          <p className="sc-grands-nombres__rappel">{m.question}</p>
        </div>
      </div>
    </div>
  );
}

/** APRÈS LA RÉPONSE : les classes qui s'allument, ou la comparaison pas à pas. */
export function ApresNombres({ m }) {
  if (m.consigne === 'comparer') return <ApresComparaison m={m} />;
  const n = Number(m.bonne);
  if (Number.isInteger(n) && n >= 0 && n <= 999999999) return <ApresLecture m={m} n={n} />;
  return <ApresSimple m={m} />;
}
