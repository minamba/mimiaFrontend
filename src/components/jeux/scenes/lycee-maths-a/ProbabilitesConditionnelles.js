import {
  Reponses, Texte, ecrire, nombre, sur, useDeroule,
} from './commun';

/**
 * LES CANAUX DES PROBABILITÉS CONDITIONNELLES (09/10/2026). La couverture :
 * des canaux de pierre qui descendent la colline, l'eau qui se partage à
 * chaque vanne entre deux bassins. Un arbre de probabilités, c'est ça : l'eau
 * (la probabilité totale, 1) se partage à chaque embranchement.
 *   - LA QUESTION est sur la margelle du bassin du haut ; dessous, l'arbre en
 *     canaux avec les nombres DONNÉS sur leurs branches (« ? » ailleurs) ;
 *   - LES RÉPONSES sont des vannes de bois : on lève la bonne (`choix`) ;
 *   - APRÈS LA RÉPONSE, l'eau coule dans les bons canaux, toutes les branches
 *     se remplissent, et le calcul s'écrit : P(A ∩ B) = P(A) × P_A(B), la
 *     somme des chemins pour P(B), Bayes, l'indépendance vérifiée…
 */

const P = 'sc-probabilites-conditionnelles';
const f = (x) => ecrire(x, 4);
const NB = '(\\d+(?:,\\d+)?)';

/** L'arbre (s'il y en a un), les chemins à faire couler et les lignes de calcul. */
export function canauxDe(m) {
  const q = String(m.question);
  const b = nombre(m.bonne);
  const proche = (x) => Number.isFinite(x) && Math.abs(x - b) < 0.0051;
  let r;
  switch (m.consigne) {
    case 'intersection':
    case 'totales':
    case 'bayes': {
      r = q.match(new RegExp(`P\\(A\\) = ${NB} ; P_A\\(B\\) = ${NB} ; P_Ā\\(B\\) = ${NB}`));
      if (!r) return null;
      const [pa, pab, pnb] = [nombre(r[1]), nombre(r[2]), nombre(r[3])];
      const arbre = {
        noms: [['A', 'Ā'], ['B', 'B̄']],
        donnes: [[pa, null], [pab, null, pnb, null]],
        tout: [[pa, 1 - pa], [pab, 1 - pab, pnb, 1 - pnb]],
      };
      const ab = pa * pab;
      const nab = (1 - pa) * pnb;
      if (m.consigne === 'intersection') {
        const barre = /P\(Ā ∩ B\)/.test(q);
        const v = barre ? nab : ab;
        if (!proche(v)) return null;
        return {
          arbre,
          chemins: [barre ? 2 : 0],
          lignes: barre
            ? [`P(Ā) = 1 − ${f(pa)} = ${f(1 - pa)}`, `P(Ā ∩ B) = P(Ā) × P_Ā(B) = ${f(1 - pa)} × ${f(pnb)} = ${f(nab)}`]
            : [`P(A ∩ B) = P(A) × P_A(B) = ${f(pa)} × ${f(pab)} = ${f(ab)}`],
        };
      }
      const pb = ab + nab;
      const lignes = [
        `P(A ∩ B) = ${f(pa)} × ${f(pab)} = ${f(ab)}`,
        `P(Ā ∩ B) = ${f(1 - pa)} × ${f(pnb)} = ${f(nab)}`,
        `P(B) = ${f(ab)} + ${f(nab)} = ${f(pb)}`,
      ];
      if (m.consigne === 'totales') return proche(pb) ? { arbre, chemins: [0, 2], lignes } : null;
      if (!proche(ab / pb)) return null;
      return { arbre, chemins: [0, 2], lignes: [...lignes, `P_B(A) = P(A ∩ B) ÷ P(B) = ${f(ab)} ÷ ${f(pb)} ≈ ${m.bonne}`] };
    }
    case 'deux-epreuves': {
      r = q.match(new RegExp(`probabilité de ${NB}`)) ?? q.match(new RegExp(`est ${NB}\\.`));
      if (!r) return null;
      const p = nombre(r[1]);
      const qq = 1 - p;
      const feuilles = [p * p, p * qq, qq * p, qq * qq];
      let chemins;
      let ligne;
      if (/au moins une fois/.test(q)) {
        chemins = [0, 1, 2];
        ligne = `1 − ${f(qq)} × ${f(qq)} = ${f(1 - qq * qq)}`;
      } else if (/exactement une fois/.test(q)) {
        chemins = [1, 2];
        ligne = `${f(p)} × ${f(qq)} + ${f(qq)} × ${f(p)} = ${f(2 * p * qq)}`;
      } else if (/les deux fois/.test(q)) {
        chemins = [0];
        ligne = `${f(p)} × ${f(p)} = ${f(p * p)}`;
      } else return null;
      if (!proche(chemins.reduce((s, i) => s + feuilles[i], 0))) return null;
      return {
        arbre: { noms: [['✓', '✗'], ['✓', '✗']], donnes: [[p, null], [p, null, p, null]], tout: [[p, qq], [p, qq, p, qq]] },
        chemins,
        lignes: [ligne],
      };
    }
    case 'independance': {
      r = q.match(new RegExp(`P\\(A\\) = ${NB} ; P\\(B\\) = ${NB} ; P\\(A ∩ B\\) = ${NB}`));
      if (!r) return null;
      const [pa, pb, pab] = [nombre(r[1]), nombre(r[2]), nombre(r[3])];
      const egal = Math.abs(pa * pb - pab) < 1e-9;
      return { lignes: [`P(A) × P(B) = ${f(pa)} × ${f(pb)} = ${f(pa * pb)}`, egal ? `= P(A ∩ B) : indépendants` : `≠ P(A ∩ B) = ${f(pab)} : pas indépendants`] };
    }
    case 'independance-calcul': {
      r = q.match(new RegExp(`P\\(A\\) = ${NB} et P\\(B\\) = ${NB}`));
      if (!r) return null;
      const [pa, pb] = [nombre(r[1]), nombre(r[2])];
      if (/P\(A ∪ B\)/.test(q)) return { lignes: [`P(A ∩ B) = ${f(pa)} × ${f(pb)} = ${f(pa * pb)}`, `P(A ∪ B) = ${f(pa)} + ${f(pb)} − ${f(pa * pb)} = ${f(pa + pb - pa * pb)}`] };
      return { lignes: ['indépendants : P(A ∩ B) = P(A) × P(B)', `= ${f(pa)} × ${f(pb)} = ${f(pa * pb)}`] };
    }
    case 'inverser': {
      r = q.match(new RegExp(`P\\(A\\) = ${NB} ; P\\(B\\) = ${NB} ; P\\(A ∩ B\\) = ${NB}\\.\\s+P_([AB])\\(`));
      if (!r) return null;
      const [pa, pb, pab] = [nombre(r[1]), nombre(r[2]), nombre(r[3])];
      const condition = r[4] === 'B' ? pb : pa;
      return { lignes: [`P_${r[4]}(${r[4] === 'B' ? 'A' : 'B'}) = P(A ∩ B) ÷ P(${r[4]})`, `= ${f(pab)} ÷ ${f(condition)} ≈ ${m.bonne}`] };
    }
    case 'notation':
      return {
        lignes: /∩/.test(m.bonne)
          ? ['« … et … » : les deux à la fois', `c’est une intersection : ${m.bonne}`]
          : ['« parmi … », « les jours où … » : on sait déjà que c’est réalisé', `la condition passe en indice : ${m.bonne}`],
      };
    default:
      return null;
  }
}

/** L'arbre en canaux : 1 → deux bassins → quatre bassins. */
function Arbre({ arbre, chemins, termine }) {
  const niveau1 = [[130, 46], [130, 134]];
  const feuilles = [[262, 18], [262, 74], [262, 106], [262, 162]];
  const racine = [16, 90];
  const coule = (i) => termine && chemins.includes(i);
  const coule1 = (k) => termine && chemins.some((c) => Math.floor(c / 2) === k);
  const valeur = (n, i) => {
    const v = termine ? arbre.tout[n][i] : arbre.donnes[n][i];
    return v === null || v === undefined ? '?' : f(v);
  };
  return (
    <svg className={`${P}__arbre${termine ? ' est-termine' : ''}`} viewBox="0 0 320 180" aria-hidden="true" focusable="false">
      {niveau1.map(([x, y], k) => (
        <g key={`n${k}`} className={`${P}__branche${coule1(k) ? ' est-pleine' : ''}`}>
          <path d={`M${racine[0]} ${racine[1]} C 70 ${racine[1]}, 70 ${y}, ${x} ${y}`} className={`${P}__lit`} />
          <path d={`M${racine[0]} ${racine[1]} C 70 ${racine[1]}, 70 ${y}, ${x} ${y}`} className={`${P}__eau`} />
          <text x="68" y={(racine[1] + y) / 2 + (k === 0 ? -10 : 20)} textAnchor="middle" className={`${P}__proba`}>{valeur(0, k)}</text>
        </g>
      ))}
      {feuilles.map(([x, y], i) => {
        const [px, py] = niveau1[Math.floor(i / 2)];
        return (
          <g key={`f${i}`} className={`${P}__branche${coule(i) ? ' est-pleine' : ''}`}>
            <path d={`M${px} ${py} C 196 ${py}, 196 ${y}, ${x} ${y}`} className={`${P}__lit`} />
            <path d={`M${px} ${py} C 196 ${py}, 196 ${y}, ${x} ${y}`} className={`${P}__eau`} style={{ animationDelay: '0.9s' }} />
            <text x="206" y={(py + y) / 2 + (i % 2 === 0 ? -6 : 14)} textAnchor="middle" className={`${P}__proba`}>{valeur(1, i)}</text>
          </g>
        );
      })}
      <circle cx={racine[0]} cy={racine[1]} r="9" className={`${P}__source`} />
      {niveau1.map(([x, y], k) => (
        <g key={`b${k}`} className={`${P}__bassin${coule1(k) ? ' est-plein' : ''}`}>
          <ellipse cx={x} cy={y} rx="17" ry="12" />
          <text x={x} y={y + 5} textAnchor="middle">{arbre.noms[0][k]}</text>
        </g>
      ))}
      {feuilles.map(([x, y], i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`p${i}`} className={`${P}__bassin${coule(i) ? ' est-plein' : ''}`}>
          <ellipse cx={x} cy={y} rx="16" ry="11" />
          <text x={x} y={y + 5} textAnchor="middle">{arbre.noms[1][i % 2]}</text>
        </g>
      ))}
    </svg>
  );
}

function Calcul({ lignes }) {
  const n = useDeroule(lignes.length, 900);
  return (
    <ol className={`${P}__calcul`} aria-label="Le calcul">
      {lignes.map((l, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={i < n ? 'est-ecrite' : ''}>{l}</li>
      ))}
    </ol>
  );
}

export function QuestionProbabilitesConditionnelles({ m, termine }) {
  const canaux = sur(() => canauxDe(m));
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__margelle`}>
        <Texte m={m} classe={`${P}__texte`} />
      </div>
      {(canaux?.arbre || (termine && canaux)) && (
        <div className={`${P}__colline`}>
          {canaux.arbre && <Arbre arbre={canaux.arbre} chemins={canaux.chemins} termine={termine} />}
          {termine && <Calcul lignes={canaux.lignes} />}
        </div>
      )}
    </div>
  );
}

/** Les vannes de bois : on lève la bonne. */
export function VannesConditionnelles({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__ecluses`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Lève la bonne vanne"
        decor={() => (
          <>
            <span className={`${P}__montant`} aria-hidden="true" />
            <span className={`${P}__montant ${P}__montant--droit`} aria-hidden="true" />
            <span className={`${P}__chute`} aria-hidden="true" />
          </>
        )}
      />
    </div>
  );
}
