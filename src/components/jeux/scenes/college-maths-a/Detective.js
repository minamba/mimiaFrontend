import { avecVisuel, classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireNombre, nombresDe,
} from './outils';

/**
 * L'ENQUÊTE DES RUINES — « Le détective des figures », 6e (09/10/2026). La
 * couverture : des ruines au soleil couchant, des triangles, des cercles et
 * des carrés incrustés dans la pierre, du lierre pourpre, une loupe posée
 * sur un piédestal, un jeune détective à l'écharpe rouge. La scène :
 *   - LA QUESTION : la fiche d'INDICE du dossier, trombone et tampon ; la
 *     loupe passe et repasse sur l'indice, des feuilles pourpres tombent ;
 *   - LES RÉPONSES : les SUSPECTS — des silhouettes encapuchonnées, un nom
 *     sous chacune : on accuse le bon (on ne montre pas leur forme, ce serait
 *     dénoncer le coupable) ;
 *   - APRÈS LA RÉPONSE : le coupable est démasqué — sa figure se trace avec
 *     ses codages (côtés égaux, angles droits, diagonales), le tampon
 *     « Affaire résolue » tombe, et l'indice décisif est relu.
 */
const P = 'sc-detective-des-figures';

/** Les sommets de chaque figure, dans un cadre de 160 × 124. */
const FORMES = {
  equilateral: [[80, 10], [20, 114], [140, 114]],
  isocele: [[80, 10], [45, 114], [115, 114]],
  'triangle-rectangle': [[25, 114], [25, 24], [145, 114]],
  'rectangle-isocele': [[30, 114], [30, 22], [122, 114]],
  quelconque: [[20, 114], [62, 16], [146, 90]],
  carre: [[38, 14], [122, 14], [122, 98], [38, 98]],
  rectangle: [[14, 24], [146, 24], [146, 98], [14, 98]],
  losange: [[80, 18], [150, 62], [80, 106], [10, 62]],
  parallelogramme: [[46, 22], [148, 22], [114, 102], [12, 102]],
};

const milieu = ([x0, y0], [x1, y1]) => [(x0 + x1) / 2, (y0 + y1) / 2];

/** Les marques d'un segment : `n` petits traits en son milieu (même longueur = même marque). */
function Traits({ a, b, n = 1 }) {
  const [mx, my] = milieu(a, b);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [ux, uy] = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  return Array.from({ length: n }, (_, k) => {
    const o = (k - (n - 1) / 2) * 5;
    const [cx, cy] = [mx + ux * o, my + uy * o];
    // eslint-disable-next-line react/no-array-index-key
    return <line key={k} x1={cx - uy * 6} y1={cy + ux * 6} x2={cx + uy * 6} y2={cy - ux * 6} className={`${P}__code`} />;
  });
}

/** Le petit carré de l'angle droit, au sommet s entre ses voisins p et q. */
function AngleDroit({ s, p, q }) {
  const u = (v) => {
    const l = Math.hypot(v[0] - s[0], v[1] - s[1]) || 1;
    return [((v[0] - s[0]) / l) * 10, ((v[1] - s[1]) / l) * 10];
  };
  const [a, b] = [u(p), u(q)];
  return <path d={`M${s[0] + a[0]} ${s[1] + a[1]} l${b[0]} ${b[1]} l${-a[0]} ${-a[1]}`} className={`${P}__code`} />;
}

/** La flèche du parallélisme, au milieu d'un segment. */
function Fleche({ a, b, n = 1 }) {
  const [mx, my] = milieu(a, b);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [ux, uy] = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  return Array.from({ length: n }, (_, k) => {
    const [cx, cy] = [mx + ux * k * 6, my + uy * k * 6];
    // eslint-disable-next-line react/no-array-index-key
    return <path key={k} d={`M${cx - ux * 6 - uy * 5} ${cy - uy * 6 + ux * 5} L${cx} ${cy} L${cx - ux * 6 + uy * 5} ${cy - uy * 6 - ux * 5}`} className={`${P}__code`} />;
  });
}

/** La figure démasquée et ses codages. */
function Figure({ forme, marques }) {
  const s = FORMES[forme];
  if (!s) return null;
  const cotes = s.map((a, i) => [a, s[(i + 1) % s.length]]);
  const avec = (x) => marques.includes(x);
  const centre = s.length === 4 ? milieu(s[0], s[2]) : null;
  return (
    <svg className={`${P}__figure`} viewBox="0 0 160 124" aria-hidden="true" focusable="false">
      <polygon points={s.map((p) => p.join(',')).join(' ')} className={`${P}__trace`} pathLength="1" />
      {avec('diagonales') && s.length === 4 && (
        <g className={`${P}__diagonales`}>
          <line x1={s[0][0]} y1={s[0][1]} x2={s[2][0]} y2={s[2][1]} />
          <line x1={s[1][0]} y1={s[1][1]} x2={s[3][0]} y2={s[3][1]} />
        </g>
      )}
      <g className={`${P}__codages`}>
        {avec('trois-egaux') && cotes.map(([a, b]) => <Traits key={`${a}`} a={a} b={b} />)}
        {avec('deux-egaux') && [cotes[0], cotes[2]].map(([a, b]) => <Traits key={`${a}`} a={a} b={b} />)}
        {avec('angle-droit') && <AngleDroit s={s[0]} p={s[1]} q={s[2]} />}
        {avec('quatre-egaux') && cotes.map(([a, b]) => <Traits key={`${a}`} a={a} b={b} />)}
        {avec('opposes-egaux') && cotes.map(([a, b], i) => <Traits key={`${a}`} a={a} b={b} n={(i % 2) + 1} />)}
        {avec('angles-droits') && s.map((p, i) => <AngleDroit key={`${p}`} s={p} p={s[(i + 1) % 4]} q={s[(i + 3) % 4]} />)}
        {avec('paralleles') && cotes.map(([a, b], i) => <Fleche key={`${a}`} a={i < 2 ? a : b} b={i < 2 ? b : a} n={(i % 2) + 1} />)}
        {avec('diag-milieu') && centre && [[s[0], centre], [centre, s[2]]].map(([a, b]) => <Traits key={`${a}`} a={a} b={b} n={1} />)}
        {avec('diag-milieu') && centre && [[s[1], centre], [centre, s[3]]].map(([a, b]) => <Traits key={`${a}`} a={a} b={b} n={2} />)}
        {avec('diag-egales') && centre && [[s[0], centre], [centre, s[2]], [s[1], centre], [centre, s[3]]].map(([a, b], i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Traits key={i} a={a} b={b} n={1} />
        ))}
        {avec('diag-perp') && centre && <AngleDroit s={centre} p={s[1]} q={s[2]} />}
      </g>
    </svg>
  );
}

/** Le cercle, son centre O, son rayon, et le point M à sa distance. */
function Cercle({ rayon, om = null }) {
  const rp = 34;
  const mp = om === null ? null : Math.min(56, (om / rayon) * rp);
  return (
    <svg className={`${P}__figure`} viewBox="0 0 160 124" aria-hidden="true" focusable="false">
      <circle cx="80" cy="62" r={rp} className={`${P}__trace`} pathLength="1" />
      <line x1="80" y1="62" x2={80 - rp} y2="62" className={`${P}__rayon`} />
      <text x={80 - rp / 2} y="56" textAnchor="middle" className={`${P}__cote`}>{`${ecrireNombre(rayon)} cm`}</text>
      <circle cx="80" cy="62" r="2.5" className={`${P}__point`} />
      <text x="84" y="76" className={`${P}__lettre`}>O</text>
      {mp !== null ? (
        <g className={`${P}__m`}>
          <line x1="80" y1="62" x2={80 + mp * 0.8} y2={62 - mp * 0.6} className={`${P}__om`} />
          <circle cx={80 + mp * 0.8} cy={62 - mp * 0.6} r="3" className={`${P}__point`} />
          <text x={84 + mp * 0.8} y={58 - mp * 0.6} className={`${P}__lettre`}>M</text>
        </g>
      ) : (
        <line x1={80 - rp} y1="62" x2={80 + rp} y2="62" className={`${P}__diametre`} />
      )}
    </svg>
  );
}

const PHRASES_TRIANGLES = {
  equilateral: ['equilateral', ['trois-egaux'], 'Trois côtés égaux, trois angles de 60° : équilatéral.'],
  isocele: ['isocele', ['deux-egaux'], 'Deux côtés égaux (et deux angles égaux) : isocèle.'],
  rectangle: ['triangle-rectangle', ['angle-droit'], 'Un angle droit, et c’est tout : rectangle.'],
  'rectangle-isocele': ['rectangle-isocele', ['angle-droit', 'deux-egaux'], 'Un angle droit ET deux côtés égaux : rectangle isocèle.'],
  quelconque: ['quelconque', [], 'Ni côtés égaux, ni angle droit : quelconque.'],
};

/** Pour chaque quadrilatère : ses codages et sa phrase, d'après ses côtés, puis d'après ses diagonales. */
const PAR_LES_ANGLES = {
  equilateral: 'Trois angles de 60°, donc trois côtés égaux : équilatéral.',
  isocele: 'Deux angles égaux, donc deux côtés égaux : isocèle.',
  rectangle: 'Un angle de 90°, les autres différents : rectangle.',
  'rectangle-isocele': 'Un angle de 90° et deux angles de 45° : rectangle isocèle.',
  quelconque: 'Trois angles différents, aucun de 90° : quelconque.',
};

const PAR_LES_COTES = {
  isocele: 'Deux longueurs égales : isocèle.',
  quelconque: 'Trois longueurs toutes différentes : quelconque.',
};

const PHRASES_QUADRILATERES = {
  carre: [['quatre-egaux', 'angles-droits'], 'Quatre côtés égaux ET quatre angles droits : carré.',
    ['diagonales', 'diag-milieu', 'diag-egales', 'diag-perp'], 'Diagonales de même milieu, de même longueur ET perpendiculaires : carré.'],
  rectangle: [['angles-droits', 'opposes-egaux'], 'Quatre angles droits : rectangle.',
    ['diagonales', 'diag-milieu', 'diag-egales'], 'Diagonales de même milieu et de même longueur : rectangle.'],
  losange: [['quatre-egaux'], 'Quatre côtés égaux : losange.',
    ['diagonales', 'diag-milieu', 'diag-perp'], 'Diagonales de même milieu et perpendiculaires : losange.'],
  parallelogramme: [['paralleles', 'opposes-egaux'], 'Côtés opposés parallèles : parallélogramme.',
    ['diagonales', 'diag-milieu'], 'Diagonales de même milieu, et rien de plus : parallélogramme.'],
};

const PROPRIETES = {
  'diag-perp': ['diagonales', 'diag-perp'],
  'diag-egales': ['diagonales', 'diag-egales'],
  'diag-milieu': ['diagonales', 'diag-milieu'],
  'angles-droits': ['angles-droits'],
  'cotes-egaux': ['quatre-egaux'],
  'cotes-paralleles': ['paralleles'],
  'un-angle-droit': ['angle-droit'],
  'diag-perp-egales': ['diagonales', 'diag-perp', 'diag-egales'],
};

const FIGURE_NOMMEE = [[/carré/, 'carre'], [/losange/, 'losange'], [/parallélogramme/, 'parallelogramme'], [/rectangle/, 'rectangle']];

function contenu(m) {
  const q = m.question;
  let dessin = null;
  let phrase = null;
  if (m.consigne === 'quel-triangle' && PHRASES_TRIANGLES[m.bonne]) {
    const [forme, marques, texte] = PHRASES_TRIANGLES[m.bonne];
    dessin = <Figure forme={forme} marques={marques} />;
    // L'indice parle d'angles, ou de longueurs : l'explication reprend sa langue.
    if (/°/.test(q)) phrase = PAR_LES_ANGLES[m.bonne];
    else if (/cm/.test(q)) phrase = PAR_LES_COTES[m.bonne] ?? texte;
    else phrase = texte;
  } else if (m.consigne === 'quel-quadrilatere' && PHRASES_QUADRILATERES[m.bonne]) {
    const [marques, texte, diagonales, phraseDiagonales] = PHRASES_QUADRILATERES[m.bonne];
    const diag = /Diagonales/.test(q);
    dessin = <Figure forme={m.bonne} marques={diag ? diagonales : marques} />;
    phrase = diag ? phraseDiagonales : texte;
  } else if (m.consigne === 'propriete-toujours') {
    const forme = FIGURE_NOMMEE.find(([motif]) => motif.test(q))?.[1];
    if (!forme || !PROPRIETES[m.bonne]) return null;
    dessin = <Figure forme={forme} marques={PROPRIETES[m.bonne]} />;
    const nom = FIGURE_NOMMEE.find(([motif]) => motif.test(q))[0].source;
    phrase = `Tous les ${nom}s, sans exception, ont cette propriété : c’est elle qui est toujours vraie.`;
  } else if (m.consigne === 'cercle-position') {
    const r = /de (rayon|diamètre) (\S+) cm\. OM = (\S+) cm/.exec(q);
    if (!r) return null;
    const [v, om] = nombresDe(`${r[2]} ${r[3]}`);
    const rayon = r[1] === 'rayon' ? v : v / 2;
    dessin = <Cercle rayon={rayon} om={om} />;
    const signe = om === rayon ? '=' : (om < rayon ? '<' : '>');
    phrase = `${r[1] === 'diamètre' ? `Rayon : ${ecrireNombre(v)} ÷ 2 = ${ecrireNombre(rayon)} cm. ` : ''}OM = ${ecrireNombre(om)} cm ${signe} ${ecrireNombre(rayon)} cm.`;
  } else if (m.consigne === 'cercle-mesure') {
    const [v] = nombresDe(q);
    if (v === undefined) return null;
    const donneRayon = /rayon de/.test(q);
    dessin = <Cercle rayon={donneRayon ? v : v / 2} />;
    phrase = donneRayon ? `Le diamètre fait deux rayons : 2 × ${ecrireNombre(v)} = ${ecrireNombre(2 * v)} cm.` : `Le rayon, c’est la moitié du diamètre : ${ecrireNombre(v)} ÷ 2 = ${ecrireNombre(v / 2)} cm.`;
  }
  if (!dessin) return null;
  return (
    <div className={`${P}__dossier-resolu`}>
      <div className={`${P}__portrait`}>
        {dessin}
        <span className={`${P}__tampon`} aria-hidden="true">Affaire résolue</span>
      </div>
      <Etapes p={P} lignes={[phrase]} depart={1.2} />
    </div>
  );
}

/** Le décor : du lierre pourpre, des feuilles qui tombent. */
function Ruines() {
  return (
    <div className={`${P}__ruines`} aria-hidden="true">
      <span className={`${P}__incrustation ${P}__incrustation--triangle`} />
      <span className={`${P}__incrustation ${P}__incrustation--cercle`} />
      <span className={`${P}__incrustation ${P}__incrustation--carre`} />
      {[8, 30, 55, 77, 93].map((x, i) => (
        <span key={x} className={`${P}__feuille`} style={{ left: `${x}%`, animationDelay: `${(i * -1.4).toFixed(1)}s` }} />
      ))}
    </div>
  );
}

export function QuestionDetective({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {!termine && <Ruines />}
      {avecVisuel(m, (
        <div className={`${P}__indice`}>
          <span className={`${P}__trombone`} aria-hidden="true" />
          <span className={`${P}__titre`} aria-hidden="true">Indice</span>
          <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
          {!termine && <span className={`${P}__loupe`} aria-hidden="true" />}
        </div>
      ))}
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={2} />}
    </div>
  );
}

/** Les réponses : les suspects, encapuchonnés ; on accuse le bon. */
export function Suspects({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__suspects`} aria-label="Accuse le bon suspect">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__suspect${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__silhouette`} aria-hidden="true">
              <span className={`${P}__yeux`} />
            </span>
            <span className={`${P}__nom`}>{libelle}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
