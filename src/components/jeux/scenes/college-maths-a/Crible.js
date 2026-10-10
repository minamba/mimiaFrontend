import { useState } from 'react';
import { classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireNombre, lireFraction, lireNombre, nombresDe, pgcd,
} from './outils';

/**
 * LES CRIBLES DES MARAIS SALANTS — « Le crible », 6e, 5e et 3e (09/10/2026).
 * La couverture : des marais salants au bord d'une mer turquoise, une roue
 * à aubes, de grands cribles de pierre percés de trous où l'on verse des
 * fèves rouges, blondes et noires, et l'eau qui s'en écoule. La scène :
 *   - LA QUESTION : gravée sur une stèle de pierre blanche, devant la mer ;
 *     la roue à aubes tourne, les tas de sel brillent ;
 *   - LES RÉPONSES : des fèves à verser dans le crible — on les y glisse, ou
 *     on clique dessus (le clic suffit toujours) ;
 *   - APRÈS LA RÉPONSE : le crible trie. Chaque fève passe l'épreuve à son
 *     tour (somme des chiffres, dernier chiffre, division…) : celle qui la
 *     réussit passe à travers les trous ✓, les autres restent ✗. En 3e, on
 *     voit la décomposition se faire, ou l'algorithme d'Euclide tourner.
 */
const P = 'sc-crible-college';

const e = (x) => ecrireNombre(x);
const sommeChiffres = (n) => String(n).split('').reduce((s, c) => s + Number(c), 0);

/** Le plus petit diviseur premier de n (n ≥ 2). */
function plusPetitDiviseur(n) {
  for (let k = 2; k * k <= n; k += 1) if (n % k === 0) return k;
  return n;
}

/** L'épreuve d'un nombre pour « divisible par d » : la règle du collège, et son verdict. */
function epreuveDivisible(n, d) {
  const ok = n % d === 0;
  const u = n % 10;
  if (d === 2) return { ok, texte: `se termine par ${u} : ${ok ? 'pair' : 'impair'}` };
  if (d === 5) return { ok, texte: `se termine par ${u}${ok ? '' : ', ni 0 ni 5'}` };
  if (d === 10) return { ok, texte: `se termine par ${u}` };
  if (d === 3 || d === 9) {
    const s = sommeChiffres(n);
    return { ok, texte: `${String(n).split('').join(' + ')} = ${s}${s % d === 0 ? ` = ${d} × ${s / d}` : `, pas dans la table de ${d}`}` };
  }
  if (d === 4) {
    const fin = n % 100;
    return { ok, texte: `les deux derniers chiffres : ${fin}${fin % 4 === 0 ? ` = 4 × ${fin / 4}` : ', pas dans la table de 4'}` };
  }
  const q = Math.floor(n / d);
  const r = n % d;
  return { ok, texte: r ? `${e(n)} = ${d} × ${q} + ${r}` : `${e(n)} = ${d} × ${q}` };
}

/** Une épreuve par fève : [{ libelle, ok, texte }]. */
function epreuves(m) {
  const candidats = m.choix.map((c) => ({ libelle: c.libelle, n: lireNombre(c.libelle) }));
  if (candidats.some((c) => c.n === null)) return null;
  const [cible] = nombresDe(m.question);
  if (m.consigne === 'divisible-par') return candidats.map(({ libelle, n }) => ({ libelle, ...epreuveDivisible(n, cible) }));
  if (m.consigne === 'critere') return candidats.map(({ libelle, n }) => ({ libelle: `÷ ${libelle}`, ...epreuveDivisible(cible, n) }));
  if (m.consigne === 'diviseur') {
    return candidats.map(({ libelle, n }) => {
      if (n > cible) return { libelle, ok: false, texte: `plus grand que ${cible} : c’en est un multiple, pas un diviseur` };
      const r = cible % n;
      return { libelle, ok: r === 0, texte: r ? `${cible} = ${n} × ${Math.floor(cible / n)} + ${r}` : `${cible} = ${n} × ${cible / n}` };
    });
  }
  if (m.consigne === 'multiple') {
    return candidats.map(({ libelle, n }) => {
      const r = n % cible;
      if (n < cible) return { libelle, ok: false, texte: `plus petit que ${cible} : c’en est peut-être un diviseur, pas un multiple` };
      return { libelle, ok: r === 0, texte: r ? `${n} = ${cible} × ${Math.floor(n / cible)} + ${r}` : `${n} = ${cible} × ${n / cible}` };
    });
  }
  if (m.consigne === 'nombre-premier') {
    return candidats.map(({ libelle, n }) => {
      if (n < 2) return { libelle, ok: false, texte: 'n’a qu’un seul diviseur : il n’est pas premier' };
      const k = plusPetitDiviseur(n);
      return k === n
        ? { libelle, ok: true, texte: `seulement 1 et ${n} : premier` }
        : { libelle, ok: false, texte: `${n} = ${k} × ${n / k}` };
    });
  }
  return null;
}

/** Les étapes des manches qui ne trient pas des fèves : diviseurs, décomposition, PGCD, fraction. */
function etapes(m) {
  const q = m.question;
  if (m.consigne === 'nombre-diviseurs') {
    const [n] = nombresDe(q);
    const paires = [];
    for (let k = 1; k * k <= n; k += 1) if (n % k === 0) paires.push([k, n / k]);
    const tous = [...new Set(paires.flat())].sort((a, b) => a - b);
    return [
      `Par paires : ${paires.map(([a, b]) => `${a} × ${b}`).join(' ; ')}`,
      `${tous.length} diviseurs : ${tous.join(', ')}`,
    ];
  }
  if (m.consigne === 'decomposition') {
    let [n] = nombresDe(q);
    if (!Number.isInteger(n) || n < 2) return null;
    const chaine = [];
    while (n > 1) {
      const k = plusPetitDiviseur(n);
      chaine.push(`${e(n)} ÷ ${k} = ${e(n / k)}`);
      n /= k;
    }
    return chaine;
  }
  if (m.consigne === 'pgcd') {
    let [a, b] = nombresDe(q);
    if (!a || !b) return null;
    if (a < b) [a, b] = [b, a];
    const lignes = [];
    while (b) {
      lignes.push(`${a} = ${Math.floor(a / b)} × ${b} + ${a % b}`);
      [a, b] = [b, a % b];
    }
    lignes.push(`Le dernier reste non nul : ${a}`);
    return lignes;
  }
  if (m.consigne === 'irreductible') {
    const f = lireFraction(/:\s*(\d+\/\d+)/.exec(q)?.[1]);
    if (!f) return null;
    const g = pgcd(f.n, f.d);
    return [
      `PGCD(${f.n} ; ${f.d}) = ${g}`,
      `${f.n} ÷ ${g} = ${f.n / g}   et   ${f.d} ÷ ${g} = ${f.d / g}`,
    ];
  }
  return null;
}

/** Le crible qui trie : chaque fève passe son épreuve, la bonne tombe à travers les trous. */
function Tri({ liste }) {
  return (
    <div className={`${P}__tri`}>
      <span className={`${P}__crible-tri`} aria-hidden="true" />
      <ul className={`${P}__epreuves`}>
        {liste.map((x, i) => (
          <li
            key={x.libelle}
            className={`${P}__epreuve${x.ok ? ' est-reussie' : ' est-ratee'}`}
            style={{ '--d': `${(0.3 + i * 0.8).toFixed(2)}s` }}
          >
            <span className={`${P}__feve-tri`}>{x.libelle}</span>
            <span className={`${P}__test`}>{x.texte}</span>
            <span className={`${P}__verdict`}>{x.ok ? '✓' : '✗'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function contenu(m) {
  const liste = epreuves(m);
  if (liste) return liste.length ? <Tri liste={liste} /> : null;
  const l = etapes(m);
  return l ? <Etapes p={P} lignes={l} pas={0.6} /> : null;
}

/** Le décor : la roue à aubes qui tourne et fait goutter l'eau, les tas de sel blanc sur le muret. */
function Marais() {
  return (
    <svg className={`${P}__marais`} viewBox="0 0 400 80" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <rect x="40" y="66" width="320" height="12" rx="4" className={`${P}__muret`} />
      <g className={`${P}__roue`}>
        <circle cx="96" cy="38" r="30" />
        <circle cx="96" cy="38" r="6" className={`${P}__moyeu`} />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <line key={a} x1={96 + 34 * Math.cos((a * Math.PI) / 180)} y1={38 + 34 * Math.sin((a * Math.PI) / 180)} x2={96 - 34 * Math.cos((a * Math.PI) / 180)} y2={38 - 34 * Math.sin((a * Math.PI) / 180)} />
        ))}
      </g>
      {[84, 96, 108].map((x, i) => (
        <circle key={x} cx={x} cy="70" r="2.6" className={`${P}__goutte`} style={{ animationDelay: `${(i * 0.45).toFixed(2)}s` }} />
      ))}
      <path d="M220 66 l28 -30 l28 30 Z M268 66 l22 -24 l22 24 Z M300 66 l18 -18 l18 18 Z" className={`${P}__sel`} />
      {[236, 262, 288].map((x, i) => <circle key={x} cx={x} cy={40 + (i % 2) * 6} r="2" className={`${P}__eclat-sel`} style={{ animationDelay: `${(i * -0.6).toFixed(1)}s` }} />)}
    </svg>
  );
}

export function QuestionCrible({ m, termine }) {
  const nb = epreuves(m)?.length ?? etapes(m)?.length ?? 0;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Marais />
      <div className={`${P}__stele`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={0.6 + nb * 0.75} />}
    </div>
  );
}

/**
 * LES RÉPONSES : des fèves et le crible. On glisse une fève dans le crible,
 * ou on clique dessus : les deux reviennent au même choix.
 */
export function Feves({ choix, fautes, choisir }) {
  const [survol, setSurvol] = useState(false);
  const deposer = (ev) => {
    ev.preventDefault();
    setSurvol(false);
    const cle = ev.dataTransfer?.getData('text/plain');
    const c = choix.find((x) => String(x.cle) === cle);
    if (c && !fautes.includes(c.cle)) choisir(c.cle);
  };
  return (
    <div className={`${P}__atelier`}>
      <ul className={`${P}__feves`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${P}__feve${fautes.includes(cle) ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={fautes.includes(cle)}
              draggable={!fautes.includes(cle)}
              onDragStart={(ev) => ev.dataTransfer?.setData('text/plain', String(cle))}
            >
              {libelle}
            </button>
          </li>
        ))}
      </ul>
      <div
        className={`${P}__crible${survol ? ' est-survole' : ''}`}
        onDragOver={(ev) => { ev.preventDefault(); setSurvol(true); }}
        onDragLeave={() => setSurvol(false)}
        onDrop={deposer}
        aria-hidden="true"
      >
        <span className={`${P}__filet`} />
      </div>
    </div>
  );
}
