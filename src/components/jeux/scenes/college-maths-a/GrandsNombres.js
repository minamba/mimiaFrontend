import { classeQuestion } from '../base';
import { Explication, lireNombre } from './outils';

/**
 * LA CITÉ DES GRANDS NOMBRES — « Les grands nombres », 6e (09/10/2026). La
 * couverture : une cité de tours ocre bâtie au-dessus des nuages, une
 * héroïne à la cape rouge qui tend la main. La scène la reprend :
 *   - LA QUESTION : une bannière tendue entre deux tours, la cité derrière,
 *     ses fanions qui claquent et ses nuages qui passent ; le nombre de la
 *     question est gravé sur le rempart, un chiffre par pierre ;
 *   - LES RÉPONSES : trois tours de la cité, toutes de même hauteur avant la
 *     réponse (une hauteur différente la donnerait), chacune porte son
 *     nombre sur sa plaque ;
 *   - APRÈS LA RÉPONSE : le tableau de numération se pose sous le nombre —
 *     le rang demandé s'allume ; pour « le plus grand », les nombres
 *     s'alignent sur leurs unités, la colonne qui décide s'allume, et les
 *     tours poussent à leur vraie taille.
 */
const P = 'sc-grands-nombres-college';

/** Les rangs, des unités vers la gauche (puissance de dix) ou vers la droite (négatifs). */
const RANG_DEMANDE = [
  [/centaines de mille/, 5],
  [/dizaines de mille/, 4],
  [/milliers/, 3],
  [/centaines/, 2],
  [/centièmes/, -2],
  [/dixièmes/, -1],
];

const ABREGE = { 0: 'u', 1: 'd', 2: 'c' };
const CLASSES = ['unités', 'mille', 'millions'];
const ABREGE_DECIMAL = { '-1': '10e', '-2': '100e', '-3': '1000e' };

/** « 4 609 567 » → { entier: '4609567', dec: '' } ; illisible → null. */
function decouper(texte) {
  const t = String(texte ?? '').replace(/[\s  ]/g, '');
  const r = /^(\d+)(?:,(\d+))?$/.exec(t);
  return r ? { entier: r[1], dec: r[2] ?? '' } : null;
}

/** Le chiffre de rang p (10^p) d'un nombre découpé, ou null s'il n'en a pas. */
function chiffre(n, p) {
  if (p >= 0) {
    const i = n.entier.length - 1 - p;
    return i >= 0 ? n.entier[i] : null;
  }
  return n.dec[-p - 1] ?? null;
}

/** La cité : des tours ocre, des fanions qui claquent, des nuages qui passent. */
function Cite() {
  const tours = [
    { x: 14, l: 34, h: 70 }, { x: 52, l: 26, h: 96 }, { x: 84, l: 40, h: 58 },
    { x: 300, l: 38, h: 64 }, { x: 344, l: 28, h: 104 }, { x: 378, l: 36, h: 76 },
  ];
  return (
    <svg className={`${P}__cite`} viewBox="0 0 420 120" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <circle className={`${P}__soleil`} cx="210" cy="70" r="34" />
      <g className={`${P}__nuages`}>
        <ellipse cx="60" cy="104" rx="70" ry="14" />
        <ellipse cx="200" cy="112" rx="90" ry="12" />
        <ellipse cx="360" cy="106" rx="80" ry="13" />
      </g>
      {tours.map((t, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={i} className={`${P}__tour-decor`}>
          <rect x={t.x} y={120 - t.h} width={t.l} height={t.h} rx="2" />
          <rect x={t.x - 3} y={120 - t.h - 8} width={t.l + 6} height="9" rx="2" className={`${P}__creneau`} />
          <path d={`M${t.x + t.l / 2 - 5} ${120 - t.h + 26} v-8 a5 5 0 0 1 10 0 v8 z`} className={`${P}__fenetre`} />
          <line x1={t.x + t.l / 2} y1={120 - t.h - 8} x2={t.x + t.l / 2} y2={120 - t.h - 26} className={`${P}__mat`} />
          <path
            d={`M${t.x + t.l / 2} ${120 - t.h - 26} l16 4 l-16 5 z`}
            className={`${P}__fanion`}
            style={{ animationDelay: `${(i * -0.37).toFixed(2)}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * LE NOMBRE GRAVÉ SUR LE REMPART : un chiffre par pierre, rangés par classes.
 * Avec `rang`, le tableau de numération apparaît dessous et le rang
 * s'allume ; avec `compter`, tous les chiffres de gauche jusqu'à lui aussi.
 */
function Rempart({ nombre, rang = null, compter = false }) {
  const n = decouper(nombre);
  if (!n) return null;
  const puissances = [];
  for (let p = n.entier.length - 1; p >= -n.dec.length; p -= 1) puissances.push(p);
  return (
    <div className={`${P}__rempart${rang !== null ? ' est-numere' : ''}`}>
      {puissances.map((p, i) => {
        const allume = rang !== null && (p === rang || (compter && p > rang));
        return (
          <span
            key={p}
            className={`${P}__pierre${p % 3 === 0 && p > 0 ? ' est-fin-de-classe' : ''}${p === 0 && n.dec ? ' est-avant-virgule' : ''}${allume ? ' est-allumee' : ''}${p === rang ? ' est-le-rang' : ''}`}
            style={{ '--d': `${(0.2 + i * 0.08).toFixed(2)}s` }}
          >
            <span className={`${P}__chiffre`} aria-hidden="true">{chiffre(n, p)}</span>
            {rang !== null && (
              <span className={`${P}__etiquette`}>
                {p >= 0 ? ABREGE[p % 3] : ABREGE_DECIMAL[p]}
                {p >= 0 && p % 3 === 0 ? <em>{CLASSES[p / 3]}</em> : null}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Les nombres de « le plus grand », alignés sur leurs unités ; la colonne qui décide s'allume. */
function Comparaison({ m }) {
  const nombres = m.choix.map((c) => ({ cle: c.cle, libelle: c.libelle, n: decouper(c.libelle), v: lireNombre(c.libelle) }));
  if (nombres.some((x) => !x.n || x.v === null)) return null;
  const haut = Math.max(...nombres.map((x) => x.n.entier.length)) - 1;
  const bas = -Math.max(...nombres.map((x) => x.n.dec.length));
  const puissances = [];
  for (let p = haut; p >= bas; p -= 1) puissances.push(p);
  // La colonne qui décide : la première, depuis la gauche, où les chiffres diffèrent.
  const decide = puissances.find((p) => new Set(nombres.map((x) => chiffre(x.n, p) ?? (p < 0 ? '0' : ''))).size > 1);
  const max = Math.max(...nombres.map((x) => x.v));
  const min = Math.min(...nombres.map((x) => x.v));
  return (
    <>
      <table className={`${P}__alignes`}>
        <tbody>
          {nombres.map((x, i) => (
            <tr key={x.cle} className={x.v === max ? 'est-le-plus-grand' : undefined} style={{ '--d': `${(0.2 + i * 0.25).toFixed(2)}s` }}>
              {puissances.map((p) => (
                <td key={p} className={`${p === decide ? 'est-decisive' : ''}${p === 0 && bas < 0 ? ' est-virgule' : ''}`}>
                  {chiffre(x.n, p) ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`${P}__phrase`} style={{ '--d': '1s' }}>
        {decide !== undefined && decide >= 0 && nombres.some((x) => chiffre(x.n, decide) === null)
          ? 'Le nombre qui a le plus de chiffres avant la virgule est le plus grand.'
          : 'Rang par rang depuis la gauche : le premier chiffre qui diffère décide.'}
      </p>
      <div className={`${P}__horizon`} aria-hidden="true">
        {nombres.map((x, i) => (
          <span
            key={x.cle}
            className={`${P}__tour-finale${x.v === max ? ' est-la-plus-haute' : ''}`}
            style={{ '--h': `${max === min ? 60 : Math.round(30 + (70 * (x.v - min)) / (max - min))}%`, '--d': `${(1.4 + i * 0.15).toFixed(2)}s` }}
          >
            <span className={`${P}__tour-nom`}>{x.libelle}</span>
          </span>
        ))}
      </div>
    </>
  );
}

function contenu(m) {
  if (/^plus-grand/.test(m.consigne)) return <Comparaison m={m} />;
  const trouve = RANG_DEMANDE.find(([motif]) => motif.test(m.question));
  const nombre = /dans\s+([\d\s  ,]+?)\s*\?/.exec(m.question)?.[1];
  if (!trouve || !nombre || !decouper(nombre)) return null;
  return (
    <>
      <Rempart nombre={nombre} rang={trouve[1]} compter={m.consigne === 'nombre-de'} />
      <p className={`${P}__phrase`} style={{ '--d': '1.2s' }}>
        {m.consigne === 'nombre-de'
          ? 'Le nombre de… : ce rang, et tous les chiffres à sa gauche.'
          : 'Le chiffre de… : le seul chiffre qui occupe ce rang.'}
      </p>
    </>
  );
}

export function QuestionGrandsNombres({ m, termine }) {
  const nombre = /dans\s+([\d\s  ,]+?)\s*\?/.exec(m.question)?.[1];
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Cite />
      <div className={`${P}__banniere`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {!termine && nombre && <Rempart nombre={nombre} />}
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={2} />}
    </div>
  );
}

/** Les réponses : trois tours de la cité, de même hauteur, chacune avec sa plaque. */
export function ToursDeLaCite({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__tours`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__tour${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__toit`} aria-hidden="true" />
            <span className={`${P}__plaque`}>{libelle}</span>
            <span className={`${P}__porte`} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
