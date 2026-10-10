import { classeQuestion } from '../base';
import { Etapes, Explication, ecrireNombre } from './outils';

/**
 * LA PROMENADE DES LAMPADAIRES — « La droite des fractions », 6e
 * (09/10/2026). La couverture : une longue promenade au bord de la mer,
 * dallée de carreaux colorés, bordée de lampadaires et de fleurs blanches,
 * une écolière au nœud bleu qui nous entraîne. La scène :
 *   - LA QUESTION : une plaque émaillée bleue, une guirlande de fanions, les
 *     mouettes, les lampadaires qui s'allument ;
 *   - LES RÉPONSES : des fanions qui claquent au vent, un par réponse ;
 *   - APRÈS LA RÉPONSE : la promenade devient la droite graduée — un
 *     lampadaire à chaque entier, les dalles partagent l'unité, le point M
 *     se pose, les sauts de l'addition s'enchaînent. Avant la réponse, la
 *     graduation n'est pas dessinée : compter les parts, c'est le jeu.
 */
const P = 'sc-droite-des-fractions';

function lire(m) {
  const q = m.question;
  let r = /(\d+) traits? partagent l’unité\. M est sur le (\d+)(?:e|er) trait/.exec(q);
  if (r) return { sorte: 'placer', d: Number(r[1]) + 1, n: Number(r[2]), traits: Number(r[1]) };
  r = /^(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)/.exec(q);
  if (r && r[2] === r[4]) return { sorte: 'addition', a: Number(r[1]), b: Number(r[3]), d: Number(r[2]) };
  r = /^(\d+)\/(\d+)\s*=\s*\?/.exec(q);
  if (r) return { sorte: 'quotient', n: Number(r[1]), d: Number(r[2]) };
  r = /^(\d+)\s*×\s*\?\s*=\s*(\d+)/.exec(q);
  if (r) return { sorte: 'manque', d: Number(r[1]), n: Number(r[2]) };
  return null;
}

/**
 * La promenade graduée, de 0 à `u` : un lampadaire par entier, `d` dalles
 * par unité, des points posés, des sauts.
 */
function Promenade({
  u, d, points = [], sauts = [], accolade = false,
}) {
  const X = (v) => 22 + (316 * v) / u;
  const dalles = [];
  if (d <= 24) for (let k = 0; k < u * d; k += 1) dalles.push(k);
  return (
    <svg className={`${P}__promenade`} viewBox="0 0 360 128" focusable="false" aria-hidden="true">
      <rect x="10" y="84" width="340" height="10" rx="3" className={`${P}__quai`} />
      {dalles.map((k) => (
        <rect
          key={k}
          x={X(k / d) + 0.8}
          y="84"
          width={Math.max(1, X(1 / d) - X(0) - 1.6)}
          height="10"
          className={`${P}__dalle${k % 2 ? ' est-impaire' : ''}${accolade && k < d ? ' est-premiere' : ''}`}
          style={{ '--d': `${(0.2 + k * 0.04).toFixed(2)}s` }}
        />
      ))}
      {Array.from({ length: u * d + 1 }, (_, k) => (k % d ? (
        // eslint-disable-next-line react/no-array-index-key
        <line key={k} x1={X(k / d)} x2={X(k / d)} y1="80" y2="98" className={`${P}__trait`} />
      ) : null))}
      {Array.from({ length: u + 1 }, (_, k) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={k} className={`${P}__lampadaire`} style={{ '--d': `${(0.1 + k * 0.2).toFixed(2)}s` }}>
          <line x1={X(k)} x2={X(k)} y1="96" y2="56" />
          <circle cx={X(k)} cy="52" r="5" className={`${P}__lampe`} />
          <text x={X(k)} y="118" textAnchor="middle" className={`${P}__entier`}>{k}</text>
        </g>
      ))}
      {accolade && (
        <text x={(X(0) + X(1)) / 2} y="76" textAnchor="middle" className={`${P}__accolade`}>{`${d} parts`}</text>
      )}
      {sauts.map(({ de, a, texte }, i) => {
        const x0 = X(de);
        const x1 = X(a);
        const h = Math.min(40, 10 + (x1 - x0) / 3);
        return (
          <g key={`${de}-${a}`} className={`${P}__saut`} style={{ '--d': `${(1 + i * 1).toFixed(2)}s` }}>
            <path d={`M${x0} 80 Q ${(x0 + x1) / 2} ${80 - 2 * h} ${x1} 80`} pathLength="1" />
            <text x={(x0 + x1) / 2} y={76 - h} textAnchor="middle">{texte}</text>
          </g>
        );
      })}
      {points.map(({ v, texte, retard = 1.4 }) => (
        <g key={texte} className={`${P}__point`} style={{ '--d': `${retard}s` }}>
          <path d={`M${X(v)} 82 l-6 -10 h12 z`} />
          <text x={X(v)} y={sauts.length ? 30 : 38} textAnchor="middle">{texte}</text>
        </g>
      ))}
    </svg>
  );
}

function contenu(m) {
  const l = lire(m);
  if (!l || l.d < 1) return null;
  if (l.sorte === 'placer') {
    const u = Math.floor(l.n / l.d) + 1;
    return (
      <>
        <Promenade u={u} d={l.d} accolade points={[{ v: l.n / l.d, texte: `M = ${l.n}/${l.d}` }]} />
        <Etapes
          p={P}
          depart={1.6}
          lignes={[
            `${l.traits} trait${l.traits > 1 ? 's' : ''} partagent l’unité en ${l.d} parts : une part vaut 1/${l.d}.`,
            `M est à ${l.n} parts de 0 : M = ${l.n}/${l.d}.`,
          ]}
        />
      </>
    );
  }
  if (l.sorte === 'addition') {
    const s = l.a + l.b;
    const u = Math.max(1, Math.ceil(s / l.d));
    return (
      <>
        <Promenade
          u={u}
          d={l.d}
          sauts={[
            { de: 0, a: l.a / l.d, texte: `+ ${l.a}/${l.d}` },
            { de: l.a / l.d, a: s / l.d, texte: `+ ${l.b}/${l.d}` },
          ]}
          points={[{ v: s / l.d, texte: `${s}/${l.d}`, retard: 2.6 }]}
        />
        <Etapes p={P} depart={3} lignes={[`Des ${l.d}e et encore des ${l.d}e : ${l.a} + ${l.b} = ${s} parts de 1/${l.d}. Le dénominateur ne change pas.`]} />
      </>
    );
  }
  const v = l.n / l.d;
  const u = Math.max(1, Math.ceil(v + 1e-9));
  if (l.sorte === 'quotient') {
    return (
      <>
        <Promenade u={u} d={l.d} points={[{ v, texte: ecrireNombre(v) }]} />
        <Etapes p={P} depart={1.6} lignes={[`${l.n}/${l.d}, c’est ${l.n} ÷ ${l.d} = ${ecrireNombre(v)}`]} />
      </>
    );
  }
  return (
    <>
      <Promenade u={u} d={l.d} points={[{ v, texte: `${l.n}/${l.d}` }]} />
      <Etapes
        p={P}
        depart={1.6}
        lignes={[
          `Le nombre qui, multiplié par ${l.d}, donne ${l.n}, c’est ${l.n} ÷ ${l.d}.`,
          `${l.n} ÷ ${l.d} s’écrit ${l.n}/${l.d} : ${l.d} × ${l.n}/${l.d} = ${l.n}`,
        ]}
      />
    </>
  );
}

/** Le décor : les lampadaires de la promenade, une guirlande de fanions entre eux, deux mouettes. */
function Bord() {
  const lampes = [30, 150, 270, 390];
  return (
    <svg className={`${P}__bord`} viewBox="0 0 420 70" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <g className={`${P}__mouette`}><path d="M120 14 q6 -6 12 0 q6 -6 12 0" /></g>
      <g className={`${P}__mouette ${P}__mouette--2`}><path d="M300 8 q5 -5 10 0 q5 -5 10 0" /></g>
      {lampes.slice(0, -1).map((x, i) => (
        <g key={x} className={`${P}__guirlande`}>
          <path d={`M${x} 26 Q ${x + 60} 46 ${x + 120} 26`} />
          {[0.2, 0.4, 0.6, 0.8].map((t, k) => {
            const px = x + 120 * t;
            const py = 26 + 40 * t * (1 - t);
            return <path key={t} d={`M${px - 5} ${py} h10 l-5 9 Z`} className={`${P}__drapeau ${P}__drapeau--${(i + k) % 3}`} />;
          })}
        </g>
      ))}
      {lampes.map((x, i) => (
        <g key={x} className={`${P}__reverbere`}>
          <line x1={x} x2={x} y1="70" y2="26" />
          <path d={`M${x - 7} 26 h14 l-3 -9 h-8 Z`} className={`${P}__cage`} />
          <circle cx={x} cy="21" r="4" style={{ animationDelay: `${(i * 0.7).toFixed(1)}s` }} />
        </g>
      ))}
    </svg>
  );
}

export function QuestionDroiteFractions({ m, termine }) {
  const l = termine ? lire(m) : null;
  let retard = 2.4;
  if (l?.sorte === 'addition') retard = 3.6;
  else if (l?.sorte === 'placer' || l?.sorte === 'manque') retard = 3.1;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Bord />
      <div className={`${P}__plaque`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={retard} />}
    </div>
  );
}

/** Les réponses : des fanions qui claquent au vent. */
export function Fanions({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__fanions`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__fanion${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__mat`} aria-hidden="true" />
            <span className={`${P}__toile`}>{libelle}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
