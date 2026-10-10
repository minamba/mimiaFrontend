import {
  euros, fr, rangee, useDeroule,
} from './communs';
import './primaire-maths-a.css';

/**
 * LA RECETTE POUR 8 (CM1) ET PRIX, VITESSE, TABLEAU (CM2) — 09/10/2026. La
 * couverture du CM1 est une cuisine en plein air : un grand saladier, la
 * farine qui tombe en pluie, les œufs, le lait, des citrons, et l'ardoise
 * « Pour 4 → pour 8 ? On multiplie par 2 ! » ; celle du CM2, un circuit :
 * drapeaux à damier, compteur de vitesse, étiquette de prix, tableau lumineux
 * et coupe du vainqueur. La scène :
 *   - AU CM1, LA CUISINE : la recette sur l'ardoise, l'ingrédient dessiné, la
 *     tablée de 4 et la tablée à servir, le fouet qui tourne dans le
 *     saladier, des citrons qui se balancent ;
 *   - AU CM2, LE CIRCUIT : l'étiquette de prix et ses objets, le compteur et
 *     la route, ou le tableau lumineux ; une voiture file au bas de l'écran,
 *     le drapeau à damier ondule ;
 *   - LES RÉPONSES : des bocaux (au CM2, des plaques de course)
 *     (`objets: 'sc-recette-pour-8'`) ; oui ou non : les deux buzzers
 *     communs, qui gardent leur place ;
 *   - APRÈS LA RÉPONSE : les invités se regroupent par 4 (ou par 2), chaque
 *     groupe reçoit sa part, et les parts s'additionnent ; « est-ce
 *     proportionnel ? » se vérifie en doublant ; au CM2, on passe par le prix
 *     d'un seul, la voiture roule heure après heure, les flèches « × k »
 *     traversent le tableau.
 */

/** Ce que dit la question, selon sa sorte ; `null` si on ne la reconnaît pas. */
export function lireRecette(m) {
  const q = String(m?.question ?? '');
  let r = q.match(/^Pour 4 personnes : (\d+) (?:(g|cL) de )?(.+)\. Pour (\d+) personnes \?$/);
  if (r) {
    return {
      sorte: 'recette', pour4: Number(r[1]), unite: r[2] ?? '', nom: r[3], n: Number(r[4]),
    };
  }
  r = q.match(/^(\d+) (\S+) coûtent ([\d,]+) €\. Combien coûtent (\d+) \S+ \?$/);
  if (r) {
    return {
      sorte: 'unite', n1: Number(r[1]), objet: r[2], prix: Number(r[3].replace(',', '.')), n2: Number(r[4]),
    };
  }
  r = q.match(/^Une voiture parcourt (\d+) km en une heure\. En (\d+) h 30, toujours à la même vitesse \?$/);
  if (r) return { sorte: 'vitesse', v: Number(r[1]), h: Number(r[2]) };
  r = q.match(/^(\d+) → (\d+)\s+;\s+(\d+) → (\d+)\s+;\s+(\d+) → \?$/);
  if (r) {
    const [x1, y1, x2, y2, x3] = r.slice(1).map(Number);
    return {
      sorte: 'tableau', x1, y1, x2, y2, x3,
    };
  }
  if (m?.consigne === 'proportionnel') {
    const nombres = (q.match(/\d+(?:,\d+)?/g) ?? []).map((x) => Number(x.replace(',', '.')));
    if (nombres.length === 4 && nombres[0] > 0) return { sorte: 'proportionnel', nombres };
  }
  return null;
}

const auCM2 = (m) => ['unite', 'vitesse', 'tableau'].includes(m?.consigne);

/** « 200 g », « 2 œufs », « 1 œuf ». */
const quantite = (q, { unite, nom }) => (unite ? `${fr(q)} ${unite}` : `${fr(q)} ${q === 1 ? nom.replace(/s$/, '') : nom}`);

/** L'ingrédient de la recette, dessiné. */
function Ingredient({ nom }) {
  let dessin;
  if (/farine/.test(nom)) {
    dessin = (
      <>
        <path d="M14 20 q-4 -10 6 -14 h20 q10 4 6 14 l4 34 q0 6 -6 6 h-28 q-6 0 -6 -6 Z" fill="#f1e3c8" stroke="#a08458" strokeWidth="2" />
        <path d="M20 8 l4 -4 l4 4 l4 -4 l4 4 l4 -4" fill="none" stroke="#a08458" strokeWidth="2" />
        <rect x="18" y="30" width="24" height="12" rx="3" fill="#fff" stroke="#a08458" />
      </>
    );
  } else if (/lait/.test(nom)) {
    dessin = (
      <>
        <path d="M20 8 h20 v10 l6 10 v30 q0 4 -4 4 h-24 q-4 0 -4 -4 v-30 l6 -10 Z" fill="#fff" stroke="#74a6d6" strokeWidth="2" />
        <rect x="18" y="34" width="24" height="14" rx="2" fill="#a5d8ff" />
        <rect x="20" y="4" width="20" height="6" rx="2" fill="#4dabf7" />
      </>
    );
  } else if (/œuf/.test(nom)) {
    dessin = (
      <>
        <ellipse cx="20" cy="40" rx="11" ry="14" fill="#fff3e0" stroke="#c9a27a" strokeWidth="2" />
        <ellipse cx="40" cy="42" rx="11" ry="14" fill="#ffe8cc" stroke="#c9a27a" strokeWidth="2" />
        <ellipse cx="30" cy="24" rx="10" ry="13" fill="#fff9f0" stroke="#c9a27a" strokeWidth="2" />
      </>
    );
  } else if (/sucre/.test(nom)) {
    dessin = (
      <>
        {[[10, 40], [30, 40], [20, 22], [40, 22]].map(([x, y]) => (
          <g key={`${x}.${y}`}>
            <rect x={x} y={y} width="18" height="18" rx="2" fill="#fff" stroke="#adb5bd" strokeWidth="2" />
            <path d={`M${x} ${y} l5 -5 h18 l-5 5 Z`} fill="#f1f3f5" stroke="#adb5bd" strokeWidth="1.5" />
          </g>
        ))}
      </>
    );
  } else {
    dessin = (
      <>
        <rect x="6" y="30" width="48" height="24" rx="4" fill="#ffe066" stroke="#c9a227" strokeWidth="2" />
        <path d="M6 30 l10 -10 h48 l-10 10 Z" fill="#fff3bf" stroke="#c9a227" strokeWidth="2" />
        <rect x="16" y="36" width="28" height="8" rx="2" fill="#fff" opacity="0.6" />
      </>
    );
  }
  return <svg className="sc-recette-pour-8__ingredient" viewBox="0 0 64 64" aria-hidden="true" focusable="false">{dessin}</svg>;
}

/** Une tablée : une assiette par invité. */
function Tablee({ n, etiquette, lumiere = false }) {
  return (
    <span className={`sc-recette-pour-8__tablee${lumiere ? ' est-allumee' : ''}`}>
      <span className="sc-recette-pour-8__assiettes" aria-hidden="true">
        {rangee(n).map((i) => <span key={i} className="sc-recette-pour-8__assiette" style={{ '--n': i }} />)}
      </span>
      {etiquette && <span className="sc-recette-pour-8__etiquette">{etiquette}</span>}
    </span>
  );
}

/** Le saladier et son fouet qui tourne, la farine qui s'envole. */
function Saladier() {
  return (
    <svg className="sc-recette-pour-8__saladier" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      {rangee(4).map((i) => <circle key={i} className="sc-recette-pour-8__nuage" cx={40 + i * 14} cy="26" r={5 + (i % 2) * 2} style={{ '--n': i }} />)}
      <g className="sc-recette-pour-8__fouet">
        <line x1="60" y1="44" x2="84" y2="6" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" />
        <path d="M54 52 q6 -16 12 -8 q-2 10 -12 8 Z M52 50 q12 -10 14 -2" fill="none" stroke="#adb5bd" strokeWidth="2" />
      </g>
      <path d="M8 44 h104 q-6 40 -52 40 q-46 0 -52 -40 Z" fill="#fffaf0" stroke="#2f5aa8" strokeWidth="3" />
      <path d="M12 54 h96 M18 64 h84" stroke="#2f5aa8" strokeWidth="4" />
      <ellipse cx="60" cy="44" rx="52" ry="7" fill="#ffe8a3" stroke="#2f5aa8" strokeWidth="3" />
    </svg>
  );
}

/** Un citron qui se balance au bout de sa branche. */
const Citron = ({ n }) => <span className="sc-recette-pour-8__citron" style={{ '--n': n }} aria-hidden="true" />;

/** La cuisine du CM1 : l'ardoise, les citrons, le plan de travail. */
function Cuisine({ m, children }) {
  return (
    <div className="sc-recette-pour-8 sc-recette-pour-8--cuisine">
      <Citron n={0} />
      <Citron n={1} />
      <p className="sc-recette-pour-8__ardoise">{m.question}</p>
      {children}
    </div>
  );
}

/** Un objet du magasin (CM2) : cahier, stylo, croissant, gomme, ballon. */
function Objet({ nom, n = 0 }) {
  let dessin;
  if (/stylo/.test(nom)) dessin = <><rect x="6" y="14" width="30" height="8" rx="2" fill="#4dabf7" /><path d="M36 14 l8 4 l-8 4 Z" fill="#ffd8a8" /><rect x="2" y="14" width="6" height="8" rx="1" fill="#1c7ed6" /></>;
  else if (/croissant/.test(nom)) dessin = <path d="M4 26 q18 -26 36 0 q-6 -4 -10 -2 q-4 -8 -8 0 q-4 -8 -8 0 q-4 -2 -10 2 Z" fill="#f0a94b" stroke="#a5651c" strokeWidth="1.5" />;
  else if (/gomme/.test(nom)) dessin = <><rect x="6" y="12" width="32" height="16" rx="3" fill="#ff8fab" /><rect x="22" y="12" width="16" height="16" rx="3" fill="#4dabf7" /></>;
  else if (/ballon/.test(nom)) dessin = <><circle cx="22" cy="20" r="14" fill="#fff" stroke="#1b1d3a" strokeWidth="2" /><path d="M22 12 l7 5 l-3 8 h-8 l-3 -8 Z" fill="#1b1d3a" /></>;
  else dessin = <><rect x="8" y="4" width="28" height="34" rx="2" fill="#ffd43b" stroke="#c9a227" strokeWidth="2" /><path d="M8 4 v34" stroke="#e8590c" strokeWidth="5" /><path d="M16 14 h14 M16 20 h14 M16 26 h10" stroke="#c9a227" strokeWidth="1.5" /></>;
  return <svg className="sc-recette-pour-8__objet" viewBox="0 0 44 42" style={{ '--n': n }} aria-hidden="true" focusable="false">{dessin}</svg>;
}

/** Le compteur de vitesse : l'aiguille oscille autour de la vitesse. */
function Compteur({ v }) {
  const angle = -120 + Math.min(Math.max(v, 0), 140) * (240 / 140);
  return (
    <svg className="sc-recette-pour-8__compteur" viewBox="0 0 100 86" aria-hidden="true" focusable="false">
      <path d="M12 66 a40 40 0 1 1 76 0" fill="rgba(10,24,70,0.9)" stroke="#6fd3ff" strokeWidth="4" />
      {rangee(8).map((i) => <line key={i} x1="50" y1="16" x2="50" y2="24" stroke="#bfe6ff" strokeWidth="2" transform={`rotate(${-120 + i * (240 / 7)} 50 54)`} />)}
      <g className="sc-recette-pour-8__aiguille" style={{ '--angle': `${angle}deg` }}>
        <line x1="50" y1="54" x2="50" y2="22" stroke="#ff6b6b" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="54" r="5" fill="#ff6b6b" />
      <text x="50" y="82" className="sc-recette-pour-8__vitesse">{`${v} km/h`}</text>
    </svg>
  );
}

/** La voiture de course. */
function Bolide() {
  return (
    <svg className="sc-recette-pour-8__bolide" viewBox="0 0 70 30" aria-hidden="true" focusable="false">
      <path d="M4 20 L10 12 L24 10 L32 4 L46 4 L54 12 L66 14 L66 21 L4 22 Z" fill="#e63946" stroke="#9b1c27" strokeWidth="1.5" />
      <path d="M30 10 L35 6 L44 6 L49 11 Z" fill="#cfeaf8" />
      <path d="M4 14 h10" stroke="#fff" strokeWidth="2" />
      <circle cx="16" cy="22" r="6" fill="#2c2c36" />
      <circle cx="54" cy="22" r="6" fill="#2c2c36" />
      <circle cx="16" cy="22" r="2.4" fill="#b8bec8" />
      <circle cx="54" cy="22" r="2.4" fill="#b8bec8" />
    </svg>
  );
}

/** Le circuit du CM2 : le drapeau à damier, la route où file la voiture. */
function Circuit({ m, children, panneau = true }) {
  return (
    <div className="sc-recette-pour-8 sc-recette-pour-8--circuit">
      <span className="sc-recette-pour-8__drapeau" aria-hidden="true" />
      {panneau && <p className="sc-recette-pour-8__ecran">{m.question}</p>}
      {children}
      <span className="sc-recette-pour-8__route" aria-hidden="true"><Bolide /></span>
    </div>
  );
}

/** Le tableau de proportionnalité (CM2) : deux lignes, la case qui manque. */
function TableauProportion({ lu, rempli = null, fleches = 0 }) {
  const xs = [lu.x1, lu.x2, lu.x3];
  const ys = [lu.y1, lu.y2, rempli];
  const k = lu.x1 > 0 ? lu.y1 / lu.x1 : null;
  return (
    <table className="sc-recette-pour-8__tableau">
      <tbody>
        <tr>{xs.map((x, i) => <td key={`x${i}`}>{x}</td>)}</tr>
        <tr className="sc-recette-pour-8__fleches" aria-hidden="true">
          {xs.map((x, i) => <td key={`f${x}`}>{i < fleches && k !== null ? `↓ × ${fr(k)}` : ''}</td>)}
        </tr>
        <tr>
          {ys.map((y, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <td key={`y${i}`} className={y === null ? 'est-vide' : i === 2 ? 'est-rempli' : undefined}>{y ?? '?'}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

/** LA QUESTION : la cuisine (CM1) ou le circuit (CM2). */
export function QuestionRecette({ m, termine }) {
  if (termine) return <ApresRecette m={m} />;
  const lu = lireRecette(m);
  if (auCM2(m)) {
    let dessin = null;
    if (lu?.sorte === 'unite') {
      dessin = (
        <div className="sc-recette-pour-8__rayon">
          <span className="sc-recette-pour-8__lot">
            {rangee(lu.n1).map((i) => <Objet key={i} nom={lu.objet} n={i} />)}
            <em>{euros(lu.prix)}</em>
          </span>
          <span className="sc-recette-pour-8__lot">
            {rangee(lu.n2).map((i) => <Objet key={i} nom={lu.objet} n={i} />)}
            <em>?</em>
          </span>
        </div>
      );
    }
    if (lu?.sorte === 'vitesse') dessin = <Compteur v={lu.v} />;
    if (lu?.sorte === 'tableau') dessin = <TableauProportion lu={lu} />;
    return <Circuit m={m}>{dessin}</Circuit>;
  }
  return (
    <Cuisine m={m}>
      <div className="sc-recette-pour-8__plan">
        {lu?.sorte === 'recette' && (
          <>
            <span className="sc-recette-pour-8__recette">
              <Ingredient nom={lu.nom} />
              <Tablee n={4} etiquette={quantite(lu.pour4, lu)} />
            </span>
            <Saladier />
            <Tablee n={lu.n} etiquette="?" />
          </>
        )}
        {lu?.sorte !== 'recette' && <Saladier />}
      </div>
    </Cuisine>
  );
}

/** Après la réponse, la recette : les invités se regroupent, chaque groupe reçoit sa part. */
function ApresRecetteCM1({ m, lu }) {
  const g = lu.n % 4 === 0 ? 4 : 2;
  const groupes = lu.n / g;
  const part = (lu.pour4 * g) / 4;
  const pas = useDeroule(groupes + 1, 900, 500);
  const fini = pas > groupes;
  const legende = fini
    ? `${groupes} × ${quantite(part, lu)} = ${quantite(part * groupes, lu)}`
    : g === 2 ? `Pour 2 personnes, la moitié : ${quantite(part, lu)}.` : `Chaque tablée de 4 reçoit ${quantite(part, lu)}.`;
  return (
    <Cuisine m={m}>
      <div className="sc-recette-pour-8__groupes">
        {rangee(groupes).map((i) => (
          <Tablee key={i} n={g} etiquette={pas > i ? quantite(part, lu) : ''} lumiere={pas > i} />
        ))}
      </div>
      <p className={`sc-recette-pour-8__legende${fini ? ' est-fini' : ''}`}>{legende}</p>
    </Cuisine>
  );
}

/** Après la réponse, « est-ce proportionnel ? » : on double, et on regarde. */
function ApresProportionnel({ m, lu }) {
  const [x1, y1, x2, y2] = lu.nombres;
  const k = x2 / x1;
  const attendu = Math.round(y1 * k * 100) / 100;
  const oui = Math.abs(attendu - y2) < 1e-9;
  const pas = useDeroule(2, 1100, 400);
  return (
    <Cuisine m={m}>
      <div className="sc-recette-pour-8__verif">
        <p className={pas >= 1 ? 'est-ecrit' : 'est-cache'}>{`${fr(x1)} → ${fr(x2)} : × ${fr(k)}`}</p>
        <p className={pas >= 2 ? `est-ecrit ${oui ? 'est-oui' : 'est-non'}` : 'est-cache'}>
          {`${fr(y1)} × ${fr(k)} = ${fr(attendu)}${oui ? ' : ' : ', mais on trouve '}${fr(y2)}`}
        </p>
      </div>
      <p className={`sc-recette-pour-8__legende${pas >= 2 ? ' est-fini' : ''}`}>
        {pas >= 2 ? (oui ? 'Quand l’un double, l’autre double aussi : c’est proportionnel.' : 'L’un double, l’autre non : ce n’est pas proportionnel.') : 'On regarde si tout est multiplié par le même nombre…'}
      </p>
    </Cuisine>
  );
}

/** Au CM2, le prix d'un seul, puis le prix de tous. */
function ApresUnite({ m, lu }) {
  const un = lu.prix / lu.n1;
  const pas = useDeroule(2, 1200, 450);
  return (
    <Circuit m={m}>
      <div className="sc-recette-pour-8__rayon">
        <span className={`sc-recette-pour-8__lot${pas >= 1 ? ' est-allume' : ''}`}>
          <Objet nom={lu.objet} />
          <em>{pas >= 1 ? euros(un) : '…'}</em>
        </span>
        <span className={`sc-recette-pour-8__lot${pas >= 2 ? ' est-allume' : ''}`}>
          {rangee(lu.n2).map((i) => <Objet key={i} nom={lu.objet} n={i} />)}
          <em>{pas >= 2 ? euros(un * lu.n2) : '?'}</em>
        </span>
      </div>
      <p className={`sc-recette-pour-8__legende${pas >= 2 ? ' est-fini' : ''}`}>
        {pas >= 2 ? `${euros(un)} × ${lu.n2} = ${euros(un * lu.n2)}` : `Un seul : ${euros(lu.prix)} ÷ ${lu.n1} = ${euros(un)}`}
      </p>
    </Circuit>
  );
}

/** Au CM2, la voiture roule heure après heure, puis la demi-heure. */
function ApresVitesse({ m, lu }) {
  const pas = useDeroule(lu.h + 1, 900, 450);
  const fini = pas > lu.h;
  const fait = Math.min(pas, lu.h) * lu.v + (fini ? lu.v / 2 : 0);
  return (
    <Circuit m={m}>
      <ol className="sc-recette-pour-8__troncons" aria-label="La route, heure par heure">
        {rangee(lu.h).map((i) => <li key={i} className={pas > i ? 'est-roule' : ''} style={{ flexGrow: 2 }}>{`1 h : ${lu.v} km`}</li>)}
        <li className={`sc-recette-pour-8__demi${fini ? ' est-roule' : ''}`} style={{ flexGrow: 1 }}>{`30 min : ${lu.v / 2} km`}</li>
      </ol>
      <p className={`sc-recette-pour-8__legende${fini ? ' est-fini' : ''}`}>
        {fini ? `${lu.v} × ${lu.h} + ${lu.v / 2} = ${fait} km` : `${fait} km…`}
      </p>
    </Circuit>
  );
}

/** Au CM2, les flèches « × k » traversent le tableau, puis la case manquante se remplit. */
function ApresTableau({ m, lu }) {
  const k = lu.y1 / lu.x1;
  const pas = useDeroule(3, 900, 450);
  return (
    <Circuit m={m}>
      <TableauProportion lu={lu} fleches={pas} rempli={pas >= 3 ? fr(lu.x3 * k) : null} />
      <p className={`sc-recette-pour-8__legende${pas >= 3 ? ' est-fini' : ''}`}>
        {pas >= 3 ? `${lu.x3} × ${fr(k)} = ${fr(lu.x3 * k)}` : `Chaque nombre du haut est multiplié par ${fr(k)}.`}
      </p>
    </Circuit>
  );
}

/** APRÈS LA RÉPONSE : l'explication de la sorte de manche. */
export function ApresRecette({ m }) {
  const lu = lireRecette(m);
  if (lu?.sorte === 'recette' && lu.n > 0 && (lu.n % 4 === 0 || lu.n % 2 === 0)) return <ApresRecetteCM1 m={m} lu={lu} />;
  if (lu?.sorte === 'proportionnel') return <ApresProportionnel m={m} lu={lu} />;
  if (lu?.sorte === 'unite' && lu.n1 > 0) return <ApresUnite m={m} lu={lu} />;
  if (lu?.sorte === 'vitesse') return <ApresVitesse m={m} lu={lu} />;
  if (lu?.sorte === 'tableau' && lu.x1 > 0) return <ApresTableau m={m} lu={lu} />;
  return auCM2(m) ? <Circuit m={m} /> : <Cuisine m={m} />;
}
