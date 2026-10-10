import {
  ecrireFr, nombreFr, nombresDans, TexteQuestion,
} from './outils';

/**
 * LA CITÉ DES TURBINES — « Les évolutions » (1re et terminale techno). La
 * couverture : une ville futuriste au bord d'un lac, d'immenses turbines
 * bleues que l'eau fait tourner, des cascades d'un bassin à l'autre au
 * coucher du soleil. Une évolution, c'est un niveau d'eau qui monte ou
 * descend d'un bassin au suivant. La scène la reprend :
 *   - LA QUESTION : sur l'écran de contrôle de la centrale ; à côté, la
 *     turbine qui tourne, l'eau qui coule, la cité ;
 *   - LES RÉPONSES : des manettes sur le pupitre (`choix`) — on abaisse la bonne ;
 *   - APRÈS LA RÉPONSE : les écluses — un bassin par valeur, le niveau d'eau
 *     qui monte ou descend, et entre deux bassins le coefficient
 *     multiplicateur (× 1,2, × 0,9…) : on voit qu'une hausse puis une baisse
 *     ne s'annulent pas, qu'un taux moyen se répète, qu'un retour se divise.
 *     Avec, en dessous, la formule de la sorte de manche.
 */

const P = 'sc-les-evolutions';

/* ---------------------------------------------------------------- le décor */

function Centrale() {
  return (
    <svg className={`${P}__centrale`} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-evo-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6c5bb8" />
          <stop offset="0.55" stopColor="#ff9fb0" />
          <stop offset="1" stopColor="#ffd59a" />
        </linearGradient>
        <linearGradient id="sc-evo-eau" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ff3ff" />
          <stop offset="1" stopColor="#1aa3c9" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="16" fill="url(#sc-evo-ciel)" />
      {/* La cité, au loin. */}
      <path d="M120 80 V44 h8 V30 h6 V44 h8 V80 Z M150 80 V56 h14 V80 Z M176 80 V50 h10 V36 h4 V50 h10 V80 Z" fill="#d9e4f2" opacity="0.85" />
      <rect x="0" y="80" width="240" height="70" fill="#e6edf5" />
      {/* Les bassins en escalier, et l'eau qui tombe de l'un à l'autre. */}
      <rect x="110" y="84" width="130" height="16" fill="url(#sc-evo-eau)" />
      <rect x="140" y="108" width="100" height="16" fill="url(#sc-evo-eau)" />
      <rect x="170" y="132" width="70" height="18" fill="url(#sc-evo-eau)" />
      <path className={`${P}__chute`} d="M112 100 V150 M142 124 V150 M118 100 V150" stroke="#e9fdff" strokeWidth="3" strokeDasharray="6 6" />
      {/* La turbine, qui tourne. */}
      <circle cx="58" cy="96" r="44" className={`${P}__carter`} />
      <g className={`${P}__roue`}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d="M58 96 L58 58 Q72 66 74 80 Z" transform={`rotate(${i * 45} 58 96)`} className={`${P}__pale`} />
        ))}
      </g>
      <circle cx="58" cy="96" r="9" className={`${P}__moyeu`} />
    </svg>
  );
}

/* --------------------------------------------------------- les lectures */

/** Les évolutions dites en mots, dans l'ordre : « une hausse de 20 % » → 20, « une baisse de 5 % » → −5. */
export function evolutionsDites(texte) {
  return [...String(texte).matchAll(/(hausse|baisse|augmenté|baissé|augmente|baisse) de (\d+(?:,\d+)?)/g)]
    .map(([, mot, v]) => (/^(baisse|baissé)$/.test(mot) ? -1 : 1) * nombreFr(v));
}

/** Les pourcentages signés d'une liste « +5 % ; −3 % ; +8 % ». */
const pourcentsSignes = (texte) => [...String(texte).matchAll(/([+−])(\d+(?:,\d+)?) ?%/g)]
  .map(([, s, v]) => (s === '−' ? -1 : 1) * nombreFr(v));

const coef = (p) => 1 + p / 100;
const unite = (texte) => (String(texte).includes('€') ? '€' : '');

/**
 * LES ÉCLUSES d'une manche : la suite des niveaux { v, nom } et, entre deux,
 * l'opération (« × 1,2 », « ÷ 1,25 »). Null si la question ne se lit pas.
 */
export function eclusesDe(m) {
  const q = String(m.question);
  const nombres = nombresDans(q);
  const evol = evolutionsDites(q);
  const etapes = (depart, coefs) => {
    const niveaux = [{ v: depart }];
    coefs.forEach((c) => niveaux.push({ v: niveaux[niveaux.length - 1].v * c }));
    return { niveaux, operations: coefs.map((c) => `× ${ecrireFr(c, 4)}`) };
  };
  switch (m.consigne) {
    case 'taux': {
      const [x, y] = nombres;
      if (!(x > 0 && y > 0)) return null;
      return { niveaux: [{ v: x }, { v: y }], operations: [`× ${ecrireFr(y / x, 4)}`], unite: unite(q) };
    }
    case 'coefficient': {
      const k = q.startsWith('Multiplier par') ? nombres[0] : null;
      if (k) return etapes(100, [k]);
      if (evol.length === 1) return etapes(100, [coef(evol[0])]);
      return null;
    }
    case 'appliquer': {
      if (evol.length !== 1) return null;
      const c = coef(evol[0]);
      if (q.includes('Prix de départ')) {
        const y = nombres[nombres.length - 1];
        return { niveaux: [{ v: y / c }, { v: y }], operations: [`× ${ecrireFr(c, 4)}`], retour: `÷ ${ecrireFr(c, 4)}`, unite: '€' };
      }
      return { ...etapes(nombres[0], [c]), unite: '€' };
    }
    case 'successives':
      return evol.length === 2 ? etapes(100, evol.map(coef)) : null;
    case 'reciproque':
      return evol.length === 1 ? etapes(100, [coef(evol[0]), 1 / coef(evol[0])]) : null;
    case 'indice': {
      const [x, y] = q.startsWith('Indices') ? nombres.slice(1) : [nombres[1], nombres[2]];
      if (!(x > 0 && y > 0)) return null;
      return { niveaux: [{ v: x }, { v: y }], operations: [`× ${ecrireFr(y / x, 4)}`] };
    }
    case 'taux-moyen': {
      const liste = pourcentsSignes(q.split('évolue de')[1] ?? '');
      if (q.includes('évolue de') && liste.length >= 2) return etapes(100, liste.map(coef));
      const n = nombreFr(q.match(/en (\d+) ans/)?.[1]);
      if (evol.length !== 1 || !n) return null;
      return etapes(100, Array(n).fill(coef(evol[0]) ** (1 / n)));
    }
    case 'taux-global': {
      const n = nombreFr(q.match(/Pendant (\d+) ans/)?.[1]);
      if (evol.length !== 1 || !n) return null;
      return etapes(100, Array(n).fill(coef(evol[0])));
    }
    case 'additif-multiplicatif': {
      const fois = q.match(/multipliée par (\d+(?:,\d+)?)\./)?.[1];
      const divise = q.match(/divisée par (\d+)/)?.[1];
      if (fois) return etapes(100, [nombreFr(fois)]);
      if (divise) return etapes(100, [1 / Number(divise)]);
      if (evol.length === 1) return etapes(100, [coef(evol[0])]);
      return null;
    }
    default: return null;
  }
}

const FORMULES = {
  taux: 'Taux = (arrivée − départ) ÷ départ, écrit en pourcentage.',
  coefficient: 'Hausse de t % : × (1 + t/100). Baisse de t % : × (1 − t/100).',
  appliquer: 'Valeur finale = départ × CM. Pour revenir au départ, on DIVISE par CM.',
  successives: 'Les coefficients se multiplient : CM global = CM₁ × CM₂, puis taux = CM − 1. Les taux ne s’additionnent pas.',
  reciproque: 'L’évolution réciproque a pour coefficient 1 ÷ CM : ce n’est pas le taux opposé.',
  indice: 'Indice = valeur ÷ valeur de base × 100 ; d’un indice à l’autre, on compare par quotient.',
  'taux-moyen': 'Le taux moyen se répète n fois pour donner l’évolution globale : CM moyen = (CM global)^(1/n).',
  'taux-global': 'Un même taux répété n fois : CM global = (1 + t)ⁿ, puis taux = CM − 1.',
  'additif-multiplicatif': 'Multiplier par k, c’est une évolution de (k − 1) × 100 %.',
};

/* --------------------------------------------------------- l'explication */

function Ecluses({ ecluses }) {
  const { niveaux, operations, unite: u = '', retour } = ecluses;
  const n = niveaux.length;
  const max = Math.max(...niveaux.map((x) => x.v));
  const larg = Math.min(46, 270 / n - 8);
  const pas = (300 - 20) / n;
  const X = (i) => 10 + i * pas + (pas - larg) / 2;
  const etiquette = (i) => n <= 5 || i === 0 || i === n - 1;
  return (
    <svg className={`${P}__ecluses`} viewBox="0 0 300 136" aria-hidden="true" focusable="false">
      {niveaux.map(({ v }, i) => {
        const h = Math.max((v / max) * 78, 3);
        return (
          // eslint-disable-next-line react/no-array-index-key
          <g key={i} style={{ '--n': i }} className={`${P}__bassin`}>
            <rect x={X(i)} y="26" width={larg} height="84" rx="4" className={`${P}__cuve`} />
            <rect x={X(i) + 2} y={108 - h} width={larg - 4} height={h} rx="3" className={`${P}__niveau`} />
            {etiquette(i) && (
              <text x={X(i) + larg / 2} y="126" textAnchor="middle" className={`${P}__valeur`}>{`${ecrireFr(v, 2)}${u ? ` ${u}` : ''}`}</text>
            )}
          </g>
        );
      })}
      {operations.map((op, i) => (n <= 6 || i === 0) && (
        // eslint-disable-next-line react/no-array-index-key
        <g key={i} style={{ '--n': i + 1 }} className={`${P}__operation`}>
          <path d={`M${X(i) + larg / 2} 20 Q${(X(i) + X(i + 1)) / 2 + larg / 2} 2 ${X(i + 1) + larg / 2} 20`} />
          <text x={(X(i) + X(i + 1)) / 2 + larg / 2} y="14" textAnchor="middle">{op}</text>
        </g>
      ))}
      {retour && (
        <text x="150" y="134" textAnchor="middle" className={`${P}__retour`}>{`retour : ${retour}`}</text>
      )}
    </svg>
  );
}

function Explication({ m }) {
  const ecluses = eclusesDe(m);
  return (
    <div className={`${P}__explication`}>
      {ecluses && <Ecluses ecluses={ecluses} />}
      <p className={`${P}__regle`}>{FORMULES[m.consigne] ?? `La réponse : ${m.bonne}.`}</p>
    </div>
  );
}

export function QuestionEvolutions({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Centrale />}
      <div className={`${P}__ecran`}>
        <div className={`${P}__barre`} aria-hidden="true">
          <span />
          <span />
          <span />
          <em>Centrale · contrôle</em>
        </div>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

/** Les réponses : des manettes sur le pupitre de la centrale ; on abaisse la bonne. */
export function ManettesEvolutions({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__pupitre`} role="group" aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <button
            key={cle}
            type="button"
            className={`${P}__manette${fausse ? ' est-fausse' : ''}`}
            style={{ '--i': i }}
            onClick={() => choisir(cle)}
            disabled={fausse}
          >
            <span className={`${P}__levier`} aria-hidden="true">
              <span className={`${P}__pommeau`} />
            </span>
            <span className={`${P}__plaque`}>{libelle}</span>
          </button>
        );
      })}
    </div>
  );
}
