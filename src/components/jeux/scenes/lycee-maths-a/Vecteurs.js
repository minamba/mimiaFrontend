import {
  Repere, Reponses, Texte, ecrire, fenetreAutour, nombre, pointsNommes, sur,
} from './commun';

/**
 * LE PORT DES VECTEURS (09/10/2026). La couverture : une marina vue d'en haut,
 * des pontons en quadrillage sur une mer turquoise, des voiles rouges.
 *   - LA QUESTION est sur la carte du capitaine, épinglée à côté d'un voilier
 *     qui tangue et d'un phare ;
 *   - LES RÉPONSES sont des voiliers qui dansent sur l'eau : on embarque sur
 *     le bon (`choix`) ;
 *   - APRÈS LA RÉPONSE, la carte devient le plan du port, quadrillé comme les
 *     pontons : les bouées A, B, C…, le trajet du bateau (le vecteur) avec ses
 *     déplacements (→ 3, ↓ 9), le milieu, le parallélogramme qui se ferme, ou
 *     les vecteurs mis bout à bout pour une combinaison.
 */

const P = 'sc-vecteurs-et-coordonnees';

const point = (s) => {
  const r = String(s).match(/\(([−-]?\d+(?:,\d+)?) ; ([−-]?\d+(?:,\d+)?)\)/);
  return r ? [nombre(r[1]), nombre(r[2])] : null;
};

/** Le plan du port : bouées, flèches (trajets), segments, polygone ; ou null. */
export function planDe(m) {
  const q = String(m.question);
  const pts = pointsNommes(q);
  const bouees = [];
  const fleches = [];
  const segments = [];
  let polygone = null;
  const { A, B, C } = pts;
  switch (m.consigne) {
    case 'coordonnees-vecteur': {
      if (!A || !B) return null;
      bouees.push(['A', A], ['B', B]);
      fleches.push({ de: A, a: B, nom: 'AB', deplacement: true });
      break;
    }
    case 'milieu': {
      const M = point(m.bonne);
      if (!A || !B || !M) return null;
      segments.push([A, B]);
      bouees.push(['A', A], ['B', B], ['M', M, true]);
      break;
    }
    case 'distance': {
      if (!A || !B) return null;
      segments.push([A, B]);
      fleches.push({ de: A, a: [B[0], A[1]], fantome: true }, { de: [B[0], A[1]], a: B, fantome: true });
      bouees.push(['A', A], ['B', B]);
      break;
    }
    case 'parallelogramme': {
      const D = point(m.bonne);
      if (!A || !B || !C || !D) return null;
      polygone = [A, B, C, D];
      fleches.push({ de: A, a: B, nom: 'AB' }, { de: D, a: C, nom: 'DC' });
      bouees.push(['A', A], ['B', B], ['C', C], ['D', D, true]);
      break;
    }
    case 'combinaison': {
      const { u, v } = pts;
      const r = q.match(/de ([−-]?\d*)u ([+−-]) (\d*)v/);
      if (!u || !v || !r) return null;
      const k = r[1] === '' ? 1 : r[1] === '−' || r[1] === '-' ? -1 : nombre(r[1]); // eslint-disable-line no-nested-ternary
      const l = (r[2] === '+' ? 1 : -1) * (r[3] === '' ? 1 : Number(r[3]));
      const ku = [k * u[0], k * u[1]];
      const fin = [ku[0] + l * v[0], ku[1] + l * v[1]];
      const bonne = point(m.bonne);
      if (!bonne || bonne[0] !== fin[0] || bonne[1] !== fin[1]) return null;
      fleches.push(
        { de: [0, 0], a: ku, nom: k === 1 ? 'u' : `${ecrire(k)}u` },
        { de: ku, a: fin, nom: l === 1 ? 'v' : `${ecrire(l)}v` },
        { de: [0, 0], a: fin, nom: m.bonne, resultat: true },
      );
      break;
    }
    case 'colineaire-test':
    case 'colineaire-valeur': {
      const u = pts.u ?? (() => {
        const r = q.match(/u\(([−-]?\d+) ; m\)/);
        return r ? [nombre(r[1]), nombre(m.bonne)] : null;
      })();
      const v = pts.v;
      if (!u || !v) return null;
      fleches.push({ de: [0, 0], a: u, nom: 'u' }, { de: [0, 0], a: v, nom: 'v', second: true });
      break;
    }
    default:
      return null;
  }
  const tous = [...bouees.map((b) => b[1]), ...fleches.flatMap((f) => [f.de, f.a]), ...(polygone ?? [])];
  return {
    fenetre: fenetreAutour(tous, 1), bouees, fleches, segments, polygone,
  };
}

function Fleche({
  X, Y, de, a, nom, classe, deplacement,
}) {
  const [x1, y1, x2, y2] = [X(de[0]), Y(de[1]), X(a[0]), Y(a[1])];
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const pointe = `M${x2} ${y2} L${x2 - 11 * Math.cos(angle - 0.4)} ${y2 - 11 * Math.sin(angle - 0.4)} L${x2 - 11 * Math.cos(angle + 0.4)} ${y2 - 11 * Math.sin(angle + 0.4)} Z`;
  return (
    <g className={`${P}__fleche ${classe}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} pathLength="1" />
      <path d={pointe} />
      {nom && <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 6}>{nom}</text>}
      {deplacement && (
        <g className={`${P}__deplacement`}>
          <path d={`M${x1} ${y1} H${x2} V${y2}`} />
          <text x={(x1 + x2) / 2} y={y1 + (y2 > y1 ? -6 : 16)} textAnchor="middle">{`${a[0] >= de[0] ? '→' : '←'} ${ecrire(Math.abs(a[0] - de[0]))}`}</text>
          <text x={x2 + 6} y={(y1 + y2) / 2}>{`${a[1] >= de[1] ? '↑' : '↓'} ${ecrire(Math.abs(a[1] - de[1]))}`}</text>
        </g>
      )}
    </g>
  );
}

function PlanDuPort({ plan }) {
  const {
    fenetre, bouees, fleches, segments, polygone,
  } = plan;
  return (
    <Repere fenetre={fenetre} prefixe={P} largeur={320} hauteur={230}>
      {(X, Y) => (
        <>
          {polygone && <path className={`${P}__bassin`} d={`M${polygone.map(([x, y]) => `${X(x)} ${Y(y)}`).join(' L')} Z`} />}
          {segments.map(([s, t], i) => (
            // eslint-disable-next-line react/no-array-index-key
            <line key={i} className={`${P}__ponton`} x1={X(s[0])} y1={Y(s[1])} x2={X(t[0])} y2={Y(t[1])} pathLength="1" />
          ))}
          {fleches.map((f, i) => (
            <Fleche
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              X={X}
              Y={Y}
              {...f}
              classe={`${f.fantome ? 'est-fantome' : ''}${f.resultat ? ' est-resultat' : ''}${f.second ? ' est-second' : ''}`}
            />
          ))}
          {bouees.map(([nom, [x, y], trouve]) => (
            <g key={nom} className={`${P}__bouee${trouve ? ' est-trouvee' : ''}`}>
              <circle cx={X(x)} cy={Y(y)} r={trouve ? 7 : 5.5} />
              <text x={X(x) + 9} y={Y(y) - 8}>{nom}</text>
            </g>
          ))}
        </>
      )}
    </Repere>
  );
}

function Voilier() {
  return (
    <svg className={`${P}__voilier`} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M8 104 q 14 -8 28 0 t 28 0 t 28 0 t 28 0 V120 H8 Z" className={`${P}__vague`} />
      <g className={`${P}__coque-scene`}>
        <path d="M24 86 H96 L84 100 H36 Z" className={`${P}__coque`} />
        <line x1="60" y1="18" x2="60" y2="86" className={`${P}__mat`} />
        <path d="M62 20 L62 80 L96 80 Z" className={`${P}__voile`} />
        <path d="M58 30 L58 80 L30 80 Z" className={`${P}__voile ${P}__voile--blanche`} />
        <path d="M60 18 l12 4 l-12 4 Z" className={`${P}__fanion`} />
      </g>
    </svg>
  );
}

export function QuestionVecteurs({ m, termine }) {
  const plan = termine ? sur(() => planDe(m)) : null;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__quai`}>
        {!plan && <Voilier />}
        <div className={`${P}__carte`}>
          <Texte m={m} classe={`${P}__texte`} />
        </div>
        {plan && <div className={`${P}__plan`}><PlanDuPort plan={plan} /></div>}
      </div>
    </div>
  );
}

/** Les voiliers qui dansent sur l'eau : on embarque sur le bon. */
export function VoiliersVecteurs({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__mer`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Embarque sur le bon voilier"
        decor={() => <span className={`${P}__voile-du-bateau`} aria-hidden="true" />}
      />
    </div>
  );
}
