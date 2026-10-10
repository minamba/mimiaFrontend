import { classeQuestion } from '../base';
import { Etapes, Explication } from './outils';

/**
 * L'ATELIER DES MESURES — « Le mètre ruban », 6e (09/10/2026). La
 * couverture : un atelier aux tentures bordeaux, un long ruban de mesure
 * déroulé sur l'établi, une balance de laiton, des éprouvettes, des poids.
 * La scène :
 *   - LA QUESTION : une plaque de laiton ; le ruban se déroule au-dessus en
 *     TABLEAU DE CONVERSION (km hm dam m dm cm mm, ou L, ou g), l'unité de
 *     départ et celle d'arrivée marquées ; la balance oscille, le liquide des
 *     éprouvettes tremble ;
 *   - LES RÉPONSES : des poids de laiton (`objets`) ;
 *   - APRÈS LA RÉPONSE : les chiffres se posent dans le ruban, le chiffre
 *     des unités sous l'unité de départ ; puis la virgule saute sous l'unité
 *     d'arrivée, les zéros qui manquent arrivent, et on lit le résultat.
 */
const P = 'sc-metre-ruban-college';

const PREFIXES = ['k', 'h', 'da', '', 'd', 'c', 'm'];

/** « hm » → { base: 'm', col: 1 } ; « daL » → { base: 'L', col: 2 }. */
function unite(u) {
  const base = /L$/.test(u) ? 'L' : (/g$/.test(u) ? 'g' : 'm');
  const col = PREFIXES.indexOf(u.slice(0, -1));
  return col < 0 ? null : { base, col };
}

function lire(m) {
  const r = /^\s*([\d\s  ]+(?:,\d+)?)\s*([a-zA-Z]+)\s*=\s*\?\s*([a-zA-Z]+)/.exec(m.question);
  if (!r) return null;
  const valeur = r[1].replace(/[\s  ]/g, '');
  const de = unite(r[2]);
  const a = unite(r[3]);
  if (!de || !a || de.base !== a.base) return null;
  return {
    valeur, de, a, base: de.base,
  };
}

/** Les chiffres posés : colonne → chiffre, l'unité du nombre sous l'unité de départ. */
function poser(l) {
  const [entier, dec = ''] = l.valeur.split(',');
  const cases = new Map();
  entier.split('').forEach((c, i) => cases.set(l.de.col - (entier.length - 1 - i), c));
  dec.split('').forEach((c, i) => cases.set(l.de.col + 1 + i, c));
  return cases;
}

/** Le ruban : une colonne par unité (et des colonnes sans nom si les chiffres débordent). */
function Ruban({ l, termine }) {
  const cases = termine ? poser(l) : new Map();
  const cols = [...cases.keys()];
  const premier = Math.min(l.a.col, ...(cols.length ? cols : [l.a.col]));
  const dernier = Math.max(l.a.col, ...(cols.length ? cols : [l.a.col]));
  const avecZeros = new Map(cases);
  if (termine) {
    // Les zéros qui manquent jusqu'à la nouvelle unité…
    for (let k = premier; k <= dernier; k += 1) if (!avecZeros.has(k)) avecZeros.set(k, '0');
    // …mais pas de zéro inutile devant (« 0,69 hL » se lit « 6,9 daL »).
    for (let k = premier; k < l.a.col && avecZeros.get(k) === '0'; k += 1) avecZeros.delete(k);
  }
  const colonnes = [];
  for (let k = Math.min(0, premier); k <= Math.max(6, dernier); k += 1) colonnes.push(k);
  const nom = (k) => (k >= 0 && k <= 6 ? `${PREFIXES[k]}${l.base}` : '');
  const virguleDe = [...cases.keys()].some((k) => k > l.de.col);
  const virguleA = [...avecZeros.keys()].some((k) => k > l.a.col);
  const indice = (k) => colonnes.indexOf(k);
  return (
    <div className={`${P}__ruban${termine ? ' est-deroule' : ''}`} style={{ '--n': colonnes.length }}>
      <div className={`${P}__rangee ${P}__rangee--unites`}>
        {colonnes.map((k) => (
          <span key={k} className={`${P}__unite${k === l.de.col ? ' est-depart' : ''}${k === l.a.col ? ' est-arrivee' : ''}`}>{nom(k)}</span>
        ))}
      </div>
      {termine && (
        <>
          <div className={`${P}__rangee ${P}__rangee--pose`}>
            {colonnes.map((k) => (
              <span key={k} className={`${P}__case${k === l.de.col ? ' est-depart' : ''}`} style={{ '--d': `${(0.3 + indice(k) * 0.08).toFixed(2)}s` }}>
                {cases.get(k) ?? ''}
              </span>
            ))}
            {virguleDe && <span className={`${P}__virgule`} style={{ '--c': indice(l.de.col) + 1 }}>,</span>}
          </div>
          <div className={`${P}__rangee ${P}__rangee--lu`}>
            {colonnes.map((k) => (
              <span
                key={k}
                className={`${P}__case${k === l.a.col ? ' est-arrivee' : ''}${avecZeros.has(k) && !cases.has(k) ? ' est-zero' : ''}`}
                style={{ '--d': `${(1.5 + indice(k) * 0.08).toFixed(2)}s` }}
              >
                {avecZeros.get(k) ?? ''}
              </span>
            ))}
            {virguleA && (
              <span className={`${P}__virgule ${P}__virgule--saute`} style={{ '--c': indice(l.a.col) + 1, '--c0': indice(l.de.col) + 1 }}>,</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const NOMS = { m: 'longueurs', L: 'contenances', g: 'masses' };

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  const ecart = l.a.col - l.de.col;
  const n = Math.abs(ecart);
  return (
    <>
      <Ruban l={l} termine />
      <Etapes
        p={P}
        depart={2.2}
        lignes={[
          `Le chiffre des unités sous les ${PREFIXES[l.de.col]}${l.base} ; puis l’unité devient le ${PREFIXES[l.a.col]}${l.base} : la virgule saute de ${n} colonne${n > 1 ? 's' : ''} vers la ${ecart > 0 ? 'droite' : 'gauche'}.`,
        ]}
      />
    </>
  );
}

/** Le décor : le ruban qui se déroule, la balance qui oscille, les éprouvettes. */
function Atelier() {
  return (
    <svg className={`${P}__atelier`} viewBox="0 0 400 70" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <path className={`${P}__ruban-decor`} d="M0 50 C 60 20 110 64 170 40 S 280 18 400 44" pathLength="1" />
      <path className={`${P}__ruban-traits`} d="M0 50 C 60 20 110 64 170 40 S 280 18 400 44" />
      <g className={`${P}__balance`}>
        <line x1="60" y1="70" x2="60" y2="18" />
        <g className={`${P}__fleau`}>
          <line x1="34" y1="18" x2="86" y2="18" />
          <path d="M34 18 l-8 18 h16 Z M86 18 l-8 18 h16 Z" />
        </g>
      </g>
      {[318, 342, 366].map((x, i) => (
        <g key={x} className={`${P}__eprouvette`}>
          <rect x={x} y={18 + i * 4} width="14" height={50 - i * 4} rx="6" />
          <rect x={x + 2} y={40 + i * 3} width="10" height={26 - i * 3} rx="4" className={`${P}__liquide`} style={{ animationDelay: `${(i * -0.6).toFixed(1)}s` }} />
        </g>
      ))}
    </svg>
  );
}

export function QuestionMetreRuban({ m, termine }) {
  const l = lire(m);
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Atelier />
      <div className={`${P}__plaque`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
        {l && <span className={`${P}__famille`}>{`Le tableau des ${NOMS[l.base]}`}</span>}
      </div>
      {!termine && l && <Ruban l={l} termine={false} />}
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={3.2} />}
    </div>
  );
}
