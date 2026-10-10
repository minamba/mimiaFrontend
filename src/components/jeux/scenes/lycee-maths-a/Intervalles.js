import {
  Texte, ecrire, nombre, nombresDe, sur,
} from './commun';

/**
 * LA DIGUE DES INTERVALLES (09/10/2026). La couverture : une écluse de pierre
 * au bord de la mer, des bassins d'eau claire entre les rochers.
 *   - LA QUESTION est sur l'écriteau de l'écluse ; dessous, une digue graduée
 *     posée sur la mer qui ondule. Les nombres de l'énoncé y sont plantés en
 *     bornes ; les intervalles DONNÉS (I et J) y sont tendus en cordages ;
 *   - LES RÉPONSES sont des bouées qui flottent (`objets`) ;
 *   - APRÈS LA RÉPONSE, l'écluse s'ouvre : l'eau remplit la bonne partie de la
 *     digue, entre deux vannes — fermée (crochet tourné vers l'eau, borne
 *     pleine) ou ouverte (borne creuse) ; vers l'infini, l'eau file jusqu'au
 *     bout. Pour une valeur absolue, le phare se pose au centre et le rayon se
 *     déroule des deux côtés.
 */

const P = 'sc-intervalles-et-inegalites';

/** « [−2 ; 10] », « ]−∞ ; 9] » → { a, b, fermeA, fermeB } (a, b peuvent être ±Infinity). */
export function intervallesDe(texte) {
  const re = /([[\]])\s*([−-]?\d+(?:,\d+)?|[−-]∞)\s*;\s*(\+?∞|[−-]?\d+(?:,\d+)?)\s*([[\]])/g;
  const liste = [];
  let r = re.exec(String(texte));
  while (r) {
    const a = /∞/.test(r[2]) ? -Infinity : nombre(r[2]);
    const b = /∞/.test(r[3]) ? Infinity : nombre(r[3]);
    liste.push({
      a, b, fermeA: r[1] === '[', fermeB: r[4] === ']',
    });
    r = re.exec(String(texte));
  }
  return liste;
}

/** L'étendue de la digue : tous les nombres de l'énoncé et de la réponse, avec de la marge. */
function etendue(nombres) {
  const finis = nombres.filter(Number.isFinite);
  if (finis.length === 0) return { min: -5, max: 5 };
  let min = Math.floor(Math.min(...finis)) - 2;
  let max = Math.ceil(Math.max(...finis)) + 2;
  if (max - min < 10) {
    const manque = 10 - (max - min);
    min -= Math.ceil(manque / 2);
    max += Math.floor(manque / 2);
  }
  return { min, max };
}

const L = 640;
const MARGE = 30;

function Digue({
  min, max, bornes, cordages = [], eau = [], centre = null,
}) {
  const X = (x) => {
    if (x === -Infinity) return 6;
    if (x === Infinity) return L - 6;
    return MARGE + ((x - min) / (max - min)) * (L - 2 * MARGE);
  };
  const pas = Math.max(1, Math.ceil((max - min) / 16));
  const graduations = [];
  for (let x = Math.ceil(min / pas) * pas; x <= max; x += pas) graduations.push(x);
  return (
    <svg className={`${P}__digue`} viewBox={`0 0 ${L} 150`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${P}-mer`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3cc8e0" />
          <stop offset="1" stopColor="#0b6f9c" />
        </linearGradient>
      </defs>
      <path className={`${P}__vague`} d={`M0 112 ${Array.from({ length: 17 }, () => 'q 20 -10 40 0').join(' ')} V150 H0 Z`} fill={`url(#${P}-mer)`} />
      <path className={`${P}__vague ${P}__vague--2`} d={`M-20 120 ${Array.from({ length: 18 }, () => 'q 20 -8 40 0').join(' ')} V150 H-20 Z`} fill="#0b6f9c" opacity="0.6" />
      {/* Les cordages : les intervalles donnés par l'énoncé. */}
      {cordages.map((c, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`c${i}`} className={`${P}__cordage ${P}__cordage--${i}`}>
          <line x1={X(c.a)} x2={X(c.b)} y1={34 + i * 16} y2={34 + i * 16} />
          <text x={(Math.max(X(c.a), 14) + Math.min(X(c.b), L - 14)) / 2} y={28 + i * 16} textAnchor="middle">{c.nom}</text>
          {Number.isFinite(c.a) && <circle cx={X(c.a)} cy={34 + i * 16} r="5" className={c.fermeA ? 'est-pleine' : 'est-creuse'} />}
          {Number.isFinite(c.b) && <circle cx={X(c.b)} cy={34 + i * 16} r="5" className={c.fermeB ? 'est-pleine' : 'est-creuse'} />}
        </g>
      ))}
      {/* L'eau de l'écluse : la bonne réponse, une fois donnée. */}
      {eau.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`e${i}`} className={`${P}__eau`} style={{ '--i': i }}>
          <rect x={X(e.a)} y="72" width={Math.max(2, X(e.b) - X(e.a))} height="20" rx="5" />
          {e.a === -Infinity && <path d="M4 82 l12 -9 v18 Z" className={`${P}__fleche`} />}
          {e.b === Infinity && <path d={`M${L - 4} 82 l-12 -9 v18 Z`} className={`${P}__fleche`} />}
          {Number.isFinite(e.a) && (
            <g className={`${P}__vanne`}>
              <path d={e.fermeA ? `M${X(e.a) + 8} 64 H${X(e.a)} V100 H${X(e.a) + 8}` : `M${X(e.a) - 8} 64 H${X(e.a)} V100 H${X(e.a) - 8}`} />
              <circle cx={X(e.a)} cy="82" r="6" className={e.fermeA ? 'est-pleine' : 'est-creuse'} />
            </g>
          )}
          {Number.isFinite(e.b) && (
            <g className={`${P}__vanne`}>
              <path d={e.fermeB ? `M${X(e.b) - 8} 64 H${X(e.b)} V100 H${X(e.b) - 8}` : `M${X(e.b) + 8} 64 H${X(e.b)} V100 H${X(e.b) + 8}`} />
              <circle cx={X(e.b)} cy="82" r="6" className={e.fermeB ? 'est-pleine' : 'est-creuse'} />
            </g>
          )}
        </g>
      ))}
      {/* La digue de pierre, graduée. */}
      <rect x="0" y="92" width={L} height="14" rx="4" className={`${P}__pierre`} />
      {graduations.map((x) => (
        <g key={x}>
          <line x1={X(x)} x2={X(x)} y1="90" y2="100" className={`${P}__trait`} />
          <text x={X(x)} y="124" textAnchor="middle" className={`${P}__nombre`}>{ecrire(x)}</text>
        </g>
      ))}
      {/* Les bornes de l'énoncé : de petits poteaux. */}
      {bornes.map((x) => (
        <g key={`b${x}`} className={`${P}__poteau`}>
          <rect x={X(x) - 3} y="78" width="6" height="16" rx="2" />
          <circle cx={X(x)} cy="77" r="4.5" />
        </g>
      ))}
      {centre && (
        <g className={`${P}__phare`}>
          <line x1={X(centre.c - centre.r)} x2={X(centre.c + centre.r)} y1="58" y2="58" className={`${P}__rayon`} />
          <text x={(X(centre.c) + X(centre.c + centre.r)) / 2} y="52" textAnchor="middle">{`r = ${ecrire(centre.r)}`}</text>
          <path d={`M${X(centre.c) - 6} 92 L${X(centre.c) - 4} 62 H${X(centre.c) + 4} L${X(centre.c) + 6} 92 Z`} className={`${P}__tour`} />
          <circle cx={X(centre.c)} cy="58" r="5" className={`${P}__lumiere`} />
          <text x={X(centre.c)} y="142" textAnchor="middle" className={`${P}__centre`}>{`c = ${ecrire(centre.c)}`}</text>
        </g>
      )}
    </svg>
  );
}

/** Ce que la digue montre : les bornes et cordages toujours, l'eau et le phare une fois la réponse donnée. */
function plan(m, termine) {
  const q = String(m.question);
  const donnes = intervallesDe(q);
  const cordages = /I =/.test(q) ? donnes.slice(0, 2).map((c, i) => ({ ...c, nom: i === 0 ? 'I' : 'J' })) : [];
  const reponse = intervallesDe(m.bonne);
  // La digue couvre l'énoncé ET toutes les réponses proposées : son étendue ne trahit pas la bonne.
  const nombres = [...nombresDe(q), ...m.choix.flatMap((c) => nombresDe(c.libelle))];
  // Les bornes plantées : les nombres « posés » sur la droite par l'énoncé.
  const bornes = [...new Set([
    ...donnes.flatMap((e) => [e.a, e.b]),
    ...((q.match(/x\s*[≤<]\s*([−-]?\d+)|([−-]?\d+)\s*[≤<]\s*x|x\s*[≥>]\s*([−-]?\d+)/g) ?? []).flatMap((s) => nombresDe(s))),
  ].filter(Number.isFinite))];
  let centre = null;
  if (termine && m.consigne === 'centre-rayon') {
    const r = String(m.bonne).match(/c = ([−-]?\d+) ; r = (\d+)/);
    if (r) centre = { c: nombre(r[1]), r: nombre(r[2]) };
  }
  if (termine && m.consigne === 'valeur-absolue') {
    const r = q.match(/\|x ([−+-]) (\d+)\| [≤<] (\d+)/);
    if (r) centre = { c: (r[1] === '+' ? -1 : 1) * Number(r[2]), r: Number(r[3]) };
  }
  const { min, max } = etendue([...nombres, ...bornes, ...(centre ? [centre.c - centre.r, centre.c + centre.r] : [])]);
  return {
    min, max, bornes, cordages, eau: termine ? reponse : [], centre,
  };
}

export function QuestionIntervalles({ m, termine }) {
  const dessin = sur(() => plan(m, termine));
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__ecriteau`}>
        <Texte m={m} classe={`${P}__texte`} />
      </div>
      {dessin && <Digue {...dessin} />}
    </div>
  );
}
