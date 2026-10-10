import { useState } from 'react';
import { avecVisuel } from '../base';
import {
  Repere, Texte, ecrire, fenetreAutour, nombre, sur, useDeroule,
} from './commun';

/**
 * LE CHANTIER DE PIERRE DU PRODUIT SCALAIRE (09/10/2026). La couverture : un
 * chantier antique au-dessus d'une vallée, des blocs de pierre taillée, une
 * grande équerre de bois et de laiton qu'on ajuste.
 *   - LA QUESTION est gravée sur un bloc du mur ; au-dessus, l'équerre du
 *     maçon bascule doucement (l'angle entre deux vecteurs) ;
 *   - LE MUR A UNE PIERRE QUI MANQUE : les réponses sont des pierres taillées
 *     qu'on glisse dans le trou — ou qu'on touche, simplement (`choix`) ;
 *   - APRÈS LA RÉPONSE, le maçon pose le calcul pierre à pierre :
 *     xx′ + yy′ avec les vrais nombres, ‖u‖ × ‖v‖ × cos θ, Al-Kashi,
 *     la polarisation, et les deux vecteurs dessinés quand on les connaît
 *     (avec l'angle droit s'ils sont orthogonaux).
 */

const P = 'sc-produit-scalaire';
const par = (x) => (x < 0 ? `(${ecrire(x)})` : ecrire(x));

/** Le calcul d'une manche : { lignes, vecteurs? } ou null. */
export function chantierDe(m) {
  const q = String(m.question).replace(/⃗/g, '');
  const norme = (n) => nombre((q.match(new RegExp(`‖${n}‖ = (\\d+)`)) ?? [])[1]);
  const coord = (n) => {
    const r = q.match(new RegExp(`${n}\\(([−-]?\\d+) ; ([−-]?\\d+|m)\\)`));
    return r ? [nombre(r[1]), r[2] === 'm' ? null : nombre(r[2])] : null;
  };
  let r;
  switch (m.consigne) {
    case 'coordonnees': {
      const [u, v] = [coord('u'), coord('v')];
      if (!u || !v) return null;
      const s = u[0] * v[0] + u[1] * v[1];
      if (s !== nombre(m.bonne)) return null;
      return { lignes: ['u · v = xx′ + yy′', `= ${par(u[0])} × ${par(v[0])} + ${par(u[1])} × ${par(v[1])}`, `= ${ecrire(u[0] * v[0])} + ${par(u[1] * v[1])} = ${ecrire(s)}`], vecteurs: [u, v] };
    }
    case 'orthogonalite': {
      const [u, v] = [coord('u'), coord('v')];
      const mm = nombre(String(m.bonne).replace('m = ', ''));
      if (!u || !v || !Number.isFinite(mm)) return null;
      return { lignes: ['orthogonaux ⟺ u · v = 0', `${par(u[0])} × ${par(v[0])} + ${par(u[1])} × m = 0`, `m = ${ecrire(mm)}`], vecteurs: [u, [v[0], mm]], droit: true };
    }
    case 'developpement': {
      r = q.match(/‖u ([+−]) v‖² = \?/);
      const [nu, nv] = [norme('u'), norme('v')];
      const s = nombre((q.match(/u · v = ([−-]?\d+)/) ?? [])[1]);
      if (!r || ![nu, nv, s].every(Number.isFinite)) return null;
      const signe = r[1] === '+' ? 1 : -1;
      return { lignes: [`‖u ${r[1]} v‖² = ‖u‖² ${r[1]} 2 u · v + ‖v‖²`, `= ${nu * nu} ${r[1]} 2 × ${par(s)} + ${nv * nv} = ${ecrire(nu * nu + signe * 2 * s + nv * nv)}`] };
    }
    case 'polarisation': {
      r = q.match(/‖u ([+−]) v‖ = (\d+)/);
      const [nu, nv] = [norme('u'), norme('v')];
      if (!r || ![nu, nv].every(Number.isFinite)) return null;
      const w = Number(r[2]);
      const s = r[1] === '+' ? (w * w - nu * nu - nv * nv) / 2 : (nu * nu + nv * nv - w * w) / 2;
      return {
        lignes: r[1] === '+'
          ? ['u · v = (‖u + v‖² − ‖u‖² − ‖v‖²) ÷ 2', `= (${w * w} − ${nu * nu} − ${nv * nv}) ÷ 2 = ${ecrire(s)}`]
          : ['u · v = (‖u‖² + ‖v‖² − ‖u − v‖²) ÷ 2', `= (${nu * nu} + ${nv * nv} − ${w * w}) ÷ 2 = ${ecrire(s)}`],
      };
    }
    case 'normes-angle': {
      r = q.match(/\(u, v\) = ([^.]+)\./);
      const [nu, nv] = [norme('u'), norme('v')];
      if (!r || ![nu, nv].every(Number.isFinite)) return null;
      return { lignes: ['u · v = ‖u‖ × ‖v‖ × cos(u, v)', `= ${nu} × ${nv} × cos(${r[1].trim()})`, `= ${m.bonne}`] };
    }
    case 'al-kashi-longueur':
      r = q.match(/AB = (\d+), AC = (\d+) et BÂC = (\d+)°/);
      return r ? { lignes: ['BC² = AB² + AC² − 2 × AB × AC × cos Â', `= ${r[1]}² + ${r[2]}² − 2 × ${r[1]} × ${r[2]} × cos ${r[3]}°`, `BC ≈ ${m.bonne}`] } : null;
    case 'al-kashi-angle':
      r = q.match(/AB = (\d+), AC = (\d+) et BC = (\d+)/);
      return r ? { lignes: ['cos Â = (AB² + AC² − BC²) ÷ (2 × AB × AC)', `= (${r[1]}² + ${r[2]}² − ${r[3]}²) ÷ (2 × ${r[1]} × ${r[2]})`, `Â ≈ ${m.bonne}`] } : null;
    case 'projete': {
      r = q.match(/AB = (\d+), AH = (\d+)/);
      if (!r) return null;
      const oppose = /A est entre H et B/.test(q);
      return { lignes: [oppose ? 'H est du mauvais côté de A : le produit est négatif' : 'H est du même côté que B : le produit est positif', `AB · AC = ${oppose ? '−' : ''}AB × AH = ${oppose ? '−' : ''}${r[1]} × ${r[2]} = ${m.bonne}`] };
    }
    default:
      return null;
  }
}

function Equerre({ posee }) {
  return (
    <svg className={`${P}__equerre${posee ? ' est-posee' : ''}`} viewBox="0 0 120 110" aria-hidden="true" focusable="false">
      <rect x="6" y="96" width="108" height="10" rx="2" className={`${P}__socle`} />
      <g className={`${P}__bras`}>
        <path d="M20 96 L20 16 L32 16 L32 84 L100 84 L100 96 Z" />
        <path d="M32 84 L32 70 L46 84 Z" className={`${P}__laiton`} />
        <circle cx="26" cy="90" r="4" className={`${P}__laiton`} />
      </g>
    </svg>
  );
}

function Vecteurs({ vecteurs, droit }) {
  const fenetre = fenetreAutour(vecteurs, 1);
  return (
    <Repere fenetre={fenetre} prefixe={P} largeur={220} hauteur={170}>
      {(X, Y) => (
        <>
          {vecteurs.map(([x, y], i) => {
            const [x2, y2] = [X(x), Y(y)];
            const a = Math.atan2(y2 - Y(0), x2 - X(0));
            return (
              <g key={i === 0 ? 'u' : 'v'} className={`${P}__vecteur ${P}__vecteur--${i === 0 ? 'u' : 'v'}`}>
                <line x1={X(0)} y1={Y(0)} x2={x2} y2={y2} pathLength="1" />
                <path d={`M${x2} ${y2} L${x2 - 10 * Math.cos(a - 0.45)} ${y2 - 10 * Math.sin(a - 0.45)} L${x2 - 10 * Math.cos(a + 0.45)} ${y2 - 10 * Math.sin(a + 0.45)} Z`} />
                <text x={x2 + 6} y={y2 - 6}>{i === 0 ? 'u' : 'v'}</text>
              </g>
            );
          })}
          {droit && (() => {
            const [u, v] = vecteurs;
            const nu = Math.hypot(X(u[0]) - X(0), Y(u[1]) - Y(0)) || 1;
            const nv = Math.hypot(X(v[0]) - X(0), Y(v[1]) - Y(0)) || 1;
            const k = 12;
            const pu = [((X(u[0]) - X(0)) / nu) * k, ((Y(u[1]) - Y(0)) / nu) * k];
            const pv = [((X(v[0]) - X(0)) / nv) * k, ((Y(v[1]) - Y(0)) / nv) * k];
            return <path className={`${P}__angle-droit`} d={`M${X(0) + pu[0]} ${Y(0) + pu[1]} l${pv[0]} ${pv[1]} l${-pu[0]} ${-pu[1]}`} />;
          })()}
        </>
      )}
    </Repere>
  );
}

function Chantier({ chantier }) {
  const n = useDeroule(chantier.lignes.length, 850);
  return (
    <div className={`${P}__calcul`}>
      <ol aria-label="Le calcul, pierre à pierre">
        {chantier.lignes.map((l, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={i < n ? 'est-posee' : ''}>{l}</li>
        ))}
      </ol>
      {chantier.vecteurs && <Vecteurs vecteurs={chantier.vecteurs} droit={chantier.droit} />}
    </div>
  );
}

export function QuestionProduitScalaire({ m, termine }) {
  const chantier = termine ? sur(() => chantierDe(m)) : null;
  const bloc = (
    <div className={`${P}__atelier`}>
      <Equerre posee={termine} />
      <div className={`${P}__bloc`}>
        <Texte m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {avecVisuel(m, bloc)}
      {chantier && <Chantier chantier={chantier} />}
    </div>
  );
}

/**
 * LA PIERRE QUI MANQUE : un mur avec un trou, et les pierres de réponse.
 * On glisse une pierre dans le trou, ou on la touche : le clic suffit
 * toujours. Chaque pierre reste un bouton nommé par son libellé.
 */
export function PierresProduitScalaire({ choix, fautes, choisir }) {
  const [survol, setSurvol] = useState(false);
  const deposer = (e) => {
    e.preventDefault();
    setSurvol(false);
    const cle = e.dataTransfer?.getData('text/plain');
    const c = choix.find((x) => String(x.cle) === cle);
    if (c && !fautes.includes(c.cle)) choisir(c.cle);
  };
  return (
    <div className={`${P}__mur-zone`}>
      <div
        className={`${P}__mur${survol ? ' est-survole' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setSurvol(true); }}
        onDragLeave={() => setSurvol(false)}
        onDrop={deposer}
        aria-hidden="true"
      >
        <span className={`${P}__moellon`} />
        <span className={`${P}__trou`}>?</span>
        <span className={`${P}__moellon`} />
      </div>
      <ul className={`${P}__reponses`} aria-label="Glisse ou touche la pierre qui manque">
        {choix.map((c, i) => {
          const faute = fautes.includes(c.cle);
          return (
            <li key={c.cle} className={`${P}__place`} style={{ '--i': i }}>
              <button
                type="button"
                className={`sc-lycee-maths-a__bouton ${P}__bouton${faute ? ' est-fausse' : ''}`}
                onClick={() => choisir(c.cle)}
                disabled={faute}
                draggable={!faute}
                onDragStart={(e) => e.dataTransfer?.setData('text/plain', String(c.cle))}
              >
                <span className={`${P}__libelle`}>{c.libelle}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
