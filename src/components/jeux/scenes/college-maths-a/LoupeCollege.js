import { classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireNombre, lireNombre,
} from './outils';

/**
 * LE JARDIN D'EAU À LA LOUPE — « La loupe des centièmes », 6e (09/10/2026).
 * La couverture : un jardin d'eau semé de pas japonais, des cerisiers en
 * fleur, une grande loupe de laiton penchée sur l'eau. La scène :
 *   - LA QUESTION : un panneau de bois au bord de l'eau ; la loupe de laiton
 *     se balance au-dessus du chemin de pierres et grossit le nombre de la
 *     question ; des pétales tombent ;
 *   - LES RÉPONSES : des nénuphars qui dérivent doucement sur l'eau, chacun
 *     porte sa réponse (un clic suffit, ils ne fuient jamais) ;
 *   - APRÈS LA RÉPONSE : la loupe se pose sur le chemin — les pierres
 *     deviennent une demi-droite graduée : on compte les graduations, on voit
 *     le nombre entre ses deux bornes, ou de quel côté il penche à l'arrondi.
 * Avant la réponse, aucune graduation n'est dessinée : la dessiner, ce
 * serait faire le travail.
 */
const P = 'sc-loupe-college';

const PRECISION = { 'à l’unité': 1000, 'au dixième': 100, 'au centième': 10 };

/** Des millièmes, écrits à la française. */
const mil = (v) => ecrireNombre(v / 1000);
const enMilliemes = (texte) => {
  const n = lireNombre(texte);
  return n === null ? null : Math.round(n * 1000);
};

function lire(m) {
  const q = m.question;
  let r = /De\s+(.+?)\s+à\s+(.+?)\s*:\s*dix parts égales\.\s*M est (\d+) graduations/.exec(q);
  if (r) {
    const a = enMilliemes(r[1]);
    const b = enMilliemes(r[2]);
    if (a === null || b === null || b <= a) return null;
    return { sorte: 'graduation', a, b, k: Number(r[3]) };
  }
  r = /Encadre\s+(.+?)\s+(à l’unité|au dixième)/.exec(q);
  if (r) {
    const x = enMilliemes(r[1]);
    return x === null ? null : { sorte: 'encadrer', x, p: PRECISION[r[2]] };
  }
  r = /Arrondi de\s+(.+?)\s+(à l’unité|au dixième|au centième)/.exec(q);
  if (r) {
    const x = enMilliemes(r[1]);
    return x === null ? null : { sorte: 'arrondir', x, p: PRECISION[r[2]], nomPrecision: r[2] };
  }
  return null;
}

/** Le nombre que la loupe grossit avant la réponse : celui de la question, rien d'autre. */
function nombreALaLoupe(m) {
  const l = lire(m);
  if (!l) return null;
  return l.sorte === 'graduation' ? 'M' : mil(l.x);
}

/** Le décor : l'eau, le chemin de pierres, les pétales, la loupe qui se balance. */
function Jardin({ loupe }) {
  return (
    <div className={`${P}__jardin`} aria-hidden="true">
      <svg className={`${P}__eau`} viewBox="0 0 400 90" preserveAspectRatio="none" focusable="false">
        <path className={`${P}__vague`} d="M0 30 Q 50 22 100 30 T 200 30 T 300 30 T 400 30 V90 H0 Z" />
        {[30, 88, 146, 204, 262, 320, 370].map((x, i) => (
          <ellipse key={x} className={`${P}__pas`} cx={x} cy={58 + (i % 2) * 8} rx="22" ry="9" />
        ))}
        <circle className={`${P}__rond`} cx="120" cy="44" r="8" />
        <circle className={`${P}__rond ${P}__rond--2`} cx="300" cy="50" r="8" />
      </svg>
      {[12, 34, 61, 80, 92].map((x, i) => (
        <span key={x} className={`${P}__petale`} style={{ left: `${x}%`, animationDelay: `${(i * -1.7).toFixed(1)}s` }} />
      ))}
      {loupe && (
        <span className={`${P}__loupe`}>
          <span className={`${P}__verre`}>{loupe}</span>
          <span className={`${P}__manche`} />
        </span>
      )}
    </div>
  );
}

/** Une demi-droite graduée faite de pierres : `de` → `a`, une pierre par graduation. */
function Chemin({
  de, a, pas, marques = [], point, bornes = null, milieu = null, compter = 0,
}) {
  const X = (v) => 24 + (292 * (v - de)) / (a - de);
  const graduations = [];
  for (let v = de; v <= a + 1e-9; v += pas) graduations.push(v);
  return (
    <svg className={`${P}__chemin`} viewBox="0 0 340 120" focusable="false" aria-hidden="true">
      <line className={`${P}__axe`} x1="12" y1="70" x2="332" y2="70" />
      {bornes && <rect className={`${P}__encadre`} x={X(bornes[0])} y="54" width={X(bornes[1]) - X(bornes[0])} height="32" rx="8" />}
      {milieu !== null && <line className={`${P}__milieu`} x1={X(milieu)} y1="44" x2={X(milieu)} y2="96" />}
      {graduations.map((v, i) => (
        <g key={v} className={`${P}__graduation`} style={{ '--d': `${(0.2 + i * 0.12).toFixed(2)}s` }}>
          <ellipse cx={X(v)} cy="70" rx="7" ry="5" className={`${P}__pierre`} />
          {compter > 0 && i > 0 && i <= compter && (
            <text x={X(v)} y="100" textAnchor="middle" className={`${P}__compte`}>{i}</text>
          )}
        </g>
      ))}
      {marques.map(({ v, texte }) => (
        <text key={`${v}-${texte}`} x={X(v)} y="44" textAnchor="middle" className={`${P}__marque`}>{texte}</text>
      ))}
      {point !== undefined && (
        <g className={`${P}__lotus`}>
          <path d={`M${X(point.v)} 70 l-9 -12 l9 4 l9 -4 z M${X(point.v)} 70 l-5 -16 l5 6 l5 -6 z`} />
          <text x={X(point.v)} y="22" textAnchor="middle" className={`${P}__lotus-nom`}>{point.texte}</text>
        </g>
      )}
    </svg>
  );
}

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  if (l.sorte === 'graduation') {
    const { a, b, k } = l;
    const pas = (b - a) / 10;
    return (
      <>
        <Chemin
          de={a}
          a={b}
          pas={pas}
          compter={k}
          marques={[{ v: a, texte: mil(a) }, { v: b, texte: mil(b) }]}
          point={{ v: a + k * pas, texte: `M = ${mil(a + k * pas)}` }}
        />
        <Etapes
          p={P}
          depart={1.6}
          lignes={[
            `Une graduation : (${mil(b)} − ${mil(a)}) ÷ 10 = ${mil(pas)}`,
            `M : ${mil(a)} + ${k} × ${mil(pas)} = ${mil(a + k * pas)}`,
          ]}
        />
      </>
    );
  }
  const { x, p } = l;
  const bas = Math.floor(x / p) * p;
  const haut = bas + p;
  if (l.sorte === 'encadrer') {
    return (
      <>
        <Chemin
          de={bas - p}
          a={haut + p}
          pas={p / 10 >= 1 ? p / 10 : p}
          bornes={[bas, haut]}
          marques={[{ v: bas, texte: mil(bas) }, { v: haut, texte: mil(haut) }]}
          point={{ v: x, texte: mil(x) }}
        />
        <Etapes p={P} depart={1.4} lignes={[`${mil(bas)} < ${mil(x)} < ${mil(haut)}`]} />
      </>
    );
  }
  // Arrondir : le chiffre juste après le rang demandé décide.
  const suivant = Math.floor((x % p) / (p / 10));
  const monte = suivant >= 5;
  return (
    <>
      <Chemin
        de={bas}
        a={haut}
        pas={p / 10}
        milieu={bas + p / 2}
        marques={[{ v: bas, texte: mil(bas) }, { v: haut, texte: mil(haut) }]}
        point={{ v: x, texte: mil(x) }}
      />
      <Etapes
        p={P}
        depart={1.4}
        lignes={[
          `Le chiffre juste après : ${suivant} — ${monte ? 'cinq ou plus, on monte' : 'moins de cinq, on garde'}.`,
          `${mil(x)} est plus près de ${mil(monte ? haut : bas)}.`,
        ]}
      />
    </>
  );
}

export function QuestionLoupe({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {/* Après la réponse, la loupe s'est posée : le chemin gradué prend la place du jardin. */}
      {!termine && <Jardin loupe={nombreALaLoupe(m)} />}
      <div className={`${P}__panneau`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={3} />}
    </div>
  );
}

/** Les réponses : des nénuphars qui dérivent sur l'eau. */
export function Nenuphars({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__etang`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__nenuphar${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__fleur`} aria-hidden="true" />
            {libelle}
          </button>
        </li>
      ))}
    </ul>
  );
}
