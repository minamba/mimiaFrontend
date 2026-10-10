import {
  ecrireFr, nombreFr, nombresDans, TexteQuestion,
} from './outils';

/**
 * L'ATELIER DE CHARPENTE — « La géométrie de l'atelier » (voie pro). La
 * couverture : une charpentière aux boucles brunes assemble des fermes
 * triangulaires en bois clair ; des cylindres de bois, des planches, des
 * équerres, une grande halle de poutres ouverte sur la montagne. La scène la
 * reprend :
 *   - LA QUESTION : sur une planche clouée, avec le dessin coté de la manche ;
 *     à côté, l'établi où la scie va et vient, l'équerre et le crayon ;
 *   - LES RÉPONSES : des planchettes de bois (`objets`) ;
 *   - APRÈS LA RÉPONSE : la formule gravée au fer, puis le calcul fait avec
 *     les cotes de la question (vérifié contre la réponse) ; les carrés de
 *     Pythagore qui poussent sur les côtés, la tôle qui se déroule, les trois
 *     cônes qui remplissent un cylindre, SOH CAH TOA sur le triangle.
 */

const P = 'sc-geometrie-atelier';

/* ---------------------------------------------------------------- le décor */

function Etabli() {
  return (
    <svg className={`${P}__etabli`} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-ate-bois" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d9a8" />
          <stop offset="1" stopColor="#d4a865" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="16" className={`${P}__halle`} />
      <path d="M0 40 L120 6 L240 40 M30 32 V0 M120 6 V0 M210 32 V0 M60 24 L120 40 L180 24" className={`${P}__poutres`} />
      <path d="M150 60 L176 44 L194 54 L214 40 L240 56 V96 H150 Z" fill="#7fae8a" opacity="0.7" />
      <rect x="0" y="96" width="240" height="54" fill="url(#sc-ate-bois)" />
      {[110, 124, 138].map((y) => <path key={y} d={`M0 ${y} Q60 ${y - 4} 120 ${y} T240 ${y}`} className={`${P}__veine`} />)}
      {/* La ferme triangulaire, l'équerre et le cylindre de bois. */}
      <path d="M20 96 L52 56 L84 96 Z M52 56 V96 M36 76 H68" className={`${P}__ferme`} />
      <path d="M100 96 V66 h6 v24 h24 v6 Z" className={`${P}__equerre`} />
      <ellipse cx="208" cy="92" rx="18" ry="6" className={`${P}__cylindre`} />
      <rect x="190" y="70" width="36" height="22" className={`${P}__cylindre`} />
      <ellipse cx="208" cy="70" rx="18" ry="6" className={`${P}__cylindre est-dessus`} />
      {/* La planche et la scie qui va et vient. */}
      <rect x="120" y="100" width="70" height="10" rx="2" className={`${P}__planche`} />
      <g className={`${P}__scie`}>
        <path d="M150 74 L176 100 L170 104 L144 78 Z" className={`${P}__lame`} />
        <rect x="136" y="64" width="16" height="12" rx="4" transform="rotate(45 144 70)" className={`${P}__manche`} />
      </g>
      {[0, 1, 2].map((i) => <circle key={i} cx={164 + i * 6} cy="104" r="1.6" className={`${P}__copeau`} style={{ '--n': i }} />)}
    </svg>
  );
}

/* --------------------------------------------------------- le calcul */

const RAD = Math.PI / 180;
const proche = (x, bonne, d) => Math.abs(x - bonne) <= 0.5 * 10 ** -d + 1e-9;

/**
 * La formule de la manche et, si la question se lit, le calcul avec ses
 * cotes : { formule, calcul, dessin }. Le calcul n'est rendu que s'il redonne
 * la réponse.
 */
export function formuleDe(m) {
  const q = String(m.question);
  const n = nombresDans(q);
  const b = nombreFr(m.bonne);
  const d = String(m.bonne).includes(',') ? String(m.bonne).split(',')[1].length : 0;
  const ok = (x) => b !== null && Number.isFinite(x) && proche(x, b, d);
  const f = (x) => ecrireFr(x, 4);
  switch (m.consigne) {
    case 'aire':
      if (q.includes('rectangulaire')) {
        const [L, l] = n;
        return { formule: 'Aire du rectangle = longueur × largeur', calcul: ok(L * l) ? `${f(L)} × ${f(l)} = ${m.bonne} m²` : null };
      }
      return { formule: 'Aire du disque = π × r², avec r = diamètre ÷ 2', calcul: ok(Math.PI * (n[0] / 2) ** 2) ? `π × (${f(n[0])} ÷ 2)² ≈ ${m.bonne} m²` : null };
    case 'volume':
      if (q.includes('dalle')) {
        const [L, l, e] = n;
        return { formule: 'Volume du pavé = L × l × h, tout en mètres', calcul: ok((L * l * e) / 100) ? `${f(L)} × ${f(l)} × ${f(e / 100)} = ${m.bonne} m³` : null };
      }
      return { formule: 'Volume du cylindre = π × r² × h ; 1 m³ = 1 000 L', calcul: ok(Math.PI * (n[0] / 2) ** 2 * n[1] * 1000) ? `π × (${f(n[0])} ÷ 2)² × ${f(n[1])} × 1 000 ≈ ${m.bonne} L` : null };
    case 'pythagore': {
      const [a, c] = n;
      if (q.includes('échelle')) {
        return { formule: 'Pythagore : hypoténuse² = côté² + côté²', calcul: ok(Math.sqrt(a * a - c * c)) ? `√(${f(a)}² − ${f(c)}²) ≈ ${m.bonne} m` : null, dessin: 'carres' };
      }
      return { formule: 'Pythagore : diagonale² = longueur² + largeur²', calcul: ok(Math.sqrt(a * a + c * c)) ? `√(${f(a)}² + ${f(c)}²) ≈ ${m.bonne} m` : null, dessin: 'carres' };
    }
    case 'trigo': {
      if (q.includes('Hauteur atteinte')) {
        const [L, angle] = n;
        return { formule: 'SOH : sin(angle) = opposé ÷ hypoténuse, donc opposé = hypoténuse × sin(angle)', calcul: ok(L * Math.sin(angle * RAD)) ? `${f(L)} × sin(${f(angle)}°) ≈ ${m.bonne} m` : null, dessin: 'soh' };
      }
      const [h, dd] = n;
      return { formule: 'TOA : tan(angle) = opposé ÷ adjacent', calcul: ok(Math.atan(h / dd) / RAD) ? `arctan(${f(h)} ÷ ${f(dd)}) ≈ ${m.bonne}°` : null, dessin: 'toa' };
    }
    case 'cone': {
      const [r, h] = n;
      return { formule: 'Volume du cône = π × r² × h ÷ 3 : le tiers du cylindre', calcul: ok((Math.PI * r * r * h) / 3) ? `π × ${f(r)}² × ${f(h)} ÷ 3 ≈ ${m.bonne} m³` : null, dessin: 'cones' };
    }
    case 'boule': {
      const [r] = n;
      return { formule: 'Volume de la boule = 4/3 × π × r³', calcul: ok((4 / 3) * Math.PI * r ** 3) ? `4/3 × π × ${f(r)}³ ≈ ${m.bonne} m³` : null };
    }
    case 'diagonale': {
      const [a, bb, c] = n;
      return { formule: 'Grande diagonale = √(L² + l² + h²)', calcul: ok(Math.sqrt(a * a + bb * bb + c * c)) ? `√(${f(a)}² + ${f(bb)}² + ${f(c)}²) ≈ ${m.bonne} m` : null };
    }
    case 'tole': {
      const [r, h] = n;
      return { formule: 'La tôle déroulée est un rectangle : (2 × π × r) × h', calcul: ok(2 * Math.PI * r * h) ? `2 × π × ${f(r)} × ${f(h)} ≈ ${m.bonne} m²` : null, dessin: 'deroule' };
    }
    case 'al-kashi-cote': {
      const [c, bb, a] = n;
      const x = Math.sqrt(bb * bb + c * c - 2 * bb * c * Math.cos(a * RAD));
      return { formule: 'Al-Kashi : BC² = AB² + AC² − 2 × AB × AC × cos Â', calcul: ok(x) ? `√(${f(c)}² + ${f(bb)}² − 2 × ${f(c)} × ${f(bb)} × cos ${f(a)}°) ≈ ${m.bonne} m` : null };
    }
    case 'al-kashi-angle': {
      const [a, bb, c] = n;
      const x = Math.acos((bb * bb + c * c - a * a) / (2 * bb * c)) / RAD;
      return { formule: 'Al-Kashi : cos Â = (AB² + AC² − BC²) ÷ (2 × AB × AC)', calcul: ok(x) ? `cos Â = (${f(c)}² + ${f(bb)}² − ${f(a)}²) ÷ (2 × ${f(c)} × ${f(bb)}), Â ≈ ${m.bonne}°` : null };
    }
    case 'loi-des-sinus': {
      const [a, A, B] = n;
      const C = 180 - A - B;
      if (q.includes('Longueur AC')) {
        return { formule: 'Loi des sinus : BC ÷ sin Â = AC ÷ sin B̂', calcul: ok((a * Math.sin(B * RAD)) / Math.sin(A * RAD)) ? `AC = ${f(a)} × sin ${f(B)}° ÷ sin ${f(A)}° ≈ ${m.bonne} m` : null };
      }
      return { formule: 'Loi des sinus : BC ÷ sin Â = AB ÷ sin Ĉ, avec Ĉ = 180° − Â − B̂', calcul: ok((a * Math.sin(C * RAD)) / Math.sin(A * RAD)) ? `Ĉ = ${f(C)}° ; AB = ${f(a)} × sin ${f(C)}° ÷ sin ${f(A)}° ≈ ${m.bonne} m` : null };
    }
    default:
      return null;
  }
}

/* --------------------------------------------------------- les dessins */

/** Les carrés de Pythagore : sur les deux côtés de l'angle droit, puis sur l'hypoténuse. */
function Carres() {
  return (
    <svg className={`${P}__dessin`} viewBox="40 10 140 130" aria-hidden="true" focusable="false">
      <rect x="60" y="60" width="30" height="30" className={`${P}__carre est-a`} />
      <rect x="90" y="90" width="40" height="40" className={`${P}__carre est-b`} />
      <polygon points="90,60 130,90 160,50 120,20" className={`${P}__carre est-c`} />
      <path d="M90 90 V60 L130 90 Z" className={`${P}__triangle`} />
      <path d="M90 84 H96 V90" className={`${P}__angle-droit`} />
    </svg>
  );
}

function Triangle({ ratio }) {
  const allume = (cote) => (ratio === 'soh' ? ['opp', 'hyp'] : ['opp', 'adj']).includes(cote);
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 200 110" aria-hidden="true" focusable="false">
      <path d="M20 96 H180" className={`${P}__cote${allume('adj') ? ' est-allume' : ''}`} />
      <path d="M180 96 V20" className={`${P}__cote${allume('opp') ? ' est-allume' : ''}`} />
      <path d="M20 96 L180 20" className={`${P}__cote${allume('hyp') ? ' est-allume' : ''}`} />
      <path d="M168 96 V84 H180" className={`${P}__angle-droit`} />
      <path d="M48 96 A28 28 0 0 0 45 84" className={`${P}__arc`} />
      <text x="100" y="108" textAnchor="middle" className={`${P}__nom`}>adjacent</text>
      <text x="186" y="62" className={`${P}__nom`}>opposé</text>
      <text x="80" y="50" className={`${P}__nom`}>hypoténuse</text>
    </svg>
  );
}

function Deroule() {
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 220 100" aria-hidden="true" focusable="false">
      <ellipse cx="34" cy="20" rx="20" ry="7" className={`${P}__tole`} />
      <path d="M14 20 V80 A20 7 0 0 0 54 80 V20" className={`${P}__tole`} />
      <rect x="66" y="20" width="140" height="60" className={`${P}__tole est-deroulee`} />
      <text x="136" y="94" textAnchor="middle" className={`${P}__nom`}>2 × π × r</text>
      <text x="212" y="54" className={`${P}__nom`}>h</text>
    </svg>
  );
}

function Cones() {
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 220 100" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${16 + i * 40} 80 L${32 + i * 40} 30 L${48 + i * 40} 80 Z`} className={`${P}__cone`} style={{ '--n': i }} />
      ))}
      <text x="140" y="60" className={`${P}__nom est-grand`}>=</text>
      <rect x="158" y="30" width="44" height="50" className={`${P}__remplissage`} />
      <rect x="158" y="30" width="44" height="50" className={`${P}__tole est-vide`} />
    </svg>
  );
}

function Explication({ m }) {
  const f = formuleDe(m);
  return (
    <div className={`${P}__explication`}>
      {f?.dessin === 'carres' && <Carres />}
      {(f?.dessin === 'soh' || f?.dessin === 'toa') && <Triangle ratio={f.dessin} />}
      {f?.dessin === 'deroule' && <Deroule />}
      {f?.dessin === 'cones' && <Cones />}
      {f && <p className={`${P}__gravure`}>{f.formule}</p>}
      {f?.calcul && <p className={`${P}__calcul`}>{f.calcul}</p>}
      {!f && <p className={`${P}__gravure`}>{`La réponse : ${m.bonne}.`}</p>}
    </div>
  );
}

export function QuestionAtelier({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Etabli />}
      <div className={`${P}__planche-question`}>
        <span className={`${P}__clou`} aria-hidden="true" />
        <span className={`${P}__clou`} aria-hidden="true" />
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
