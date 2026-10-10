import {
  ecrireFr, nombreFr, nombresDans, premierNombre, proche, TexteQuestion,
} from './outils';

/**
 * LA FABRIQUE DE JUS D'ORANGE — « Proportions et grandeurs » (voie pro). La
 * couverture : une usine lumineuse, des cuves de verre pleines de jus et de
 * rondelles d'orange, un tuyau qui verse, des bouteilles sur un tapis
 * roulant ; un apprenti lève un bécher pour lire le niveau. La scène la reprend :
 *   - LA QUESTION : sur la fiche de production, pincée à son porte-bloc ; à
 *     côté, la cuve qui bouillonne, le jus qui coule, les bouteilles qui passent ;
 *   - LES RÉPONSES : des bouteilles sur le tapis roulant (`choix`) — le tapis
 *     défile sous elles, elles restent à portée de main ;
 *   - APRÈS LA RÉPONSE : le calcul de la manche posé avec ses nombres — le
 *     tableau de proportionnalité et son coefficient, l'horloge des minutes,
 *     le triangle distance-vitesse-durée, l'échelle du pH ou des décibels —,
 *     chaque calcul vérifié contre la réponse avant d'être montré.
 */

const P = 'sc-proportions-et-grandeurs';

/* ---------------------------------------------------------------- le décor */

function Fabrique() {
  return (
    <svg className={`${P}__fabrique`} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-pro-jus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd35c" />
          <stop offset="1" stopColor="#ff8a1c" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="16" className={`${P}__hall`} />
      <path d="M0 22 H240 M60 0 V40 M180 0 V40" className={`${P}__tuyaux`} />
      {/* La grande cuve de verre et son jus qui ondule. */}
      <rect x="14" y="30" width="70" height="96" rx="12" className={`${P}__verre`} />
      <g className={`${P}__jus`}>
        <path d="M17 70 q8 -5 16 0 t16 0 t16 0 t16 0 V122 q0 2 -2 2 H19 q-2 0 -2 -2 Z" fill="url(#sc-pro-jus)" />
      </g>
      {[[34, 98], [58, 88], [46, 110], [70, 104]].map(([x, y], i) => (
        <g key={x} className={`${P}__rondelle`} style={{ '--n': i }}>
          <circle cx={x} cy={y} r="6" fill="#ffb347" stroke="#fff3c4" strokeWidth="1.5" />
          <path d={`M${x - 6} ${y} h12 M${x} ${y - 6} v12`} stroke="#fff3c4" strokeWidth="1" />
        </g>
      ))}
      {[0, 1, 2].map((i) => <circle key={i} cx={30 + i * 18} cy="80" r="2" className={`${P}__bulle`} style={{ '--n': i }} />)}
      {/* Le tuyau qui verse dans la cuve du bas. */}
      <path d="M84 50 H120 V76" className={`${P}__conduite`} />
      <rect x="114" y="76" width="12" height="40" className={`${P}__coulee`} />
      <ellipse cx="120" cy="124" rx="30" ry="8" fill="url(#sc-pro-jus)" />
      {/* Les bouteilles sur leur tapis. */}
      <rect x="140" y="126" width="100" height="8" rx="4" className={`${P}__tapis`} />
      <g className={`${P}__bouteilles`}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${150 + i * 24} 92)`}>
            <path d="M5 0 h6 v8 q6 4 6 12 v14 h-18 v-14 q0 -8 6 -12 Z" fill="url(#sc-pro-jus)" stroke="#fff" strokeWidth="1.2" />
            <rect x="-1" y="20" width="18" height="7" fill="#fff" opacity="0.85" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- les calculs */

/** Une ligne de calcul, et rien si elle ne tombe pas juste. */
const Ligne = ({ texte, n = 0 }) => <li style={{ '--n': n }}>{texte}</li>;

/**
 * Le calcul d'une manche : { lignes, dessin } — chaque ligne vérifiée contre
 * la bonne réponse — ou null.
 */
export function calculDe(m) {
  const q = String(m.question);
  const b = premierNombre(m.bonne);
  const nb = nombresDans(q);
  const f = (x, d = 2) => ecrireFr(x, d);
  switch (m.consigne) {
    case 'quatrieme': {
      const mo = q.match(/dure (\d+) h (\d+) min ; .* facturée (.+?) de l’heure/);
      if (mo) {
        const [h, min] = [Number(mo[1]), Number(mo[2])];
        const taux = premierNombre(mo[3]);
        const duree = h + min / 60;
        if (taux === null || b === null || !proche(Math.round(duree * taux * 100) / 100, b)) return null;
        return {
          lignes: [`${h} h ${min} min = ${h} + ${min} ÷ 60 = ${f(duree, 4)} h`, `${f(duree, 4)} × ${f(taux)} € = ${m.bonne}`],
          dessin: 'horloge',
          minutes: min,
        };
      }
      const [q1, v1, q2] = nb;
      if (![q1, v1, q2, b].every(Number.isFinite) || !proche(Math.round((v1 / q1) * q2 * 10) / 10, Math.round(b * 10) / 10)) return null;
      return {
        lignes: [`Pour 1 : ${f(v1)} ÷ ${f(q1)} = ${f(v1 / q1, 4)}`, `Pour ${f(q2)} : ${f(v1 / q1, 4)} × ${f(q2)} = ${m.bonne}`],
        tableau: [[q1, v1], [q2, m.bonne]],
      };
    }
    case 'echelle': {
      const e = nombreFr(q.match(/1\/(\d+)/)?.[1]);
      if (!e) return null;
      if (q.includes('Aire réelle')) {
        const [, , a, c] = nb;
        return { lignes: [`${f(a)} cm × ${e} = ${f((a * e) / 100)} m et ${f(c)} cm × ${e} = ${f((c * e) / 100)} m`, `Aire : ${f((a * e) / 100)} × ${f((c * e) / 100)} = ${m.bonne}`] };
      }
      const valeur = nb[2];
      if (q.includes('Longueur réelle')) return { lignes: [`${f(valeur)} cm × ${e} = ${f(valeur * e)} cm = ${f((valeur * e) / 100)} m`] };
      return { lignes: [`${f(valeur)} m = ${f(valeur * 100)} cm`, `${f(valeur * 100)} cm ÷ ${e} = ${m.bonne}`] };
    }
    case 'conversion': {
      if (q.includes('m³') && q.includes('litres')) return { lignes: ['1 m³ = 1 000 L : on multiplie par 1 000.'], echelons: ['m³', 'dm³ = L'] };
      if (q.includes('mètres cubes')) return { lignes: ['1 000 L = 1 m³ : on divise par 1 000.'], echelons: ['L = dm³', 'm³'] };
      if (q.includes('centimètres carrés')) return { lignes: ['1 m² = 100 cm × 100 cm = 10 000 cm².'], echelons: ['m²', 'dm²', 'cm²'] };
      if (q.includes('tonnes')) return { lignes: ['1 t = 1 000 kg : on divise par 1 000.'], echelons: ['kg', 't'] };
      if (q.includes('bac')) return { lignes: ['Tout en décimètres : 1 dm³ = 1 L.', `Contenance : ${m.bonne}`] };
      return null;
    }
    case 'duree': {
      const dec = q.match(/dure (\d+(?:,\d+)?) h\./)?.[1];
      if (dec) {
        const v = nombreFr(dec);
        const part = Math.round((v - Math.floor(v)) * 100) / 100;
        return { lignes: [`${f(part)} h = ${f(part)} × 60 min = ${f(part * 60)} min`], dessin: 'horloge', minutes: Math.round(part * 60) };
      }
      const hm = q.match(/dure (\d+) h (\d+) min/);
      if (!hm) return null;
      const min = Number(hm[2]);
      return { lignes: [`${min} min = ${min} ÷ 60 h = ${f(min / 60, 4)} h`], dessin: 'horloge', minutes: min };
    }
    case 'vitesse':
      return { dessin: 'triangle' };
    case 'debit':
      return { lignes: ['Débit = volume ÷ durée ; 1 m³ = 1 000 L ; 1 h = 60 min.'] };
    case 'decibels':
      return { dessin: 'decibels' };
    case 'ph':
      return { dessin: 'ph', ph: nombreFr(m.bonne) };
    default:
      return null;
  }
}

const REGLES = {
  quatrieme: 'Proportionnalité : on passe par l’unité, puis on multiplie.',
  echelle: 'Échelle 1/e : le réel vaut e fois le plan — et une aire, e × e fois.',
  conversion: 'Un rang de plus, c’est × 10 pour une longueur, × 100 pour une aire, × 1 000 pour un volume.',
  duree: 'Une heure, c’est 60 minutes, pas 100.',
  vitesse: 'v = d ÷ t, d = v × t, t = d ÷ v — avec t en heures pour des km/h ; 1 m/s = 3,6 km/h.',
  debit: 'Débit = volume ÷ durée.',
  decibels: 'Échelle logarithmique : intensité × 10 ⇔ + 10 dB ; deux sources identiques ⇔ + 3 dB environ.',
  ph: 'pH = −log [H₃O⁺] : concentration ÷ 10 ⇔ pH + 1.',
};

/* --------------------------------------------------------- les dessins */

function Horloge({ minutes }) {
  const angle = (minutes / 60) * 360;
  const rad = ((angle - 90) * Math.PI) / 180;
  const grand = angle > 180 ? 1 : 0;
  return (
    <svg className={`${P}__horloge`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="44" className={`${P}__cadran`} />
      {minutes > 0 && minutes < 60 && (
        <path d={`M50 50 L50 6 A44 44 0 ${grand} 1 ${50 + 44 * Math.cos(rad)} ${50 + 44 * Math.sin(rad)} Z`} className={`${P}__secteur`} />
      )}
      {[0, 15, 30, 45].map((t) => (
        <text key={t} x={50 + 34 * Math.cos(((t * 6 - 90) * Math.PI) / 180)} y={54 + 34 * Math.sin(((t * 6 - 90) * Math.PI) / 180)} textAnchor="middle" className={`${P}__heure`}>{t}</text>
      ))}
      <line x1="50" y1="50" x2={50 + 38 * Math.cos(rad)} y2={50 + 38 * Math.sin(rad)} className={`${P}__aiguille`} />
    </svg>
  );
}

function Triangle() {
  return (
    <svg className={`${P}__triangle`} viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      <path d="M60 6 L114 94 H6 Z" className={`${P}__dvt`} />
      <line x1="30" y1="52" x2="90" y2="52" className={`${P}__dvt-ligne`} />
      <line x1="60" y1="52" x2="60" y2="94" className={`${P}__dvt-ligne`} />
      <text x="60" y="42" textAnchor="middle" className={`${P}__dvt-lettre`}>d</text>
      <text x="38" y="82" textAnchor="middle" className={`${P}__dvt-lettre`}>v</text>
      <text x="82" y="82" textAnchor="middle" className={`${P}__dvt-lettre`}>t</text>
    </svg>
  );
}

function EchellePh({ ph }) {
  const x = Number.isFinite(ph) ? 10 + (Math.min(Math.max(ph, 0), 14) / 14) * 280 : null;
  return (
    <svg className={`${P}__ph`} viewBox="0 0 300 60" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-pro-ph" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e5383b" />
          <stop offset="0.35" stopColor="#ffd35c" />
          <stop offset="0.5" stopColor="#5fc46a" />
          <stop offset="0.75" stopColor="#3a7bd5" />
          <stop offset="1" stopColor="#6c3fb5" />
        </linearGradient>
      </defs>
      <rect x="10" y="16" width="280" height="16" rx="8" fill="url(#sc-pro-ph)" />
      {[0, 7, 14].map((v) => <text key={v} x={10 + (v / 14) * 280} y="48" textAnchor="middle" className={`${P}__heure`}>{v}</text>)}
      {x !== null && <path d={`M${x} 34 l-7 12 h14 Z`} className={`${P}__repere-ph`} />}
    </svg>
  );
}

function Decibels() {
  return (
    <svg className={`${P}__db`} viewBox="0 0 300 80" aria-hidden="true" focusable="false">
      {[0, 1, 2, 3].map((k) => (
        <g key={k} className={`${P}__marche-db`} style={{ '--n': k }}>
          <rect x={20 + k * 70} y={64 - 12 * (k + 1)} width="56" height={12 * (k + 1)} rx="4" />
          <text x={48 + k * 70} y={58 - 12 * (k + 1)} textAnchor="middle">{`+${k * 10} dB`}</text>
          <text x={48 + k * 70} y="76" textAnchor="middle">{`× ${10 ** k}`}</text>
        </g>
      ))}
    </svg>
  );
}

function Explication({ m }) {
  const calcul = calculDe(m);
  return (
    <div className={`${P}__explication`}>
      {calcul?.tableau && (
        <table className={`${P}__tableau`}>
          <tbody>
            <tr>{calcul.tableau.map(([a]) => <td key={`a${a}`}>{ecrireFr(a)}</td>)}</tr>
            <tr>{calcul.tableau.map(([a, v]) => <td key={`v${a}`}>{typeof v === 'number' ? ecrireFr(v) : v}</td>)}</tr>
          </tbody>
        </table>
      )}
      {calcul?.echelons && (
        <div className={`${P}__echelons`}>
          {calcul.echelons.map((e, i) => <span key={e} style={{ '--n': i }}>{e}</span>)}
        </div>
      )}
      {calcul?.dessin === 'horloge' && <Horloge minutes={calcul.minutes} />}
      {calcul?.dessin === 'triangle' && <Triangle />}
      {calcul?.dessin === 'decibels' && <Decibels />}
      {calcul?.dessin === 'ph' && <EchellePh ph={calcul.ph} />}
      {calcul?.lignes && (
        <ul className={`${P}__lignes`}>
          {calcul.lignes.map((l, i) => <Ligne key={l} texte={l} n={i} />)}
        </ul>
      )}
      <p className={`${P}__regle`}>{REGLES[m.consigne] ?? `La réponse : ${m.bonne}.`}</p>
    </div>
  );
}

export function QuestionProportions({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Fabrique />}
      <div className={`${P}__porte-bloc`}>
        <span className={`${P}__pince`} aria-hidden="true" />
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

/** Les réponses : des bouteilles sur le tapis roulant. Le tapis défile ; elles restent à portée de main. */
export function BouteillesProportions({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__chaine`} role="group" aria-label="Choisis ta réponse">
      <div className={`${P}__bouteilles-reponse`}>
        {choix.map(({ cle, libelle }, i) => {
          const fausse = fautes.includes(cle);
          return (
            <button
              key={cle}
              type="button"
              className={`${P}__bouteille${fausse ? ' est-fausse' : ''}`}
              style={{ '--i': i }}
              onClick={() => choisir(cle)}
              disabled={fausse}
            >
              <span className={`${P}__goulot`} aria-hidden="true" />
              <span className={`${P}__etiquette`}>{libelle}</span>
            </button>
          );
        })}
      </div>
      <span className={`${P}__tapis-roulant`} aria-hidden="true" />
    </div>
  );
}
