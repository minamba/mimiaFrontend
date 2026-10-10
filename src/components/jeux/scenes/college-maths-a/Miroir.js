import { classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireNombre, lireNombre,
} from './outils';

/**
 * LE LAC MIROIR — « Le miroir », de la 6e à la 3e (09/10/2026). La
 * couverture : un pont rouge au-dessus d'un lac si calme qu'il le reflète
 * tout entier, des érables flamboyants, une jeune fille en kimono accoudée
 * à la balustrade de bambou. La scène :
 *   - LA QUESTION : une plaque votive de bois (un ema) suspendue à son
 *     cordon rouge, sous une branche d'érable flamboyante qui se balance ;
 *     des feuilles tombent en tournoyant ;
 *   - LES RÉPONSES : des lanternes de papier qui flottent sur le lac, avec
 *     leur reflet — on choisit la sienne ;
 *   - APRÈS LA RÉPONSE : le lac devient un repère. Le point et son image
 *     apparaissent, reliés comme il faut : perpendiculaire à l'axe, milieu O,
 *     même flèche pour la translation, quart de tour pour la rotation, rayon
 *     qui s'étire pour l'homothétie. Les droites, les parallélogrammes et les
 *     notations se dessinent aussi. Avant la réponse, rien n'est tracé.
 */
const P = 'sc-miroir-college';

const e = (x) => ecrireNombre(x);
/** Un nombre négatif entre parenthèses quand il suit un signe : « 3 − (−1) ». */
const ep = (x) => (x < 0 ? `(${e(x)})` : e(x));
const COORD = /([A-Z])?\(\s*([−-]?\d+(?:,\d+)?)\s*;\s*([−-]?\d+(?:,\d+)?)\s*\)/g;

/** Tous les points écrits « A(3 ; −2) » ou « (0 ; 7) » de la question. */
function points(texte) {
  return [...String(texte).matchAll(COORD)].map((r) => ({ nom: r[1] ?? '', x: lireNombre(r[2]), y: lireNombre(r[3]) }));
}
const coord = (texte) => points(texte)[0] ?? null;
const ecrit = ({ x, y }) => `(${e(x)} ; ${e(y)})`;

/** LE REPÈRE DU LAC : une grille, des points, des segments, un axe, un arc. */
function Repere({
  pts = [], segments = [], axe = null, arc = null,
}) {
  const xs = [...pts.map((p) => p.x), ...segments.flatMap((s) => [s.a.x, s.b.x]), 0];
  const ys = [...pts.map((p) => p.y), ...segments.flatMap((s) => [s.a.y, s.b.y]), 0];
  if (axe?.sens === 'v') xs.push(axe.k);
  if (axe?.sens === 'h') ys.push(axe.k);
  const [x0, x1] = [Math.min(...xs) - 1, Math.max(...xs) + 1];
  const [y0, y1] = [Math.min(...ys) - 1, Math.max(...ys) + 1];
  if (![x0, x1, y0, y1].every(Number.isFinite) || x1 - x0 > 60 || y1 - y0 > 60) return null;
  const u = Math.min(300 / (x1 - x0), 190 / (y1 - y0), 24);
  const L = (x1 - x0) * u + 20;
  const H = (y1 - y0) * u + 20;
  const X = (x) => 10 + (x - x0) * u;
  const Y = (y) => 10 + (y1 - y) * u;
  const grille = [];
  for (let x = Math.ceil(x0); x <= x1; x += 1) grille.push(<line key={`x${x}`} x1={X(x)} x2={X(x)} y1={Y(y0)} y2={Y(y1)} className={x === 0 ? `${P}__axe-repere` : undefined} />);
  for (let y = Math.ceil(y0); y <= y1; y += 1) grille.push(<line key={`y${y}`} x1={X(x0)} x2={X(x1)} y1={Y(y)} y2={Y(y)} className={y === 0 ? `${P}__axe-repere` : undefined} />);
  return (
    <svg className={`${P}__repere`} viewBox={`0 0 ${L.toFixed(1)} ${H.toFixed(1)}`} aria-hidden="true" focusable="false">
      <defs>
        <marker id={`${P}-pointe`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className={`${P}__pointe`} />
        </marker>
      </defs>
      <g className={`${P}__grille`}>{grille}</g>
      {axe && (axe.sens === 'h'
        ? <line x1={X(x0)} x2={X(x1)} y1={Y(axe.k)} y2={Y(axe.k)} className={`${P}__axe`} />
        : <line x1={X(axe.k)} x2={X(axe.k)} y1={Y(y0)} y2={Y(y1)} className={`${P}__axe`} />)}
      {segments.map((s, i) => (
        <line
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          x1={X(s.a.x)}
          y1={Y(s.a.y)}
          x2={X(s.b.x)}
          y2={Y(s.b.y)}
          className={`${P}__segment ${s.classe ?? ''}`}
          markerEnd={s.fleche ? `url(#${P}-pointe)` : undefined}
          pathLength="1"
          style={{ '--d': `${s.retard ?? 0.6}s` }}
        />
      ))}
      {arc && (() => {
        const r = Math.hypot(arc.de.x - arc.centre.x, arc.de.y - arc.centre.y) * u;
        return (
          <path
            d={`M${X(arc.de.x)} ${Y(arc.de.y)} A${r} ${r} 0 0 ${arc.horaire ? 1 : 0} ${X(arc.a.x)} ${Y(arc.a.y)}`}
            className={`${P}__arc`}
            markerEnd={`url(#${P}-pointe)`}
            pathLength="1"
          />
        );
      })()}
      {pts.map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={i} className={`${P}__point ${p.classe ?? ''}`} style={{ '--d': `${p.retard ?? 0.2}s` }}>
          <circle cx={X(p.x)} cy={Y(p.y)} r="4" />
          <text x={X(p.x) + 6} y={Y(p.y) - 6}>{p.nom}</text>
        </g>
      ))}
    </svg>
  );
}

/** Un parallélogramme ABCD (ou un quadrilatère nommé), ses diagonales s'il le faut, des étiquettes. */
function Parallelogramme({
  noms = ['A', 'B', 'C', 'D'], diagonales = false, etiquettes = [], fleches = false,
}) {
  const s = [[40, 30], [190, 30], [160, 120], [10, 120]];
  const centre = [100, 75];
  return (
    <svg className={`${P}__quadri`} viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <polygon points={s.map((p) => p.join(',')).join(' ')} className={`${P}__contour`} pathLength="1" />
      {diagonales && (
        <g className={`${P}__diagonales`}>
          <line x1={s[0][0]} y1={s[0][1]} x2={s[2][0]} y2={s[2][1]} />
          <line x1={s[1][0]} y1={s[1][1]} x2={s[3][0]} y2={s[3][1]} />
          <circle cx={centre[0]} cy={centre[1]} r="3" />
          <text x={centre[0] + 6} y={centre[1] + 14}>O</text>
        </g>
      )}
      {fleches && (
        <g className={`${P}__fleches`}>
          <line x1="50" y1="22" x2="180" y2="22" markerEnd={`url(#${P}-pointe-q)`} />
          <line x1="20" y1="112" x2="150" y2="112" markerEnd={`url(#${P}-pointe-q)`} />
          <defs>
            <marker id={`${P}-pointe-q`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" className={`${P}__pointe`} />
            </marker>
          </defs>
        </g>
      )}
      {s.map((p, i) => (
        <text key={noms[i]} x={p[0] + (i === 1 || i === 2 ? 6 : -14)} y={p[1] + (i < 2 ? -6 : 16)} className={`${P}__sommet`}>{noms[i]}</text>
      ))}
      {etiquettes.map(({ x, y, texte, classe }) => (
        <text key={texte + x} x={x} y={y} textAnchor="middle" className={`${P}__etiquette ${classe ?? ''}`}>{texte}</text>
      ))}
    </svg>
  );
}

/** Trois droites et leurs relations : la commune à plat, les deux autres selon // ou ⊥. */
function Droites({ relations, commune }) {
  const lignes = [{ nom: commune, sens: 'h', y: 60 }];
  relations.forEach(({ autre, rel }, i) => {
    if (rel === '//') lignes.push({ nom: autre, sens: 'h', y: i ? 100 : 22 });
    else lignes.push({ nom: autre, sens: 'v', x: i ? 150 : 60 });
  });
  return (
    <svg className={`${P}__droites`} viewBox="0 0 220 124" aria-hidden="true" focusable="false">
      {lignes.map((l, i) => (
        <g key={l.nom} className={`${P}__droite`} style={{ '--d': `${(0.3 + i * 0.5).toFixed(2)}s` }}>
          {l.sens === 'h'
            ? <line x1="8" x2="212" y1={l.y} y2={l.y} pathLength="1" />
            : <line x1={l.x} x2={l.x} y1="6" y2="118" pathLength="1" />}
          <text x={l.sens === 'h' ? 196 : l.x + 6} y={l.sens === 'h' ? l.y - 6 : 16}>{`(${l.nom})`}</text>
        </g>
      ))}
    </svg>
  );
}

/** La notation : un segment s'arrête, une demi-droite file d'un côté, une droite des deux. */
function Notation({ sorte, a, b }) {
  const pointes = {
    droite: [true, true], 'demi-droite': [false, true], segment: [false, false], longueur: [false, false],
  }[sorte];
  return (
    <svg className={`${P}__notation`} viewBox="0 0 240 70" aria-hidden="true" focusable="false">
      <defs>
        <marker id={`${P}-pointe-n`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className={`${P}__pointe`} />
        </marker>
      </defs>
      <line
        x1={pointes[0] ? 8 : 60}
        x2={pointes[1] ? 232 : 180}
        y1="40"
        y2="40"
        className={`${P}__trait-notation`}
        markerStart={pointes[0] ? `url(#${P}-pointe-n)` : undefined}
        markerEnd={pointes[1] ? `url(#${P}-pointe-n)` : undefined}
        pathLength="1"
      />
      {sorte === 'longueur' && <path d="M60 22 H180 M60 16 V28 M180 16 V28" className={`${P}__mesure`} />}
      <circle cx="60" cy="40" r="4" className={`${P}__point-n`} />
      <circle cx="180" cy="40" r="4" className={`${P}__point-n`} />
      <text x="60" y="62" textAnchor="middle" className={`${P}__sommet`}>{a}</text>
      <text x="180" y="62" textAnchor="middle" className={`${P}__sommet`}>{b}</text>
    </svg>
  );
}

/** Deux triangles : l'un, et son image (glissée, ou agrandie, ou réduite). */
function Images({ rapport = 1, glisse = false }) {
  const k = Math.min(2.2, Math.max(0.35, Math.abs(rapport)));
  const tri = '0,0 34,0 10,-30';
  return (
    <svg className={`${P}__images`} viewBox="0 0 240 96" aria-hidden="true" focusable="false">
      <g transform="translate(16 84)"><polygon points={tri} className={`${P}__figure-depart`} /></g>
      <g className={`${P}__figure-image`} transform={`translate(${glisse ? 150 : 130} ${glisse ? 60 : 84}) scale(${glisse ? 1 : k})`}>
        <polygon points={tri} transform={rapport < 0 ? 'rotate(180 17 -15)' : undefined} />
      </g>
      {glisse && <line x1="40" y1="70" x2="160" y2="46" className={`${P}__glisse`} markerEnd={`url(#${P}-pointe-i)`} />}
      <defs>
        <marker id={`${P}-pointe-i`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className={`${P}__pointe`} />
        </marker>
      </defs>
    </svg>
  );
}

const nomsDroites = (t) => [...String(t).matchAll(/\(d([₁₂₃])\)/g)].map((r) => `d${r[1]}`);

function lire(m) {
  const q = m.question;
  const bonne = coord(m.bonne);
  const pts = points(q);
  switch (m.consigne) {
    case 'symetrie-axiale': {
      const sens = /horizontale/.test(q) ? 'h' : 'v';
      const [passe, A] = pts;
      if (!passe || !A || !bonne) return null;
      const k = sens === 'h' ? passe.y : passe.x;
      const ecart = sens === 'h' ? A.y - k : A.x - k;
      return {
        vue: <Repere axe={{ sens, k }} pts={[{ ...A, nom: 'A' }, { ...bonne, nom: 'A′', classe: `${P}__image`, retard: 1.4 }]} segments={[{ a: A, b: bonne, classe: `${P}__pointille` }]} />,
        lignes: [
          `A est à ${e(Math.abs(ecart))} de l’axe ; A′ aussi, de l’autre côté, sur la perpendiculaire.`,
          sens === 'h' ? `y : ${e(k)} ${ecart > 0 ? '−' : '+'} ${e(Math.abs(ecart))} = ${e(bonne.y)}, et x ne bouge pas.` : `x : ${e(k)} ${ecart > 0 ? '−' : '+'} ${e(Math.abs(ecart))} = ${e(bonne.x)}, et y ne bouge pas.`,
        ],
      };
    }
    case 'symetrie-centrale': {
      const [O, A] = pts;
      if (!O || !A || !bonne) return null;
      return {
        vue: <Repere pts={[{ ...O, nom: 'O', classe: `${P}__centre` }, { ...A, nom: 'A' }, { ...bonne, nom: 'A′', classe: `${P}__image`, retard: 1.4 }]} segments={[{ a: A, b: bonne, classe: `${P}__pointille` }]} />,
        lignes: ['O est le milieu de [AA′] : on refait le même pas au-delà de O.', `x : ${e(O.x)} + (${e(O.x)} − ${ep(A.x)}) = ${e(bonne.x)} ; y : ${e(O.y)} + (${e(O.y)} − ${ep(A.y)}) = ${e(bonne.y)}`],
      };
    }
    case 'translation':
    case 'vecteur': {
      // La flèche va du premier point nommé au second (« vecteur FE » : de F à E).
      const v = /vecteur ([A-Z])([A-Z])/.exec(q);
      const parNom = (n) => pts.find((p) => p.nom === n);
      const [B, C] = v ? [parNom(v[1]), parNom(v[2])] : pts;
      const A = pts[pts.length - 1];
      if (!B || !C || !A || !bonne) return null;
      const dx = C.x - B.x;
      const dy = C.y - B.y;
      return {
        vue: (
          <Repere
            pts={[{ ...B }, { ...C }, { ...A }, { ...bonne, nom: `${A.nom}′`, classe: `${P}__image`, retard: 1.6 }]}
            segments={[{ a: B, b: C, fleche: true, retard: 0.4 }, { a: A, b: bonne, fleche: true, classe: `${P}__image`, retard: 1.2 }]}
          />
        ),
        lignes: [`De ${B.nom} à ${C.nom} : ${dx >= 0 ? '+' : '−'} ${e(Math.abs(dx))} en x, ${dy >= 0 ? '+' : '−'} ${e(Math.abs(dy))} en y.`, `Même flèche depuis ${A.nom} : ${ecrit({ x: A.x + dx, y: A.y + dy })}`],
      };
    }
    case 'rotation': {
      const [O, A] = pts;
      if (!O || !A || !bonne) return null;
      const horaire = !/inverse/.test(q);
      return {
        vue: <Repere pts={[{ ...O, nom: 'O', classe: `${P}__centre` }, { ...A, nom: 'A' }, { ...bonne, nom: 'A′', classe: `${P}__image`, retard: 1.8 }]} segments={[{ a: O, b: A, retard: 0.4 }, { a: O, b: bonne, classe: `${P}__image`, retard: 1.6 }]} arc={{ centre: O, de: A, a: bonne, horaire }} />,
        lignes: [`Un quart de tour autour de O : OA′ = OA, et l’angle AOA′ est droit.`],
      };
    }
    case 'homothetie-point': {
      const [O, A] = pts;
      const k = lireNombre(/rapport (\S+?)\./.exec(q)?.[1]);
      if (!O || !A || !bonne || k === null) return null;
      return {
        vue: <Repere pts={[{ ...O, nom: 'O', classe: `${P}__centre` }, { ...A, nom: 'A' }, { ...bonne, nom: 'A′', classe: `${P}__image`, retard: 1.6 }]} segments={[{ a: O, b: bonne, classe: `${P}__pointille`, retard: 0.6 }]} />,
        lignes: [
          `De O à A : (${e(A.x - O.x)} ; ${e(A.y - O.y)}). On multiplie ce pas par ${e(k)} :`,
          `(${e(A.x - O.x)} × ${ep(k)} ; ${e(A.y - O.y)} × ${ep(k)}) = (${e((A.x - O.x) * k)} ; ${e((A.y - O.y) * k)}), en partant de O.`,
        ],
      };
    }
    case 'droites': {
      const noms = nomsDroites(q);
      const rels = [...q.matchAll(/(\/\/|⊥)/g)].map((r) => r[1]);
      if (noms.length < 6 || rels.length < 2) return null;
      const [a1, b1, a2, b2] = noms;
      const commune = [a1, b1].find((n) => n === a2 || n === b2);
      if (!commune) return null;
      const autre1 = a1 === commune ? b1 : a1;
      const autre2 = a2 === commune ? b2 : a2;
      const memes = rels[0] === rels[1];
      return {
        vue: <Droites commune={commune} relations={[{ autre: autre1, rel: rels[0] }, { autre: autre2, rel: rels[1] }]} />,
        lignes: [memes
          ? `(${autre1}) et (${autre2}) sont toutes deux ${rels[0] === '//' ? 'parallèles' : 'perpendiculaires'} à (${commune}) : elles sont parallèles entre elles.`
          : `L’une est parallèle à (${commune}), l’autre lui est perpendiculaire : elles sont perpendiculaires entre elles.`],
      };
    }
    case 'notation': {
      const r = /(?:par|extrémités|origine)\s+([A-Z])\s+(?:et|qui passe par)\s+([A-Z])/.exec(q) ?? /\[([A-Z])([A-Z])\]/.exec(q);
      if (!r) return null;
      let sorte = 'segment';
      if (/^La droite/.test(q)) sorte = 'droite';
      else if (/demi-droite/.test(q)) sorte = 'demi-droite';
      else if (/longueur/.test(q)) sorte = 'longueur';
      const phrases = {
        droite: 'Une droite file des deux côtés : deux parenthèses.',
        'demi-droite': 'Un crochet du côté de l’origine, où elle s’arrête ; une parenthèse de l’autre, où elle file.',
        segment: 'Un segment s’arrête des deux côtés : deux crochets.',
        longueur: 'Une longueur est un nombre : ni crochets, ni parenthèses.',
      };
      return { vue: <Notation sorte={sorte} a={r[1]} b={r[2]} />, lignes: [phrases[sorte]] };
    }
    case 'diagonales': {
      const r = /(\w\w) = (\S+) cm et (\w\w) = (\S+) cm\.\n?\s*(\w\w) = \?/.exec(q);
      if (!r) return null;
      const demi = r[5];
      const diag = demi.includes('A') || demi.includes('C') ? [r[1], r[2]] : [r[3], r[4]];
      const longueur = lireNombre(diag[1]);
      return {
        vue: <Parallelogramme diagonales etiquettes={[{ x: 70, y: 52, texte: `${r[1]} = ${r[2]}` }, { x: 150, y: 60, texte: `${r[3]} = ${r[4]}` }]} />,
        lignes: [`Les diagonales d’un parallélogramme se coupent en leur milieu O.`, `${demi} = ${diag[0]} ÷ 2 = ${e(longueur / 2)} cm`],
      };
    }
    case 'parallelogramme': {
      const angle = /angle en (\w) mesure (\d+)°/.exec(q);
      if (angle) {
        const a = Number(angle[2]);
        const demande = /angle en (\w) = \?/.exec(q)?.[1] ?? 'B';
        // L'angle opposé est égal ; un angle voisin le complète à 180°.
        const oppose = demande === 'C';
        const place = {
          B: { x: 168, y: 48 }, C: { x: 140, y: 112 }, D: { x: 36, y: 112 },
        }[demande] ?? { x: 168, y: 48 };
        return {
          vue: <Parallelogramme etiquettes={[{ x: 58, y: 48, texte: `${a}°` }, { ...place, texte: `${oppose ? a : 180 - a}°`, classe: `${P}__cherche` }]} />,
          lignes: [oppose
            ? `Deux angles opposés d’un parallélogramme sont égaux : l’angle en C mesure ${a}°, comme en A.`
            : `Deux angles qui se suivent dans un parallélogramme font 180° ensemble : 180° − ${a}° = ${180 - a}°.`],
        };
      }
      const r = /(\w\w) = (\S+) cm et (\w\w) = (\S+) cm\.\n?\s*(\w\w) = \?/.exec(q);
      if (!r) return null;
      return {
        vue: <Parallelogramme etiquettes={[{ x: 115, y: 22, texte: `${r[1]} = ${r[2]}` }, { x: 186, y: 80, texte: `${r[3]} = ${r[4]}` }, { x: 85, y: 140, texte: `${r[5]} = ?`, classe: `${P}__cherche` }]} />,
        lignes: [`Les côtés opposés d’un parallélogramme ont la même longueur.`],
      };
    }
    case 'translation-parallelogramme': {
      const noms = String(m.bonne).split('');
      if (noms.length !== 4) return null;
      return {
        vue: <Parallelogramme noms={noms} fleches />,
        lignes: [`${noms[0]} → ${noms[1]} et ${noms[3]} → ${noms[2]} : la même flèche. Le quadrilatère se lit dans l’ordre du tour : ${m.bonne}.`],
      };
    }
    case 'translation-mesure':
      return {
        vue: <Images glisse />,
        lignes: ['Une translation fait glisser la figure sans la déformer : longueurs, angles et aires restent les mêmes.'],
      };
    case 'homothetie-taille': {
      const k = lireNombre(/rapport (\S+?)\s*:/.exec(q)?.[1]);
      if (k === null) return null;
      const a = Math.abs(k);
      let verdict = 'garde la taille';
      if (a > 1) verdict = 'agrandit';
      else if (a < 1) verdict = 'réduit';
      return {
        vue: <Images rapport={k} />,
        lignes: [`On regarde ${k < 0 ? 'la valeur sans le signe' : 'le rapport'} : ${e(a)} ${a > 1 ? '>' : (a < 1 ? '<' : '=')} 1, l’homothétie ${verdict}.${k < 0 ? ' Le signe moins ne fait que retourner la figure.' : ''}`],
      };
    }
    case 'homothetie-mesure': {
      const k = lireNombre(/rapport (\S+?)\./.exec(q)?.[1]);
      const [v] = (/de (\d+(?:,\d+)?) cm/.exec(q) ?? []).slice(1).map(lireNombre);
      if (k === null || v === undefined) return null;
      const aire = /cm²/.test(q);
      return {
        vue: <Images rapport={k} />,
        lignes: [aire
          ? `Les aires sont multipliées par k² : ${e(v)} × ${e(k * k)} = ${e(v * k * k)} cm²`
          : `Les longueurs sont multipliées par ${e(Math.abs(k))} : ${e(v)} × ${e(Math.abs(k))} = ${e(v * Math.abs(k))} cm`],
      };
    }
    default:
      return null;
  }
}

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  return (
    <>
      {l.vue && <div className={`${P}__lac-vue`}>{l.vue}</div>}
      <Etapes p={P} lignes={l.lignes} depart={1.8} pas={0.9} />
    </>
  );
}

/** Le décor : une branche d'érable flamboyante qui se balance, ses feuilles qui tombent en tournoyant. */
function Lac() {
  const feuille = 'M0 -9 L2.5 -3 L8 -5 L5 0 L9 3 L3 3 L2 9 L0 4 L-2 9 L-3 3 L-9 3 L-5 0 L-8 -5 L-2.5 -3 Z';
  const touffes = [[60, 22], [92, 30], [128, 20], [162, 34], [198, 24], [236, 32], [272, 22], [306, 30], [340, 20]];
  return (
    <div className={`${P}__lac`} aria-hidden="true">
      <svg viewBox="0 0 400 60" focusable="false" preserveAspectRatio="xMidYMin meet">
        <g className={`${P}__branche`}>
          <path d="M0 10 Q 120 30 200 22 T 400 14" />
          {touffes.map(([x, y], i) => (
            <g key={x} transform={`translate(${x} ${y}) rotate(${(i * 37) % 60 - 30}) scale(1.7)`}>
              <path d={feuille} className={`${P}__feuille ${P}__feuille--${i % 3}`} />
            </g>
          ))}
        </g>
      </svg>
      {[10, 28, 64, 82, 95].map((x, i) => (
        <span key={x} className={`${P}__erable`} style={{ left: `${x}%`, animationDelay: `${(i * -1.5).toFixed(1)}s` }} />
      ))}
    </div>
  );
}

export function QuestionMiroir({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {!termine && <Lac />}
      <div className={`${P}__ema`}>
        <span className={`${P}__cordon`} aria-hidden="true" />
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={2.8 + (lire(m)?.lignes.length ?? 0) * 0.9} />}
    </div>
  );
}

/** Les réponses : des lanternes de papier qui flottent sur le lac, avec leur reflet. */
export function Lanternes({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__lanternes`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__lanterne${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__toit`} aria-hidden="true" />
            <span className={`${P}__papier`}>{libelle}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
