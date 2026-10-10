import {
  Reponses, Texte, ecrire, nombre, sur, useDeroule,
} from './commun';

/**
 * LE PORT DES MONTGOLFIÈRES DES VARIABLES ALÉATOIRES (09/10/2026). La
 * couverture : un port suspendu dans un ciel violet de coucher de soleil, des
 * montgolfières, des grues de fer qui hissent des caisses.
 *   - LA QUESTION est sur le registre du port (une plaque de cuivre) ;
 *     dessous, la loi de X en montgolfières : chaque ballon porte une valeur
 *     (sa caisse) et sa probabilité (sur l'enveloppe) — un « ? » pour celle
 *     qu'on cherche. Ce ne sont que les données de l'énoncé ;
 *   - LES RÉPONSES sont des caisses pendues aux grues, qui se balancent : on
 *     décroche la bonne (`choix`) ;
 *   - APRÈS LA RÉPONSE, chaque ballon montre son produit x × p, ceux qui
 *     comptent s'allument, et le calcul s'écrit : l'espérance, la probabilité
 *     manquante (la somme vaut 1), la variance, le gain moins la mise…
 */

const P = 'sc-variables-aleatoires';
const f = (x) => ecrire(x, 4);
const par = (x) => (x < 0 ? `(${f(x)})` : f(x));
const somme = (l) => l.reduce((s, x) => s + x, 0);

const lireLigne = (q, titre) => {
  const r = String(q).match(new RegExp(`${titre} : ([^\\n]+)`));
  return r ? r[1].split('|').map((s) => s.trim()) : null;
};

/** La loi de X et l'explication : { ballons: [{ valeur, proba, nom }], lignes, allumes } ou null. */
export function loiDe(m) {
  const q = String(m.question);
  const b = nombre(String(m.bonne).replace(' €', ''));
  const proche = (x) => Number.isFinite(x) && Math.abs(x - b) < 0.006;
  const valeurs = lireLigne(q, 'Valeurs de X');
  const probas = lireLigne(q, 'Probabilités');
  if (valeurs && probas && valeurs.length === probas.length) {
    const ballons = valeurs.map((v, i) => ({ valeur: nombre(v), proba: probas[i] === '?' ? null : nombre(probas[i]) }));
    const connus = ballons.filter((x) => x.proba !== null);
    switch (m.consigne) {
      case 'esperance': {
        const e = somme(ballons.map((x) => x.valeur * x.proba));
        if (!proche(e)) return null;
        return { ballons, produits: true, lignes: ['E(X) = somme des x × p', `= ${ballons.map((x) => `${par(x.valeur)} × ${f(x.proba)}`).join(' + ')}`, `= ${m.bonne}`] };
      }
      case 'manquante': {
        const reste = 1 - somme(connus.map((x) => x.proba));
        if (!proche(reste)) return null;
        return {
          ballons: ballons.map((x) => (x.proba === null ? { ...x, proba: reste, trouve: true } : x)),
          lignes: ['les probabilités font 1 en tout', `1 − (${connus.map((x) => f(x.proba)).join(' + ')}) = ${f(reste)}`],
        };
      }
      case 'variance': {
        const e = nombre((q.match(/E\(X\) = ([−-]?\d+(?:,\d+)?)/) ?? [])[1]);
        const v = somme(ballons.map((x) => x.proba * (x.valeur - e) ** 2));
        if (!proche(v)) return null;
        return { ballons, lignes: ['V(X) = somme des p × (x − E)²', `= ${ballons.map((x) => `${f(x.proba)} × ${par(x.valeur - e)}²`).join(' + ')}`, `= ${m.bonne}`] };
      }
      case 'notations': {
        const r = q.match(/P\(X ([<>≤≥]) ([−-]?\d+)\)/);
        if (!r) return null;
        const seuil = nombre(r[2]);
        const test = {
          '<': (x) => x < seuil, '>': (x) => x > seuil, '≤': (x) => x <= seuil, '≥': (x) => x >= seuil,
        }[r[1]];
        const pris = ballons.filter((x) => test(x.valeur));
        if (!proche(somme(pris.map((x) => x.proba)))) return null;
        return {
          ballons: ballons.map((x) => ({ ...x, allume: test(x.valeur) })),
          lignes: [`les valeurs ${r[1]} ${r[2]} : ${pris.map((x) => f(x.valeur)).join(', ')}`, `${pris.map((x) => f(x.proba)).join(' + ')} = ${m.bonne}`],
        };
      }
      default:
        return null;
    }
  }
  if (m.consigne === 'urne') {
    const r = q.match(/(\d+) boules : (\d+) rouges, (\d+) vertes et (\d+) noires/);
    const g = q.match(/Rouge : on (gagne|perd) (\d+) € ; verte : on (gagne|perd) (\d+) € ; noire : on (gagne|perd) (\d+) €/);
    const cible = nombre((q.match(/P\(X = ([−-]?\d+)\)/) ?? [])[1]);
    if (!r || !g) return null;
    const total = Number(r[1]);
    const ballons = [0, 1, 2].map((i) => ({
      valeur: (g[1 + 2 * i] === 'perd' ? -1 : 1) * Number(g[2 + 2 * i]),
      nombreDe: Number(r[2 + i]),
      nom: ['rouges', 'vertes', 'noires'][i],
      proba: null,
    }));
    const pris = ballons.filter((x) => x.valeur === cible);
    const n = somme(pris.map((x) => x.nombreDe));
    if (!proche(n / total)) return null;
    return {
      ballons: ballons.map((x) => ({ ...x, proba: x.nombreDe / total, allume: x.valeur === cible })),
      avant: ballons,
      lignes: [`X = ${f(cible)} : les boules ${pris.map((x) => x.nom).join(' et ')}`, `${n} sur ${total} : ${n} ÷ ${total} = ${m.bonne}`],
    };
  }
  if (m.consigne === 'gain-net' || m.consigne === 'mise') {
    const lots = [...q.matchAll(/(\d+) € avec une probabilité de (\d+(?:,\d+)?)/g)].map((r) => ({ valeur: Number(r[1]), proba: nombre(r[2]) }));
    if (lots.length === 0) return null;
    const rien = { valeur: 0, proba: 1 - somme(lots.map((x) => x.proba)) };
    const e = somme(lots.map((x) => x.valeur * x.proba));
    const avant = [...lots, { valeur: 0, proba: null }];
    const ballons = [...lots, rien];
    if (m.consigne === 'mise') {
      if (!proche(e)) return null;
      return { ballons, avant, produits: true, lignes: [`E(gain) = ${lots.map((x) => `${x.valeur} × ${f(x.proba)}`).join(' + ')} = ${f(e)} €`, `équitable : la mise vaut l’espérance, ${m.bonne}`] };
    }
    const mise = nombre((q.match(/coûte (\d+(?:,\d+)?) €/) ?? [])[1]);
    if (!proche(e - mise)) return null;
    return { ballons, avant, produits: true, lignes: [`E(gain) = ${lots.map((x) => `${x.valeur} × ${f(x.proba)}`).join(' + ')} = ${f(e)} €`, `moins la mise : ${f(e)} − ${f(mise)} = ${m.bonne}`] };
  }
  if (m.consigne === 'favorable') {
    const faces = {};
    const re = /[Aa]vec un (\d)(?: ou un (\d))?, on (gagne|perd) (\d+) €/g;
    let r = re.exec(q);
    while (r) {
      const v = (r[3] === 'perd' ? -1 : 1) * Number(r[4]);
      faces[r[1]] = v;
      if (r[2]) faces[r[2]] = v;
      r = re.exec(q);
    }
    const sinon = q.match(/sinon, on (gagne|perd) (\d+) €/);
    if (!sinon) return null;
    const vSinon = (sinon[1] === 'perd' ? -1 : 1) * Number(sinon[2]);
    const groupes = new Map();
    for (let k = 1; k <= 6; k += 1) {
      const v = faces[k] ?? vSinon;
      groupes.set(v, (groupes.get(v) ?? 0) + 1);
    }
    const ballons = [...groupes.entries()].map(([valeur, n]) => ({ valeur, proba: n / 6, faces: n }));
    const e = somme(ballons.map((x) => x.valeur * x.proba));
    const sens = e > 1e-9 ? 'Favorable' : e < -1e-9 ? 'Défavorable' : 'Équitable'; // eslint-disable-line no-nested-ternary
    if (!String(m.bonne).startsWith(sens)) return null;
    return {
      ballons,
      avant: ballons.map((x) => ({ ...x, proba: null })),
      lignes: [`E = ${ballons.map((x) => `${par(x.valeur)} × ${x.faces}/6`).join(' + ')}`, `= ${f(e)} € : ${e > 0 ? 'positif, favorable au joueur' : e < 0 ? 'négatif, défavorable au joueur' : 'nul, équitable'}`], // eslint-disable-line no-nested-ternary
    };
  }
  if (m.consigne === 'linearite') {
    const r = q.match(/([EV])\(X\) = ([−-]?\d+)\.\s+[EV]\(([−-]?\d*)X ([+−]) (\d+)\)/);
    if (!r) return null;
    const a = r[3] === '' ? 1 : r[3] === '−' ? -1 : nombre(r[3]); // eslint-disable-line no-nested-ternary
    const c = (r[4] === '+' ? 1 : -1) * Number(r[5]);
    const x = nombre(r[2]);
    if (r[1] === 'E') return { lignes: ['E(aX + b) = a × E(X) + b', `= ${par(a)} × ${par(x)} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${m.bonne}`] };
    return { lignes: ['V(aX + b) = a² × V(X) : b ne change rien', `= ${par(a)}² × ${f(x)} = ${m.bonne}`] };
  }
  return null;
}

const COULEURS = ['#ff7eb6', '#ffb74d', '#7c4dff', '#4dd0e1', '#81c784', '#e57373'];

function Ballons({ ballons, termine, produits }) {
  return (
    <ul className={`${P}__ciel`} aria-label="La loi de X">
      {ballons.map((x, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={`${P}__ballon${x.allume && termine ? ' est-allume' : ''}${x.trouve && termine ? ' est-trouve' : ''}`} style={{ '--i': i, '--teinte': COULEURS[i % COULEURS.length] }}>
          <span className={`${P}__enveloppe`}>
            {x.nombreDe !== undefined && !termine ? `${x.nombreDe} ${x.nom}` : (x.proba === null ? '?' : f(x.proba))}
          </span>
          <span className={`${P}__cordes`} aria-hidden="true" />
          <span className={`${P}__nacelle`}>{`${f(x.valeur)}${x.faces ? ` (${x.faces} face${x.faces > 1 ? 's' : ''})` : ''}`}</span>
          {termine && produits && x.proba !== null && <span className={`${P}__produit`}>{`= ${f(x.valeur * x.proba)}`}</span>}
        </li>
      ))}
    </ul>
  );
}

function Calcul({ lignes }) {
  const n = useDeroule(lignes.length, 900);
  return (
    <ol className={`${P}__registre-calcul`} aria-label="Le calcul">
      {lignes.map((l, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={i < n ? 'est-ecrite' : ''}>{l}</li>
      ))}
    </ol>
  );
}

export function QuestionVariablesAleatoires({ m, termine }) {
  const loi = sur(() => loiDe(m));
  // Avant la réponse : seulement ce que l'énoncé donne (aucune probabilité calculée).
  const avant = loi && (loi.avant ?? loi.ballons?.map((x) => (x.trouve ? { ...x, proba: null } : { ...x, allume: false })));
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__registre`}>
        <span className={`${P}__hublot`} aria-hidden="true" />
        <Texte m={m} classe={`${P}__texte`} />
      </div>
      {loi?.ballons && <Ballons ballons={termine ? loi.ballons : avant} termine={termine} produits={loi.produits} />}
      {termine && loi && <Calcul lignes={loi.lignes} />}
    </div>
  );
}

/** Les caisses pendues aux grues : on décroche la bonne. */
export function CaissesVariables({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__quai`}>
      <span className={`${P}__fleche-grue`} aria-hidden="true" />
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Décroche la bonne caisse"
        decor={() => <span className={`${P}__crochet`} aria-hidden="true" />}
      />
    </div>
  );
}
