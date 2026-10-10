import { avecVisuel } from '../base';
import { Enonce, nombresDe, useEtapes } from './commun';

/**
 * LE TEMPLE DES SOLIDES — « Solides et patrons » (6e, 4e), le 09/10/2026.
 * La couverture : un temple de marbre ouvert sur des montagnes, des solides
 * orange et bleus qui flottent, un patron posé à plat sur une table. La scène
 * la reprend, et chaque sorte de manche a son tableau :
 *   - COMPTER (faces, arêtes, sommets) : le solide nommé flotte au-dessus de
 *     son socle ; APRÈS, ses faces se colorent, ses arêtes s'allument ou ses
 *     sommets s'éclairent un par un, avec le compte qui monte ;
 *   - LE PATRON : ses pièces, dépliées sur la dalle (le texte les décrit) ;
 *     APRÈS, le solide qu'elles forment se dessine à côté ;
 *   - LE PORTRAIT : un solide voilé sur son socle ; APRÈS, le voile s'envole ;
 *   - LE VOLUME : le dessin coté de la question ; APRÈS, le prisme de même
 *     base se remplit au tiers, et le calcul se pose ligne à ligne ;
 *   - LA SECTION : le solide et la lame, à côté ; APRÈS, la lame tranche et la
 *     section s'allume.
 * Avant la réponse, rien n'est compté, rien n'est coupé, rien n'est dévoilé.
 */

const P = 'sc-solides-et-patrons';

/* ------------------------------------------------------- LA GÉOMÉTRIE */

/** Un solide en perspective, dans un cadre de 200 × 190 : sommets, arêtes (cachées ou non), faces. */
function polyedre(sorte, n, allure = {}) {
  const {
    rx = 62, ry = 22, h = 80, cx = 100, cy = 150, decalage,
  } = allure;
  const debut = decalage ?? (n === 4 ? Math.PI / 4 + 0.22 : Math.PI / 2 + Math.PI / n);
  const angles = Array.from({ length: n }, (_, k) => debut + (2 * Math.PI * k) / n);
  const bas = angles.map((t) => ({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t), t }));
  const derriere = (t) => Math.sin(t) < -0.05 && Math.abs(Math.cos(t)) < 0.97;
  const milieu = (a, b) => {
    const t = (a.t + b.t) / 2 + (b.t < a.t ? Math.PI : 0);
    return Math.sin(t) < 0;
  };
  if (sorte === 'pyramide') {
    const sommet = { x: cx, y: cy - h - 20 };
    const sommets = [...bas, sommet];
    const aretes = [
      ...bas.map((a, i) => [i, (i + 1) % n, milieu(a, bas[(i + 1) % n])]),
      ...bas.map((a, i) => [i, n, derriere(a.t)]),
    ];
    const faces = [
      ...bas.map((_, i) => [i, (i + 1) % n, n]),
      bas.map((_, i) => i),
    ];
    return { sommets, aretes, faces };
  }
  const haut = bas.map((s) => ({ x: s.x, y: s.y - h, t: s.t }));
  const sommets = [...bas, ...haut];
  const aretes = [
    ...bas.map((a, i) => [i, (i + 1) % n, milieu(a, bas[(i + 1) % n])]),
    ...haut.map((_, i) => [n + i, n + ((i + 1) % n), false]),
    ...bas.map((a, i) => [i, n + i, derriere(a.t)]),
  ];
  // Le dessus d'abord : c'est la face qu'on voit le mieux, on commence par elle.
  const faces = [
    haut.map((_, i) => n + i),
    ...bas.map((_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i]),
    bas.map((_, i) => i),
  ];
  return { sommets, aretes, faces };
}

/** Le solide nommé dans la question (ou dans la réponse) : sa sorte et son allure. */
function solideNomme(texte) {
  const t = String(texte ?? '').toLowerCase();
  const nBase = () => {
    if (/triangulaire|triangle/.test(t)) return 3;
    if (/pentagonale/.test(t)) return 5;
    if (/hexagonale|hexagone/.test(t)) return 6;
    if (/octogonale/.test(t)) return 8;
    return 4;
  };
  if (/cube/.test(t)) return { sorte: 'prisme', n: 4, allure: { rx: 52, ry: 20, h: 74 } };
  if (/pavé/.test(t)) return { sorte: 'prisme', n: 4, allure: { rx: 78, ry: 24, h: 54, decalage: Math.PI / 4 + 0.42 } };
  if (/prisme/.test(t)) return { sorte: 'prisme', n: /prisme droit$/.test(t.trim()) ? 3 : nBase(), allure: { rx: 62, ry: 22, h: 78 } };
  if (/pyramide/.test(t)) return { sorte: 'pyramide', n: nBase(), allure: { rx: 66, ry: 23, h: 92 } };
  if (/cylindre/.test(t)) return { sorte: 'cylindre' };
  if (/cône|cone/.test(t)) return { sorte: 'cone' };
  if (/boule/.test(t)) return { sorte: 'boule' };
  return null;
}

const chemin = (pts) => `${pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} Z`;
const centre = (pts) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
});

/* --------------------------------------------------------- LES DESSINS */

/**
 * UN SOLIDE DESSINÉ. `compte` (facultatif) : ce qu'on compte (« faces »,
 * « aretes », « sommets ») et combien sont déjà allumés.
 */
function DessinSolide({ solide, compte = null, decoupe = null }) {
  if (!solide) return null;
  if (solide.sorte === 'cylindre' || solide.sorte === 'cone' || solide.sorte === 'boule') {
    return <SolideRond sorte={solide.sorte} decoupe={decoupe} />;
  }
  const { sommets, aretes, faces } = polyedre(solide.sorte, solide.n, solide.allure);
  const allumes = compte?.n ?? 0;
  return (
    <g>
      {faces.map((f, i) => {
        const pts = f.map((k) => sommets[k]);
        const allumee = compte?.quoi === 'faces' && i < allumes;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <path key={`f${i}`} d={chemin(pts)} className={`${P}__face${i === 0 && solide.sorte === 'prisme' ? ` ${P}__face--dessus` : ''}${allumee ? ' est-allumee' : ''}`} style={{ '--k': i % 4 }} />
        );
      })}
      {aretes.map(([a, b, cachee], i) => {
        const allumee = compte?.quoi === 'aretes' && i < allumes;
        return (
          <line
            // eslint-disable-next-line react/no-array-index-key
            key={`a${i}`}
            x1={sommets[a].x}
            y1={sommets[a].y}
            x2={sommets[b].x}
            y2={sommets[b].y}
            className={`${P}__arete${cachee ? ' est-cachee' : ''}${allumee ? ' est-allumee' : ''}`}
          />
        );
      })}
      {compte?.quoi === 'sommets' && sommets.slice(0, allumes).map((s, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`s${i}`} className={`${P}__sommet`}>
          <circle cx={s.x} cy={s.y} r="6" />
          <text x={s.x} y={s.y - 10} textAnchor="middle">{i + 1}</text>
        </g>
      ))}
      {compte?.quoi === 'faces' && faces.slice(0, allumes).map((f, i) => {
        const c = centre(f.map((k) => sommets[k]));
        // eslint-disable-next-line react/no-array-index-key
        return <text key={`n${i}`} x={c.x} y={c.y + 5} textAnchor="middle" className={`${P}__numero`}>{i + 1}</text>;
      })}
      {compte?.quoi === 'aretes' && aretes.slice(0, allumes).map(([a, b], i) => (
        // eslint-disable-next-line react/no-array-index-key
        <text key={`m${i}`} x={(sommets[a].x + sommets[b].x) / 2} y={(sommets[a].y + sommets[b].y) / 2 + 4} textAnchor="middle" className={`${P}__numero ${P}__numero--petit`}>{i + 1}</text>
      ))}
      {decoupe && <Section solide={solide} sommets={sommets} />}
    </g>
  );
}

/** La section d'une pyramide par un plan parallèle à sa base : une réduction de la base, à mi-hauteur. */
function Section({ solide, sommets }) {
  const { n } = solide;
  const apex = sommets[n];
  const pts = sommets.slice(0, n).map((s) => ({ x: (s.x + apex.x) / 2, y: (s.y + apex.y) / 2 }));
  return <path d={chemin(pts)} className={`${P}__section`} />;
}

/** Les solides ronds : cylindre, cône, boule. */
function SolideRond({ sorte, decoupe }) {
  if (sorte === 'boule') {
    return (
      <g>
        <circle cx="100" cy="100" r="68" className={`${P}__face ${P}__face--boule`} />
        <ellipse cx="100" cy="100" rx="68" ry="18" className={`${P}__arete est-cachee`} />
      </g>
    );
  }
  if (sorte === 'cylindre') {
    return (
      <g>
        <path d="M40 60 L40 150 A60 20 0 0 0 160 150 L160 60 Z" className={`${P}__face`} />
        <ellipse cx="100" cy="60" rx="60" ry="20" className={`${P}__face ${P}__face--dessus`} />
        <path d="M40 150 A60 20 0 0 1 160 150" className={`${P}__arete est-cachee`} />
        <path d="M40 150 A60 20 0 0 0 160 150" className={`${P}__arete`} />
        <ellipse cx="100" cy="60" rx="60" ry="20" className={`${P}__arete`} fill="none" />
        <line x1="40" y1="60" x2="40" y2="150" className={`${P}__arete`} />
        <line x1="160" y1="60" x2="160" y2="150" className={`${P}__arete`} />
      </g>
    );
  }
  return (
    <g>
      <path d="M36 150 L100 30 L164 150 A64 21 0 0 1 36 150 Z" className={`${P}__face`} />
      <path d="M36 150 A64 21 0 0 1 164 150" className={`${P}__arete est-cachee`} />
      <path d="M36 150 A64 21 0 0 0 164 150" className={`${P}__arete`} />
      <line x1="36" y1="150" x2="100" y2="30" className={`${P}__arete`} />
      <line x1="164" y1="150" x2="100" y2="30" className={`${P}__arete`} />
      {decoupe === 'parallele' && <ellipse cx="100" cy="90" rx="32" ry="10.5" className={`${P}__section`} />}
      {decoupe === 'sommet' && <path d="M36 150 L100 30 L164 150 Z" className={`${P}__section`} />}
    </g>
  );
}

/** Le solide qui flotte au-dessus de son socle de marbre. */
function Flotte({ children, etiquette = null, classe = '' }) {
  return (
    <figure className={`${P}__vitrine ${classe}`}>
      <svg viewBox="0 0 200 200" className={`${P}__svg`} aria-hidden="true" focusable="false">
        <g className={`${P}__flotte`}>{children}</g>
        <ellipse cx="100" cy="190" rx="58" ry="7" className={`${P}__ombre`} />
      </svg>
      <span className={`${P}__socle`} aria-hidden="true" />
      {etiquette && <figcaption className={`${P}__etiquette`}>{etiquette}</figcaption>}
    </figure>
  );
}

/* -------------------------------------------------------- LES PATRONS */

/** Les pièces d'un patron, posées à plat comme sur la couverture. */
function piecesDuPatron(question) {
  const q = String(question).toLowerCase();
  const carre = (x, y, c = 34) => `M${x} ${y} h${c} v${c} h${-c} Z`;
  const rect = (x, y, w, h) => `M${x} ${y} h${w} v${h} h${-w} Z`;
  if (/6 carrés/.test(q)) {
    return [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]].map(([i, j]) => ({ d: carre(30 + i * 34, 10 + j * 34) }));
  }
  if (/6 rectangles/.test(q)) {
    return [
      { d: rect(10, 46, 22, 30) }, { d: rect(32, 46, 56, 30) }, { d: rect(88, 46, 22, 30) },
      { d: rect(110, 46, 56, 30) }, { d: rect(32, 24, 56, 22) }, { d: rect(32, 76, 56, 22) },
    ];
  }
  if (/2 triangles/.test(q)) {
    return [
      { d: rect(30, 40, 40, 50) }, { d: rect(70, 40, 40, 50) }, { d: rect(110, 40, 40, 50) },
      { d: 'M70 40 L110 40 L90 6 Z' }, { d: 'M70 90 L110 90 L90 124 Z' },
    ];
  }
  if (/carré et de 4 triangles/.test(q)) {
    return [
      { d: rect(68, 42, 40, 40) }, { d: 'M68 42 L108 42 L88 6 Z' }, { d: 'M108 42 L108 82 L144 62 Z' },
      { d: 'M68 82 L108 82 L88 118 Z' }, { d: 'M68 42 L68 82 L32 62 Z' },
    ];
  }
  if (/4 triangles/.test(q)) {
    return [
      { d: 'M88 8 L64 50 L112 50 Z' }, { d: 'M64 50 L40 92 L88 92 Z' },
      { d: 'M112 50 L88 92 L136 92 Z' }, { d: 'M64 50 L112 50 L88 92 Z' },
    ];
  }
  if (/2 disques/.test(q)) {
    return [
      { d: rect(40, 36, 100, 50) }, { cercle: [90, 18, 17] }, { cercle: [90, 104, 17] },
    ];
  }
  if (/portion de disque/.test(q)) {
    return [{ d: 'M70 14 L22 96 A96 96 0 0 0 128 104 Z' }, { cercle: [140, 64, 22] }];
  }
  return null;
}

function Patron({ question }) {
  const pieces = piecesDuPatron(question);
  if (!pieces) return null;
  return (
    <svg viewBox="0 0 176 128" className={`${P}__patron`} aria-hidden="true" focusable="false">
      {pieces.map((p, i) => (p.cercle ? (
        // eslint-disable-next-line react/no-array-index-key
        <circle key={i} cx={p.cercle[0]} cy={p.cercle[1]} r={p.cercle[2]} className={`${P}__piece`} style={{ '--k': i }} />
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <path key={i} d={p.d} className={`${P}__piece`} style={{ '--k': i }} />
      )))}
    </svg>
  );
}

/* --------------------------------------------------------- LES SCÈNES */

const MOTS = { faces: 'faces', aretes: 'arêtes', sommets: 'sommets' };
const quoiCompter = (question) => {
  if (/faces/.test(question)) return 'faces';
  if (/arêtes|aretes/.test(question)) return 'aretes';
  return 'sommets';
};

/** Compter : le solide, puis, après la réponse, ses éléments allumés un par un. */
function Compter({ m, termine }) {
  const solide = solideNomme(m.question.split(':')[0]);
  const quoi = quoiCompter(m.question);
  if (!solide) return null;
  return termine ? <Comptage solide={solide} quoi={quoi} /> : <Flotte>{solide && <DessinSolide solide={solide} />}</Flotte>;
}

function Comptage({ solide, quoi }) {
  const { sommets, aretes, faces } = polyedre(solide.sorte, solide.n, solide.allure);
  const total = { faces: faces.length, aretes: aretes.length, sommets: sommets.length }[quoi];
  const n = useEtapes(total, Math.min(650, 7000 / total), 400);
  return (
    <Flotte etiquette={<><strong key={n} className={`${P}__compteur`}>{n}</strong>{` ${MOTS[quoi]}`}</>} classe={`${P}__vitrine--compte`}>
      <DessinSolide solide={solide} compte={{ quoi, n }} />
    </Flotte>
  );
}

/** Le patron, puis le solide qu'il forme. */
function ScenePatron({ m, termine }) {
  return (
    <div className={`${P}__atelier`}>
      <div className={`${P}__dalle`}><Patron question={m.question} /></div>
      {termine && (
        <>
          <span className={`${P}__fleche`} aria-hidden="true">se replie en</span>
          <Flotte etiquette={m.bonne} classe={`${P}__vitrine--apparait`}><DessinSolide solide={solideNomme(m.bonne)} /></Flotte>
        </>
      )}
    </div>
  );
}

/** Le portrait : un solide voilé, que la réponse dévoile. */
function Portrait({ m, termine }) {
  return (
    <div className={`${P}__atelier`}>
      <Flotte etiquette={termine ? m.bonne : null} classe={termine ? `${P}__vitrine--devoile` : ''}>
        {termine ? <DessinSolide solide={solideNomme(m.bonne)} /> : (
          <g className={`${P}__voile`}>
            <path d="M40 182 C46 120 58 52 100 34 C142 52 154 120 160 182 C140 172 120 186 100 176 C80 186 60 172 40 182 Z" />
            <text x="100" y="128" textAnchor="middle">?</text>
          </g>
        )}
      </Flotte>
    </div>
  );
}

/** Le volume : le prisme de même base se remplit au tiers, et le calcul se pose. */
function Volume({ m }) {
  const q = m.question;
  const nombres = nombresDe(q);
  let lignes;
  if (/^Cône/.test(q) && nombres.length >= 2) {
    const [d, h] = nombres;
    const r = d / 2;
    lignes = [
      `Rayon : ${d} ÷ 2 = ${r} cm`,
      `Aire de la base : ${r}² × π = ${r * r}π cm²`,
      `Cylindre de même base : ${r * r}π × ${h} = ${r * r * h}π cm³`,
      `Le cône en est le tiers : ${r * r * h}π ÷ 3 = ${(r * r * h) / 3}π cm³`,
    ];
  } else if (/carrée/.test(q) && nombres.length >= 2) {
    const [c, h] = nombres;
    lignes = [
      `Aire de la base : ${c} × ${c} = ${c * c} cm²`,
      `Prisme de même base : ${c * c} × ${h} = ${c * c * h} cm³`,
      `La pyramide en est le tiers : ${c * c * h} ÷ 3 = ${(c * c * h) / 3} cm³`,
    ];
  } else if (nombres.length >= 3) {
    const [a, b, h] = nombres;
    lignes = [
      `Aire de la base : ${a} × ${b} = ${a * b} cm²`,
      `Prisme de même base : ${a * b} × ${h} = ${a * b * h} cm³`,
      `La pyramide en est le tiers : ${a * b * h} ÷ 3 = ${(a * b * h) / 3} cm³`,
    ];
  } else {
    lignes = [`Volume : ${m.bonne} cm³`];
  }
  return <CalculVolume lignes={lignes} cone={/^Cône/.test(q)} />;
}

function CalculVolume({ lignes, cone }) {
  const n = useEtapes(lignes.length, 1100, 500);
  return (
    <div className={`${P}__tiers`}>
      {/* Le prisme (ou le cylindre) de même base et de même hauteur, rempli au
          tiers : c'est tout ce que contient la pyramide (ou le cône). */}
      <svg viewBox="0 0 170 150" className={`${P}__sablier`} aria-hidden="true" focusable="false">
        {cone
          ? <path d="M25 22 L25 128 A50 10 0 0 0 125 128 L125 22 A50 10 0 0 0 25 22 Z" className={`${P}__prisme`} />
          : <rect x="25" y="20" width="100" height="110" className={`${P}__prisme`} />}
        <rect x="27" y="93" width="96" height="36" className={`${P}__sable${n >= 2 ? ' est-plein' : ''}`} />
        <line x1="25" y1="56.7" x2="125" y2="56.7" className={`${P}__repere`} />
        <line x1="25" y1="93.3" x2="125" y2="93.3" className={`${P}__repere`} />
        <path d="M25 130 L75 20 L125 130 Z" className={`${P}__pointe`} />
        <text x="134" y="118" className={`${P}__fraction`}>⅓</text>
      </svg>
      <ol className={`${P}__calcul`} aria-label="Le calcul">
        {lignes.map((l, i) => <li key={l} className={i < n ? 'est-pose' : ''}>{l}</li>)}
      </ol>
    </div>
  );
}

/** La section : la lame à côté du solide ; après la réponse, elle tranche. */
function SceneSection({ m, termine }) {
  const q = m.question.toLowerCase();
  const sommet = /sommet/.test(q);
  const solide = solideNomme(q.split(',')[0]);
  if (!solide) return null;
  const decoupe = sommet ? 'sommet' : 'parallele';
  return (
    <div className={`${P}__atelier`}>
      <figure className={`${P}__vitrine ${termine ? `${P}__vitrine--tranchee` : ''}`}>
        <svg viewBox="0 0 200 200" className={`${P}__svg`} aria-hidden="true" focusable="false">
          <g className={`${P}__flotte`}>
            <DessinSolide solide={solide} decoupe={termine ? decoupe : null} />
          </g>
          <g className={`${P}__lame ${P}__lame--${decoupe}${termine ? ' est-passee' : ''}`}>
            {sommet
              ? <path d="M100 4 L100 196" />
              : <path d={`M2 ${solide.sorte === 'cone' ? 90 : 94} L198 ${solide.sorte === 'cone' ? 90 : 94}`} />}
          </g>
        </svg>
        <span className={`${P}__socle`} aria-hidden="true" />
        {termine && <figcaption className={`${P}__etiquette`}>{m.bonne}</figcaption>}
      </figure>
    </div>
  );
}

const SORTES = {
  compter: Compter,
  pyramide: Compter,
  patron: ScenePatron,
  'quel-solide': Portrait,
  section: SceneSection,
};

/** Les petits solides qui flottent dans le temple, comme sur la couverture. */
function Decor() {
  return (
    <span className={`${P}__decor`} aria-hidden="true">
      <span className={`${P}__gemme`} />
      <span className={`${P}__gemme ${P}__gemme--2`} />
      <span className={`${P}__gemme ${P}__gemme--3`} />
    </span>
  );
}

export function QuestionSolides({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  let dessin = null;
  if (m.consigne === 'volume') dessin = termine ? <Volume m={m} /> : null;
  else if (Sorte) dessin = <Sorte m={m} termine={termine} />;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Decor />
      {avecVisuel(m, <Enonce m={m} classe={`${P}__plaque`} />)}
      {dessin}
    </div>
  );
}

export const sceneSolides = {
  question: (m, termine) => <QuestionSolides m={m} termine={termine} />,
  objets: P,
};
