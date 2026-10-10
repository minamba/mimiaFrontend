import { Enonce, nombre, proprietesChoix, useEtapes } from './commun';

/**
 * LA COUR AUX BILLES — « Le sac de billes » (5e → 3e), le 09/10/2026.
 * La couverture : une cour provençale, un sac de toile à bande rouge renversé
 * sur les pavés, des billes de verre de toutes les couleurs qui roulent. La
 * scène en reprend le sac, les billes, et des dés de bois :
 *   - UNE COULEUR : les billes du sac, comptées par couleur (la question les
 *     donne) ; APRÈS, les billes favorables sautent et brillent, les autres
 *     pâlissent, et la fraction se forme : favorables sur total ;
 *   - LE DÉ : ses faces alignées ; APRÈS, celles qui réalisent l'événement
 *     s'allument ;
 *   - CE QUI N'EST PAS UNE PROBABILITÉ : la règle de 0 à 1 ; APRÈS, chaque
 *     valeur s'y pose, et l'intruse tombe hors de la règle ;
 *   - LE CONTRAIRE : la barre de la probabilité ; APRÈS, la part qui manque ;
 *   - L'EFFECTIF : les billes du sac ; APRÈS, elles se rangent en paquets ;
 *   - DEUX TIRAGES : APRÈS, l'arbre pousse, branche par branche, et le
 *     chemin demandé s'illumine ; deux dés : le tableau des 36 sommes ;
 *   - LES RÉPONSES : de grosses billes de verre qui roulent sur les pavés.
 */

const P = 'sc-sac-de-billes-college';
const TEINTES = {
  rouge: '#e03131', bleue: '#1c7ed6', verte: '#2f9e44', jaune: '#f2b705',
};
const teinteDe = (mot) => TEINTES[String(mot).replace(/s$/, '')] ?? '#868e96';

/* --------------------------------------------------- LES LECTURES */

/** « 3 billes rouges, 5 bleues et 2 vertes » → [['rouge', 3], ['bleue', 5], ['verte', 2]] */
function contenuDuSac(texte) {
  const ligne = String(texte).split('\n')[0];
  return [...ligne.matchAll(/(\d+) (?:billes? )?(rouges?|bleues?|vertes?|jaunes?)\b/g)]
    .map((r) => [r[2].replace(/s$/, ''), Number(r[1])]);
}

/** « 3/8 » → 0,375 ; « 0,35 » → 0,35 ; « −1/3 » → −0,33… */
function valeurDe(texte) {
  const t = String(texte).replace('−', '-');
  if (t.includes('/')) {
    const [a, b] = t.split('/').map(Number);
    return a / b;
  }
  return nombre(texte);
}

const PREMIERS = [2, 3, 5, 7, 11, 13, 17, 19];

/** L'événement d'un dé : la liste de ses faces favorables. */
function facesFavorables(texte, faces) {
  const t = String(texte);
  const k = Number((t.match(/(\d+)\s*»/) ?? t.match(/à (\d+)/) ?? [])[1]);
  const liste = Array.from({ length: faces }, (_, i) => i + 1);
  if (/impair/.test(t)) return liste.filter((x) => x % 2 === 1);
  if (/pair/.test(t)) return liste.filter((x) => x % 2 === 0);
  if (/multiple de 3/.test(t)) return liste.filter((x) => x % 3 === 0);
  if (/multiple de 4/.test(t)) return liste.filter((x) => x % 4 === 0);
  if (/premier/.test(t)) return liste.filter((x) => PREMIERS.includes(x));
  if (/strictement supérieur à/.test(t)) return liste.filter((x) => x > k);
  if (/inférieur ou égal à/.test(t)) return liste.filter((x) => x <= k);
  const egal = t.match(/« Obtenir (\d+) »/);
  if (egal) return liste.filter((x) => x === Number(egal[1]));
  return null;
}

/* --------------------------------------------------- LES DESSINS */

/** Une bille de verre. */
function Bille({ teinte, etat = '', k = 0 }) {
  return <span className={`${P}__bille ${etat}`} style={{ '--t': teinte, '--k': k }} />;
}

/** Le sac de toile à bande rouge, d'où les billes ont roulé. */
function Sac() {
  return (
    <svg viewBox="0 0 90 90" className={`${P}__sac`} aria-hidden="true" focusable="false">
      <path d="M18 30 C10 50 10 78 30 84 H62 C82 78 80 50 72 30 Z" className={`${P}__toile`} />
      <path d="M22 44 H70" className={`${P}__bande`} />
      <path d="M24 30 C34 18 56 18 66 30" className={`${P}__col`} />
      <path d="M30 24 C36 14 54 14 60 24" className={`${P}__cordon`} />
    </svg>
  );
}

/** Les billes du sac, par couleur. `favorable` : la couleur cherchée (après la réponse). */
function Billes({ contenu, favorable = null }) {
  let k = 0;
  return (
    <div className={`${P}__cour`}>
      <Sac />
      <div className={`${P}__tas`}>
        {contenu.map(([couleur, n]) => (
          <span key={couleur} className={`${P}__groupe`}>
            {Array.from({ length: n }, (_, i) => {
              k += 1;
              const etat = favorable === null ? '' : (couleur === favorable ? 'est-favorable' : 'est-pale');
              // eslint-disable-next-line react/no-array-index-key
              return <Bille key={i} teinte={teinteDe(couleur)} etat={etat} k={k} />;
            })}
            <em className={`${P}__compte`}>{n}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Les faces d'un dé, en petits cubes de bois. */
function Faces({ faces, allumees = null }) {
  return (
    <div className={`${P}__des`}>
      {Array.from({ length: faces }, (_, i) => i + 1).map((f) => (
        <span key={f} className={`${P}__face${allumees ? (allumees.includes(f) ? ' est-favorable' : ' est-pale') : ''}`} style={{ '--k': f }}>{f}</span>
      ))}
    </div>
  );
}

/** Le calcul, posé à la craie sur une ardoise. */
function Ardoise({ lignes }) {
  return (
    <ol className={`${P}__ardoise`} aria-label="Le calcul">
      {lignes.map((l, i) => <li key={l} style={{ '--k': i }}>{l}</li>)}
    </ol>
  );
}

/* --------------------------------------------------- LES SORTES */

function Couleur({ m, termine }) {
  const contenu = contenuDuSac(m.question);
  const cherchee = (String(m.question).match(/tirer une (rouge|bleue|verte|jaune) \?/) ?? [])[1];
  if (!contenu.length) return null;
  const total = contenu.reduce((s, [, n]) => s + n, 0);
  const fav = contenu.find(([c]) => c === cherchee)?.[1];
  return (
    <div className={`${P}__atelier`}>
      <Billes contenu={contenu} favorable={termine && cherchee ? cherchee : null} />
      {termine && fav !== undefined && (
        <Ardoise lignes={[`${fav} bille${fav > 1 ? 's' : ''} ${cherchee}${fav > 1 ? 's' : ''} sur ${total} billes`, `${fav}/${total} = ${m.bonne}`]} />
      )}
    </div>
  );
}

function De({ m, termine }) {
  const q = String(m.question);
  const sac = q.match(/ne contient que (\d+) billes (\w+)\.\n« Tirer une bille (\w+) »/);
  if (sac) {
    const n = Number(sac[1]);
    const couleur = sac[2].replace(/s$/, '');
    const meme = sac[3] === couleur;
    return (
      <div className={`${P}__atelier`}>
        <Billes contenu={[[couleur, n]]} favorable={termine ? (meme ? couleur : 'aucune') : null} />
        {termine && <Ardoise lignes={[meme ? `Toutes les billes sont ${sac[2]} : c’est certain` : `Aucune bille ${sac[3]} dans le sac : c’est impossible`]} />}
      </div>
    );
  }
  const faces = Number((q.match(/à (\d+) faces/) ?? [])[1] ?? (/six faces/.test(q) ? 6 : NaN));
  if (!Number.isFinite(faces)) return null;
  const evenement = q.split('\n')[1] ?? '';
  const fav = facesFavorables(evenement, faces);
  if (!fav) return <Faces faces={faces} />;
  let lignes;
  if (m.consigne === 'evenement') {
    let verdict = 'possible, mais pas certain';
    if (fav.length === 0) verdict = 'impossible';
    if (fav.length === faces) verdict = 'certain';
    lignes = [`${fav.length} face${fav.length > 1 ? 's' : ''} sur ${faces} : ${verdict}`];
  } else {
    lignes = [`Faces favorables : ${fav.join(', ')}`, `${fav.length}/${faces} = ${m.bonne}`];
  }
  return (
    <div className={`${P}__atelier`}>
      <Faces faces={faces} allumees={termine ? fav : null} />
      {termine && <Ardoise lignes={lignes} />}
    </div>
  );
}

/** La règle des probabilités, de 0 à 1 : l'intruse tombe en dehors. */
function Regle({ m, termine }) {
  if (!termine) {
    return (
      <div className={`${P}__regle`} aria-hidden="true">
        <span className={`${P}__regle-bois`}><b>0</b><b>1</b></span>
      </div>
    );
  }
  const X = (v) => `${((Math.max(-0.45, Math.min(1.45, v)) + 0.5) / 2) * 100}%`;
  return (
    <div className={`${P}__regle est-posee`} aria-hidden="true">
      <span className={`${P}__regle-bois`}><b>0</b><b>1</b></span>
      {m.choix.map(({ cle, libelle }, i) => {
        const v = valeurDe(libelle);
        const dehors = !(v >= 0 && v <= 1);
        return (
          <span key={cle} className={`${P}__jeton${dehors ? ' est-dehors' : ''}`} style={{ left: X(v), '--k': i }}>
            {libelle}
          </span>
        );
      })}
    </div>
  );
}

/** Le contraire : la barre du « oui » ; après, la part du « non ». */
function Contraire({ m, termine }) {
  const r = String(m.question).match(/(\d+)\/(\d+)\./);
  if (!r) return null;
  const [p, q] = [Number(r[1]), Number(r[2])];
  return (
    <div className={`${P}__atelier`}>
      <div className={`${P}__barre`} style={{ '--q': q }}>
        {Array.from({ length: q }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__part${i < p ? ' est-donnee' : (termine ? ' est-contraire' : '')}`} style={{ '--k': i }} />
        ))}
      </div>
      {termine && <Ardoise lignes={[`1 − ${p}/${q} = ${q}/${q} − ${p}/${q}`, `= ${m.bonne}`]} />}
    </div>
  );
}

/** L'effectif : les billes se rangent en paquets égaux. */
function Effectif({ m, termine }) {
  const r = String(m.question).match(/contient (\d+) billes\.\nLa probabilité de tirer une bille (\w+) est (\d+)\/(\d+)/);
  if (!r) return null;
  const [n, couleur, p, q] = [Number(r[1]), r[2], Number(r[3]), Number(r[4])];
  const parPaquet = n / q;
  if (!termine) return <Billes contenu={[['grise', n]]} />;
  return (
    <div className={`${P}__atelier`}>
      <div className={`${P}__paquets`}>
        {Array.from({ length: q }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__paquet${i < p ? ' est-colore' : ''}`} style={{ '--k': i }}>
            {Array.from({ length: parPaquet }, (_, j) => (
              // eslint-disable-next-line react/no-array-index-key
              <Bille key={j} teinte={i < p ? teinteDe(couleur) : '#adb5bd'} k={i} />
            ))}
          </span>
        ))}
      </div>
      <Ardoise lignes={[`${n} billes en ${q} paquets de ${parPaquet}`, `${p} paquets sur ${q} : ${p} × ${parPaquet} = ${m.bonne}`]} />
    </div>
  );
}

/**
 * L'ARBRE DES DEUX TIRAGES. `branches` : les deux issues du 1er tirage ;
 * `suite(i)` : celles du 2nd après l'issue i ; `voulus` : les chemins demandés.
 */
function Arbre({ branches, suite, voulus }) {
  const k = useEtapes(3, 1100, 400);
  const y1 = [62, 178];
  const y2 = (i, j) => y1[i] + (j ? 26 : -26);
  return (
    <svg viewBox="0 0 380 240" className={`${P}__arbre`} aria-hidden="true" focusable="false">
      <circle cx="24" cy="120" r="7" className={`${P}__racine`} />
      {branches.map((b, i) => (
        <g key={b.nom} className={`${P}__niveau${k >= 1 ? ' est-pousse' : ''}`}>
          <line x1="24" y1="120" x2="150" y2={y1[i]} className={`${P}__branche${voulus.some(([a]) => a === i) && k >= 3 ? ' est-voulue' : ''}`} />
          <text x="78" y={(120 + y1[i]) / 2 + (i ? 18 : -8)} className={`${P}__proba`}>{b.p}</text>
          <circle cx="156" cy={y1[i]} r="9" style={{ fill: b.teinte }} className={`${P}__noeud`} />
          {suite(i).map((c, j) => (
            <g key={c.nom} className={`${P}__niveau${k >= 2 ? ' est-pousse' : ''}`}>
              <line x1="166" y1={y1[i]} x2="290" y2={y2(i, j)} className={`${P}__branche${voulus.some(([a, bb]) => a === i && bb === j) && k >= 3 ? ' est-voulue' : ''}`} />
              <text x="214" y={(y1[i] + y2(i, j)) / 2 + (j ? 16 : -6)} className={`${P}__proba`}>{c.p}</text>
              <circle cx="296" cy={y2(i, j)} r="8" style={{ fill: c.teinte }} className={`${P}__noeud`} />
              <text x="310" y={y2(i, j) + 5} className={`${P}__issue${voulus.some(([a, bb]) => a === i && bb === j) && k >= 3 ? ' est-voulue' : ''}`}>{`${b.court}${c.court}`}</text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function Tirages({ m, termine }) {
  const q = String(m.question);
  const r = q.match(/(\d+) billes (\w+) et (\d+) (\w+)\./);
  if (!r) return null;
  const [a, ca, b, cb] = [Number(r[1]), r[2].replace(/s$/, ''), Number(r[3]), r[4].replace(/s$/, '')];
  const n = a + b;
  const remise = /on la remet/.test(q);
  if (!termine) return <Billes contenu={[[ca, a], [cb, b]]} />;
  const deux = /deux billes/.test(q);
  const voulus = deux ? [[0, 0]] : [[0, 1]];
  const d2 = remise ? n : n - 1;
  const branches = [
    { nom: ca, p: `${a}/${n}`, teinte: teinteDe(ca), court: ca[0].toUpperCase() },
    { nom: cb, p: `${b}/${n}`, teinte: teinteDe(cb), court: cb[0].toUpperCase() },
  ];
  const suite = (i) => [
    { nom: ca, p: `${remise || i === 1 ? a : a - 1}/${d2}`, teinte: teinteDe(ca), court: ca[0].toUpperCase() },
    { nom: cb, p: `${remise || i === 0 ? b : b - 1}/${d2}`, teinte: teinteDe(cb), court: cb[0].toUpperCase() },
  ];
  const [i, j] = voulus[0];
  const p1 = branches[i].p;
  const p2 = suite(i)[j].p;
  return (
    <div className={`${P}__atelier`}>
      <Arbre branches={branches} suite={suite} voulus={voulus} />
      <Ardoise lignes={[remise ? 'Remise : le sac est le même au 2e tirage' : `Sans remise : il reste ${n - 1} billes au 2e tirage`, `${p1} × ${p2} = ${m.bonne}`]} />
    </div>
  );
}

function DeuxEpreuves({ m, termine }) {
  const q = String(m.question);
  if (/deux pièces/.test(q)) {
    if (!termine) return <div className={`${P}__pieces`} aria-hidden="true"><span className={`${P}__piece`}>P</span><span className={`${P}__piece ${P}__piece--2`}>F</span></div>;
    const pileFace = /une fois pile et une fois face/.test(q);
    const voulus = pileFace ? [[0, 1], [1, 0]] : [[1, 1]];
    const cote = (i) => ({ nom: i ? 'face' : 'pile', p: '1/2', teinte: i ? '#c9a227' : '#adb5bd', court: i ? 'F' : 'P' });
    return (
      <div className={`${P}__atelier`}>
        <Arbre branches={[cote(0), cote(1)]} suite={() => [cote(0), cote(1)]} voulus={voulus} />
        <Ardoise lignes={['4 issues, toutes de probabilité 1/2 × 1/2 = 1/4', `${voulus.length} issue${voulus.length > 1 ? 's' : ''} qui convien${voulus.length > 1 ? 'nent' : 't'} : ${m.bonne}`]} />
      </div>
    );
  }
  const somme = Number((q.match(/somme de (\d+)/) ?? [])[1]);
  if (!Number.isFinite(somme)) return null;
  return (
    <div className={`${P}__atelier`}>
      <div className={`${P}__table`} aria-hidden="true">
        <span className={`${P}__case ${P}__case--coin`}>+</span>
        {[1, 2, 3, 4, 5, 6].map((x) => <span key={`t${x}`} className={`${P}__case ${P}__case--titre`}>{x}</span>)}
        {[1, 2, 3, 4, 5, 6].flatMap((y) => [
          <span key={`l${y}`} className={`${P}__case ${P}__case--titre`}>{y}</span>,
          ...[1, 2, 3, 4, 5, 6].map((x) => (
            <span key={`${x}-${y}`} className={`${P}__case${termine && x + y === somme ? ' est-favorable' : ''}`} style={{ '--k': x + y }}>
              {termine ? x + y : ''}
            </span>
          )),
        ])}
      </div>
      {termine && <Ardoise lignes={['36 cases, toutes aussi probables', `${[1, 2, 3, 4, 5, 6].flatMap((x) => [1, 2, 3, 4, 5, 6].filter((y) => x + y === somme)).length} cases de somme ${somme} : ${m.bonne}`]} />}
    </div>
  );
}

const SORTES = {
  'proba-simple': (props) => (/dé/.test(props.m.question) ? <De {...props} /> : <Couleur {...props} />),
  evenement: De,
  'pas-une-proba': Regle,
  contraire: Contraire,
  effectif: Effectif,
  'tirage-avec-remise': Tirages,
  'tirage-sans-remise': Tirages,
  'deux-epreuves': DeuxEpreuves,
};

export function QuestionBilles({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Enonce m={m} classe={`${P}__etiquette`} />
      {Sorte && <Sorte key={termine ? 'apres' : 'avant'} m={m} termine={termine} />}
    </div>
  );
}

/** Les réponses : de grosses billes de verre qui roulent doucement sur les pavés. */
export function GrossesBilles({ choix, fautes, choisir }) {
  const couleurs = ['#e03131', '#1c7ed6', '#2f9e44', '#f2b705'];
  return (
    <ul className={`${P}__pave`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i, '--t': couleurs[i % couleurs.length] }}>
          <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__grosse${fautes.includes(cle) ? ' est-faux' : ''}${String(libelle).length > 9 ? ' est-longue' : ''}`}>
            {libelle}
          </button>
        </li>
      ))}
    </ul>
  );
}

export const sceneBilles = {
  question: (m, termine) => <QuestionBilles m={m} termine={termine} />,
  choix: (props) => <GrossesBilles {...props} />,
};
