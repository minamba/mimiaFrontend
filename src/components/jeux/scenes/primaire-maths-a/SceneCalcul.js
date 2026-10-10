import { rangee, useDeroule } from './communs';
import './primaire-maths-a.css';

/**
 * LE CALCUL MALIN (CM1) ET LES OPÉRATIONS POSÉES (CM2) — 09/10/2026. Les deux
 * couvertures sont un chemin de pierres : au CM1, des pierres de gué sur une
 * rivière (× 9, × 25, × 50) qui mènent à un coffre ; au CM2, des îles qui
 * flottent dans le ciel, chacune son signe d'opération. La scène les reprend :
 *   - LA QUESTION est gravée sur la grande pierre ; au CM1 une grenouille y
 *     est assise (elle cligne, sa gorge se gonfle), au CM2 un oiseau tourne
 *     autour de l'île ;
 *   - LES RÉPONSES sont des pierres de gué (ou des îlots) qui dansent sur
 *     l'eau : on saute sur la bonne (`ChoixCalcul`) ;
 *   - APRÈS LA RÉPONSE, au CM1, la grenouille saute de pierre en pierre en
 *     suivant LA RUSE (× 10 puis − le nombre…) jusqu'au coffre qui s'ouvre ;
 *     au CM2, l'opération se POSE colonne par colonne, retenues comprises.
 * Rien du calcul n'est montré avant la réponse : la ruse, c'est la réponse.
 */

const SIGNES = { '×': 'fois', '−': 'moins', '+': 'plus', '÷': 'divise' };

/** Ce que dit la question : la sorte d'opération et ses deux nombres, ou rien. */
export function lireCalcul(m) {
  const q = String(m?.question ?? '');
  let r = q.match(/^(\d+) × (\d+) = \?$/);
  if (r) return { sorte: m.consigne === 'calcul' ? 'ruse' : 'multiplication', a: Number(r[1]), b: Number(r[2]) };
  r = q.match(/^(\d+) − (\d+) = \?$/);
  if (r) return { sorte: 'soustraction', a: Number(r[1]), b: Number(r[2]) };
  r = q.match(/^(\d+) divisé par (\d+)$/);
  if (r) return { sorte: 'division', a: Number(r[1]), b: Number(r[2]) };
  return null;
}

/** Le CM1 joue sur la rivière ; le CM2, dans le ciel. */
const surLaRiviere = (m) => m?.consigne === 'calcul';

/** La grenouille du gué : elle cligne, sa gorge se gonfle. */
function Grenouille() {
  return (
    <svg className="sc-calcul-mental__grenouille" viewBox="0 0 90 64" aria-hidden="true" focusable="false">
      <ellipse cx="45" cy="58" rx="30" ry="5" fill="rgba(0,0,0,0.25)" />
      <path d="M14 52 q-8 -2 -6 -10 q6 2 14 6 Z" fill="#3f9b3a" />
      <path d="M76 52 q8 -2 6 -10 q-6 2 -14 6 Z" fill="#3f9b3a" />
      <ellipse cx="45" cy="40" rx="30" ry="19" fill="#5cc451" stroke="#2f7a2a" strokeWidth="2" />
      <ellipse className="sc-calcul-mental__gorge" cx="45" cy="50" rx="13" ry="7" fill="#e9f7b8" />
      <ellipse cx="45" cy="44" rx="18" ry="9" fill="#a8e27a" opacity="0.7" />
      <g className="sc-calcul-mental__yeux">
        <circle cx="30" cy="22" r="10" fill="#5cc451" stroke="#2f7a2a" strokeWidth="2" />
        <circle cx="60" cy="22" r="10" fill="#5cc451" stroke="#2f7a2a" strokeWidth="2" />
        <circle cx="30" cy="22" r="6.5" fill="#fff" />
        <circle cx="60" cy="22" r="6.5" fill="#fff" />
        <circle cx="31.5" cy="23" r="3.4" fill="#1b2a1a" />
        <circle cx="61.5" cy="23" r="3.4" fill="#1b2a1a" />
        <circle cx="32.5" cy="21.6" r="1.2" fill="#fff" />
        <circle cx="62.5" cy="21.6" r="1.2" fill="#fff" />
      </g>
      <path d="M33 38 q12 9 24 0" fill="none" stroke="#1f5a1c" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="26" cy="36" r="3" fill="#ff9aa8" opacity="0.6" />
      <circle cx="64" cy="36" r="3" fill="#ff9aa8" opacity="0.6" />
    </svg>
  );
}

/** L'oiseau des îles du ciel : il bat des ailes. */
function Oiseau() {
  return (
    <svg className="sc-calcul-mental__oiseau" viewBox="0 0 80 60" aria-hidden="true" focusable="false">
      <path d="M14 34 l-12 -6 l4 10 l-4 8 Z" fill="#2e6fd8" />
      <ellipse cx="38" cy="34" rx="24" ry="18" fill="#3d8bff" stroke="#1d4f9e" strokeWidth="2" />
      <ellipse cx="42" cy="40" rx="14" ry="10" fill="#ffe08a" />
      <path className="sc-calcul-mental__aile" d="M30 30 q-6 -22 18 -24 q-4 14 -2 24 Z" fill="#7fb6ff" stroke="#1d4f9e" strokeWidth="1.6" />
      <path d="M60 30 l14 4 l-14 5 Z" fill="#ff9f1c" stroke="#b86a00" strokeWidth="1.2" />
      <g className="sc-calcul-mental__yeux">
        <circle cx="52" cy="26" r="6" fill="#fff" />
        <circle cx="53.5" cy="26.5" r="3.2" fill="#14213d" />
        <circle cx="54.6" cy="25.2" r="1.1" fill="#fff" />
      </g>
    </svg>
  );
}

/** La question, avec son signe d'opération qui brille (le texte reste entier). */
function Enonce({ texte }) {
  const morceaux = String(texte).split(/([×−+÷]|divisé par)/);
  return (
    <p className="sc-calcul-mental__enonce">
      {morceaux.map((x, i) => {
        const signe = x === 'divisé par' ? '÷' : x;
        return SIGNES[signe]
          // eslint-disable-next-line react/no-array-index-key
          ? <span key={i} className={`sc-calcul-mental__signe sc-calcul-mental__signe--${SIGNES[signe]}`}>{x}</span>
          : x;
      })}
    </p>
  );
}

/** Le décor de la rivière : l'eau qui file, la cascade, les reflets. */
function Riviere() {
  return (
    <div className="sc-calcul-mental__eau" aria-hidden="true">
      <span className="sc-calcul-mental__cascade">
        {rangee(5).map((i) => <span key={i} style={{ '--n': i }} />)}
      </span>
      <svg className="sc-calcul-mental__vagues" viewBox="0 0 400 40" preserveAspectRatio="none" focusable="false">
        <path d="M0 20 q25 -12 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
        <path d="M0 32 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      </svg>
    </div>
  );
}

/** Le décor du ciel : des nuages qui passent, des îles au loin. */
function Ciel() {
  return (
    <div className="sc-calcul-mental__ciel" aria-hidden="true">
      {rangee(3).map((i) => <span key={i} className="sc-calcul-mental__nuage" style={{ '--n': i }} />)}
      {rangee(6).map((i) => <span key={`e${i}`} className="sc-calcul-mental__etincelle" style={{ '--n': i }} />)}
    </div>
  );
}

/** LA QUESTION : la grande pierre du gué (CM1) ou l'île du ciel (CM2). */
export function QuestionCalcul({ m, termine }) {
  // eslint-disable-next-line no-use-before-define
  if (termine) return <ApresCalcul m={m} />;
  const riviere = surLaRiviere(m);
  return (
    <div className={`sc-calcul-mental sc-calcul-mental--${riviere ? 'riviere' : 'ciel'}`}>
      {riviere ? <Riviere /> : <Ciel />}
      <div className="sc-calcul-mental__rocher">
        {riviere ? <Grenouille /> : <Oiseau />}
        <Enonce texte={m.question} />
        {!riviere && <span className="sc-calcul-mental__chute" aria-hidden="true" />}
      </div>
    </div>
  );
}

/**
 * LES RÉPONSES : des pierres de gué (ou des îlots) qui dansent sur l'eau,
 * lentement et en boucle ; on clique sur celle où sauter. Une pierre fausse
 * se fend et coule à moitié, son nombre barré.
 */
export function ChoixCalcul({ m, choix, fautes, choisir }) {
  const riviere = surLaRiviere(m);
  return (
    <ul className={`sc-calcul-mental__gue sc-calcul-mental__gue--${riviere ? 'riviere' : 'ciel'}`} aria-label="Choisis la pierre où sauter">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`sc-calcul-mental__pierre${fausse ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={fausse}
            >
              <span className="sc-calcul-mental__mousse" aria-hidden="true" />
              <span className="sc-calcul-mental__libelle">{libelle}</span>
              <span className="sc-calcul-mental__ronds" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Les deux pas de chaque ruse : × 10 puis − le nombre, × 100 puis le quart… */
export function etapesDeLaRuse(n, f) {
  const fois = (a, b) => `${a} × ${b} = ${a * b}`;
  switch (f) {
    case 9: return [{ ruse: '× 10', calcul: fois(n, 10) }, { ruse: `− ${n}`, calcul: `${n * 10} − ${n} = ${n * 9}` }];
    case 11: return [{ ruse: '× 10', calcul: fois(n, 10) }, { ruse: `+ ${n}`, calcul: `${n * 10} + ${n} = ${n * 11}` }];
    case 20: return [{ ruse: 'le double', calcul: fois(n, 2) }, { ruse: '× 10', calcul: fois(n * 2, 10) }];
    case 25: return [{ ruse: '× 100', calcul: fois(n, 100) }, { ruse: 'le quart', calcul: `${n * 100} ÷ 4 = ${n * 25}` }];
    case 50: return [{ ruse: '× 100', calcul: fois(n, 100) }, { ruse: 'la moitié', calcul: `${n * 100} ÷ 2 = ${n * 50}` }];
    default: return null;
  }
}

/** Le coffre du bout du gué : il s'ouvre sur la bonne réponse. */
function Coffre({ ouvert }) {
  return (
    <svg className={`sc-calcul-mental__coffre${ouvert ? ' est-ouvert' : ''}`} viewBox="0 0 90 70" aria-hidden="true" focusable="false">
      <g className="sc-calcul-mental__rayons">
        {rangee(8).map((i) => <rect key={i} x="43" y="-6" width="4" height="22" rx="2" fill="#ffe066" transform={`rotate(${i * 45 - 90} 45 30)`} />)}
      </g>
      <rect x="10" y="32" width="70" height="34" rx="6" fill="#a0522d" stroke="#5b2c0f" strokeWidth="3" />
      <rect x="10" y="44" width="70" height="6" fill="#d4a017" />
      <g className="sc-calcul-mental__couvercle">
        <path d="M10 34 q35 -30 70 0 Z" fill="#b8642f" stroke="#5b2c0f" strokeWidth="3" />
        <rect x="40" y="26" width="10" height="12" rx="2" fill="#ffd43b" stroke="#8a6500" strokeWidth="2" />
      </g>
      <path d="M41 50 l4 6 l4 -6 Z" fill="#5b2c0f" />
    </svg>
  );
}

/** APRÈS LA RÉPONSE, AU CM1 : la grenouille suit la ruse, pierre après pierre, jusqu'au coffre. */
function ApresRuse({ m, n, f }) {
  const etapes = etapesDeLaRuse(n, f) ?? [];
  const pas = useDeroule(etapes.length + 1, 1300, 500);
  const ici = Math.min(pas, etapes.length + 1);
  return (
    <div className="sc-calcul-mental sc-calcul-mental--riviere sc-calcul-mental--apres">
      <Riviere />
      <ol className="sc-calcul-mental__chemin" aria-label="La ruse, pas à pas">
        <li className="sc-calcul-mental__etape est-la">
          <span className="sc-calcul-mental__case">
            <Enonce texte={m.question} />
          </span>
          {ici === 0 && <Grenouille />}
        </li>
        {etapes.map((e, i) => (
          <li key={e.ruse} className={`sc-calcul-mental__etape${ici > i ? ' est-la' : ''}`}>
            <span className="sc-calcul-mental__ruse">{e.ruse}</span>
            <span className="sc-calcul-mental__case">{e.calcul}</span>
            {ici === i + 1 && <Grenouille />}
          </li>
        ))}
        <li className={`sc-calcul-mental__etape sc-calcul-mental__etape--coffre${ici > etapes.length ? ' est-la' : ''}`}>
          <Coffre ouvert={ici > etapes.length} />
          {ici > etapes.length && <strong className="sc-calcul-mental__tresor">{`${n} × ${f} = ${m.bonne}`}</strong>}
          {ici > etapes.length && <Grenouille />}
        </li>
      </ol>
    </div>
  );
}

/** Les colonnes d'une soustraction posée, des unités vers la gauche, retenues comprises. */
export function poserSoustraction(a, b) {
  const haut = String(a);
  const bas = String(b).padStart(haut.length, ' ');
  const colonnes = [];
  let retenue = 0;
  for (let i = haut.length - 1; i >= 0; i -= 1) {
    const h = Number(haut[i]);
    const x = bas[i] === ' ' ? 0 : Number(bas[i]);
    const enBas = x + retenue;
    const emprunt = h < enBas;
    colonnes.unshift({
      haut: haut[i], bas: bas[i] === ' ' ? '' : bas[i], recue: retenue === 1, emprunt, chiffre: (emprunt ? h + 10 : h) - enBas,
    });
    retenue = emprunt ? 1 : 0;
  }
  // Les zéros de tête du résultat ne s'écrivent pas.
  const resultat = String(a - b).padStart(haut.length, ' ');
  return colonnes.map((c, i) => ({ ...c, ecrit: resultat[i] === ' ' ? '' : resultat[i] }));
}

/** L'ardoise de pierre qui flotte, où l'opération se pose. */
function Ardoise({ m, children, legende }) {
  return (
    <div className="sc-calcul-mental sc-calcul-mental--ciel sc-calcul-mental--apres">
      <Ciel />
      <div className="sc-calcul-mental__ardoise">
        <div className="sc-calcul-mental__entete">
          <Oiseau />
          <Enonce texte={m.question} />
        </div>
        {children}
        {legende && <p className="sc-calcul-mental__legende">{legende}</p>}
      </div>
    </div>
  );
}

function ApresSoustraction({ m, a, b }) {
  const colonnes = poserSoustraction(a, b);
  const n = colonnes.length;
  const pas = useDeroule(n + 1, 1000, 500);
  // Les colonnes se font de droite à gauche : la k-ième étape écrit la colonne n − k.
  const faite = (i) => pas >= n - i;
  const enCours = pas >= 1 && pas <= n ? n - pas : -1;
  const empruntVu = colonnes.some((c, i) => c.emprunt && faite(i));
  return (
    <Ardoise m={m} legende={pas > n ? `${a} − ${b} = ${a - b}` : empruntVu ? 'Trop petit en haut ? On prend une dizaine : c’est la retenue.' : 'Colonne par colonne, en partant des unités.'}>
      <div className="sc-calcul-mental__pose" style={{ '--colonnes': n + 1 }}>
        <span />
        {colonnes.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`h${i}`} className={`sc-calcul-mental__chiffre${i === enCours ? ' est-en-cours' : ''}`}>
            {c.emprunt && faite(i) && <sup className="sc-calcul-mental__retenue">1</sup>}
            {c.haut}
          </span>
        ))}
        <span className="sc-calcul-mental__op">−</span>
        {colonnes.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`b${i}`} className={`sc-calcul-mental__chiffre${i === enCours ? ' est-en-cours' : ''}`}>
            {c.bas}
            {c.recue && faite(i) && <sub className="sc-calcul-mental__retenue">+1</sub>}
          </span>
        ))}
        <span className="sc-calcul-mental__trait" />
        <span />
        {colonnes.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`r${i}`} className={`sc-calcul-mental__chiffre sc-calcul-mental__chiffre--resultat${faite(i) ? ' est-ecrit' : ''}`}>
            {faite(i) ? c.ecrit : ''}
          </span>
        ))}
      </div>
    </Ardoise>
  );
}

function ApresMultiplication({ m, a, b }) {
  const u = b % 10;
  const d = Math.floor(b / 10);
  const ligne1 = a * u;
  const ligne2 = a * d;
  const total = a * b;
  const pas = useDeroule(3, 1300, 500);
  const largeur = String(total).length + 2;
  const ligne = (texte) => texte.padStart(largeur, ' ');
  return (
    <Ardoise
      m={m}
      legende={pas >= 3 ? `${a} × ${b} = ${total}` : pas === 2 ? `${a} × ${d} dizaines : on décale d’un rang, avec un zéro au bout.` : `${a} × ${u} unités.`}
    >
      <div className="sc-calcul-mental__multi">
        <span>{ligne(String(a))}</span>
        <span>{ligne(`× ${b}`)}</span>
        <span className="sc-calcul-mental__barre" />
        <span className={pas >= 1 ? 'est-ecrit' : 'est-cache'}>{ligne(String(ligne1))}</span>
        <span className={pas >= 2 ? 'est-ecrit' : 'est-cache'}>
          {ligne(`+ ${ligne2}0`).slice(0, -1)}
          <em className="sc-calcul-mental__zero">0</em>
        </span>
        <span className="sc-calcul-mental__barre" />
        <strong className={pas >= 3 ? 'est-ecrit' : 'est-cache'}>{ligne(String(total))}</strong>
      </div>
    </Ardoise>
  );
}

function ApresDivision({ m, a, b }) {
  const q = Math.floor(a / b);
  const r = a % b;
  const pas = useDeroule(3, 1300, 500);
  return (
    <Ardoise m={m} legende={pas >= 3 ? `Le reste ${r} est plus petit que ${b} : c’est fini.` : 'Combien de fois le diviseur tient-il dans le nombre ?'}>
      <div className="sc-calcul-mental__potence">
        <span className="sc-calcul-mental__dividende">{a}</span>
        <span className="sc-calcul-mental__diviseur">{b}</span>
        <span className={`sc-calcul-mental__reste${pas >= 2 ? ' est-ecrit' : ' est-cache'}`}>{r}</span>
        <span className={`sc-calcul-mental__quotient${pas >= 1 ? ' est-ecrit' : ' est-cache'}`}>{q}</span>
      </div>
      <p className={`sc-calcul-mental__verif${pas >= 3 ? ' est-ecrit' : ' est-cache'}`}>
        {`${b} × ${q} = ${b * q}   puis   ${b * q} + ${r} = ${a}`}
      </p>
    </Ardoise>
  );
}

/** APRÈS LA RÉPONSE : la ruse rejouée (CM1), ou l'opération posée (CM2). */
export function ApresCalcul({ m }) {
  const lu = lireCalcul(m);
  if (lu?.sorte === 'ruse' && etapesDeLaRuse(lu.a, lu.b)) return <ApresRuse m={m} n={lu.a} f={lu.b} />;
  if (lu?.sorte === 'soustraction' && lu.a > lu.b) return <ApresSoustraction m={m} a={lu.a} b={lu.b} />;
  if (lu?.sorte === 'multiplication' && lu.b >= 10 && lu.b < 100) return <ApresMultiplication m={m} a={lu.a} b={lu.b} />;
  if (lu?.sorte === 'division' && lu.b > 0) return <ApresDivision m={m} a={lu.a} b={lu.b} />;
  // Une question inattendue : la pierre, simplement.
  return (
    <div className={`sc-calcul-mental sc-calcul-mental--${surLaRiviere(m) ? 'riviere' : 'ciel'}`}>
      <div className="sc-calcul-mental__rocher">
        <Enonce texte={m.question} />
      </div>
    </div>
  );
}
