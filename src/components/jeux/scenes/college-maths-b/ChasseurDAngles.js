import { avecVisuel } from '../base';
import { Enonce, nombresDe, useEtapes } from './commun';

/**
 * LE CAMP DU CHASSEUR D'ANGLES — « Le chasseur d'angles » (5e), le 09/10/2026.
 * La couverture : un camp d'arpenteur dans le désert rouge, une toile
 * claire, un sextant de laiton dans les mains, des panneaux et des câbles
 * tendus. La scène en reprend le carnet de relevés et le sextant :
 *   - L'ANGLE ÉGAL : le dessin de la question (la sécante et ses deux
 *     croisements) reste ; APRÈS, l'angle connu se décalque et glisse jusqu'à
 *     l'autre croisement — tout droit le long de la sécante s'il est
 *     correspondant, en faisant un demi-tour s'il est alterne-interne. Si les
 *     droites ne sont pas parallèles, le décalque ne tombe pas juste ;
 *   - LA SOMME DES ANGLES : le triangle de la question reste ; APRÈS, ses
 *     trois angles se détachent et se rangent côte à côte : un demi-tour,
 *     180° ;
 *   - LE TRIANGLE CONSTRUCTIBLE : trois jalons couchés dans le sable ; APRÈS,
 *     les deux plus courts se lèvent aux bouts du plus long et tentent de se
 *     rejoindre — ils se touchent, se couchent à plat, ou n'y arrivent pas.
 */

const P = 'sc-chasseur-d-angles';
const RAD = Math.PI / 180;

/** Un secteur d'angle, de `debut` à `debut + ouverture` (en degrés, dans le sens du dessin). */
function secteur(r, debut, ouverture) {
  const a0 = debut * RAD;
  const a1 = (debut + ouverture) * RAD;
  return `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 ${ouverture > 180 ? 1 : 0} 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;
}

/* --------------------------------------------------- L'ANGLE ÉGAL */

/** Les coins d'un croisement : leurs directions de départ et leur ouverture, sur notre sécante. */
const PENTE = Math.atan2(180, 100) / RAD;
/** Les quatre coins, quand la droite croisée penche de `phi` degrés (0 : horizontale). */
const coins = (phi = 0) => ({
  se: [phi, PENTE - phi],
  so: [PENTE, 180 + phi - PENTE],
  no: [180 + phi, PENTE - phi],
  ne: [180 + PENTE, 180 - PENTE + phi],
});
const COINS = coins(0);

function Decalque({ visuel, termine }) {
  const [a1, a2] = visuel?.angles ?? [];
  if (!a1 || !a2 || !COINS[a1.coin] || !COINS[a2.coin]) return null;
  const paralleles = visuel.paralleles !== false;
  // La sécante va de (110, 0) à (210, 180) ; la 1re droite à y = 40.
  const P1 = { x: 110 + (100 * 40) / 180, y: 40 };
  // La 2de droite : horizontale à y = 140, ou penchée si elle n'est pas parallèle.
  const pente2 = paralleles ? 0 : 0.18;
  const y2 = (x) => 140 + pente2 * (x - 160);
  // Croisement de la sécante (x = 110 + 100 t, y = 180 t) avec la 2de droite.
  const t = (140 - 160 * pente2 + 110 * pente2) / (180 - 100 * pente2);
  const P2 = { x: 110 + 100 * t, y: 180 * t };
  const ici = coins(Math.atan(pente2) / RAD);
  const [d1, o1] = COINS[a1.coin];
  const [d2, o2] = ici[a2.coin];
  const tour = d2 - d1;
  return (
    <figure className={`${P}__calque${termine ? ' est-pose' : ''}`}>
      <svg viewBox="0 0 320 190" aria-hidden="true" focusable="false">
        <line x1="10" y1="40" x2="310" y2="40" className={`${P}__droite`} />
        <line x1="10" y1={y2(10)} x2="310" y2={y2(310)} className={`${P}__droite`} />
        <line x1="104" y1="-10" x2="216" y2="190" className={`${P}__secante`} />
        <path d={secteur(26, d1, o1)} transform={`translate(${P1.x} ${P1.y})`} className={`${P}__angle`} />
        <path d={secteur(26, d2, o2)} transform={`translate(${P2.x} ${P2.y})`} className={`${P}__angle ${P}__angle--cible`} />
        {termine && (
          <g style={{ transform: `translate(${P2.x}px, ${P2.y}px)` }}>
            <g className={`${P}__fantome`} style={{ '--dx': `${P1.x - P2.x}px`, '--dy': `${P1.y - P2.y}px`, '--tour': `${-tour}deg` }}>
              <path d={secteur(26, d2, o1)} />
            </g>
          </g>
        )}
        <text x={P1.x + 30} y="30" className={`${P}__mesure`}>{a1.valeur}</text>
        <text x={P2.x + 30} y={P2.y - 8} className={`${P}__mesure ${P}__mesure--cible`}>{termine ? (paralleles ? a1.valeur : '≠ ?') : '?'}</text>
      </svg>
      {termine && (
        <figcaption className={`${P}__lecon`}>
          {(() => {
            if (!paralleles) return 'Droites pas parallèles : le décalque ne tombe pas juste, on ne peut rien dire.';
            if (a1.coin === a2.coin) return 'Correspondants : même place aux deux croisements, même mesure.';
            return 'Alternes-internes : un demi-tour, et l’angle tombe juste. Même mesure.';
          })()}
        </figcaption>
      )}
    </figure>
  );
}

/* --------------------------------------------------- LA SOMME DES ANGLES */

function Demitour({ a, b, noms }) {
  const c = 180 - a - b;
  // Comme le dessin de la question : A en haut, B en bas à gauche, C en bas à
  // droite. Côté BC = 1, puis mis à l'échelle du cadre (un angle obtus pousse
  // un sommet au-delà d'un autre : on cadre sur les trois).
  const sinus = (x) => Math.sin(x * RAD);
  const t = sinus(c) / sinus(a);
  const brut = [{ x: t * Math.cos(b * RAD), y: -t * sinus(b) }, { x: 0, y: 0 }, { x: 1, y: 0 }];
  const xs = brut.map((q) => q.x);
  const ys = brut.map((q) => q.y);
  const e = Math.min(260 / (Math.max(...xs) - Math.min(...xs)), 150 / Math.max(Math.max(...ys) - Math.min(...ys), 0.05));
  const dx = 160 - ((Math.max(...xs) + Math.min(...xs)) / 2) * e;
  const [A, B, C] = brut.map((q) => ({ x: dx + q.x * e, y: 180 + q.y * e }));
  const k = useEtapes(3, 1300, 400);
  // Chaque angle : son coin dans le triangle, puis sa place dans le demi-tour.
  const angles = [
    { nom: noms[1], v: b, coin: B, r: -b, place: 180 },
    { nom: noms[0], v: a, coin: A, r: c, place: 180 + b },
    { nom: noms[2], v: c, coin: C, r: 180, place: 180 + b + a },
  ];
  const centre = { x: 160, y: 262 };
  return (
    <figure className={`${P}__demitour`}>
      <svg viewBox="0 0 320 300" aria-hidden="true" focusable="false">
        <path d={`M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z`} className={`${P}__triangle`} />
        <line x1="70" x2="250" y1={centre.y} y2={centre.y} className={`${P}__regle`} />
        {angles.map((g, i) => {
          const parti = k >= 2;
          const x = parti ? centre.x : g.coin.x;
          const y = parti ? centre.y : g.coin.y;
          return (
            <g key={g.nom} className={`${P}__morceau ${P}__morceau--${i}${k >= 1 ? ' est-visible' : ''}`} style={{ transform: `translate(${x}px, ${y}px) rotate(${parti ? g.place : g.r}deg)` }}>
              <path d={secteur(parti ? 44 : 30, 0, g.v)} />
            </g>
          );
        })}
        {[[A, noms[0]], [B, noms[1]], [C, noms[2]]].map(([pt, nom]) => (
          <text key={nom} x={pt.x + (pt === B ? -14 : pt === C ? 8 : -4)} y={pt.y + (pt === A ? -8 : 16)} className={`${P}__sommet`}>{nom}</text>
        ))}
        {k >= 3 && <text x="160" y="292" textAnchor="middle" className={`${P}__total`}>180°</text>}
      </svg>
    </figure>
  );
}

function SommeTriangle({ m, termine }) {
  const q = String(m.question);
  let a;
  let b;
  let lignes;
  const iso = q.match(/isocèle en A, angle A = (\d+)°/);
  const quelc = q.match(/angle A = (\d+)°, angle B = (\d+)°/);
  if (iso) {
    const s = Number(iso[1]);
    a = s;
    b = (180 - s) / 2;
    lignes = [`Les trois angles font 180° : 180 − ${s} = ${180 - s}`, `Isocèle : B et C se partagent le reste, ${180 - s} ÷ 2 = ${b}`];
  } else if (quelc) {
    a = Number(quelc[1]);
    b = Number(quelc[2]);
    lignes = [`Les trois angles font 180°`, `180 − ${a} − ${b} = ${180 - a - b}`];
  } else return null;
  if (!termine) return null;
  return (
    <div className={`${P}__atelier`}>
      <Demitour a={a} b={b} noms={['A', 'B', 'C']} />
      <ol className={`${P}__releve`} aria-label="Le calcul">
        {lignes.map((l) => <li key={l}>{l}</li>)}
      </ol>
    </div>
  );
}

/* --------------------------------------------------- LE TRIANGLE CONSTRUCTIBLE */

function Jalons({ m, termine }) {
  const cotes = nombresDe(m.question);
  if (cotes.length !== 3 || cotes.some((x) => !Number.isFinite(x))) return null;
  const tries = [...cotes].sort((x, y) => x - y);
  const [a, b, c] = tries;
  const sc = 250 / c;
  const x0 = 35;
  const y = 150;
  const leve = termine;
  // Les angles aux deux bouts du grand côté, s'ils existent ; sinon, à plat.
  const cosA = (a * a + c * c - b * b) / (2 * a * c);
  const cosB = (b * b + c * c - a * a) / (2 * b * c);
  const ta = a + b > c ? Math.acos(Math.max(-1, Math.min(1, cosA))) / RAD : 0;
  const tb = a + b > c ? Math.acos(Math.max(-1, Math.min(1, cosB))) / RAD : 0;
  const verdict = (() => {
    if (a + b > c) return `${a} + ${b} = ${a + b}, plus que ${c} : les jalons se rejoignent, un vrai triangle.`;
    if (a + b === c) return `${a} + ${b} = ${c} tout juste : les jalons se touchent à plat, le triangle est aplati.`;
    return `${a} + ${b} = ${a + b}, moins que ${c} : les jalons ne se rejoignent pas.`;
  })();
  return (
    <div className={`${P}__atelier`}>
      <svg viewBox="0 0 320 180" className={`${P}__sable`} aria-hidden="true" focusable="false">
        <path d="M0 158 Q80 148 160 156 T320 152 V180 H0 Z" className={`${P}__dune`} />
        {termine ? (
          <>
            {/* Le grand jalon, un peu plus bas : les deux autres se couchent dessus sans le cacher. */}
            <g style={{ transform: `translate(${x0}px, ${y + 9}px)` }}>
              <line x1="0" y1="0" x2={c * sc} y2="0" className={`${P}__jalon ${P}__jalon--long`} />
            </g>
            <g style={{ transform: `translate(${x0}px, ${y}px)` }}>
              <g className={`${P}__bras${leve ? ' est-leve' : ''}`} style={{ '--fin': `${-ta}deg`, '--debut': '-180deg' }}>
                <line x1="0" y1="0" x2={a * sc} y2="0" className={`${P}__jalon ${P}__jalon--a`} />
              </g>
            </g>
            <g style={{ transform: `translate(${x0 + c * sc}px, ${y}px)` }}>
              <g className={`${P}__bras${leve ? ' est-leve' : ''}`} style={{ '--fin': `${180 + tb}deg`, '--debut': '0deg' }}>
                <line x1="0" y1="0" x2={b * sc} y2="0" className={`${P}__jalon ${P}__jalon--b`} />
              </g>
            </g>
            {a + b < c && (
              <line x1={x0 + a * sc} x2={x0 + (c - b) * sc} y1={y} y2={y} className={`${P}__trou`} />
            )}
            <text x={x0 + (c * sc) / 2} y={y + 28} textAnchor="middle" className={`${P}__longueur`}>{`${c} cm`}</text>
          </>
        ) : (
          tries.map((l, i) => (
            <g key={`${l}-${i}`} className={`${P}__couche`} style={{ '--k': i }}>
              <line x1={x0} x2={x0 + l * sc} y1={40 + i * 40} y2={40 + i * 40} className={`${P}__jalon ${P}__jalon--${['a', 'b', 'long'][i]}`} />
              <text x={x0 + l * sc + 8} y={45 + i * 40} className={`${P}__longueur`}>{`${l} cm`}</text>
            </g>
          ))
        )}
      </svg>
      {termine && <p className={`${P}__lecon`}>{verdict}</p>}
    </div>
  );
}

/* --------------------------------------------------- LA SCÈNE */

/** Le sextant de laiton de la couverture, qui se balance au bout de sa chaîne. */
function Sextant() {
  return (
    <svg viewBox="0 0 70 80" className={`${P}__sextant`} aria-hidden="true" focusable="false">
      <g className={`${P}__balancier`}>
        <line x1="35" y1="0" x2="35" y2="14" />
        <path d="M35 14 L10 62 A30 30 0 0 0 60 62 Z" className={`${P}__laiton`} />
        <path d="M14 58 A26 26 0 0 0 56 58" className={`${P}__graduation`} />
        <line x1="35" y1="14" x2="22" y2="60" className={`${P}__alidade`} />
        <circle cx="35" cy="14" r="4" />
      </g>
    </svg>
  );
}

export function QuestionAngles({ m, termine }) {
  let suite = null;
  if (m.consigne === 'angle-egal' && termine) suite = <Decalque visuel={m.visuel} termine={termine} />;
  if (m.consigne === 'somme-triangle') suite = <SommeTriangle key={termine ? 'a' : 'b'} m={m} termine={termine} />;
  if (m.consigne === 'constructible') suite = <Jalons key={termine ? 'a' : 'b'} m={m} termine={termine} />;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__carnet-cadre`}>
        <Sextant />
        <div className={`${P}__carnet`}>{avecVisuel(m, <Enonce m={m} classe={`${P}__releve-texte`} />)}</div>
      </div>
      {suite}
    </div>
  );
}

export const sceneAngles = {
  question: (m, termine) => <QuestionAngles m={m} termine={termine} />,
  objets: P,
};
