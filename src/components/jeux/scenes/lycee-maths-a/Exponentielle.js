import { avecVisuel } from '../base';
import {
  Reponses, Texte, sur, useDeroule,
} from './commun';

/**
 * LA CITÉ SOUS-MARINE DE L'EXPONENTIELLE (09/10/2026). La couverture : une
 * ville engloutie sous des dômes de verre, des coraux bleus, et une bulle où
 * brille une spirale de nautile — la croissance exponentielle elle-même.
 *   - LA QUESTION est dans un hublot de verre ; à côté, le nautile dont la
 *     spirale se dessine et luit, et des bulles qui montent ;
 *   - LES RÉPONSES sont des bulles qui flottent lentement : on attrape la
 *     bonne (`choix`) ;
 *   - APRÈS LA RÉPONSE, les règles remontent à la surface, une par une :
 *     eᵃ × eᵇ = eᵃ⁺ᵇ avec les vrais exposants, « exp est croissante : on
 *     compare les exposants », « eˣ > 0 : le signe vient de l'autre facteur »,
 *     la dérivée de e^(ax + b)…
 */

const P = 'sc-exponentielle';
const EXP = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
const lire = (s) => (s ? Number(s.split('').map((c) => EXP[c]).join('')) : 1);
const ent = (n) => (n < 0 ? `(−${-n})` : String(n));

/** LES RÈGLES d'une manche, avec ses nombres ; null si la question ne se lit pas. */
export function reglesDe(m) {
  const q = String(m.question).replace(/ = \?$/, '');
  const X = '([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]*)';
  let r;
  switch (m.consigne) {
    case 'produit':
      r = q.match(new RegExp(`^e${X} × e${X}$`));
      if (r) return ['eᵃ × eᵇ = eᵃ⁺ᵇ', `e^(${lire(r[1])} + ${ent(lire(r[2]))}) = ${m.bonne}`];
      r = q.match(/^e\^\((.+?)\) × e\^\((.+)\)$/);
      return r ? ['eᵃ × eᵇ = eᵃ⁺ᵇ : on additionne les exposants', `(${r[1]}) + (${r[2]})`, m.bonne] : null;
    case 'quotient':
      r = q.match(new RegExp(`^e${X} ÷ e${X}$`));
      return r ? ['eᵃ ÷ eᵇ = eᵃ⁻ᵇ', `e^(${lire(r[1])} − ${ent(lire(r[2]))}) = ${m.bonne}`] : null;
    case 'puissance':
      if ((r = q.match(/^\(eˣ\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/))) return ['(eˣ)ⁿ = eⁿˣ : on multiplie les exposants', m.bonne]; // eslint-disable-line no-cond-assign
      r = q.match(new RegExp(`^\\(e${X}\\)${X}$`));
      return r ?['(eᵃ)ⁿ = eᵃⁿ', `e^(${lire(r[1])} × ${ent(lire(r[2]))}) = ${m.bonne}`] : null;
    case 'inverse':
      return ['1/eᵃ = e⁻ᵃ', 'e⁻ᵃ = 1/eᵃ'];
    case 'equation':
      r = q.match(/^Résous e\^\((.+)\) = (?:e\^\((.+)\)|e([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)|(1))$/);
      if (!r) return null;
      if (r[4]) return ['1 = e⁰', 'eᴬ = e⁰ ⟺ A = 0', `${r[1]} = 0`];
      return ['eᴬ = eᴮ ⟺ A = B', `${r[1]} = ${r[2] ?? lire(r[3])}`];
    case 'inequation':
      r = q.match(/^Résous e\^\((.+)\) ([<>≤≥]) e([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
      if (!r) return null;
      return ['exp est croissante : l’ordre ne change pas', `${r[1]} ${r[2]} ${String(lire(r[3])).replace('-', '−')}`];
    case 'signe-equation':
    case 'signe-inequation':
      r = q.match(/^Résous \(([^)]+)\)e/);
      return r ? ['eˣ > 0 toujours : il ne change pas le signe', `tout se joue sur ${r[1]}`] : null;
    case 'signe-toujours':
      return ['eˣ > 0 pour tout réel x', /−eˣ/.test(q) ? 'donc −eˣ < 0' : 'une exponentielle ne s’annule jamais'];
    case 'variation':
      r = q.match(/^f\(x\) = ([−-]?\d*)e(?:\^\(([−-]?\d*)x\)|ˣ)/);
      if (!r) return null;
      {
        const lireCoef = (c) => (c === undefined || c === '' ? 1 : c === '−' || c === '-' ? -1 : Number(c.replace('−', '-'))); // eslint-disable-line no-nested-ternary
        const [a, k] = [lireCoef(r[1]), lireCoef(r[2])];
        const sens = a * k > 0 ? 'croissante' : 'décroissante';
        if (String(m.bonne) !== sens) return null;
        return [`f′(x) = ${ent(a)} × ${ent(k)} × e^(${k === 1 ? '' : k === -1 ? '−' : k}x)`, `e^(…) > 0 et ${ent(a)} × ${ent(k)} ${a * k > 0 ? '> 0' : '< 0'} : f est ${sens}`]; // eslint-disable-line no-nested-ternary
      }
    case 'derivee':
      if (/^f\(x\) = \(/.test(q)) return ['(u × eˣ)′ = (u′ + u) eˣ'];
      return ['(e^(ax + b))′ = a × e^(ax + b)', 'le coefficient de x descend devant'];
    default:
      return null;
  }
}

function Nautile() {
  // La spirale d'or : chaque quart de tour est plus grand que le précédent.
  const spirale = 'M60 60 a4 4 0 0 1 4 4 a8 8 0 0 1 -8 8 a12 12 0 0 1 -12 -12 a20 20 0 0 1 20 -20 a32 32 0 0 1 32 32 a50 50 0 0 1 -50 50';
  return (
    <svg className={`${P}__nautile`} viewBox="0 0 130 140" aria-hidden="true" focusable="false">
      <circle cx="62" cy="64" r="58" className={`${P}__bulle-geante`} />
      <path d={spirale} className={`${P}__spirale`} pathLength="1" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={20 + i * 22} cy="130" r={3 + (i % 3)} className={`${P}__bulle-montante`} style={{ '--i': i }} />
      ))}
    </svg>
  );
}

function Regles({ regles }) {
  const n = useDeroule(regles.length, 800);
  return (
    <ol className={`${P}__regles`} aria-label="Les règles qui remontent">
      {regles.map((r, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={i < n ? 'est-remontee' : ''}>{r}</li>
      ))}
    </ol>
  );
}

export function QuestionExponentielle({ m, termine }) {
  const regles = termine ? sur(() => reglesDe(m)) : null;
  const hublot = (
    <div className={`${P}__abysses`}>
      <Nautile />
      <div className={`${P}__hublot`}>
        <Texte m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {avecVisuel(m, hublot)}
      {regles && <Regles regles={regles} />}
    </div>
  );
}

/** Les bulles qui flottent : on attrape la bonne. */
export function BullesExponentielle({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__courant`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Attrape la bonne bulle"
        decor={() => <span className={`${P}__reflet`} aria-hidden="true" />}
      />
    </div>
  );
}
