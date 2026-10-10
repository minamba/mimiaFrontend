import {
  Bulle, Fete, humeurDe, rangee, useDeroule,
} from './communs';
import './ce2-maths.css';

/**
 * LE DIAGRAMME (CE2) — 09/10/2026. La couverture : un garçon qui montre un
 * grand tableau noir où un diagramme en barres est dessiné à la craie, deux
 * lanternes suspendues, des craies et une règle sur la table, un soleil
 * gribouillé dans le coin. La scène :
 *   - LA QUESTION : le diagramme d'origine (gardé), redessiné à la craie sur
 *     le tableau noir — les barres poussent du sol à l'arrivée ; les
 *     lanternes se balancent, le petit soleil de craie tourne ; la craie,
 *     mascotte du jeu, se dandine sur le rebord du tableau ;
 *   - LES RÉPONSES : de petites ardoises suspendues, écrites à la craie ;
 *   - APRÈS LA RÉPONSE : LA CRAIE EXPLIQUE, selon la question —
 *       lire : un trait part du haut de la barre jusqu'à l'axe, « 7 : entre
 *       6 et 8 » ;
 *       le plus : une couronne tombe sur la barre la plus haute ;
 *       combien de plus : le haut de la petite barre est reporté sur la
 *       grande, et l'écart s'allume ;
 *       en tout : les barres se comptent une à une, la somme s'écrit.
 * Les valeurs ne sont écrites qu'après la réponse : les lire sur l'axe est
 * la compétence.
 */

const COULEURS = ['#e76f51', '#f4a261', '#2a9d8f', '#5b6bd6'];
const HAUT = 14;
const y = (v) => 150 - (v / HAUT) * 130;
const xBarre = (i) => 50 + i * 56;

/** Les catégories nommées dans la question, entre guillemets, dans l'ordre. */
export function nommees(m) {
  const trouves = [...String(m.question ?? '').matchAll(/« ([^»]+) »/g)].map((r) => r[1]);
  return trouves.map((n) => m.noms.indexOf(n)).filter((i) => i >= 0);
}

/** Le diagramme : la grille, les barres, l'axe — et le dessin de l'explication. */
export function Barres({ m, termine, pas = 0 }) {
  const cibles = nommees(m);
  const max = m.valeurs.indexOf(Math.max(...m.valeurs));
  const lire = termine && m.sorte === 'lire' && cibles.length > 0 ? cibles[0] : null;
  const ecart = termine && m.sorte === 'difference' && cibles.length > 1 ? { g: cibles[0], p: cibles[1] } : null;
  const terne = (i) => termine && ((m.sorte === 'plus' && i !== max)
    || (m.sorte === 'lire' && lire !== null && i !== lire)
    || (ecart && i !== ecart.g && i !== ecart.p));
  return (
    <svg className="diagramme__dessin" viewBox="0 0 280 190" role="img" aria-label={m.titre}>
      <text x="150" y="12" textAnchor="middle" className="diagramme__titre">{m.titre}</text>
      {Array.from({ length: HAUT / 2 + 1 }, (_, k) => {
        const v = k * 2;
        return (
          <g key={v}>
            <line x1="34" y1={y(v)} x2="270" y2={y(v)} className="diagramme__grille" />
            <text x="28" y={y(v) + 4} textAnchor="end" className="diagramme__graduation">{v}</text>
          </g>
        );
      })}
      {m.valeurs.map((v, i) => {
        const x = xBarre(i);
        const compte = termine && m.sorte === 'total' && pas > i;
        return (
          <g key={m.noms[i]} className={`sc-le-diagramme-ce2__colonne${terne(i) ? ' est-terne' : ''}${compte ? ' est-comptee' : ''}`} style={{ '--i': i }}>
            <rect x={x} y={y(v)} width="36" height={150 - y(v)} rx="3" fill={COULEURS[i]} className="sc-le-diagramme-ce2__barre" />
            <text x={x + 18} y="166" textAnchor="middle" className="diagramme__nom">{m.noms[i]}</text>
            {termine && <text x={x + 18} y={y(v) - 4} textAnchor="middle" className="diagramme__valeur">{v}</text>}
          </g>
        );
      })}
      <line x1="34" y1="150" x2="270" y2="150" className="diagramme__axe" />

      {lire !== null && (
        <g className="sc-le-diagramme-ce2__lecture">
          <line x1={xBarre(lire)} y1={y(m.valeurs[lire])} x2="34" y2={y(m.valeurs[lire])} className="sc-le-diagramme-ce2__trait" />
          <circle cx="34" cy={y(m.valeurs[lire])} r="4" className="sc-le-diagramme-ce2__point" />
        </g>
      )}
      {termine && m.sorte === 'plus' && (
        <g className="sc-le-diagramme-ce2__couronne" style={{ transformOrigin: `${xBarre(max) + 18}px ${y(m.valeurs[max]) - 26}px` }}>
          <path
            d={`M${xBarre(max) + 4} ${y(m.valeurs[max]) - 21} l4 -14 l6 8 l4 -12 l4 12 l6 -8 l4 14 z`}
            className="sc-le-diagramme-ce2__or"
          />
        </g>
      )}
      {ecart && (
        <g className="sc-le-diagramme-ce2__ecart">
          <line x1={xBarre(ecart.p) + 36} y1={y(m.valeurs[ecart.p])} x2={xBarre(ecart.g) + 36} y2={y(m.valeurs[ecart.p])} className="sc-le-diagramme-ce2__trait" />
          <rect
            x={xBarre(ecart.g) - 2}
            y={y(m.valeurs[ecart.g])}
            width="40"
            height={Math.max(0, y(m.valeurs[ecart.p]) - y(m.valeurs[ecart.g]))}
            rx="3"
            className="sc-le-diagramme-ce2__surplus"
          />
        </g>
      )}
    </svg>
  );
}

/** La phrase de l'explication, écrite à la craie sous le diagramme. */
function Explication({ m, pas }) {
  const cibles = nommees(m);
  let texte = null;
  if (m.sorte === 'lire' && cibles.length) {
    const v = m.valeurs[cibles[0]];
    texte = v % 2 ? `La barre s’arrête entre ${v - 1} et ${v + 1} : c’est ${v}.` : `La barre s’arrête sur le trait ${v}.`;
  } else if (m.sorte === 'plus') {
    texte = `La barre la plus haute : ${m.bonne}.`;
  } else if (m.sorte === 'difference' && cibles.length > 1) {
    const [g, p] = cibles;
    texte = `${m.valeurs[g]} − ${m.valeurs[p]} = ${m.valeurs[g] - m.valeurs[p]}`;
  } else if (m.sorte === 'total') {
    const n = m.valeurs.length;
    texte = pas >= n ? `${m.valeurs.join(' + ')} = ${m.bonne}` : `${m.valeurs.slice(0, pas).join(' + ') || 'On compte'} …`;
  }
  if (!texte) return null;
  return <p className="sc-le-diagramme-ce2__explication">{texte}</p>;
}

/** La craie, mascotte du tableau : elle se dandine, saute à la réussite, encourage à l'erreur. */
export function Craie({ humeur }) {
  return (
    <div className={`sc-le-diagramme-ce2__mascotte est-${humeur}`} aria-hidden="true">
      <Bulle humeur={humeur} />
      {humeur === 'fete' && <Fete couleurs={['#ffffff', '#ffd43b', '#74c0fc', '#ff8787']} />}
      <svg className="sc-le-diagramme-ce2__craie" viewBox="0 0 60 100" focusable="false">
        <rect x="14" y="8" width="32" height="78" rx="12" fill="#fdfdf8" stroke="#ced4da" strokeWidth="2" />
        <rect x="14" y="62" width="32" height="24" rx="10" fill="#ffe066" opacity="0.7" />
        <line x1="14" y1="46" x2="2" y2="58" stroke="#fdfdf8" strokeWidth="5" strokeLinecap="round" className="sc-le-diagramme-ce2__bras-g" />
        <line x1="46" y1="46" x2="58" y2="34" stroke="#fdfdf8" strokeWidth="5" strokeLinecap="round" className="sc-le-diagramme-ce2__bras-d" />
        <g className="sc-le-diagramme-ce2__yeux">
          <ellipse cx="24" cy="32" rx="3.4" ry="4.4" fill="#212529" />
          <ellipse cx="36" cy="32" rx="3.4" ry="4.4" fill="#212529" />
          <circle cx="25" cy="30.6" r="1.2" fill="#fff" />
          <circle cx="37" cy="30.6" r="1.2" fill="#fff" />
        </g>
        <circle cx="19" cy="40" r="3" fill="#ffa8a8" />
        <circle cx="41" cy="40" r="3" fill="#ffa8a8" />
        <path d="M24 42 q6 6 12 0" fill="none" stroke="#212529" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="sc-le-diagramme-ce2__poussiere" />
    </div>
  );
}

/** Le décor : les lanternes, le petit soleil de craie, le rebord et ses craies. */
function Decor() {
  return (
    <div className="sc-le-diagramme-ce2__decor" aria-hidden="true">
      <span className="sc-le-diagramme-ce2__lanterne" />
      <span className="sc-le-diagramme-ce2__lanterne sc-le-diagramme-ce2__lanterne--2" />
      <svg className="sc-le-diagramme-ce2__soleil" viewBox="0 0 60 60" focusable="false">
        <circle cx="30" cy="30" r="11" fill="none" stroke="#fff" strokeWidth="2" />
        <path d="M25 28 h0.1 M35 28 h0.1" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="M25 34 q5 4 10 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <g className="sc-le-diagramme-ce2__rayons">
          {rangee(8).map((i) => <line key={i} x1="30" y1="5" x2="30" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45} 30 30)`} />)}
        </g>
      </svg>
      <span className="sc-le-diagramme-ce2__rebord">
        <span className="sc-le-diagramme-ce2__morceau" />
        <span className="sc-le-diagramme-ce2__morceau sc-le-diagramme-ce2__morceau--bleu" />
        <span className="sc-le-diagramme-ce2__brosse" />
      </span>
    </div>
  );
}

/** APRÈS LA RÉPONSE : le tableau rejoue la lecture, pas à pas pour le total. */
function TableauExplique({ m }) {
  const pas = useDeroule(m.sorte === 'total' ? m.valeurs.length : 0, 800, 450);
  return (
    <>
      <Barres m={m} termine pas={pas} />
      <p className="diagramme__question">{m.question}</p>
      <Explication m={m} pas={pas} />
    </>
  );
}

/** LA QUESTION : le diagramme à la craie sur le tableau noir, la question, et la craie. */
export function QuestionDiagramme({ m, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  return (
    <div className={`sc-le-diagramme-ce2 sc-le-diagramme-ce2--${m.sorte}${termine ? ' est-termine' : ''}`}>
      <Decor />
      {termine ? <TableauExplique m={m} /> : (
        <>
          <Barres m={m} termine={false} />
          <p className="diagramme__question">{m.question}</p>
        </>
      )}
      <Craie key={`${humeur}-${extra?.derniereFaute ?? ''}`} humeur={humeur} />
    </div>
  );
}

/**
 * LES RÉPONSES : de petites ardoises suspendues. Chaque ardoise est un bouton
 * à son libellé ; une ardoise fausse est barrée, ternie, et ne se prend plus.
 */
export function ChoixDiagramme({ choix, fautes, choisir }) {
  return (
    <ul className="sc-le-diagramme-ce2__ardoises" aria-label="Choisis ton ardoise">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <span className="sc-le-diagramme-ce2__ficelle" aria-hidden="true" />
            <button type="button" className={`sc-le-diagramme-ce2__ardoise${fausse ? ' est-fausse' : ''}`} onClick={() => choisir(cle)} disabled={fausse}>
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
