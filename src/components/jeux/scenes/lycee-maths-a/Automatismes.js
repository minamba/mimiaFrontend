import {
  Reponses, Texte, ecrire, nombre, pointsNommes, sur, useDeroule,
} from './commun';

/**
 * LA GRANDE HORLOGE DES AUTOMATISMES (09/10/2026). La couverture : un hall
 * d'horlogerie rouge et or, des engrenages partout, des cadrans géants.
 *   - LA QUESTION est gravée sur une plaque de laiton, sous une horloge dont
 *     les engrenages tournent et le balancier oscille ;
 *   - LES RÉPONSES sont des leviers de laiton sur un pupitre : on en abaisse un ;
 *   - APRÈS LA RÉPONSE, la machine REJOUE le calcul : chaque engrenage porte
 *     une opération (« × 0,8 », « ÷ 3,6 »…) et la valeur passe d'une plaque à
 *     l'autre jusqu'au résultat. Un automatisme, c'est une chaîne de rouages.
 * Rien du calcul n'est montré avant la réponse.
 */

const P = 'sc-automatismes';

/** Une évolution en pourcentage → son coefficient multiplicateur. */
const coef = (sens, taux) => 1 + (/baiss/i.test(sens) ? -1 : 1) * (nombre(taux) / 100);
const enCoef = (c) => `× ${ecrire(c, 4)}`;
const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
const lireExposant = (s) => Number(s.split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''));

/**
 * LA CHAÎNE DE ROUAGES d'une manche : [{ plaque } | { rouage }], ou null si la
 * question ne se laisse pas lire. Le dernier maillon est vérifié contre la
 * bonne réponse du module : jamais un calcul faux à l'écran.
 */
export function chaineDe(m) {
  // Le module sépare « 20 % » et « 800 € » par une espace fine insécable : on la lit comme une espace.
  const q = String(m.question).replace(/[\u00a0\u202f]/g, ' ');
  const b = nombre(String(m.bonne).replace(/\s/g, ''));
  const proche = (x) => Number.isFinite(x) && Number.isFinite(b) && Math.abs(x - b) < 0.011 * Math.max(1, Math.abs(b));
  let r;
  switch (m.consigne) {
    case 'successives':
      r = q.match(/(baisse|hausse) de ([\d,]+) %, puis une (baisse|hausse) de ([\d,]+) %/i);
      if (r) {
        const c1 = coef(r[1], r[2]);
        const c2 = coef(r[3], r[4]);
        if (proche((c1 * c2 - 1) * 100)) {
          return [{ plaque: '100 %' }, { rouage: enCoef(c1) }, { plaque: `${ecrire(c1 * 100, 2)} %` }, { rouage: enCoef(c2) }, { plaque: `${ecrire(c1 * c2 * 100, 2)} %` }, { fin: m.bonne }];
        }
      }
      return null;
    case 'valeur-finale':
      r = q.match(/de ([\d\s]+) € (baisse|augmente) de ([\d,]+) %/i);
      if (r) {
        const v = nombre(r[1]);
        const c = coef(r[2], r[3]);
        if (proche(v * c)) return [{ plaque: `${ecrire(v)} €` }, { rouage: enCoef(c) }, { fin: m.bonne }];
      }
      return null;
    case 'valeur-initiale':
      r = q.match(/(baisse|hausse) de ([\d,]+) %, un prix vaut ([\d\s,]+) €/i);
      if (r) {
        const c = coef(r[1], r[2]);
        const v = nombre(r[3]);
        if (proche(v / c)) return [{ plaque: `${ecrire(v)} €` }, { rouage: `÷ ${ecrire(c)}` }, { fin: m.bonne }];
      }
      return null;
    case 'coefficient':
      r = q.match(/(Baisser|Augmenter) de ([\d,]+) %/i);
      if (r) {
        const c = coef(r[1], r[2]);
        if (proche(c)) return [{ plaque: '100 %' }, { rouage: `${/baiss/i.test(r[1]) ? '−' : '+'} ${r[2]} %` }, { plaque: `${ecrire(c * 100, 2)} %` }, { fin: m.bonne }];
      }
      return null;
    case 'reciproque':
      r = q.match(/(baisse|augmente) de ([\d,]+) %/i);
      if (r) {
        const c = coef(r[1], r[2]);
        if (proche((1 / c - 1) * 100)) return [{ plaque: '100 %' }, { rouage: enCoef(c) }, { plaque: `${ecrire(c * 100, 2)} %` }, { rouage: enCoef(1 / c) }, { plaque: '100 %' }, { fin: m.bonne }];
      }
      return null;
    case 'taux':
      r = q.match(/passe de (\d+) à (\d+)/);
      if (r) {
        const c = Number(r[2]) / Number(r[1]);
        if (proche((c - 1) * 100)) return [{ plaque: r[1] }, { rouage: enCoef(c) }, { plaque: r[2] }, { fin: m.bonne }];
      }
      return null;
    case 'pourcentage-de':
      r = q.match(/([\d,]+) % de (\d+)/);
      if (r) {
        const c = nombre(r[1]) / 100;
        if (proche(c * Number(r[2]))) return [{ plaque: r[2] }, { rouage: enCoef(c) }, { fin: m.bonne }];
      }
      return null;
    case 'vitesse':
      r = q.match(/(\d+) km\/h/);
      if (r && proche(Number(r[1]) / 3.6)) return [{ plaque: `${r[1]} km/h` }, { rouage: '÷ 3,6' }, { fin: `${m.bonne} m/s` }];
      return null;
    case 'proportion-de-proportion':
      r = q.match(/(\d+) % des élèves sont internes, et (\d+) % des internes/);
      if (r) {
        const c1 = Number(r[1]) / 100;
        const c2 = Number(r[2]) / 100;
        if (proche(c1 * c2 * 100)) return [{ plaque: '100 %' }, { rouage: enCoef(c1) }, { plaque: `${r[1]} %` }, { rouage: enCoef(c2) }, { fin: m.bonne }];
      }
      return null;
    case 'heures':
      r = q.match(/^(\d+),(\d+) h/);
      if (r) {
        const minutes = Math.round(nombre(`0,${r[2]}`) * 60);
        if (m.bonne === `${r[1]} h ${minutes} min`) return [{ plaque: `0,${r[2]} h` }, { rouage: '× 60' }, { plaque: `${minutes} min` }, { fin: m.bonne }];
      }
      return null;
    case 'puissances': {
      const E = '([⁰¹²³⁴⁵⁶⁷⁸⁹]+)';
      r = q.match(new RegExp(`^(\\d+)${E} ([×÷]) \\1${E} = \\?$`));
      if (r) {
        const [e1, e2] = [lireExposant(r[2]), lireExposant(r[4])];
        return [{ plaque: q.replace(' = ?', '') }, { rouage: `exposants : ${e1} ${r[3] === '×' ? '+' : '−'} ${e2}` }, { fin: m.bonne }];
      }
      r = q.match(new RegExp(`^\\((\\d+)${E}\\)${E} = \\?$`));
      if (r) return [{ plaque: q.replace(' = ?', '') }, { rouage: `exposants : ${lireExposant(r[2])} × ${lireExposant(r[3])}` }, { fin: m.bonne }];
      return null;
    }
    case 'fractions': {
      r = q.match(/^(\d+)\/(\d+) \+ (\d+)\/(\d+) = \?$/);
      if (!r) return null;
      const [a, bb, c, d] = r.slice(1).map(Number);
      const den = (bb * d) / pgcd(bb, d);
      const num = (a * den) / bb + (c * den) / d;
      const g = pgcd(num, den);
      if (`${num / g}/${den / g}` !== m.bonne && `${num / g}` !== m.bonne) return null;
      return [{ plaque: `${a}/${bb} + ${c}/${d}` }, { rouage: `même dénominateur : ${den}` }, { plaque: `${(a * den) / bb}/${den} + ${(c * den) / d}/${den}` }, { rouage: g > 1 ? `simplifier par ${g}` : 'additionner' }, { fin: m.bonne }];
    }
    case 'aire-volume': {
      r = q.match(/^([\d,]+) (m²|m³) = \? (dm²|cm²|L|dm³|cm³)$/);
      const facteurs = {
        'm²dm²': 100, 'm²cm²': 10000, 'm³L': 1000, 'm³dm³': 1000, 'm³cm³': 1000000,
      };
      const k = r ? facteurs[r[2] + r[3]] : null;
      if (!k || !proche(nombre(r[1]) * k)) return null;
      return [{ plaque: `${r[1]} ${r[2]}` }, { rouage: `× ${ecrire(k).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}` }, { fin: `${m.bonne} ${r[3]}` }];
    }
    case 'conditionnelle':
      r = q.match(/P\(A\) = ([\d,]+) et P\(A ∩ B\) = ([\d,]+)/);
      if (!r || !proche(nombre(r[2]) / nombre(r[1]))) return null;
      return [{ plaque: `P(A ∩ B) = ${r[2]}` }, { rouage: `÷ P(A) = ${r[1]}` }, { fin: m.bonne }];
    case 'tableau-croise':
      r = q.match(/(\d+) font du théâtre, dont (\d+) en terminale/);
      if (!r || !proche(Number(r[2]) / Number(r[1]))) return null;
      return [{ plaque: `${r[2]} en terminale` }, { rouage: `÷ ${r[1]} au théâtre` }, { fin: m.bonne }];
    case 'coefficient-directeur': {
      const { A, B } = pointsNommes(q);
      if (!A || !B) return null;
      return [{ plaque: `Δy = ${ecrire(B[1] - A[1])}` }, { rouage: `÷ Δx = ${ecrire(B[0] - A[0])}` }, { fin: m.bonne }];
    }
    case 'equation-droite': {
      r = q.match(/\(0 ; ([−-]?\d+)\) et passe par le point \(([−-]?\d+) ; ([−-]?\d+)\)/);
      if (!r) return null;
      const [p, x, y] = [nombre(r[1]), nombre(r[2]), nombre(r[3])];
      return [{ plaque: `b = ${ecrire(p)}` }, { rouage: `a = (${ecrire(y)} − ${p < 0 ? `(${ecrire(p)})` : ecrire(p)}) ÷ ${ecrire(x)}` }, { fin: m.bonne }];
    }
    case 'developper':
    case 'factoriser':
    case 'produit-nul':
    case 'equation':
    case 'inequation':
    case 'signe-lu':
    case 'equation-lue':
    case 'image-antecedent':
      return [{ plaque: regleDe(m, q) }, { fin: m.bonne }];
    default:
      return null;
  }
}

/** La règle à rappeler, pour les automatismes qui ne se font pas en rouages. */
function regleDe(m, q) {
  switch (m.consigne) {
    case 'developper':
      if (/\((\d*x) − (\d+)\)\(\1 \+ \2\)|\((\d*x) \+ (\d+)\)\(\3 − \4\)/.test(q)) return '(a − b)(a + b) = a² − b²';
      if (/\)²$/.test(q)) return /−/.test(q) ? '(a − b)² = a² − 2ab + b²' : '(a + b)² = a² + 2ab + b²';
      return 'chaque terme multiplie chaque terme';
    case 'factoriser':
      if (/^Factorise : (\([^)]+\))\(.+\) − \1/.test(q)) return `facteur commun : ${q.match(/^Factorise : (\([^)]+\))/)[1]}`;
      if (/x² − \d+$/.test(q)) return 'a² − b² = (a − b)(a + b)';
      return 'a² ± 2ab + b² = (a ± b)²';
    case 'produit-nul':
      return 'un produit est nul si l’un de ses facteurs est nul';
    case 'equation':
      return 'on isole x : on retire, puis on divise';
    case 'inequation':
      return /Résous : −/.test(q) ? 'on divise par un négatif : le sens s’inverse' : 'on divise par un positif : le sens reste';
    case 'signe-lu':
      return 'au-dessus de l’axe : f(x) > 0 ; au-dessous : f(x) < 0';
    case 'equation-lue':
      return 'les solutions sont les abscisses des points communs';
    default:
      return 'un point (x ; y) de la courbe : f(x) = y';
  }
}

/** Un engrenage dessiné : `dents` dents, qui tourne dans un sens ou dans l'autre. */
function Engrenage({
  x, y, r, dents = 10, sens = 1, vitesse = 8, classe = '',
}) {
  const d = [];
  for (let i = 0; i < dents; i += 1) {
    const a = (i / dents) * Math.PI * 2;
    d.push(`M${(x + Math.cos(a) * r * 0.82).toFixed(1)} ${(y + Math.sin(a) * r * 0.82).toFixed(1)} L${(x + Math.cos(a) * r * 1.12).toFixed(1)} ${(y + Math.sin(a) * r * 1.12).toFixed(1)}`);
  }
  return (
    <g className={`${P}__roue${sens < 0 ? ' est-inverse' : ''} ${classe}`} style={{ '--vitesse': `${vitesse}s`, transformOrigin: `${x}px ${y}px` }}>
      <path d={d.join(' ')} className={`${P}__dents`} strokeWidth={r * 0.32} />
      <circle cx={x} cy={y} r={r * 0.86} className={`${P}__jante`} />
      <circle cx={x} cy={y} r={r * 0.36} className={`${P}__moyeu`} />
      <circle cx={x} cy={y} r={r * 0.12} className={`${P}__axe`} />
    </g>
  );
}

/** La grande horloge : cadran, aiguilles qui tournent, balancier, rouages autour. */
function Horloge({ chante }) {
  return (
    <svg className={`${P}__horloge${chante ? ' est-en-fete' : ''}`} viewBox="0 0 200 170" aria-hidden="true" focusable="false">
      <Engrenage x={36} y={46} r={26} dents={12} sens={1} vitesse={9} />
      <Engrenage x={166} y={40} r={22} dents={10} sens={-1} vitesse={7} />
      <Engrenage x={170} y={100} r={14} dents={8} sens={1} vitesse={4} />
      <Engrenage x={28} y={108} r={16} dents={8} sens={-1} vitesse={5} />
      <g className={`${P}__balancier`}>
        <line x1="100" y1="96" x2="100" y2="150" />
        <circle cx="100" cy="154" r="11" />
      </g>
      <circle cx="100" cy="64" r="48" className={`${P}__cadran-bord`} />
      <circle cx="100" cy="64" r="41" className={`${P}__cadran`} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={100 + Math.sin(a) * 34} y1={64 - Math.cos(a) * 34} x2={100 + Math.sin(a) * 39} y2={64 - Math.cos(a) * 39} className={`${P}__repere`} />;
      })}
      <line x1="100" y1="64" x2="100" y2="40" className={`${P}__aiguille ${P}__aiguille--heure`} />
      <line x1="100" y1="64" x2="100" y2="30" className={`${P}__aiguille ${P}__aiguille--minute`} />
      <circle cx="100" cy="64" r="4" className={`${P}__axe`} />
    </svg>
  );
}

/** Après la réponse : la chaîne de rouages qui refait le calcul, maillon après maillon. */
function ChaineEnMarche({ chaine }) {
  const n = useDeroule(chaine.length, 700);
  return (
    <ol className={`${P}__chaine`} aria-label="Le calcul, rouage par rouage">
      {chaine.map((maillon, i) => {
        const etat = i <= n ? ' est-allume' : '';
        if (maillon.rouage) {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <li key={i} className={`${P}__maillon ${P}__maillon--rouage${etat}`}>
              <svg viewBox="0 0 60 60" aria-hidden="true" focusable="false"><Engrenage x={30} y={30} r={22} dents={10} sens={i % 4 === 1 ? 1 : -1} vitesse={2.5} /></svg>
              <span>{maillon.rouage}</span>
            </li>
          );
        }
        return (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={`${P}__maillon ${maillon.fin !== undefined ? `${P}__maillon--fin` : ''}${etat}`}>
            <span>{maillon.fin ?? maillon.plaque}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function QuestionAutomatismes({ m, termine }) {
  const chaine = termine ? sur(() => chaineDe(m)) : null;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__hall`}>
        <Horloge chante={termine} />
        <div className={`${P}__plaque`}>
          <span className={`${P}__rivet`} aria-hidden="true" />
          <span className={`${P}__rivet`} aria-hidden="true" />
          <Texte m={m} classe={`${P}__texte`} />
        </div>
      </div>
      {chaine && <ChaineEnMarche chaine={chaine} />}
    </div>
  );
}

/** Le pupitre aux leviers : chaque réponse est un levier de laiton, qu'on abaisse d'un clic. */
export function LeviersAutomatismes({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__pupitre`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Abaisse le bon levier"
        decor={() => (
          <span className={`${P}__levier`} aria-hidden="true">
            <span className={`${P}__manche`} />
            <span className={`${P}__boule`} />
            <span className={`${P}__socle`} />
          </span>
        )}
      />
    </div>
  );
}
