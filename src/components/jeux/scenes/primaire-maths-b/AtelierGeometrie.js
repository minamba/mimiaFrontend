import * as regle from '../../../../lib/jeux/geometrieCM1';
import { FIGURES } from '../../../../lib/jeux/geometrieCM2';
import { rangee, rang } from './communs';
import './primaire-maths-b.css';

/**
 * L'ATELIER DE GÉOMÉTRIE — CM1 « Angles, droites et miroir », CM2 « Angles et
 * figures » (09/10/2026). La couverture du CM1 montre une fillette qui touche
 * son reflet dans un grand miroir au cadre de bois, un poteau indicateur
 * (Angles, Droites, Miroir), une équerre, une règle et un compas posés sur les
 * pierres ; celle du CM2, des figures lumineuses dans le ciel.
 *   - LA QUESTION : le poteau indicateur montre l'atelier du moment (sa
 *     planche s'allume), le dessin est épinglé sur une feuille, les outils
 *     flottent à côté (l'équerre, la règle, le compas, le rapporteur) ; le
 *     miroir a un cadre de bois et un reflet qui passe sur le verre ;
 *   - LES RÉPONSES : des PLANCHES fléchées clouées comme celles du poteau ;
 *     pour le miroir, trois petits MIROIRS encadrés ;
 *   - APRÈS LA RÉPONSE : l'outil vient faire la preuve sur le dessin —
 *     l'équerre se pose dans l'angle (plus fermé, pile, plus ouvert), le
 *     rapporteur mesure en balayant les degrés, l'équerre marque l'angle droit
 *     des perpendiculaires, l'écart se mesure trois fois entre les
 *     parallèles, la moitié se replie sur l'axe comme une feuille pliée, et la
 *     figure se couvre de ses codages (côtés égaux, angles droits).
 */

const rad = (d) => (d * Math.PI) / 180;

/** Un angle : deux demi-droites qui partent du même sommet. */
export function Angle({ angle, rotation }) {
  const [cx, cy, r] = [70, 130, 110];
  const bout = (a) => [cx + r * Math.cos(rad(-(rotation + a))), cy + r * Math.sin(rad(-(rotation + a)))];
  const [x1, y1] = bout(0);
  const [x2, y2] = bout(angle);
  return (
    <svg className="geo__dessin" viewBox="0 0 200 180" role="img" aria-label="Un angle">
      <line x1={cx} y1={cy} x2={x1} y2={y1} className="geo__trait" />
      <line x1={cx} y1={cy} x2={x2} y2={y2} className="geo__trait" />
      <circle cx={cx} cy={cy} r={4} className="geo__point" />
    </svg>
  );
}

/** Le tracé des deux droites : la seconde tournée de `ecart` degrés (0 : parallèle, décalée). */
function traits(rotation, ecart) {
  const trait = (angle, dx, dy) => {
    const [c, s] = [Math.cos(rad(angle)), Math.sin(rad(angle))];
    return {
      x1: 100 + dx - 90 * c, y1: 90 + dy - 90 * s, x2: 100 + dx + 90 * c, y2: 90 + dy + 90 * s,
    };
  };
  const decale = ecart === 0 ? 34 : 0;
  const n = [-Math.sin(rad(rotation)) * decale, Math.cos(rad(rotation)) * decale];
  return { premier: trait(rotation, -n[0], -n[1]), second: trait(rotation + ecart, n[0], n[1]), n };
}

/** Deux droites : la seconde tournée de `ecart` degrés (0 : parallèle, décalée). */
export function Droites({ rotation, ecart }) {
  const { premier, second } = traits(rotation, ecart);
  return (
    <svg className="geo__dessin" viewBox="0 0 200 180" role="img" aria-label="Deux droites">
      <line {...premier} className="geo__trait" />
      <line {...second} className="geo__trait geo__trait--second" />
    </svg>
  );
}

const C = 22;

/** Une moitié de figure en carreaux ; `droite` la place à droite de l'axe. */
export function Moitie({ cases, droite }) {
  return (
    <svg className="geo__moitie" viewBox={`0 0 ${regle.LARGEUR * C} ${regle.HAUTEUR * C}`} role="img" aria-label="Une moitié de figure">
      {Array.from({ length: regle.LARGEUR * regle.HAUTEUR }, (_, i) => (
        <rect key={i} x={(i % regle.LARGEUR) * C} y={Math.floor(i / regle.LARGEUR) * C} width={C} height={C} className="aires__trait" />
      ))}
      {cases.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x * C} y={y * C} width={C} height={C} className={droite ? 'geo__case geo__case--reflet' : 'geo__case'} />
      ))}
    </svg>
  );
}

function Miroir({ gauche }) {
  return (
    <div className="geo__miroir">
      <Moitie cases={gauche} />
      <span className="geo__axe" aria-hidden="true" />
      <span className="geo__vide" aria-hidden="true">?</span>
    </div>
  );
}

/** Les figures usuelles du CM2, dessinées à plat. */
export const SOMMETS = {
  carre: '55,35 135,35 135,115 55,115',
  rectangle: '25,50 175,50 175,125 25,125',
  losange: '100,15 155,90 100,165 45,90',
  parallelogramme: '55,50 175,50 145,130 25,130',
  'triangle-rectangle': '45,30 45,145 165,145',
  'triangle-equilateral': '100,25 170,146 30,146',
  'triangle-isocele': '100,20 140,150 60,150',
};

function Figure({ figure }) {
  return (
    <svg className="geo__dessin" viewBox="0 0 200 180" role="img" aria-label="Une figure">
      <polygon points={SOMMETS[figure]} className="geo__figure" />
    </svg>
  );
}

/** Le dessin de la manche, tel qu'il a toujours été. */
export function Dessin(m) {
  if (m.consigne === 'angle' || m.consigne === 'mesure') return <Angle angle={m.angle} rotation={m.rotation} />;
  if (m.consigne === 'figure') return <Figure figure={m.figure} />;
  if (m.consigne === 'droites') return <Droites rotation={m.rotation} ecart={m.ecart} />;
  return <Miroir gauche={m.gauche} />;
}

/* ------------------------------------------------------------------ LES PREUVES */

const point = (cx, cy, r, a) => [cx + r * Math.cos(rad(-a)), cy + r * Math.sin(rad(-a))];
const fmt = (p) => p.map((v) => Math.round(v * 10) / 10).join(' ');

/** L'équerre vient se poser dans l'angle : son coin droit au sommet, contre le premier côté. */
function AngleEquerre({ angle, rotation }) {
  const [cx, cy, r] = [70, 130, 110];
  const p1 = point(cx, cy, r, rotation);
  const p2 = point(cx, cy, r, rotation + angle);
  const e1 = point(cx, cy, 78, rotation);
  const e2 = point(cx, cy, 56, rotation + 90);
  const a1 = point(cx, cy, 30, rotation);
  const a2 = point(cx, cy, 30, rotation + angle);
  const c1 = point(cx, cy, 12, rotation);
  const c2 = point(cx, cy, 12, rotation + 90);
  const c3 = [c1[0] + c2[0] - cx, c1[1] + c2[1] - cy];
  return (
    <svg className="geo__dessin sc-le-miroir__preuve-dessin" viewBox="0 0 200 180" role="img" aria-label="L’équerre posée dans l’angle">
      <path d={`M ${fmt(a1)} A 30 30 0 ${angle > 180 ? 1 : 0} 0 ${fmt(a2)}`} className="sc-le-miroir__arc" />
      <line x1={cx} y1={cy} x2={p1[0]} y2={p1[1]} className="geo__trait" />
      <line x1={cx} y1={cy} x2={p2[0]} y2={p2[1]} className="geo__trait" />
      <g className="sc-le-miroir__equerre-posee">
        <polygon points={`${cx},${cy} ${fmt(e1)} ${fmt(e2)}`} className="sc-le-miroir__equerre" />
        <polyline points={`${fmt(c1)} ${fmt(c3)} ${fmt(c2)}`} className="sc-le-miroir__coin" />
      </g>
      <circle cx={cx} cy={cy} r={4} className="geo__point" />
    </svg>
  );
}

/** Le rapporteur se pose sur le premier côté ; un arc balaie les degrés jusqu'au second. */
function AngleRapporteur({ angle, rotation, bonne }) {
  const [cx, cy, r] = [70, 130, 110];
  const p1 = point(cx, cy, r, rotation);
  const p2 = point(cx, cy, r, rotation + angle);
  const debut = point(cx, cy, 70, rotation);
  const fin = point(cx, cy, 70, rotation + 180);
  const b1 = point(cx, cy, 40, rotation);
  const b2 = point(cx, cy, 40, rotation + angle);
  const etiquette = point(cx, cy, 52, rotation + angle / 2);
  return (
    <svg className="geo__dessin sc-le-miroir__preuve-dessin" viewBox="0 0 200 180" role="img" aria-label={`Le rapporteur : ${bonne}`}>
      <g className="sc-le-miroir__rapporteur">
        <path d={`M ${fmt(debut)} A 70 70 0 0 0 ${fmt(fin)} Z`} className="sc-le-miroir__demi-disque" />
        {rangee(19).map((k) => {
          const a = rotation + k * 10;
          const [ux, uy] = point(cx, cy, k % 3 === 0 ? 58 : 63, a);
          const [vx, vy] = point(cx, cy, 70, a);
          return <line key={k} x1={ux} y1={uy} x2={vx} y2={vy} className="sc-le-miroir__graduation" />;
        })}
      </g>
      <line x1={cx} y1={cy} x2={p1[0]} y2={p1[1]} className="geo__trait" />
      <line x1={cx} y1={cy} x2={p2[0]} y2={p2[1]} className="geo__trait" />
      <path d={`M ${fmt(b1)} A 40 40 0 0 0 ${fmt(b2)}`} pathLength="1" className="sc-le-miroir__balaye" />
      <g className="sc-le-miroir__degres">
        <rect x={etiquette[0] - 19} y={etiquette[1] - 11} width="38" height="20" rx="6" />
        <text x={etiquette[0]} y={etiquette[1] + 4}>{bonne}</text>
      </g>
      <circle cx={cx} cy={cy} r={4} className="geo__point" />
    </svg>
  );
}

/** Les droites, et la preuve : l'angle droit, les trois écarts égaux, ou le croisement de biais. */
function DroitesPreuve({ rotation, ecart, bonne }) {
  const { premier, second, n } = traits(rotation, ecart);
  const d1 = [Math.cos(rad(rotation)), Math.sin(rad(rotation))];
  const d2 = [Math.cos(rad(rotation + ecart)), Math.sin(rad(rotation + ecart))];
  const P = [100, 90];
  const plus = (a, b, k = 1) => [a[0] + k * b[0], a[1] + k * b[1]];
  let preuve = null;
  if (bonne === 'perpendiculaires') {
    const c1 = plus(P, d1, 16);
    const c2 = plus(P, d2, 16);
    const c3 = plus(c1, d2, 16);
    preuve = (
      <g className="sc-le-miroir__equerre-posee">
        <polygon points={`${fmt(P)} ${fmt(plus(P, d1, 60))} ${fmt(plus(P, d2, 44))}`} className="sc-le-miroir__equerre" />
        <polyline points={`${fmt(c1)} ${fmt(c3)} ${fmt(c2)}`} className="sc-le-miroir__coin" />
      </g>
    );
  } else if (bonne === 'paralleles') {
    preuve = [-55, 0, 55].map((t, k) => {
      const a = plus(plus(P, d1, t), n, -1);
      const b = plus(plus(P, d1, t), n, 1);
      return (
        <g key={t} className="sc-le-miroir__ecart" style={rang(k)}>
          <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
          <circle cx={a[0]} cy={a[1]} r="3" />
          <circle cx={b[0]} cy={b[1]} r="3" />
        </g>
      );
    });
  } else {
    const a1 = plus(P, d1, 24);
    const a2 = plus(P, d2, 24);
    preuve = (
      <g className="sc-le-miroir__croisement">
        <path d={`M ${fmt(a1)} A 24 24 0 0 1 ${fmt(a2)}`} className="sc-le-miroir__arc" />
        <circle cx={P[0]} cy={P[1]} r="7" className="sc-le-miroir__point-croise" />
      </g>
    );
  }
  return (
    <svg className="geo__dessin sc-le-miroir__preuve-dessin" viewBox="0 0 200 180" role="img" aria-label={regle.NOMS[bonne] ?? 'Deux droites'}>
      <line {...premier} className="geo__trait" />
      <line {...second} className="geo__trait geo__trait--second" />
      {preuve}
    </svg>
  );
}

/** La moitié qui manque se replie sur l'axe, comme une feuille pliée. */
function MiroirReflet({ gauche, reflet }) {
  return (
    <div className="geo__miroir sc-le-miroir__plie">
      <Moitie cases={gauche} />
      <span className="geo__axe" aria-hidden="true" />
      <span className="sc-le-miroir__volet">
        <Moitie cases={reflet} droite />
      </span>
    </div>
  );
}

/** Les codages d'une figure : un trait sur les côtés égaux, un petit carré aux angles droits. */
export function codages(points) {
  const pts = String(points).trim().split(/\s+/).map((p) => p.split(',').map(Number));
  const n = pts.length;
  const cotes = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    return { p, q, l: Math.hypot(q[0] - p[0], q[1] - p[1]) };
  });
  // Les côtés de même longueur (à 3 % près) portent le même nombre de traits.
  const groupes = [];
  cotes.forEach((c) => {
    const g = groupes.find((x) => Math.abs(x.l - c.l) / x.l < 0.03);
    if (g) g.cotes.push(c);
    else groupes.push({ l: c.l, cotes: [c] });
  });
  const traitsDe = [];
  groupes.filter((g) => g.cotes.length > 1).forEach((g, k) => g.cotes.forEach((c) => traitsDe.push({ ...c, n: k + 1 })));
  // Un angle droit : les deux côtés du sommet, rendus unitaires, ont un produit scalaire nul.
  const angles = pts.map((v, i) => {
    const a = pts[(i + n - 1) % n];
    const b = pts[(i + 1) % n];
    const lu = Math.hypot(a[0] - v[0], a[1] - v[1]);
    const lw = Math.hypot(b[0] - v[0], b[1] - v[1]);
    const u = [(a[0] - v[0]) / lu, (a[1] - v[1]) / lu];
    const w = [(b[0] - v[0]) / lw, (b[1] - v[1]) / lw];
    return Math.abs(u[0] * w[0] + u[1] * w[1]) < 0.03 ? { v, u, w } : null;
  }).filter(Boolean);
  return { traits: traitsDe, angles };
}

function FigureCodee({ figure }) {
  const points = SOMMETS[figure];
  if (!points) return null;
  const { traits: marques, angles } = codages(points);
  let k = 0;
  return (
    <svg className="geo__dessin sc-le-miroir__preuve-dessin" viewBox="0 0 200 180" role="img" aria-label={FIGURES[figure] ?? 'Une figure'}>
      <polygon points={points} className="geo__figure sc-le-miroir__figure-brille" />
      {marques.map(({ p, q, l, n }) => {
        const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        const d = [(q[0] - p[0]) / l, (q[1] - p[1]) / l];
        const o = [-d[1], d[0]];
        k += 1;
        return (
          <g key={`${p.join('.')}-${q.join('.')}`} className="sc-le-miroir__marque" style={rang(k)}>
            {rangee(n).map((j) => {
              const c = [m[0] + d[0] * (j - (n - 1) / 2) * 6, m[1] + d[1] * (j - (n - 1) / 2) * 6];
              return <line key={j} x1={c[0] - o[0] * 7} y1={c[1] - o[1] * 7} x2={c[0] + o[0] * 7} y2={c[1] + o[1] * 7} />;
            })}
          </g>
        );
      })}
      {angles.map(({ v, u, w }) => {
        const a = [v[0] + u[0] * 13, v[1] + u[1] * 13];
        const b = [v[0] + w[0] * 13, v[1] + w[1] * 13];
        const c = [a[0] + w[0] * 13, a[1] + w[1] * 13];
        k += 1;
        return <polyline key={v.join('.')} points={`${fmt(a)} ${fmt(c)} ${fmt(b)}`} className="sc-le-miroir__coin sc-le-miroir__marque" style={rang(k)} />;
      })}
    </svg>
  );
}

/** Ce que dit la preuve, en une phrase. */
function phrase(m) {
  if (m.consigne === 'angle') {
    return {
      aigu: 'Plus fermé que le coin de l’équerre : un angle aigu.',
      droit: 'Le coin de l’équerre s’y pose pile : un angle droit.',
      obtus: 'Plus ouvert que le coin de l’équerre : un angle obtus.',
    }[m.bonne];
  }
  if (m.consigne === 'mesure') return `Le rapporteur, posé sur le premier côté, compte à partir de 0 : ${m.bonne}.`;
  if (m.consigne === 'droites') {
    return {
      perpendiculaires: 'Elles se coupent en angle droit : perpendiculaires.',
      paralleles: 'Toujours le même écart, elles ne se croisent jamais : parallèles.',
      secantes: 'Elles se croisent, mais pas en angle droit : ni l’un ni l’autre.',
    }[m.bonne];
  }
  if (m.consigne === 'figure') {
    const pourquoi = {
      carre: 'quatre côtés égaux et quatre angles droits.',
      rectangle: 'quatre angles droits, et des côtés de deux longueurs.',
      losange: 'quatre côtés égaux, mais pas d’angle droit.',
      parallelogramme: 'ses côtés opposés sont égaux deux à deux, sans angle droit.',
      'triangle-rectangle': 'il a un angle droit.',
      'triangle-isocele': 'deux côtés égaux, pas trois.',
      'triangle-equilateral': 'ses trois côtés sont égaux.',
    }[m.bonne];
    return `${FIGURES[m.bonne] ?? ''} : ${pourquoi ?? ''}`;
  }
  return 'Pliée sur l’axe, chaque carreau retombe à la même distance : le reflet.';
}

function Preuve({ m }) {
  if (m.consigne === 'angle') return <AngleEquerre angle={m.angle} rotation={m.rotation} />;
  if (m.consigne === 'mesure') return <AngleRapporteur angle={m.angle} rotation={m.rotation} bonne={m.bonne} />;
  if (m.consigne === 'droites') return <DroitesPreuve rotation={m.rotation} ecart={m.ecart} bonne={m.bonne} />;
  if (m.consigne === 'figure') return <FigureCodee figure={m.figure} />;
  if (m.moities?.[m.bonne]) return <MiroirReflet gauche={m.gauche} reflet={m.moities[m.bonne]} />;
  return Dessin(m);
}

/* ------------------------------------------------------------------- LA SCÈNE */

const STATIONS = [
  ['angles', 'Angles', ['angle', 'mesure']],
  ['figures', 'Figures', ['figure']],
  ['droites', 'Droites', ['droites']],
  ['miroir', 'Miroir', ['miroir']],
];

/** Le poteau indicateur, comme sur la couverture : la planche de l'atelier s'allume. */
function Poteau({ consigne }) {
  return (
    <div className="sc-le-miroir__poteau" aria-hidden="true">
      <span className="sc-le-miroir__mat" />
      {STATIONS.map(([cle, nom, consignes], i) => (
        <span
          key={cle}
          className={`sc-le-miroir__panneau sc-le-miroir__panneau--${cle}${consignes.includes(consigne) ? ' est-ici' : ''}`}
          style={rang(i)}
        >
          {nom}
        </span>
      ))}
    </div>
  );
}

/** Les outils qui flottent à côté de la feuille. */
function Outils() {
  return (
    <div className="sc-le-miroir__outils" aria-hidden="true">
      <svg className="sc-le-miroir__outil sc-le-miroir__outil--equerre" viewBox="0 0 60 60" focusable="false">
        <path d="M4 56 L4 4 L56 56 Z M14 46 L14 28 L32 46 Z" fillRule="evenodd" />
      </svg>
      <svg className="sc-le-miroir__outil sc-le-miroir__outil--regle" viewBox="0 0 90 22" focusable="false">
        <rect x="1" y="1" width="88" height="20" rx="3" />
        {rangee(9).map((i) => <line key={i} x1={8 + i * 9.5} y1="1" x2={8 + i * 9.5} y2={i % 2 ? 7 : 11} />)}
      </svg>
      <svg className="sc-le-miroir__outil sc-le-miroir__outil--compas" viewBox="0 0 50 70" focusable="false">
        <circle cx="25" cy="8" r="6" />
        <path d="M22 13 L8 66 M28 13 L42 62" />
        <path d="M42 62 l-2 6" className="sc-le-miroir__mine" />
      </svg>
      <svg className="sc-le-miroir__outil sc-le-miroir__outil--rapporteur" viewBox="0 0 80 44" focusable="false">
        <path d="M2 42 A38 38 0 0 1 78 42 Z" />
        {rangee(7).map((i) => {
          const a = Math.PI - (i * Math.PI) / 6;
          return <line key={i} x1={40 + 30 * Math.cos(a)} y1={42 - 30 * Math.sin(a)} x2={40 + 37 * Math.cos(a)} y2={42 - 37 * Math.sin(a)} />;
        })}
      </svg>
    </div>
  );
}

export function QuestionGeometrie({ m, termine }) {
  const miroir = m.consigne === 'miroir';
  return (
    <div className={`sc-le-miroir${miroir ? ' sc-le-miroir--glace' : ''}${termine ? ' est-termine' : ''}`}>
      <Poteau consigne={m.consigne} />
      <div className="sc-le-miroir__atelier">
        <div className={miroir ? 'sc-le-miroir__cadre-bois' : 'sc-le-miroir__feuille'}>
          {miroir && <span className="sc-le-miroir__reflet" aria-hidden="true" />}
          {termine ? <Preuve m={m} /> : Dessin(m)}
        </div>
        {termine && <p className="sc-le-miroir__verdict">{phrase(m)}</p>}
      </div>
      <Outils />
    </div>
  );
}

/** Les réponses : des planches fléchées ; pour le miroir, de petits miroirs encadrés. */
export function PlanchesGeometrie({ choix, fautes, choisir }) {
  return (
    <ul className="sc-le-miroir__reponses" aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        const texte = typeof libelle === 'string';
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${texte ? `sc-le-miroir__planche sc-le-miroir__planche--${i % 2 ? 'gauche' : 'droite'}` : 'sc-le-miroir__petit-miroir'}${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const SCENE_GEOMETRIE = {
  rendreQuestion: (m, termine) => <QuestionGeometrie m={m} termine={termine} />,
  // La preuve dessinée et sa phrase montrent la réponse.
  rendreApres: () => null,
  rendreChoix: (c, m) => (m.consigne === 'miroir' ? <Moitie cases={m.moities[c.cle]} droite /> : c.libelle),
  rendreLesChoix: (props) => <PlanchesGeometrie {...props} />,
};
