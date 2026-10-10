import {
  Enonce, ecrire, nombre, proprietesChoix, useEtapes,
} from './commun';

/**
 * LA TOUR DES PUISSANCES — « La tour des puissances » (5e → 3e), le 09/10/2026.
 * La couverture : une tour de pierre blanche qui flotte dans des nuages
 * mauves au couchant, des escaliers bordés de glycine et de lanternes. Ici,
 * UNE PUISSANCE EST UNE TOUR : chaque étage multiplie par la base.
 *   - AVANT : l'énoncé gravé sur une stèle fleurie de glycine, et la tour
 *     qui attend ses étages dans les nuages ;
 *   - APRÈS : la tour se bâtit étage par étage, chaque lanterne affichant le
 *     produit qui grandit (2, 4, 8, 16…) ; les exposants négatifs sont des
 *     étages SOUS les nuages ; multiplier deux puissances, c'est empiler leurs
 *     étages ; l'écriture scientifique fait sauter la virgule, rang par rang ;
 *     pour comparer, trois tours se dressent et la plus haute s'illumine ;
 *   - LES RÉPONSES : des lanternes de papier qui flottent.
 */

const P = 'sc-tour-des-puissances';
const SUP = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};
const exposant = (n) => String(n).split('').map((c) => Object.keys(SUP).find((k) => SUP[k] === c) ?? c).join('');

/** « 10⁻³ » → [10, −3] ; « 2,5 × 10⁴ » → [2.5, 4] (pour l'écriture scientifique). */
function puissance(texte) {
  const r = String(texte).trim().match(/^(−?[\d,]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/);
  if (!r) return null;
  return [nombre(r[1]), Number(r[2].split('').map((c) => SUP[c]).join(''))];
}
function scientifique(texte) {
  const r = String(texte).trim().match(/^\(?([\d,]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)\)?$/);
  if (!r) return null;
  return [nombre(r[1]), Number(r[2].split('').map((c) => SUP[c]).join(''))];
}

/* --------------------------------------------------- LA TOUR */

/**
 * LA TOUR : `etages` (de bas en haut) au-dessus des nuages, `caves` en
 * dessous ; chaque étage porte une étiquette et sa lanterne une valeur.
 * `n` : combien sont déjà bâtis.
 */
function Tour({
  etages = [], caves = [], n = 99, sommet = null, petite = false, allumee = false,
}) {
  const total = Math.max(etages.length + caves.length, 6);
  const h = Math.min(24, 210 / total);
  const sol = 20 + Math.max(etages.length, 4) * h;
  return (
    <svg viewBox={`0 0 ${petite ? 110 : 220} ${sol + caves.length * h + 30}`} className={`${P}__tour${petite ? ` ${P}__tour--petite` : ''}${allumee ? ' est-allumee' : ''}`} aria-hidden="true" focusable="false">
      <ellipse cx={petite ? 55 : 110} cy={sol + 4} rx={petite ? 52 : 100} ry="12" className={`${P}__nuage`} />
      {etages.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`e${i}`} className={`${P}__etage${i < n ? ' est-bati' : ''}`} style={{ '--k': i }}>
          <rect x={petite ? 25 : 70} y={sol - (i + 1) * h} width="60" height={h - 2} rx="3" />
          {!petite && <text x="100" y={sol - i * h - h / 2 + 4} textAnchor="middle">{e.texte}</text>}
          {!petite && e.valeur !== undefined && (
            <g className={`${P}__lanterne`}>
              <rect x="140" y={sol - (i + 1) * h + 1} width={Math.max(30, 9 * String(e.valeur).length + 12)} height={h - 4} rx="6" />
              <text x={140 + Math.max(30, 9 * String(e.valeur).length + 12) / 2} y={sol - i * h - h / 2 + 4} textAnchor="middle">{e.valeur}</text>
            </g>
          )}
        </g>
      ))}
      {caves.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`c${i}`} className={`${P}__etage ${P}__etage--cave${i + etages.length < n ? ' est-bati' : ''}`} style={{ '--k': i + etages.length }}>
          <rect x={petite ? 25 : 70} y={sol + 8 + i * h} width="60" height={h - 2} rx="3" />
          {!petite && <text x="100" y={sol + 8 + i * h + h / 2 + 3} textAnchor="middle">{e.texte}</text>}
          {!petite && e.valeur !== undefined && (
            <g className={`${P}__lanterne ${P}__lanterne--cave`}>
              <rect x="140" y={sol + 9 + i * h} width={Math.max(30, 9 * String(e.valeur).length + 12)} height={h - 4} rx="6" />
              <text x={140 + Math.max(30, 9 * String(e.valeur).length + 12) / 2} y={sol + 8 + i * h + h / 2 + 3} textAnchor="middle">{e.valeur}</text>
            </g>
          )}
        </g>
      ))}
      {sommet && <text x={petite ? 55 : 100} y={sol - etages.length * h - 8} textAnchor="middle" className={`${P}__sommet`}>{sommet}</text>}
    </svg>
  );
}

/** La valeur qui grandit : a, a², a³… écrite à la française. */
const grouper = (x) => {
  if (!Number.isFinite(x)) return '';
  if (Math.abs(x) < 1 && x !== 0) return ecrire(x);
  return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('-', '−');
};

/* --------------------------------------------------- LES SORTES */

function Batisse({ lignes, etages, caves = [], sommet }) {
  const total = etages.length + caves.length;
  const k = useEtapes(total + lignes.length, Math.min(700, 5000 / Math.max(total, 1)), 400);
  return (
    <div className={`${P}__atelier`}>
      <Tour etages={etages} caves={caves} n={k} sommet={k >= total ? sommet : null} />
      <ol className={`${P}__parchemin`} aria-label="Le calcul">
        {lignes.map((l, i) => <li key={l} className={i < k - total ? 'est-pose' : ''}>{l}</li>)}
      </ol>
    </div>
  );
}

function explication(m) {
  const q = String(m.question).replace(/ = \?$/, '');
  const bonne = String(m.bonne);
  const p = puissance(q);
  if (m.consigne === 'valeur-puissance' && p) {
    const [a, n] = p;
    const etages = Array.from({ length: n }, (_, i) => ({ texte: `× ${a}`, valeur: grouper(a ** (i + 1)) }));
    return { etages, sommet: `${a}${exposant(n)}`, lignes: [`${n} étages, chacun × ${a}`, `${a}${exposant(n)} = ${Array(n).fill(a).join(' × ')} = ${bonne}`] };
  }
  if (m.consigne === 'ecrire-puissance') {
    const facteurs = q.split(' × ');
    const a = Number(facteurs[0]);
    if (!facteurs.every((f) => Number(f) === a)) return null;
    const n = facteurs.length;
    return { etages: facteurs.map(() => ({ texte: `× ${a}` })), sommet: bonne, lignes: [`${n} facteurs égaux à ${a} : ${n} étages`, `L’exposant compte les étages : ${bonne}`] };
  }
  if (m.consigne === 'calcul-puissance') {
    const r = q.match(/^(\d+) ([+×]) (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    if (!r) return null;
    const [b, op, a] = [Number(r[1]), r[2], Number(r[3])];
    const n = Number(r[4].split('').map((c) => SUP[c]).join(''));
    const v = a ** n;
    return {
      etages: Array.from({ length: n }, (_, i) => ({ texte: `× ${a}`, valeur: grouper(a ** (i + 1)) })),
      sommet: `${a}${exposant(n)}`,
      lignes: [`D’abord la puissance : ${a}${exposant(n)} = ${v}`, `Puis ${b} ${op} ${v} = ${bonne}`],
    };
  }
  if (m.consigne === 'puissance-dix') {
    const seule = q.match(/^10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/);
    if (seule) {
      const e = Number(seule[1].split('').map((c) => SUP[c]).join(''));
      if (e >= 0) return null;
      return {
        etages: [],
        caves: Array.from({ length: -e }, (_, i) => ({ texte: '÷ 10', valeur: ecrire(10 ** -(i + 1)) })),
        sommet: `10${exposant(e)}`,
        lignes: [`Exposant négatif : ${-e} étage${-e > 1 ? 's' : ''} sous les nuages, chacun ÷ 10`, `10${exposant(e)} = 1 ÷ 10${exposant(-e)} = ${bonne}`],
      };
    }
    const r = q.match(/^10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+) ([×÷]) 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/);
    if (!r) return null;
    const a = Number(r[1].split('').map((c) => SUP[c]).join(''));
    const b = Number(r[3].split('').map((c) => SUP[c]).join(''));
    const res = r[2] === '×' ? a + b : a - b;
    const etages = res > 0 ? Array.from({ length: res }, () => ({ texte: '× 10' })) : [];
    const caves = res < 0 ? Array.from({ length: -res }, () => ({ texte: '÷ 10' })) : [];
    return {
      etages,
      caves,
      sommet: bonne,
      lignes: [
        r[2] === '×' ? `On empile les étages : ${ecrire(a)} + (${ecrire(b)}) = ${ecrire(res)}` : `On retire les étages : ${ecrire(a)} − (${ecrire(b)}) = ${ecrire(res)}`,
        `= ${bonne}`,
      ],
    };
  }
  if (m.consigne === 'signes-puissance') {
    const par = q.match(/^\(−(\d+)\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    const sans = q.match(/^−(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    const produit = q.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) × (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    const ex = (s) => Number(s.split('').map((c) => SUP[c]).join(''));
    if (par) {
      const [a, n] = [Number(par[1]), ex(par[2])];
      return { etages: Array.from({ length: n }, () => ({ texte: `× (−${a})` })), sommet: bonne, lignes: [`(−${a})${exposant(n)} = ${Array(n).fill(`(−${a})`).join(' × ')}`, `${n} signes moins : ${n % 2 ? 'impair, négatif' : 'pair, positif'} → ${bonne}`] };
    }
    if (sans) {
      const [a, n] = [Number(sans[1]), ex(sans[2])];
      return { etages: Array.from({ length: n }, () => ({ texte: `× ${a}` })), sommet: bonne, lignes: [`La puissance ne porte que sur ${a} : −(${Array(n).fill(a).join(' × ')})`, `= −${a ** n} = ${bonne}`] };
    }
    if (produit) {
      const [b, m1, n1] = [Number(produit[1]), ex(produit[2]), ex(produit[4])];
      return {
        etages: [...Array.from({ length: m1 }, () => ({ texte: `× ${b}` })), ...Array.from({ length: n1 }, () => ({ texte: `× ${b}` }))],
        sommet: bonne,
        lignes: [`On empile ${m1} étages puis ${n1} : ${m1} + ${n1} = ${m1 + n1}`, `= ${bonne}`],
      };
    }
    return null;
  }
  if (m.consigne === 'produit-scientifique' || m.consigne === 'quotient-scientifique') {
    const r = q.match(/^\(([\d,]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)\) ([×÷]) \(([\d,]+) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)\)$/);
    if (!r) return null;
    const ex = (s) => Number(s.split('').map((c) => SUP[c]).join(''));
    const [m1, e1, op, m2, e2] = [nombre(r[1]), ex(r[2]), r[3], nombre(r[4]), ex(r[5])];
    const mm = op === '×' ? m1 * m2 : m1 / m2;
    const ee = op === '×' ? e1 + e2 : e1 - e2;
    return {
      lignes: [
        `Les nombres : ${ecrire(m1)} ${op} ${ecrire(m2)} = ${ecrire(mm)}`,
        `Les puissances : 10${exposant(e1)} ${op} 10${exposant(e2)} = 10${exposant(ee)}`,
        `${ecrire(mm)} × 10${exposant(ee)} = ${bonne}`,
      ],
    };
  }
  return null;
}

/** L'écriture scientifique : la virgule saute, un rang à la fois. */
function Virgule({ m }) {
  const nb = (String(m.question).match(/de ([\d ,]+) \?$/) ?? [])[1];
  const sci = scientifique(m.bonne);
  const chiffres = nb ? nb.replace(/[ ,]/g, '') : '';
  const depart = nb ? nb.replace(/ /g, '').indexOf(',') : -1;
  const debut = depart < 0 ? chiffres.length : depart;
  const premier = chiffres.search(/[1-9]/);
  const sauts = sci ? -sci[1] : 0;
  const k = useEtapes(Math.abs(sauts) + 1, 600, 500);
  if (!nb || !sci || premier < 0) return null;
  const position = debut + Math.sign(sauts) * Math.min(k, Math.abs(sauts));
  return (
    <div className={`${P}__atelier`}>
      <div className={`${P}__chiffres`} aria-hidden="true">
        {chiffres.split('').map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__chiffre${i === premier ? ' est-premier' : ''}`}>{c}</span>
        ))}
        <span className={`${P}__virgule`} style={{ '--p': position }}>,</span>
      </div>
      <ol className={`${P}__parchemin`} aria-label="Le calcul">
        <li className="est-pose">La virgule va juste après le premier chiffre non nul.</li>
        <li className={k >= 1 ? 'est-pose' : ''}>{`Elle saute de ${Math.min(k, Math.abs(sauts))} rang${Math.abs(sauts) > 1 ? 's' : ''} vers la ${sauts > 0 ? 'droite' : 'gauche'}`}</li>
        <li className={k > Math.abs(sauts) ? 'est-pose' : ''}>{`${sauts > 0 ? 'Vers la droite : exposant négatif' : 'Vers la gauche : exposant positif'} → ${m.bonne}`}</li>
      </ol>
    </div>
  );
}

/** Comparer : trois tours se dressent ; la plus haute est le plus grand nombre. */
function Comparer({ m, termine }) {
  const valeurs = m.choix.map((c) => scientifique(c.libelle));
  if (valeurs.some((v) => !v)) return null;
  const hauteur = (v) => v[1] + Math.log10(v[0]);
  const min = Math.min(...valeurs.map(hauteur)) - 1.5;
  const max = Math.max(...valeurs.map(hauteur));
  return (
    <div className={`${P}__trio`}>
      {m.choix.map((c, i) => {
        const etages = termine ? Math.max(1, Math.round(((hauteur(valeurs[i]) - min) / (max - min)) * 8)) : 1;
        const gagnante = termine && hauteur(valeurs[i]) === max;
        return (
          <figure key={c.cle} className={`${P}__colonne${gagnante ? ' est-gagnante' : ''}`}>
            <Tour etages={Array.from({ length: etages }, () => ({ texte: '' }))} petite allumee={gagnante} />
            <figcaption>{termine ? `10${exposant(valeurs[i][1])}` : '?'}</figcaption>
          </figure>
        );
      })}
      {termine && <p className={`${P}__parchemin ${P}__parchemin--une`}>D’abord l’exposant de 10 : le plus grand gagne, quel que soit le nombre devant.</p>}
    </div>
  );
}

function Explication({ m }) {
  if (m.consigne === 'scientifique') return <Virgule m={m} />;
  const e = explication(m);
  if (!e) return null;
  if (!e.etages && !e.caves) {
    return (
      <ol className={`${P}__parchemin`} aria-label="Le calcul">
        {e.lignes.map((l) => <li key={l} className="est-pose">{l}</li>)}
      </ol>
    );
  }
  return <Batisse lignes={e.lignes} etages={e.etages ?? []} caves={e.caves ?? []} sommet={e.sommet} />;
}

/** La glycine qui pend de la stèle. */
function Glycine() {
  return (
    <span className={`${P}__glycine`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => <span key={i} className={`${P}__grappe`} style={{ '--k': i }} />)}
    </span>
  );
}

export function QuestionTour({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__stele`}>
        <Glycine />
        <Enonce m={m} classe={`${P}__gravure`} />
      </div>
      {m.consigne === 'comparer-scientifique'
        ? <Comparer m={m} termine={termine} />
        : termine && <Explication m={m} />}
      {!termine && m.consigne !== 'comparer-scientifique' && <Tour etages={[{ texte: '?' }]} n={1} />}
    </div>
  );
}

/** Les réponses : des lanternes de papier qui flottent dans le soir mauve. */
export function Lanternes({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__lanternes`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__papier${fautes.includes(cle) ? ' est-faux' : ''}`}>
            {libelle}
          </button>
        </li>
      ))}
    </ul>
  );
}

export const sceneTour = {
  question: (m, termine) => <QuestionTour m={m} termine={termine} />,
  choix: (props) => <Lanternes {...props} />,
};
