import { rangee, useDeroule } from './communs';
import './primaire-maths-a.css';

/**
 * LES FRACTIONS (CM1) ET LES FRACTIONS DÉCIMALES (CM2) — 09/10/2026. L'écran
 * est celui des « parts de pizza » ; la couverture du CM1 montre un disque
 * coupé en quarts au bord de la mer, celle du CM2 des disques de verre
 * lumineux coupés en dixièmes, dans un ciel d'îles flottantes. La scène :
 *   - AU CM1, LA PIZZERIA DU BORD DE MER : un four où dansent les flammes, une
 *     souris pizzaïolo qui cligne et remue la queue, l'ardoise où la question
 *     est écrite à la craie, et sur la planche les DONNÉES dessinées — les
 *     parts en vrac, le bocal de bonbons, la pizza en plaque et ses parts
 *     garnies ;
 *   - AU CM2, LE CIEL DES DISQUES DE VERRE : les mêmes dessins en verre
 *     lumineux, et pour « la plus grande part », deux disques encore entiers ;
 *   - LES RÉPONSES : des pizzas (au CM2, des disques de verre) à attraper
 *     (`objets: 'sc-fractions-cm1'`) ;
 *   - APRÈS LA RÉPONSE : les parts volent se ranger en pizzas entières, les
 *     bonbons se partagent en assiettes, la plaque se range dans le tableau
 *     des dixièmes et des centièmes, le couteau coupe les deux disques.
 * Avant la réponse, rien n'est rangé ni calculé : ce serait la donner.
 */

const CM2 = ['vers-fraction', 'somme', 'plus-grande-part'];
const auCiel = (m) => CM2.includes(m?.consigne);

/** Ce que dit la question, selon sa sorte ; `null` si on ne la reconnaît pas. */
export function lireFraction(m) {
  const q = String(m?.question ?? '');
  let r;
  switch (m?.consigne) {
    case 'decomposer':
      r = q.match(/^(\d+)\/(\d+) = \?$/);
      return r ? { n: Number(r[1]), d: Number(r[2]) } : null;
    case 'operateur':
      r = q.match(/^Les (\d+)\/(\d+) de (\d+) bonbons = \?$/);
      return r ? { a: Number(r[1]), d: Number(r[2]), q: Number(r[3]) } : null;
    case 'virgule':
      r = q.match(/^(\d+)\/(10|100) = \?$/);
      return r ? { n: Number(r[1]), d: Number(r[2]) } : null;
    case 'vers-fraction':
      r = q.match(/^(\d+),(\d{1,2}) = \?$/);
      return r ? { entier: Number(r[1]), apres: r[2] } : null;
    case 'somme':
      r = q.match(/^(\d)\/10 \+ (\d)\/100 = \?$/);
      return r ? { dix: Number(r[1]), cent: Number(r[2]) } : null;
    case 'plus-grande-part':
      r = q.match(/^1\/(\d+)\s+ou\s+1\/(\d+) \?$/);
      return r ? { a: Number(r[1]), b: Number(r[2]) } : null;
    default:
      return null;
  }
}

const arrondi = (x) => Math.round(x * 100) / 100;

/** Le chemin d'une part : la i-ième de n, dans un disque de rayon r centré en 0. */
function chemin(i, n, r) {
  if (n <= 1) return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
  const a0 = ((-90 + (i * 360) / n) * Math.PI) / 180;
  const a1 = ((-90 + ((i + 1) * 360) / n) * Math.PI) / 180;
  const grand = 360 / n > 180 ? 1 : 0;
  return `M 0 0 L ${arrondi(r * Math.cos(a0))} ${arrondi(r * Math.sin(a0))} A ${r} ${r} 0 ${grand} 1 ${arrondi(r * Math.cos(a1))} ${arrondi(r * Math.sin(a1))} Z`;
}

/** Le milieu d'une part, pour y poser une rondelle de chorizo. */
function milieu(i, n, r) {
  const a = ((-90 + ((i + 0.5) * 360) / n) * Math.PI) / 180;
  return [arrondi(r * 0.58 * Math.cos(a)), arrondi(r * 0.58 * Math.sin(a))];
}

/**
 * UNE PIZZA (ou un disque de verre, au CM2) coupée en `parts` : les `garnies`
 * premières sont là, les autres manquent (on voit l'assiette).
 */
function Pizza({
  parts, garnies = parts, verre = false, levee = -1, className = '',
}) {
  const r = 44;
  return (
    <svg className={`sc-fractions-cm1__pizza${verre ? ' est-en-verre' : ''} ${className}`} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      <circle r="48" className="sc-fractions-cm1__assiette" />
      {rangee(parts).map((i) => (
        <g key={i} className={`sc-fractions-cm1__part${i < garnies ? ' est-garnie' : ''}${i === levee ? ' est-levee' : ''}`} style={{ '--n': i }}>
          <path d={chemin(i, parts, r)} />
          {i < garnies && !verre && parts <= 12 && <circle cx={milieu(i, parts, r)[0]} cy={milieu(i, parts, r)[1]} r={Math.max(2.5, 9 - parts * 0.5)} className="sc-fractions-cm1__chorizo" />}
        </g>
      ))}
    </svg>
  );
}

/** Une part seule (1/d), pointe en bas, comme posée sur la planche. */
function Part({ d, verre, n }) {
  return (
    <svg className={`sc-fractions-cm1__part-seule${verre ? ' est-en-verre' : ''}`} viewBox="-50 -50 100 100" style={{ '--n': n }} aria-hidden="true" focusable="false">
      <g className="sc-fractions-cm1__part est-garnie" transform={`rotate(${180 - 180 / d})`}>
        <path d={chemin(0, d, 44)} />
        {!verre && <circle cx={milieu(0, d, 44)[0]} cy={milieu(0, d, 44)[1]} r="6" className="sc-fractions-cm1__chorizo" />}
      </g>
    </svg>
  );
}

/** La pizza en plaque : 10 bandes, ou 100 carreaux ; les `garnis` premiers (par colonnes) sont garnis. */
function Plaque({ cent, garnis, verre = false, mis = garnis }) {
  const cases = cent ? 100 : 10;
  // En dixièmes, une plaque en longueur : dix bandes côte à côte.
  const H = cent ? 100 : 40;
  return (
    <svg
      className={`sc-fractions-cm1__plaque${verre ? ' est-en-verre' : ''}${cent ? '' : ' sc-fractions-cm1__plaque--dixiemes'}`}
      viewBox={`-2 -2 104 ${H + 4}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="-2" y="-2" width="104" height={H + 4} rx="6" className="sc-fractions-cm1__pate" />
      {rangee(cases).map((k) => {
        const [x, y, l, h] = cent ? [Math.floor(k / 10) * 10, (k % 10) * 10, 10, 10] : [k * 10, 0, 10, H];
        return (
          <rect
            key={k}
            x={x + 0.8}
            y={y + 0.8}
            width={l - 1.6}
            height={h - 1.6}
            rx="1.5"
            className={`sc-fractions-cm1__carre${k < Math.min(garnis, mis) ? ' est-garnie' : ''}`}
            style={{ '--n': cent ? k % 40 : k }}
          />
        );
      })}
    </svg>
  );
}

/** Le tableau des unités, dixièmes et centièmes : les chiffres tombent à leur place. */
function TableauDecimal({ ecriture, montre }) {
  const [entier, apres = ''] = String(ecriture).split(',');
  const colonnes = [['unités', entier], ['dixièmes', apres[0] ?? '0'], ['centièmes', apres[1] ?? '']];
  return (
    <table className="sc-fractions-cm1__tableau">
      <thead>
        <tr>
          {colonnes.map(([nom]) => <th key={nom} scope="col">{nom}</th>)}
        </tr>
      </thead>
      <tbody>
        <tr>
          {colonnes.map(([nom, chiffre], i) => (
            <td key={nom} className={montre ? 'est-rempli' : ''} style={{ '--n': i }}>
              {montre ? chiffre : ''}
              {i === 0 && <span className="sc-fractions-cm1__virgule">,</span>}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

/** Le bocal de bonbons. */
function Bocal({ q }) {
  return (
    <div className="sc-fractions-cm1__bocal" aria-hidden="true">
      <span className="sc-fractions-cm1__couvercle" />
      <span className="sc-fractions-cm1__bonbons">
        {rangee(q).map((i) => <span key={i} className="sc-fractions-cm1__bonbon" style={{ '--n': i }} />)}
      </span>
    </div>
  );
}

/** Le four à bois et ses flammes. */
function Four() {
  return (
    <svg className="sc-fractions-cm1__four" viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      <path d="M8 96 V58 a52 50 0 0 1 104 0 V96 Z" fill="#b5532f" stroke="#6e2a14" strokeWidth="3" />
      <path d="M20 60 h80 M14 76 h92 M30 44 h60 M60 10 v34 M40 60 v16 M80 60 v16 M50 76 v20 M74 76 v20" stroke="#8d3a1c" strokeWidth="2" opacity="0.6" />
      <path d="M34 96 V74 a26 22 0 0 1 52 0 V96 Z" fill="#2b1208" />
      <g className="sc-fractions-cm1__flammes">
        <path className="sc-fractions-cm1__flamme" d="M44 96 q-4 -16 6 -24 q0 10 6 12 q-2 -14 8 -20 q-2 14 8 20 q4 -6 2 -12 q10 10 4 24 Z" fill="#ff8c1a" />
        <path className="sc-fractions-cm1__flamme sc-fractions-cm1__flamme--coeur" d="M52 96 q-2 -10 5 -16 q0 8 4 9 q0 -8 5 -12 q0 10 4 13 q4 4 0 6 Z" fill="#ffe066" />
      </g>
      <rect x="4" y="92" width="112" height="8" rx="2" fill="#7a4a2a" />
    </svg>
  );
}

/** La souris pizzaïolo : elle cligne et remue la queue. */
function Souris() {
  return (
    <svg className="sc-fractions-cm1__souris" viewBox="0 0 80 90" aria-hidden="true" focusable="false">
      <path className="sc-fractions-cm1__queue" d="M58 78 q22 -2 16 -22 q-4 -10 4 -16" fill="none" stroke="#e79aa8" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="38" cy="66" rx="22" ry="20" fill="#9aa3b2" stroke="#5f6878" strokeWidth="2" />
      <ellipse cx="38" cy="70" rx="13" ry="12" fill="#fff" />
      <circle cx="18" cy="30" r="12" fill="#9aa3b2" stroke="#5f6878" strokeWidth="2" />
      <circle cx="58" cy="30" r="12" fill="#9aa3b2" stroke="#5f6878" strokeWidth="2" />
      <circle cx="18" cy="30" r="7" fill="#f4b6c2" />
      <circle cx="58" cy="30" r="7" fill="#f4b6c2" />
      <ellipse cx="38" cy="40" rx="18" ry="16" fill="#aab2c0" stroke="#5f6878" strokeWidth="2" />
      <path d="M24 22 q-4 -16 14 -16 q18 0 14 16 Z" fill="#fff" stroke="#c9ced6" strokeWidth="2" />
      <rect x="23" y="20" width="30" height="6" rx="2" fill="#fff" stroke="#c9ced6" strokeWidth="2" />
      <g className="sc-fractions-cm1__yeux">
        <circle cx="31" cy="38" r="3.4" fill="#1b1d3a" />
        <circle cx="45" cy="38" r="3.4" fill="#1b1d3a" />
        <circle cx="32" cy="37" r="1.1" fill="#fff" />
        <circle cx="46" cy="37" r="1.1" fill="#fff" />
      </g>
      <circle cx="38" cy="46" r="3" fill="#e2536a" />
      <path d="M30 47 h-12 M30 49 l-11 4 M46 47 h12 M46 49 l11 4" stroke="#5f6878" strokeWidth="1.2" />
    </svg>
  );
}

/** Le ciel du CM2 : des étoiles et des îles qui flottent. */
function CielDeVerre() {
  return (
    <div className="sc-fractions-cm1__cosmos" aria-hidden="true">
      {rangee(8).map((i) => <span key={i} className="sc-fractions-cm1__etoile" style={{ '--n': i }} />)}
      <span className="sc-fractions-cm1__ile" />
      <span className="sc-fractions-cm1__ile sc-fractions-cm1__ile--loin" />
    </div>
  );
}

/** Le dessin des données, avant la réponse. */
function Donnees({ m, lu, verre }) {
  if (!lu) return null;
  switch (m.consigne) {
    case 'decomposer':
      return (
        <div className="sc-fractions-cm1__vrac">
          {rangee(lu.n).map((i) => <Part key={i} d={lu.d} verre={verre} n={i} />)}
        </div>
      );
    case 'operateur':
      return <Bocal q={lu.q} />;
    case 'virgule':
      return <Plaque cent={lu.d === 100} garnis={lu.n} />;
    case 'somme':
      return (
        <div className="sc-fractions-cm1__morceaux">
          <span className="sc-fractions-cm1__bandes">
            {rangee(lu.dix).map((i) => <span key={i} className="sc-fractions-cm1__bande" style={{ '--n': i }} />)}
          </span>
          <span className="sc-fractions-cm1__plus" aria-hidden="true">+</span>
          <span className="sc-fractions-cm1__petits">
            {rangee(lu.cent).map((i) => <span key={i} className="sc-fractions-cm1__petit" style={{ '--n': i }} />)}
          </span>
        </div>
      );
    case 'plus-grande-part':
      return (
        <div className="sc-fractions-cm1__duo">
          <Pizza parts={1} verre={verre} />
          <span className="sc-fractions-cm1__roulette" aria-hidden="true" />
          <Pizza parts={1} verre={verre} />
        </div>
      );
    default:
      return null;
  }
}

/** LA QUESTION : la pizzeria du bord de mer (CM1), ou le ciel des disques de verre (CM2). */
export function QuestionFractions({ m, termine }) {
  if (termine) return <ApresFractions m={m} />;
  const verre = auCiel(m);
  const lu = lireFraction(m);
  return (
    <div className={`sc-fractions-cm1 sc-fractions-cm1--${verre ? 'ciel' : 'terrasse'}`}>
      {verre ? <CielDeVerre /> : <span className="sc-fractions-cm1__mer" aria-hidden="true" />}
      <div className="sc-fractions-cm1__comptoir">
        {!verre && <Four />}
        <div className="sc-fractions-cm1__ardoise">
          <p className="sc-fractions-cm1__question">{m.question}</p>
          <Donnees m={m} lu={lu} verre={verre} />
        </div>
        {!verre && <Souris />}
      </div>
    </div>
  );
}

/** L'habillage de l'explication : le même décor, le texte de la question en tête. */
function Explication({
  m, verre, legende, children,
}) {
  return (
    <div className={`sc-fractions-cm1 sc-fractions-cm1--${verre ? 'ciel' : 'terrasse'} sc-fractions-cm1--apres`}>
      {verre ? <CielDeVerre /> : <span className="sc-fractions-cm1__mer" aria-hidden="true" />}
      <div className="sc-fractions-cm1__comptoir">
        <div className="sc-fractions-cm1__ardoise">
          <p className="sc-fractions-cm1__question">{m.question}</p>
          <div className="sc-fractions-cm1__explication">{children}</div>
          {legende && <p className="sc-fractions-cm1__legende">{legende}</p>}
        </div>
        {!verre && <Souris />}
      </div>
    </div>
  );
}

/** 7/4 : les parts volent se ranger, pizza après pizza. */
function ApresDecomposer({ m, n, d }) {
  const entieres = Math.floor(n / d);
  const reste = n % d;
  const pizzas = entieres + (reste ? 1 : 0);
  const pas = useDeroule(pizzas + 1, 900, 400);
  return (
    <Explication m={m} legende={pas > pizzas ? `${n}/${d} = ${m.bonne} : ${entieres} pizza${entieres > 1 ? 's' : ''} entière${entieres > 1 ? 's' : ''}, et ${reste} part${reste > 1 ? 's' : ''} de 1/${d}.` : `On range les parts : ${d} parts font une pizza entière.`}>
      <div className="sc-fractions-cm1__rangees">
        {rangee(pizzas).map((i) => (
          <span key={i} className={`sc-fractions-cm1__une${pas > i ? ' est-faite' : ''}`}>
            <Pizza parts={d} garnies={pas > i ? (i < entieres ? d : reste) : 0} />
            <em>{pas > i ? (i < entieres ? '1' : `${reste}/${d}`) : ''}</em>
          </span>
        ))}
      </div>
    </Explication>
  );
}

/** Les 3/4 de 12 : on partage en 4 assiettes, puis on en prend 3. */
function ApresOperateur({
  m, a, d, q,
}) {
  const part = q / d;
  const pas = useDeroule(3, 1100, 400);
  return (
    <Explication
      m={m}
      legende={pas >= 3 ? `${a} assiettes de ${part} : ${a} × ${part} = ${a * part} bonbons.` : pas >= 2 ? `On en prend ${a} sur ${d}.` : `On partage ${q} bonbons en ${d} parts égales : ${part} par assiette.`}
    >
      <div className="sc-fractions-cm1__assiettes">
        {rangee(d).map((i) => (
          <span key={i} className={`sc-fractions-cm1__assiette-pleine${pas >= 2 && i < a ? ' est-prise' : ''}`} style={{ '--n': i }}>
            {pas >= 1 && rangee(part).map((k) => <span key={k} className="sc-fractions-cm1__bonbon" style={{ '--n': k + i * part }} />)}
          </span>
        ))}
      </div>
    </Explication>
  );
}

/** Une plaque garnie, puis le tableau où ses chiffres tombent. */
function ApresDecimal({
  m, garnis, cent, ecriture, legende, verre,
}) {
  const pas = useDeroule(2, 1200, 400);
  return (
    <Explication m={m} verre={verre} legende={pas >= 2 ? legende : 'Combien de dixièmes, combien de centièmes ?'}>
      <div className="sc-fractions-cm1__decimal">
        <Plaque cent={cent} garnis={garnis} verre={verre} />
        <TableauDecimal ecriture={ecriture} montre={pas >= 2} />
      </div>
    </Explication>
  );
}

/** 3/10 + 4/100 : les bandes et les petits carrés se posent sur la même plaque. */
function ApresSomme({
  m, dix, cent, verre,
}) {
  const pas = useDeroule(3, 1100, 400);
  const garnis = dix * 10 + cent;
  return (
    <Explication m={m} verre={verre} legende={pas >= 3 ? `${dix} dixièmes et ${cent} centièmes : ${m.bonne}` : 'Les dixièmes au premier rang après la virgule, les centièmes au deuxième.'}>
      <div className="sc-fractions-cm1__decimal">
        <Plaque cent garnis={garnis} mis={pas >= 2 ? garnis : pas >= 1 ? dix * 10 : 0} verre={verre} />
        <TableauDecimal ecriture={`0,${dix}${cent}`} montre={pas >= 3} />
      </div>
    </Explication>
  );
}

/** 1/3 ou 1/5 : le couteau coupe les deux disques, une part de chaque se lève. */
function ApresPlusGrandePart({
  m, a, b, verre,
}) {
  const pas = useDeroule(2, 1200, 400);
  const petit = Math.min(a, b);
  return (
    <Explication m={m} verre={verre} legende={pas >= 2 ? `1/${petit} est plus grand : moins on coupe de parts, plus elles sont grosses.` : 'On coupe chaque disque en parts égales.'}>
      <div className="sc-fractions-cm1__duo">
        {[a, b].map((x) => (
          <span key={x} className={`sc-fractions-cm1__une${pas >= 2 && x === petit ? ' est-gagnante' : ''}`}>
            <Pizza parts={pas >= 1 ? x : 1} verre={verre} levee={pas >= 2 ? 0 : -1} />
            <em>{`1/${x}`}</em>
          </span>
        ))}
      </div>
    </Explication>
  );
}

/** APRÈS LA RÉPONSE : l'explication animée de la sorte de manche. */
export function ApresFractions({ m }) {
  const lu = lireFraction(m);
  const verre = auCiel(m);
  if (lu) {
    switch (m.consigne) {
      case 'decomposer':
        if (lu.d > 1 && lu.n > lu.d) return <ApresDecomposer m={m} n={lu.n} d={lu.d} />;
        break;
      case 'operateur':
        if (lu.d > 0 && lu.q % lu.d === 0) return <ApresOperateur m={m} a={lu.a} d={lu.d} q={lu.q} />;
        break;
      case 'virgule':
        if (lu.n <= lu.d) return <ApresDecimal m={m} garnis={lu.n} cent={lu.d === 100} ecriture={String(m.bonne)} legende={`${m.question.replace(' = ?', '')} = ${m.bonne}`} />;
        break;
      case 'vers-fraction':
        if (lu.entier === 0) {
          const centiemes = Number(lu.apres.padEnd(2, '0'));
          return <ApresDecimal m={m} verre garnis={centiemes} cent ecriture={`0,${lu.apres}`} legende={`${m.question.replace(' = ?', '')} = ${m.bonne} : ${centiemes} carreaux sur 100.`} />;
        }
        break;
      case 'somme':
        return <ApresSomme m={m} dix={lu.dix} cent={lu.cent} verre />;
      case 'plus-grande-part':
        return <ApresPlusGrandePart m={m} a={lu.a} b={lu.b} verre />;
      default:
        break;
    }
  }
  return (
    <Explication m={m} verre={verre} />
  );
}
