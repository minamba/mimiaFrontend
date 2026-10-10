import { classeQuestion } from '../base';
import {
  Etapes, Explication, divise, ecrireFraction, fois, lireFraction, moins, plus, ppcm, pgcd,
} from './outils';

/**
 * L'ÎLE AUX JARDINS PARTAGÉS — « Les fractions », 6e, 5e et 4e (09/10/2026).
 * La couverture : une île ronde au milieu d'un lac, partagée en champs de
 * fleurs (rouges, blanches, roses, jaunes, lavande), des ponts de pierre,
 * un garçon à l'écharpe rouge qui nous invite. La scène :
 *   - LA QUESTION : un panneau de jardin planté devant l'île, dont les champs
 *     fleurissent et dont l'eau ondule ;
 *   - LES RÉPONSES : des îlots fleuris, chacun portant sa fraction écrite en
 *     vrai (le numérateur sur la barre, le dénominateur dessous) ;
 *   - APRÈS LA RÉPONSE : l'île se partage pour de bon — les parts se cueillent
 *     (« on en prend »), deux îles se comparent, les calculs se posent ligne
 *     à ligne : même dénominateur, produit des numérateurs, inverse…
 * Avant la réponse, l'île n'est pas partagée selon la question : la dessiner,
 * ce serait déjà répondre.
 */
const P = 'sc-fractions-college';

const F = ecrireFraction;
const COULEURS = ['#e8433f', '#f6f1e8', '#f39ac0', '#f6c933', '#9b7fe0', '#f08a2c'];

/** Une île ronde partagée en `d` champs, dont `n` fleuris (les autres cueillis). */
function Ile({
  n, d, taille = 92, cueillis = 0, retard = 0,
}) {
  const parts = Math.max(1, Math.min(d, 36));
  const r = 40;
  const secteur = (i) => {
    const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
    const grand = 0;
    return `M50 50 L${50 + r * Math.cos(a0)} ${50 + r * Math.sin(a0)} A${r} ${r} 0 ${grand} 1 ${50 + r * Math.cos(a1)} ${50 + r * Math.sin(a1)} Z`;
  };
  return (
    <svg className={`${P}__ile`} viewBox="0 0 100 100" width={taille} height={taille} aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="48" className={`${P}__lac`} />
      <circle cx="50" cy="50" r="43" className={`${P}__rive`} />
      {parts === 1 ? (
        <circle cx="50" cy="50" r={r} fill={n >= 1 ? COULEURS[0] : '#8a6a44'} className={`${P}__champ`} />
      ) : Array.from({ length: parts }, (_, i) => {
        const fleuri = i < n;
        const cueilli = i >= n - cueillis && i < n;
        return (
          <path
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            d={secteur(i)}
            fill={fleuri ? COULEURS[i % COULEURS.length] : '#8a6a44'}
            className={`${P}__champ${cueilli ? ' est-cueilli' : ''}`}
            style={{ '--d': `${(retard + (cueilli ? (i - (n - cueillis)) * 0.12 : i * 0.05)).toFixed(2)}s` }}
          />
        );
      })}
      <circle cx="50" cy="50" r="5" className={`${P}__arbre`} />
    </svg>
  );
}

/** Une fraction dessinée en îles : autant d'îles entières que nécessaire (trois au plus). */
function Iles({ f, retard = 0 }) {
  if (!f || f.d < 1 || f.d > 36 || f.n < 0 || f.n > 3 * f.d) return null;
  const nb = Math.max(1, Math.ceil(f.n / f.d));
  return (
    <span className={`${P}__archipel`}>
      {Array.from({ length: nb }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Ile key={i} n={Math.min(f.d, f.n - i * f.d)} d={f.d} taille={74} retard={retard + i * 0.3} />
      ))}
      <em>{F(f)}</em>
    </span>
  );
}

const fractionsDe = (texte) => (String(texte).match(/\d+\/\d+|\d+/g) ?? []);

/** Ce que l'explication montre : des îles, des lignes de calcul. */
function lire(m) {
  const q = m.question;
  const bonne = lireFraction(m.bonne);
  if (m.consigne === 'sens') {
    const [n, k] = (q.match(/\d+/g) ?? []).map(Number);
    if (!n || k === undefined || k > n) return null;
    return {
      iles: <Ile n={n} d={n} taille={120} cueillis={k} retard={0.4} />,
      lignes: [`${n} parts, on en prend ${k} : il en reste ${n} − ${k} = ${n - k}`, `${n - k} parts sur ${n}`],
    };
  }
  const f = fractionsDe(q).map(lireFraction);
  if (f.some((x) => !x)) return null;
  const [a, b, c] = f;
  if (m.consigne === 'simplifier' && a) {
    const g = pgcd(a.n, a.d);
    return {
      iles: <><Iles f={a} /><Iles f={{ n: a.n / g, d: a.d / g }} retard={0.6} /></>,
      lignes: [`${a.n} et ${a.d} sont tous deux divisibles par ${g}`, `${F(a)} = (${a.n} ÷ ${g}) / (${a.d} ÷ ${g}) = ${a.n / g}/${a.d / g}`],
    };
  }
  if (m.consigne === 'comparer' && a && b) {
    const D = ppcm(a.d, b.d);
    const A = { n: (a.n * D) / a.d, d: D };
    const B = { n: (b.n * D) / b.d, d: D };
    return {
      iles: <><Iles f={a} /><Iles f={b} retard={0.6} /></>,
      lignes: [
        `Même dénominateur : ${F(a)} = ${F(A)} et ${F(b)} = ${F(B)}`,
        `${F(A)} ${A.n > B.n ? '>' : '<'} ${F(B)}`,
      ],
    };
  }
  if (m.consigne === 'egales' && a && bonne && a.n) {
    const k = bonne.n / a.n;
    if (!Number.isInteger(k) || bonne.d !== a.d * k) {
      return {
        iles: <><Iles f={a} /><Iles f={bonne} retard={0.6} /></>,
        lignes: [`Produits en croix : ${a.n} × ${bonne.d} = ${a.d} × ${bonne.n} = ${a.n * bonne.d}`],
      };
    }
    return {
      iles: <><Iles f={a} /><Iles f={bonne} retard={0.6} /></>,
      lignes: [`On multiplie le haut ET le bas par le même nombre, ${k} :`, `(${a.n} × ${k}) / (${a.d} × ${k}) = ${F(bonne)}`],
    };
  }
  if (m.consigne === 'meme-denominateur' && a && b) {
    const k = b.n / a.d;
    if (!Number.isInteger(k)) return null;
    return {
      iles: <><Iles f={a} /><Iles f={{ n: a.n * k, d: b.n }} retard={0.6} /></>,
      lignes: [`${a.d} × ${k} = ${b.n} : on multiplie aussi le numérateur par ${k}`, `${F(a)} = (${a.n} × ${k}) / (${a.d} × ${k}) = ${a.n * k}/${b.n}`],
    };
  }
  if (m.consigne === 'multiplier' && a && b) {
    return {
      lignes: a.d === 1
        ? [`${a.n} × ${F(b)} = (${a.n} × ${b.n}) / ${b.d} = ${a.n * b.n}/${b.d}`]
        : [`On multiplie les numérateurs entre eux, les dénominateurs entre eux :`, `(${a.n} × ${b.n}) / (${a.d} × ${b.d}) = ${a.n * b.n}/${a.d * b.d}`],
    };
  }
  if ((m.consigne === 'additionner' || m.consigne === 'somme') && a && b) {
    const signe = q.includes('−') ? '−' : '+';
    const D = ppcm(a.d, b.d);
    const A = (a.n * D) / a.d;
    const B = (b.n * D) / b.d;
    const R = signe === '+' ? A + B : A - B;
    return {
      iles: R >= 0 ? <Iles f={{ n: R, d: D }} retard={1.4} /> : null,
      lignes: [
        `Même dénominateur, ${D} : ${F(a)} ${signe} ${F(b)} = ${A}/${D} ${signe} ${B}/${D}`,
        `On ${signe === '+' ? 'additionne' : 'soustrait'} les numérateurs : ${A} ${signe} ${B} = ${R}, d’où ${R}/${D}`,
      ],
    };
  }
  if (m.consigne === 'diviser' && a && b) {
    const inverse = { n: b.d, d: b.n };
    const produit = { n: a.n * inverse.n, d: a.d * inverse.d };
    return {
      lignes: [
        `Diviser par ${F(b)}, c’est multiplier par son inverse ${F(inverse)}`,
        `${F(a)} × ${F(inverse)} = ${F(produit)}${produit.d !== 1 && pgcd(produit.n, produit.d) > 1 ? ` = ${F(divise(a, b))}` : ''}`,
      ],
    };
  }
  if (m.consigne === 'priorite' && a && b && c) {
    const signe = q.includes('−') ? '−' : '+';
    const p = fois(b, c);
    const r = signe === '+' ? plus(a, p) : moins(a, p);
    return {
      lignes: [
        `D’abord la multiplication : ${F(b)} × ${F(c)} = ${F(p)}`,
        `Puis : ${F(a)} ${signe} ${F(p)} = ${F(r)}`,
      ],
    };
  }
  return null;
}

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  return (
    <>
      {l.iles && <div className={`${P}__vue`}>{l.iles}</div>}
      <Etapes p={P} lignes={l.lignes} depart={l.iles ? 1.2 : 0.3} pas={0.9} />
    </>
  );
}

/** Le décor : l'île aux six champs, l'eau qui ondule, des pétales qui volent. */
function Decor() {
  return (
    <div className={`${P}__decor`} aria-hidden="true">
      <span className={`${P}__onde`} />
      <span className={`${P}__onde ${P}__onde--2`} />
      <span className={`${P}__grande-ile`}><Ile n={6} d={6} taille={110} /></span>
      {[10, 26, 70, 88].map((x, i) => (
        <span key={x} className={`${P}__petale`} style={{ left: `${x}%`, animationDelay: `${(i * -1.6).toFixed(1)}s` }} />
      ))}
    </div>
  );
}

export function QuestionFractions({ m, termine }) {
  const l = termine ? lire(m) : null;
  const retard = l ? (l.iles ? 1.2 : 0.3) + l.lignes.length * 0.9 : 0;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {!termine && <Decor />}
      <div className={`${P}__panneau`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={retard} />}
    </div>
  );
}

/** Une fraction écrite en vrai : le numérateur sur la barre, le dénominateur dessous. */
function Ecrite({ texte }) {
  const f = /^(\d+)\/(\d+)$/.exec(String(texte));
  if (!f) return <span className={`${P}__entier`}>{texte}</span>;
  return (
    <span className={`${P}__fraction`} aria-hidden="true">
      <span>{f[1]}</span>
      <span className={`${P}__barre`} />
      <span>{f[2]}</span>
    </span>
  );
}

/** Les réponses : des îlots fleuris, chacun avec sa fraction. */
export function Ilots({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__ilots`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            aria-label={String(libelle)}
            className={`${P}__ilot${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__fleurs`} aria-hidden="true" />
            <Ecrite texte={libelle} />
          </button>
        </li>
      ))}
    </ul>
  );
}
