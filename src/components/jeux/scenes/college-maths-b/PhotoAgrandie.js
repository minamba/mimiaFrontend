import { avecVisuel } from '../base';
import {
  Enonce, ecrire, nombre, proprietesChoix, useEtapes,
} from './commun';

/**
 * LA CHAMBRE NOIRE — « La photo agrandie » (4e, 3e), le 09/10/2026.
 * La couverture : un laboratoire photo baigné de lumière rouge, des bacs de
 * révélateur, un agrandisseur, et des cadres emboîtés de plus en plus petits.
 * L'idée de la scène : THALÈS, C'EST UN AGRANDISSEUR. La lampe est au sommet
 * A, le petit triangle est le négatif, le grand est le tirage :
 *   - AVANT : l'énoncé sur un tirage, le dessin de la question (s'il y en a
 *     un), la lampe inactinique qui rougeoie ;
 *   - APRÈS : la lampe s'allume, ses rayons passent par le négatif et vont
 *     dessiner le tirage ; le rapport d'agrandissement se calcule et donne la
 *     longueur. La photo grandit dans son cadre ; un carré devient k × k
 *     carrés (les aires), un cube k × k × k cubes (les volumes) ; pour la
 *     réciproque, on compare les deux rapports avant de tracer (MN).
 *   - LES RÉPONSES : des tirages pendus au fil à sécher, avec leurs pinces.
 */

const P = 'sc-photo-agrandie';

/** Les longueurs données : { AM: 4, AB: 10, … }, et celle qu'on cherche. */
function longueurs(q) {
  const donnees = Object.fromEntries([...String(q).matchAll(/(\w{2}) = ([\d,]+) cm/g)].map((r) => [r[1], nombre(r[2])]));
  const cherche = (String(q).match(/(\w{2}) = \?/) ?? [])[1] ?? null;
  return { donnees, cherche };
}

/* --------------------------------------------------- L'AGRANDISSEUR */

/**
 * LE FAISCEAU : la lampe en A, le négatif [MN], le tirage [BC]. `t` : le
 * rapport AM/AB ; `papillon` : le négatif de l'autre côté de la lampe.
 */
function Faisceau({
  noms, t, papillon = false, allume = false, cotes = {},
}) {
  const [a, b, c, m, n] = noms;
  const A = papillon ? [160, 70] : [160, 16];
  const B = [40, 176];
  const C = [280, 176];
  const vers = (Q, k) => [A[0] + (Q[0] - A[0]) * k, A[1] + (Q[1] - A[1]) * k];
  const M = vers(B, papillon ? -t : t);
  const N = vers(C, papillon ? -t : t);
  const milieu = (U, V) => [(U[0] + V[0]) / 2, (U[1] + V[1]) / 2];
  const etiquette = (U, V, texte, dy = 0) => {
    if (!texte) return null;
    const [x, y] = milieu(U, V);
    return (
      <g className={`${P}__cote`} transform={`translate(${x} ${y + dy})`}>
        <rect x={-6 - 4 * texte.length} y="-11" width={12 + 8 * texte.length} height="22" rx="11" />
        <text y="5" textAnchor="middle">{texte}</text>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 320 200" className={`${P}__faisceau${allume ? ' est-allume' : ''}`} aria-hidden="true" focusable="false">
      <polygon points={[A, B, C].map((p) => p.join(',')).join(' ')} className={`${P}__lumiere`} />
      {papillon && <polygon points={[A, M, N].map((p) => p.join(',')).join(' ')} className={`${P}__lumiere`} />}
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} className={`${P}__rayon`} />
      <line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} className={`${P}__rayon`} />
      {papillon && <line x1={A[0]} y1={A[1]} x2={M[0]} y2={M[1]} className={`${P}__rayon`} />}
      {papillon && <line x1={A[0]} y1={A[1]} x2={N[0]} y2={N[1]} className={`${P}__rayon`} />}
      <line x1={M[0]} y1={M[1]} x2={N[0]} y2={N[1]} className={`${P}__negatif`} />
      <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} className={`${P}__tirage`} />
      <circle cx={A[0]} cy={A[1]} r="7" className={`${P}__lampe`} />
      {[[A, a, 0, -10], [B, b, -10, 14], [C, c, 10, 14], [M, m, -12, 0], [N, n, 12, 0]].map(([p, nom, dx, dy]) => (
        <text key={nom} x={p[0] + dx} y={p[1] + dy} textAnchor="middle" className={`${P}__nom`}>{nom}</text>
      ))}
      {etiquette(M, N, cotes.mn, papillon ? -14 : -14)}
      {etiquette(B, C, cotes.bc, 18)}
    </svg>
  );
}

/** Thalès, les milieux, la proportionnalité : la lampe s'allume, et le rapport fait le reste. */
function Agrandisseur({ m }) {
  const q = String(m.question);
  const tri = (q.match(/Dans (\w{3})/) ?? [])[1] ?? 'ABC';
  const [A, B, C] = tri.split('');
  const milieux = /milieu/.test(q);
  const [M, N] = milieux ? ['I', 'J'] : ['M', 'N'];
  const papillon = /se coupent en A/.test(q);
  const { donnees, cherche } = longueurs(q);
  const k = useEtapes(3, 1200, 500);
  const am = donnees[`${A}${M}`];
  const ab = donnees[`${A}${B}`];
  const t = milieux ? 0.5 : (am && ab ? am / ab : 0.5);
  const bonne = String(m.bonne);
  let lignes;
  if (milieux) {
    lignes = [
      `I et J sont des milieux : le négatif AIJ est réduit de moitié`,
      cherche === 'IJ' ? `IJ = ${B}${C} ÷ 2 = ${bonne}` : `${B}${C} = IJ × 2 = ${bonne}`,
    ];
  } else if (am && ab) {
    const autre = cherche === `${A}${C}` ? `${A}${N}` : `${B}${C}`;
    lignes = [
      `Le rapport : ${A}${M} ÷ ${A}${B} = ${ecrire(am)} ÷ ${ecrire(ab)}`,
      cherche === `${A}${C}`
        ? `${A}${C} = ${autre} × ${ecrire(ab)} ÷ ${ecrire(am)} = ${bonne}`
        : `${M}${N} = ${autre} × ${ecrire(am)} ÷ ${ecrire(ab)} = ${bonne}`,
    ];
  } else {
    lignes = [`${cherche ?? '?'} = ${bonne}`];
  }
  const cotes = {
    mn: k >= 2 ? (cherche === `${M}${N}` ? bonne : (donnees[`${M}${N}`] !== undefined ? `${ecrire(donnees[`${M}${N}`])} cm` : '')) : '',
    bc: k >= 2 ? (cherche === `${B}${C}` ? bonne : (donnees[`${B}${C}`] !== undefined ? `${ecrire(donnees[`${B}${C}`])} cm` : '')) : '',
  };
  return (
    <div className={`${P}__atelier`}>
      <Faisceau noms={[A, B, C, M, N]} t={t} papillon={papillon} allume={k >= 1} cotes={cotes} />
      <ol className={`${P}__fiche`} aria-label="Le calcul">
        {lignes.map((l, i) => <li key={l} className={i < k ? 'est-pose' : ''}>{l}</li>)}
      </ol>
    </div>
  );
}

/** « (IJ) est parallèle à ? » : après, le négatif et le tirage, côte parallèle à côte. */
function Parallele({ m }) {
  const tri = (String(m.question).match(/Dans (\w{3})/) ?? [])[1] ?? 'ABC';
  const [A, B, C] = tri.split('');
  return (
    <div className={`${P}__atelier`}>
      <Faisceau noms={[A, B, C, 'I', 'J']} t={0.5} allume />
      <p className={`${P}__fiche ${P}__fiche--une`}>{`Les milieux I et J : (IJ) est parallèle au troisième côté, ${m.bonne}.`}</p>
    </div>
  );
}

/** La photo : elle grandit dans son cadre, du même rapport dans les deux sens. */
function Photo({ m }) {
  const r = String(m.question).match(/de ([\d,]+) cm sur ([\d,]+) cm est agrandie : ses [\d,]+ cm deviennent ([\d,]+) cm/);
  const k = useEtapes(2, 1300, 500);
  if (!r) return null;
  const [l, L, l2] = [nombre(r[1]), nombre(r[2]), nombre(r[3])];
  const coef = l2 / l;
  return (
    <div className={`${P}__atelier`}>
      {/* Le cadre du tirage agrandi ; la photo y part de sa petite taille et grandit. */}
      <div className={`${P}__cadres`} style={{ width: 240, height: Math.min(200, (240 * l2) / (L * coef)) }} aria-hidden="true">
        <span className={`${P}__photo${k >= 1 ? ' est-agrandie' : ''}`} style={{ '--r': 1 / coef }}>
          <span className={`${P}__paysage`} />
        </span>
        <em className={`${P}__mesure ${P}__mesure--l`}>{k >= 2 ? m.bonne : `${ecrire(L)} cm`}</em>
        <em className={`${P}__mesure ${P}__mesure--h`}>{k >= 1 ? `${ecrire(l2)} cm` : `${ecrire(l)} cm`}</em>
      </div>
      <ol className={`${P}__fiche`} aria-label="Le calcul">
        <li className={k >= 1 ? 'est-pose' : ''}>{`Le coefficient : ${ecrire(l2)} ÷ ${ecrire(l)} = ${ecrire(coef)}`}</li>
        <li className={k >= 2 ? 'est-pose' : ''}>{`${ecrire(L)} × ${ecrire(coef)} = ${m.bonne}`}</li>
      </ol>
    </div>
  );
}

/** La réciproque : les deux rapports comparés, puis (MN) tracée — parallèle ou non. */
function Reciproque({ m }) {
  const { donnees } = longueurs(m.question);
  const k = useEtapes(3, 1200, 500);
  const { AM, AB, AN, AC } = donnees;
  if (![AM, AB, AN, AC].every(Number.isFinite)) return null;
  const egal = AM * AC === AN * AB;
  return (
    <div className={`${P}__atelier`}>
      <svg viewBox="0 0 320 200" className={`${P}__faisceau est-allume`} aria-hidden="true" focusable="false">
        <line x1="160" y1="16" x2="40" y2="176" className={`${P}__rayon`} />
        <line x1="160" y1="16" x2="280" y2="176" className={`${P}__rayon`} />
        <line x1="40" y1="176" x2="280" y2="176" className={`${P}__tirage`} />
        {k >= 3 && (() => {
          const t1 = AM / AB;
          const t2 = AN / AC;
          const M = [160 - 120 * t1, 16 + 160 * t1];
          const N = [160 + 120 * t2, 16 + 160 * t2];
          return (
            <>
              <line x1={M[0]} y1={M[1]} x2={N[0]} y2={N[1]} className={`${P}__negatif${egal ? '' : ' est-penche'}`} />
              <text x={M[0] - 12} y={M[1]} className={`${P}__nom`} textAnchor="middle">M</text>
              <text x={N[0] + 12} y={N[1]} className={`${P}__nom`} textAnchor="middle">N</text>
            </>
          );
        })()}
        <text x="160" y="8" className={`${P}__nom`} textAnchor="middle">A</text>
        <text x="30" y="190" className={`${P}__nom`} textAnchor="middle">B</text>
        <text x="290" y="190" className={`${P}__nom`} textAnchor="middle">C</text>
      </svg>
      <ol className={`${P}__fiche`} aria-label="Le calcul">
        <li className={k >= 1 ? 'est-pose' : ''}>{`AM ÷ AB = ${AM} ÷ ${AB}  et  AN ÷ AC = ${AN} ÷ ${AC}`}</li>
        <li className={k >= 2 ? 'est-pose' : ''}>{`Produits en croix : ${AM} × ${AC} = ${AM * AC} ; ${AN} × ${AB} = ${AN * AB}`}</li>
        <li className={k >= 3 ? 'est-pose' : ''}>{egal ? 'Rapports égaux : (MN) est parallèle à (BC).' : 'Rapports différents : (MN) n’est pas parallèle à (BC).'}</li>
      </ol>
    </div>
  );
}

/** L'agrandissement : un carré devient k × k carrés, un cube k × k × k cubes. */
function Agrandissement({ m }) {
  const q = String(m.question);
  const r = q.match(/de ([\d,]+) cm(²|³) est (?:agrandie?|réduite?) à l’échelle ([\d,]+)/);
  const k = useEtapes(2, 1300, 500);
  if (!r) return null;
  const v = nombre(r[1]);
  const volume = r[2] === '³';
  const e = nombre(r[3]);
  const puissance = volume ? 3 : 2;
  const facteur = e ** puissance;
  const grand = e >= 1 ? e : 1 / e;
  const cases = Math.round(grand);
  return (
    <div className={`${P}__atelier`}>
      <div className={`${P}__damier${volume ? ' est-volume' : ''}${e < 1 ? ' est-reduit' : ''}`} style={{ '--n': cases }} aria-hidden="true">
        {Array.from({ length: volume ? cases : 1 }, (_, couche) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={couche} className={`${P}__couche${k >= 1 ? ' est-remplie' : ''}`} style={{ '--c': couche }}>
            {Array.from({ length: cases * cases }, (_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <i key={i} className={i === 0 && couche === 0 ? 'est-unite' : ''} style={{ '--k': i }} />
            ))}
          </span>
        ))}
      </div>
      <ol className={`${P}__fiche`} aria-label="Le calcul">
        <li className={k >= 1 ? 'est-pose' : ''}>
          {e >= 1
            ? `Échelle ${ecrire(e)} : ${volume ? 'un cube' : 'un carré'} devient ${volume ? `${cases} × ${cases} × ${cases}` : `${cases} × ${cases}`} = ${ecrire(facteur)}`
            : `Échelle ${ecrire(e)} : ${volume ? `${cases} × ${cases} × ${cases} cubes` : `${cases} × ${cases} carrés`} n’en font plus qu’un`}
        </li>
        <li className={k >= 2 ? 'est-pose' : ''}>{`${ecrire(v)} × ${ecrire(facteur)} = ${m.bonne}`}</li>
      </ol>
    </div>
  );
}

function Explication({ m }) {
  const q = String(m.question);
  if (m.consigne === 'photo') return <Photo m={m} />;
  if (m.consigne === 'reciproque-thales') return <Reciproque m={m} />;
  if (m.consigne === 'agrandissement') return <Agrandissement m={m} />;
  if (m.consigne === 'milieux' && /parallèle à \?/.test(q)) return <Parallele m={m} />;
  return <Agrandisseur m={m} />;
}

/** La lampe inactinique rouge de la chambre noire. */
function Lampe() {
  return <span className={`${P}__lampe-rouge`} aria-hidden="true" />;
}

export function QuestionPhoto({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__tirage-cadre`}>
        <Lampe />
        {avecVisuel(m, <Enonce m={m} classe={`${P}__epreuve`} />)}
      </div>
      {termine && <Explication m={m} />}
    </div>
  );
}

/** Les réponses : des tirages pendus au fil à sécher, chacun avec sa pince. */
export function FilASecher({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__fil`}>
      <span className={`${P}__corde`} aria-hidden="true" />
      <ul className={`${P}__tirages`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => (
          <li key={cle} style={{ '--i': i }}>
            <span className={`${P}__pince`} aria-hidden="true" />
            <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__epreuve-choix${fautes.includes(cle) ? ' est-faux' : ''}`}>
              {libelle}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const scenePhoto = {
  question: (m, termine) => <QuestionPhoto m={m} termine={termine} />,
  choix: (props) => <FilASecher {...props} />,
};
