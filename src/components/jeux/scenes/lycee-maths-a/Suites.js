import { avecVisuel } from '../base';
import {
  Texte, ecrire, nombre, sur, useDeroule,
} from './commun';

/**
 * LE TAPIS DES ORANGERAIES (09/10/2026). La couverture : des terrasses
 * d'orangers au-dessus d'un lac, et un long tapis roulant qui descend la
 * colline, chargé de cagettes d'oranges. Une suite, c'est ce tapis : une
 * cagette après l'autre, u₀, u₁, u₂…
 *   - LA QUESTION est sur la pancarte de bois du domaine ; dessous, le tapis
 *     roulant défile avec ses cagettes (vides de nombres : rien n'est dit) ;
 *   - LES RÉPONSES sont des cagettes d'oranges (`objets`) ;
 *   - APRÈS LA RÉPONSE, le tapis rejoue la suite : chaque cagette reçoit son
 *     terme, avec « + r » ou « × q » entre deux cagettes, jusqu'au terme
 *     demandé ; pour une somme, les cagettes s'additionnent par paires.
 */

const P = 'sc-suites';

const INDICES = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
};
const lireIndice = (s) => Number(String(s).split('').map((c) => INDICES[c] ?? '').join(''));
const indice = (n) => String(n).split('').map((c) => Object.keys(INDICES)[Number(c)]).join('');
const IND = '([₀₁₂₃₄₅₆₇₈₉]+)';
const NB = '([−-]?\\d+(?:,\\d+)?)';

/** Les cagettes : [{ nom, valeur }] et les liens entre elles, plus une ligne de calcul éventuelle. */
export function tapisDe(m) {
  const q = String(m.question);
  const b = nombre(m.bonne);
  const proche = (x) => Number.isFinite(x) && Math.abs(x - b) < 1e-6;
  let r;
  if (m.consigne === 'arithmetique' || m.consigne === 'geometrique') {
    r = q.match(new RegExp(`(arithmétique|géométrique) de raison ${NB}, et u${IND} = ${NB}\\. u${IND} = \\?`));
    if (!r) return null;
    const geo = r[1] === 'géométrique';
    const raison = nombre(r[2]);
    const k0 = lireIndice(r[3]);
    const n = lireIndice(r[5]);
    const terme = (k) => (geo ? nombre(r[4]) * raison ** (k - k0) : nombre(r[4]) + raison * (k - k0));
    if (!proche(terme(n)) || n < k0) return null;
    const rangs = n - k0 <= 6 ? Array.from({ length: n - k0 + 1 }, (_, i) => k0 + i) : [k0, k0 + 1, k0 + 2, null, n];
    return {
      cagettes: rangs.map((k) => (k === null ? null : { nom: `u${indice(k)}`, valeur: ecrire(terme(k)) })),
      lien: `${geo ? '×' : '+'} ${ecrire(raison)}`,
      calcul: n - k0 > 6 ? `u${indice(n)} = ${ecrire(nombre(r[4]))} ${geo ? '×' : '+'} ${geo ? `${ecrire(raison)}^${n - k0}` : `${n - k0} × ${ecrire(raison)}`} = ${m.bonne}` : null,
    };
  }
  if (m.consigne === 'recurrence') {
    r = q.match(new RegExp(`u₀ = ${NB} et uₙ₊₁ = ([−-]?\\d*)uₙ ([+−-]) (\\d+)\\. u${IND} = \\?`));
    if (!r) return null;
    const a = r[2] === '' ? 1 : r[2] === '−' || r[2] === '-' ? -1 : nombre(r[2]); // eslint-disable-line no-nested-ternary
    const c = (r[3] === '+' ? 1 : -1) * Number(r[4]);
    const n = lireIndice(r[5]);
    const termes = [nombre(r[1])];
    for (let k = 1; k <= n; k += 1) termes.push(a * termes[k - 1] + c);
    if (!proche(termes[n])) return null;
    return {
      cagettes: termes.map((v, k) => ({ nom: `u${indice(k)}`, valeur: ecrire(v) })),
      lien: `× ${ecrire(a)} ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`,
      calcul: null,
    };
  }
  if (m.consigne === 'raison') {
    r = q.match(new RegExp(`(arithmétique|géométrique), u${IND} = ${NB} et u${IND} = ${NB}\\.`));
    if (!r) return null;
    const geo = r[1] === 'géométrique';
    const [i, vi, j, vj] = [lireIndice(r[2]), nombre(r[3]), lireIndice(r[4]), nombre(r[5])];
    const raison = geo ? vj / vi : (vj - vi) / (j - i);
    if (!proche(raison) && ecrire(raison) !== m.bonne) return null;
    if (j - i > 8) return null;
    return {
      cagettes: Array.from({ length: j - i + 1 }, (_, k) => ({
        nom: `u${indice(i + k)}`,
        valeur: k === 0 || k === j - i ? ecrire(k === 0 ? vi : vj) : '?',
      })),
      lien: `${geo ? '×' : '+'} ${m.bonne}`,
      calcul: geo ? `${ecrire(vj)} ÷ ${ecrire(vi)} = ${m.bonne}` : `(${ecrire(vj)} − ${vi < 0 ? `(${ecrire(vi)})` : ecrire(vi)}) ÷ ${j - i} = ${m.bonne}`,
    };
  }
  if (m.consigne === 'variation') {
    // Les quatre premières cagettes suffisent à voir le sens.
    let terme = null;
    let lien = '';
    r = q.match(new RegExp(`(arithmétique|géométrique) de raison ${NB}, avec u₀ = ${NB}`));
    if (r) {
      const [raison, u0] = [nombre(r[2]), nombre(r[3])];
      terme = r[1] === 'géométrique' ? (k) => u0 * raison ** k : (k) => u0 + raison * k;
      lien = `${r[1] === 'géométrique' ? '×' : '+'} ${ecrire(raison)}`;
    } else if ((r = q.match(/^uₙ = ([−-]?\d*)n(?: ([+−]) (\d+))?\./))) { // eslint-disable-line no-cond-assign
      const a = r[1] === '' ? 1 : r[1] === '−' || r[1] === '-' ? -1 : nombre(r[1]); // eslint-disable-line no-nested-ternary
      const c = r[2] ? (r[2] === '+' ? 1 : -1) * Number(r[3]) : 0;
      terme = (k) => a * k + c;
      lien = `+ ${a < 0 ? `(${ecrire(a)})` : ecrire(a)}`;
    }
    if (!terme) return null;
    const t = [0, 1, 2, 3].map(terme);
    const monte = t.every((v, k) => k === 0 || v > t[k - 1]);
    const descend = t.every((v, k) => k === 0 || v < t[k - 1]);
    const sens = monte ? 'croissante' : descend ? 'décroissante' : 'ni croissante ni décroissante'; // eslint-disable-line no-nested-ternary
    if (sens !== String(m.bonne)) return null;
    return {
      cagettes: t.map((v, k) => ({ nom: `u${indice(k)}`, valeur: ecrire(v) })),
      lien,
      calcul: monte ? 'les cagettes montent : croissante' : descend ? 'les cagettes descendent : décroissante' : 'ça monte, ça descend : ni l’un ni l’autre', // eslint-disable-line no-nested-ternary
    };
  }
  if (m.consigne === 'terme-suivant') {
    r = q.match(/uₙ = (.+)\. uₙ₊₁ = \?/);
    if (!r) return null;
    const remplace = r[1].replace(/(\d*)n(²?)/g, (_, k, carre) => `${k}(n + 1)${carre}`);
    return { cagettes: [], lien: '', calcul: `on remplace n par n + 1 : ${remplace} = ${m.bonne}` };
  }
  if (m.consigne === 'nature') {
    const nature = String(m.bonne);
    const raison = (nature.match(/[qr] = (.+)$/) ?? [])[1];
    let pourquoi = 'ni « + r » ni « × q » : ni arithmétique ni géométrique';
    if (/^géométrique/.test(nature)) pourquoi = `chaque terme est multiplié par ${raison} pour donner le suivant`;
    if (/^arithmétique/.test(nature)) pourquoi = `on ajoute ${raison} à chaque terme pour avoir le suivant`;
    return { cagettes: [], lien: '', calcul: pourquoi };
  }
  if (m.consigne === 'somme') {
    r = q.match(new RegExp(`arithmétique, u₀ = ${NB} et r = ${NB}\\. u₀ \\+ u₁ \\+ … \\+ u${IND} = \\?`));
    if (r) {
      const [u0, raison, n] = [nombre(r[1]), nombre(r[2]), lireIndice(r[3])];
      const un = u0 + n * raison;
      if (!proche(((u0 + un) * (n + 1)) / 2)) return null;
      return {
        cagettes: [{ nom: 'u₀', valeur: ecrire(u0) }, { nom: 'u₁', valeur: ecrire(u0 + raison) }, null, { nom: `u${indice(n)}`, valeur: ecrire(un) }],
        lien: `+ ${ecrire(raison)}`,
        calcul: `(${ecrire(u0)} + ${ecrire(un)}) × ${n + 1} ÷ 2 = ${m.bonne}`,
      };
    }
    r = q.match(/^1 \+ (\d+) \+ \d+² \+ … \+ \d+([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \?$/);
    if (r) {
      const qq = Number(r[1]);
      const n = Number(r[2].split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''));
      if (!proche((qq ** (n + 1) - 1) / (qq - 1))) return null;
      return {
        cagettes: [{ nom: '1', valeur: '1' }, { nom: `${qq}`, valeur: ecrire(qq) }, { nom: `${qq}²`, valeur: ecrire(qq * qq) }, null, { nom: `${qq}^${n}`, valeur: ecrire(qq ** n) }],
        lien: `× ${qq}`,
        calcul: `(${qq}^${n + 1} − 1) ÷ (${qq} − 1) = ${m.bonne}`,
      };
    }
    r = q.match(/^(\d+) \+ (\d+) \+ (\d+) \+ … \+ (\d+) = \?$/);
    if (r) {
      const [a, c, z] = [Number(r[1]), Number(r[2]), Number(r[4])];
      const pas = c - a;
      const nb = (z - a) / pas + 1;
      if (!Number.isInteger(nb) || !proche(((a + z) * nb) / 2)) return null;
      return {
        cagettes: [{ nom: '1ʳᵉ', valeur: r[1] }, { nom: '2ᵉ', valeur: r[2] }, { nom: '3ᵉ', valeur: r[3] }, null, { nom: 'dernière', valeur: r[4] }],
        lien: `+ ${pas}`,
        calcul: `(${a} + ${z}) × ${nb} ÷ 2 = ${m.bonne}`,
      };
    }
  }
  return null;
}

/** Le tapis roulant et ses cagettes ; avant la réponse, elles défilent sans rien dire. */
function Tapis({ tapis }) {
  const total = tapis ? tapis.cagettes.length + (tapis.calcul ? 1 : 0) : 0;
  const n = useDeroule(total, 520);
  if (!tapis) {
    return (
      <div className={`${P}__tapis`} aria-hidden="true">
        <div className={`${P}__defile`}>
          {Array.from({ length: 12 }, (_, i) => <span key={i} className={`${P}__cagette`} />)}
        </div>
        <span className={`${P}__rouleaux`} />
      </div>
    );
  }
  return (
    <div className={`${P}__tapis est-rejoue`}>
      <ol className={`${P}__termes`} aria-label="La suite, cagette après cagette">
        {tapis.cagettes.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={`${i < n ? 'est-posee' : ''}${i === tapis.cagettes.length - 1 ? ` ${P}__derniere` : ''}`}>
            {i > 0 && <span className={`${P}__lien`}>{c === null || tapis.cagettes[i - 1] === null ? '…' : tapis.lien}</span>}
            {c === null ? <span className={`${P}__ellipse`}>…</span> : (
              <span className={`${P}__cagette ${P}__cagette--pleine`}>
                <span className={`${P}__nom`}>{c.nom}</span>
                <strong>{c.valeur}</strong>
              </span>
            )}
          </li>
        ))}
      </ol>
      <span className={`${P}__rouleaux`} aria-hidden="true" />
      {tapis.calcul && n >= total && <p className={`${P}__calcul`}>{tapis.calcul}</p>}
    </div>
  );
}

export function QuestionSuites({ m, termine }) {
  const tapis = termine ? sur(() => tapisDe(m)) : null;
  const pancarte = (
    <div className={`${P}__pancarte`}>
      <span className={`${P}__oranger`} aria-hidden="true" />
      <Texte m={m} classe={`${P}__texte`} />
    </div>
  );
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {avecVisuel(m, pancarte)}
      <Tapis key={tapis ? 'rejoue' : 'defile'} tapis={tapis} />
    </div>
  );
}
