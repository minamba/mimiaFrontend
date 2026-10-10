import { Fragment, useMemo } from 'react';
import { ecrire as ecrireProgramme } from '../../../../lib/jeux/college/robot-college';
import {
  borne, ecrire, nombresDe, proprietesChoix, useEtapes,
} from './commun';

/**
 * L'ATELIER DES ROBOTS — « Le robot » (6e → 3e), le 09/10/2026.
 * La couverture : un hangar gris et vert anis, des bras robotisés, un sol de
 * dalles et de caissons. La scène en est le poste de commande :
 *   - LE PROGRAMME est écrit en BLOCS à la Scratch (orange pour les
 *     variables, or pour les boucles et les « si », bleu pour les
 *     déplacements, rose pour les blocs personnalisés) — c'est le texte de la
 *     question, ligne pour ligne, simplement coloré ;
 *   - un BRAS ROBOTISÉ veille au-dessus et pivote ;
 *   - LES RÉPONSES sont des caissons sur un TAPIS ROULANT (on clique celui
 *     qu'on veut : ils ne s'en vont jamais) ;
 *   - APRÈS LA RÉPONSE, le robot EXÉCUTE le programme pas à pas : le bloc en
 *     cours s'allume, les écrans des variables changent, le lutin se déplace
 *     sur sa grille. La boîte mystère se défait à l'envers, les motifs se
 *     prolongent. On voit POURQUOI c'est la bonne réponse.
 */

const P = 'sc-robot-college';

/* ----------------------------------------------- LA MACHINE PAS À PAS
   Le module exécute ses programmes d'un coup ; ici, on les rejoue en notant
   chaque pas et la ligne qui le fait (dans l'ordre où `ecrire` les écrit). */

const SENS = {
  haut: [0, 1], bas: [0, -1], droite: [1, 0], gauche: [-1, 0],
};

function valeur(e, env) {
  if (typeof e === 'number') return e;
  if (typeof e === 'string') return env[e];
  const [op, a, b] = e;
  const x = valeur(a, env);
  const y = valeur(b, env);
  if (op === '+') return x + y;
  if (op === '−') return x - y;
  return x * y;
}

function vrai(c, env) {
  if (c[0] === 'pair') return env[c[1]] % 2 === 0;
  if (c[0] === 'impair') return Math.abs(env[c[1]] % 2) === 1;
  const a = valeur(c[1], env);
  const b = valeur(c[2], env);
  return c[0] === '>' ? a > b : a < b;
}

/** Chaque instruction reçoit le numéro de sa ligne (et de ses « fin »), comme dans le texte écrit. */
function numeroter(programme) {
  let ligne = 0;
  const num = (liste) => liste.map((i) => {
    const l = ligne;
    ligne += 1;
    if (i[0] === 'repeter' || i[0] === 'jusqua') {
      const corps = num(i[2]);
      ligne += 1;
      return { i, l, corps };
    }
    if (i[0] === 'si') {
      const alors = num(i[2]);
      let lSinon = null;
      let sinon = null;
      if (i[3]) {
        lSinon = ligne;
        ligne += 1;
        sinon = num(i[3]);
      }
      ligne += 1;
      return {
        i, l, alors, lSinon, sinon,
      };
    }
    return { i, l };
  });
  const defs = {};
  (programme.defs ?? []).forEach((d) => {
    const l = ligne;
    ligne += 1;
    const corps = num(d.corps);
    ligne += 1;
    defs[d.nom] = { ...d, l, corps };
  });
  return { defs, corps: num(programme.corps) };
}

/** Le programme rejoué : la liste des pas, chacun avec sa ligne et les variables à ce moment. */
export function tracer(programme, depart = {}) {
  const { defs, corps } = numeroter(programme);
  const env = { ...depart };
  const pas = [];
  const noter = (l, extra = {}) => { if (pas.length < 500) pas.push({ l, env: { ...env }, ...extra }); };
  let garde = 0;
  const jouer = (liste) => liste.forEach((n) => {
    garde += 1;
    if (garde > 4000) return;
    const { i } = n;
    if (i[0] === 'mettre') {
      env[i[1]] = valeur(i[2], env);
      noter(n.l);
    } else if (i[0] === 'ajouter') {
      env[i[2]] += valeur(i[1], env);
      noter(n.l);
    } else if (i[0] === 'repeter') {
      for (let k = 0; k < i[1]; k += 1) {
        noter(n.l, { tour: k + 1 });
        jouer(n.corps);
      }
    } else if (i[0] === 'jusqua') {
      while (!vrai(i[1], env) && garde < 4000) {
        noter(n.l, { test: false });
        jouer(n.corps);
      }
      noter(n.l, { test: true });
    } else if (i[0] === 'si') {
      const v = vrai(i[1], env);
      noter(n.l, { test: v });
      if (v) jouer(n.alors);
      else if (n.sinon) {
        noter(n.lSinon);
        jouer(n.sinon);
      }
    } else if (i[0] === 'appel') {
      noter(n.l);
      const d = defs[i[1]];
      if (!d) return;
      env[d.param] = valeur(i[2], env);
      noter(d.l);
      jouer(d.corps);
    } else if (i[0] === 'bouge') {
      env.x += SENS[i[1]][0] * i[2];
      env.y += SENS[i[1]][1] * i[2];
      noter(n.l);
    } else if (i[0] === 'aller') {
      [, env.x, env.y] = i;
      noter(n.l);
    }
  });
  jouer(corps);
  return pas;
}

/* --------------------------------------------------- LES BLOCS COLORÉS */

/** La famille d'un bloc, d'après ses premiers mots (comme les couleurs de Scratch). */
function familleDe(ligne) {
  const t = ligne.trim();
  if (/^(répéter|fin répéter|si |sinon$|fin si)/.test(t)) return 'controle';
  if (/^(mettre|ajouter)/.test(t)) return 'variable';
  if (/^(monter|descendre|aller)/.test(t)) return 'mouvement';
  if (/^(définir|fin définir)/.test(t) || /^\w+ \(.+\)$/.test(t)) return 'bloc';
  return null;
}

/** Le texte de la question, ligne par ligne : les lignes du programme deviennent des blocs. */
function Programme({ question, allumee = null, debut = 0 }) {
  const lignes = String(question).split('\n');
  return (
    <div className={`${P}__programme`}>
      {lignes.map((l, k) => {
        const famille = familleDe(l);
        const retrait = l.match(/^\s*/)[0];
        const allume = allumee !== null && k === debut + allumee;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={k}>
            {famille ? (
              <span className={`${P}__ligne`}>
                {retrait && <span className={`${P}__retrait`}>{retrait}</span>}
                <span className={`${P}__bloc ${P}__bloc--${famille}${allume ? ' est-allume' : ''}`}>{l.slice(retrait.length)}</span>
              </span>
            ) : <span className={`${P}__texte`}>{l}</span>}
            {k < lignes.length - 1 ? '\n' : null}
          </Fragment>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------- LE DÉCOR */

/** Le bras robotisé blanc et vert anis de la couverture, qui pivote. */
function Bras() {
  return (
    <svg viewBox="0 0 120 100" className={`${P}__bras`} aria-hidden="true" focusable="false">
      <rect x="22" y="84" width="44" height="14" rx="3" className={`${P}__socle`} />
      <g className={`${P}__bras-epaule`}>
        <rect x="38" y="40" width="12" height="46" rx="6" className={`${P}__membre`} />
        <circle cx="44" cy="84" r="9" className={`${P}__articulation`} />
        <g className={`${P}__bras-coude`}>
          <rect x="40" y="30" width="56" height="12" rx="6" className={`${P}__membre`} />
          <circle cx="44" cy="36" r="8" className={`${P}__articulation`} />
          <g className={`${P}__pince`}>
            <circle cx="96" cy="36" r="6" className={`${P}__articulation`} />
            <path d="M96 42 l-6 12 M96 42 l6 12" />
          </g>
        </g>
      </g>
      <circle cx="30" cy="91" r="2.5" className={`${P}__voyant`} />
    </svg>
  );
}

/* ------------------------------------------------------ L'EXÉCUTION */

/** La grille du lutin : sa trace et sa position. `unite` : un carreau = une unité (6e) ou dix pas (5e). */
function Scene({
  points, courant, depart, fin = false, mini = 1,
}) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [x0, x1] = [Math.min(0, ...xs), Math.max(...xs, mini)];
  const [y0, y1] = [Math.min(0, ...ys), Math.max(...ys, mini)];
  const largeur = Math.max(x1 - x0, 1);
  const hauteur = Math.max(y1 - y0, 1);
  const echelle = Math.min(200 / largeur, 150 / hauteur, 26);
  // Dix carreaux au plus dans chaque sens : un carreau vaut 1, 2, 5, 10, 20, 50 ou 100.
  const pas = [1, 2, 5, 10, 20, 50, 100, 200].find((k) => Math.max(largeur, hauteur) / k <= 12) ?? 500;
  const X = (x) => 40 + (x - x0) * echelle;
  const Y = (y) => 46 + (y1 - y) * echelle;
  const lignesV = [];
  for (let x = Math.ceil(x0 / pas) * pas; x <= x1; x += pas) lignesV.push(x);
  const lignesH = [];
  for (let y = Math.ceil(y0 / pas) * pas; y <= y1; y += pas) lignesH.push(y);
  const trace = points.slice(0, courant + 1);
  const ici = points[Math.min(courant, points.length - 1)] ?? depart;
  return (
    <svg viewBox={`0 0 ${X(x1) + 34} ${Y(y0) + 26}`} className={`${P}__grille`} aria-hidden="true" focusable="false">
      {lignesV.map((x) => <line key={`v${x}`} x1={X(x)} x2={X(x)} y1={Y(y1)} y2={Y(y0)} className={x === 0 ? `${P}__axe` : `${P}__carreau`} />)}
      {lignesH.map((y) => <line key={`h${y}`} x1={X(x0)} x2={X(x1)} y1={Y(y)} y2={Y(y)} className={y === 0 ? `${P}__axe` : `${P}__carreau`} />)}
      {lignesV.filter((x, k) => k === 0 || k === lignesV.length - 1 || x === 0).map((x) => <text key={`tx${x}`} x={X(x)} y={Y(y0) + 18} textAnchor="middle">{ecrire(x)}</text>)}
      {lignesH.filter((y, k) => k === 0 || k === lignesH.length - 1 || y === 0).map((y) => <text key={`ty${y}`} x={X(x0) - 8} y={Y(y) + 5} textAnchor="end">{ecrire(y)}</text>)}
      {trace.length > 1 && <polyline points={trace.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} className={`${P}__trace`} />}
      <circle cx={X(depart.x)} cy={Y(depart.y)} r="5" className={`${P}__depart`} />
      <g className={`${P}__lutin`} style={{ transform: `translate(${X(ici.x)}px, ${Y(ici.y)}px)` }}>
        <rect x="-9" y="-9" width="18" height="18" rx="4" />
        <circle cx="-3.5" cy="-2" r="2" />
        <circle cx="3.5" cy="-2" r="2" />
        <line x1="0" y1="-9" x2="0" y2="-15" />
      </g>
      {fin && (
        <g className={`${P}__arrivee`}>
          <rect x={X(ici.x) - 34} y={Y(ici.y) - 40} width="68" height="22" rx="11" />
          <text x={X(ici.x)} y={Y(ici.y) - 24} textAnchor="middle">{`(${ecrire(ici.x)} ; ${ecrire(ici.y)})`}</text>
        </g>
      )}
    </svg>
  );
}

/** Les écrans des variables, comme des cadrans sur la machine. */
function Ecrans({ env, ordre }) {
  return (
    <div className={`${P}__ecrans`} aria-label="Les variables">
      {ordre.filter((nom) => nom in env).map((nom) => (
        <span key={nom} className={`${P}__ecran`}>
          <b>{nom}</b>
          <strong key={String(env[nom])}>{ecrire(env[nom])}</strong>
        </span>
      ))}
    </div>
  );
}

/** Le robot rejoue le programme : bloc allumé, écrans, et la grille s'il se déplace. */
function Execution({ m }) {
  const texte = ecrireProgramme(m.programme);
  const debut = String(m.question).slice(0, Math.max(0, String(m.question).indexOf(texte))).split('\n').length - 1;
  const depart = useMemo(() => m.depart ?? {}, [m.depart]);
  const pas = useMemo(() => tracer(m.programme, depart), [m.programme, depart]);
  const cadence = borne(Math.round(13000 / Math.max(pas.length, 1)), 140, 650);
  const n = useEtapes(Math.max(pas.length - 1, 0), cadence, 450);
  if (!pas.length) return <Programme question={m.question} />;
  const fini = n >= pas.length - 1;
  const etape = pas[n];
  const bouge = m.consigne === 'deplacement' || m.consigne === 'boucle-lutin';
  const ordre = [];
  pas.forEach((p) => Object.keys(p.env).forEach((k) => { if (!ordre.includes(k)) ordre.push(k); }));
  // Les positions du lutin : son départ (s'il est donné), puis chaque pas qui le place.
  const place = (p) => Number.isFinite(p.env.x) && Number.isFinite(p.env.y);
  const avant = m.depart ? [m.depart] : [];
  const points = bouge ? [...avant, ...pas.filter(place).map((p) => ({ x: p.env.x, y: p.env.y }))] : [];
  const indexPoint = bouge ? avant.length + pas.slice(0, n + 1).filter(place).length - 1 : 0;
  const info = etape.tour ? `tour ${etape.tour}` : (etape.test === true && 'condition vraie') || (etape.test === false && 'condition fausse') || '';
  return (
    <div className={`${P}__atelier ${P}__atelier--marche`}>
      <div className={`${P}__poste`}>
        <Bras />
        <Programme question={m.question} allumee={fini ? null : etape.l} debut={debut} />
        {info && !fini && <span key={n} className={`${P}__info`}>{info}</span>}
      </div>
      <div className={`${P}__sortie`}>
        {bouge && points.length > 0 && (
          <Scene points={points} courant={Math.max(indexPoint, 0)} depart={m.depart ?? points[0]} fin={fini} mini={m.depart ? 10 : 1} />
        )}
        <Ecrans env={etape.env} ordre={ordre} />
        <span className={`${P}__verdict${fini ? ' est-fini' : ''}`} role="status">{fini ? m.bonne : '…'}</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------- LES SORTES SANS PROGRAMME */

/** La boîte mystère (6e) : avant, la chaîne de la machine ; après, on la défait à l'envers. */
function Mystere({ m, termine }) {
  const { a, b, ajoute, r } = m.mystere;
  const n = (ajoute ? r - b : r + b) / a;
  const k = useEtapes(termine ? 3 : 0, 1000);
  const etapes = [
    { op: `× ${a}`, inverse: `÷ ${a}` },
    { op: ajoute ? `+ ${b}` : `− ${b}`, inverse: ajoute ? `− ${b}` : `+ ${b}` },
  ];
  const milieu = ajoute ? r - b : r + b;
  return (
    <div className={`${P}__mystere${termine ? ' est-defait' : ''}`}>
      <span className={`${P}__caisse ${P}__caisse--entree${termine && k >= 2 ? ' est-ouverte' : ''}`}>{termine && k >= 2 ? ecrire(n) : '?'}</span>
      <span className={`${P}__engrenage`}>
        <em>{termine ? etapes[0].inverse : etapes[0].op}</em>
      </span>
      <span className={`${P}__caisse`}>{termine && k >= 1 ? ecrire(milieu) : '·'}</span>
      <span className={`${P}__engrenage`}>
        <em>{termine ? etapes[1].inverse : etapes[1].op}</em>
      </span>
      <span className={`${P}__caisse ${P}__caisse--sortie`}>{ecrire(r)}</span>
      {termine && (
        <span className={`${P}__sens`}>
          {k >= 3 ? `Vérifions : ${ecrire(n)} ${etapes[0].op} ${etapes[1].op} = ${ecrire(r)}` : '← on défait les étapes, de la dernière à la première'}
        </span>
      )}
    </div>
  );
}

const ICONES = {
  allumettes: 'allumette', carreaux: 'carreau', jetons: 'jeton', cubes: 'cube',
};

/** Les motifs (6e) : avant, les trois premiers, dessinés ; après, la suite qui se prolonge. */
function Motifs({ m, termine }) {
  const lignes = String(m.question).split('\n');
  const valeurs = lignes.slice(0, 3).map((l) => nombresDe(l)[1]);
  const quoi = (lignes[0].match(/\d+ (\S+)$/) ?? [])[1];
  const rang = nombresDe(lignes[3] ?? '')[0];
  if (valeurs.some((v) => !Number.isFinite(v)) || !Number.isFinite(rang)) return null;
  const d = valeurs[1] - valeurs[0];
  const icone = ICONES[quoi] ?? 'jeton';
  return (
    <div className={`${P}__motifs`}>
      {valeurs.map((v, i) => (
        <div key={v} className={`${P}__motif`}>
          <span className={`${P}__motif-nom`}>{`Motif ${i + 1}`}</span>
          <span className={`${P}__pieces`}>
            {Array.from({ length: v }, (_, j) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={j} className={`${P}__piece ${P}__piece--${icone}${termine && i > 0 && j >= valeurs[i - 1] ? ' est-ajoutee' : ''}`} />
            ))}
          </span>
          {termine && i > 0 && <em className={`${P}__plus`}>{`+${d}`}</em>}
        </div>
      ))}
      {termine && (
        <p className={`${P}__suite`}>
          {`Motif ${rang} : ${valeurs[0]} + ${rang - 1} × ${d} = ${valeurs[0] + (rang - 1) * d}`}
        </p>
      )}
    </div>
  );
}

/* --------------------------------------------------------- LA SCÈNE */

export function QuestionRobot({ m, termine }) {
  let dessin;
  if (m.programme && termine) dessin = <Execution m={m} />;
  else if (m.programme) {
    dessin = (
      <div className={`${P}__atelier`}>
        <div className={`${P}__poste`}>
        <Bras /><Programme question={m.question} /></div>
        {m.consigne === 'deplacement' && m.depart && (
          <div className={`${P}__sortie`}>
            <Scene points={[m.depart]} courant={0} depart={m.depart} mini={10} />
          </div>
        )}
      </div>
    );
  } else {
    dessin = (
      <>
        <div className={`${P}__poste`}>
        <Bras /><Programme question={m.question} /></div>
        {/* La clé remonte la boîte quand la réponse tombe : son déroulé repart de zéro. */}
        {m.mystere && <Mystere key={termine ? 'defait' : 'pose'} m={m} termine={termine} />}
        {m.consigne === 'motifs' && <Motifs m={m} termine={termine} />}
      </>
    );
  }
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {dessin}
    </div>
  );
}

/** Les réponses : des caissons sur un tapis roulant. Ils ne partent jamais : on a tout le temps. */
export function TapisRoulant({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__tapis`}>
      <ul className={`${P}__caissons`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => (
          <li key={cle} style={{ '--i': i }}>
            <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__caisson${fautes.includes(cle) ? ' est-faux' : ''}`}>
              {libelle}
            </button>
          </li>
        ))}
      </ul>
      <span className={`${P}__bande`} aria-hidden="true" />
    </div>
  );
}

export const sceneRobot = {
  question: (m, termine) => <QuestionRobot m={m} termine={termine} />,
  // L'exécution finit sur la réponse, dans l'écran du robot, et la boîte
  // mystère sur le nombre de départ : pas de bulle en double. Les motifs la gardent.
  apres: (m) => (m.programme || m.mystere ? null : <p className="scene__bulle">{m.bonne}</p>),
  choix: (props) => <TapisRoulant {...props} />,
};
