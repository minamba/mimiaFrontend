import * as regle from '../../../../lib/jeux/tableauxCM1';
import { rang } from './communs';
import './primaire-maths-b.css';

/**
 * L'ÉTAL DU MARCHÉ — CM1 « Le tableau du marché », CM2 « Tableaux et
 * diagrammes » (09/10/2026). La couverture du CM1 montre une marchande au
 * chapeau de paille devant un grand tableau noir des ventes, des cagettes de
 * fruits étiquetées à la craie, un auvent rayé rouge et blanc ; celle du CM2,
 * des diagrammes holographiques dans le ciel.
 *   - LA QUESTION : le tableau écrit à la craie sous l'auvent qui ondule, les
 *     cagettes de pommes, de poires et de prunes, une abeille qui butine. Au
 *     CM2, le même étal passe en hologramme (`.jeu--niv-cm2`) ;
 *   - LES RÉPONSES : des CAGETTES à étiquette d'ardoise (`objets`) ; au CM2,
 *     les diagrammes proposés sont des écrans ;
 *   - APRÈS LA RÉPONSE : le doigt de craie suit la ligne du fruit et la
 *     colonne du jour jusqu'au croisement ; pour un total, la colonne
 *     s'allume case par case et l'addition s'écrit ; pour « le plus », la
 *     ligne s'allume et le plus grand nombre reçoit son étoile ; pour le bon
 *     diagramme, ses barres montent une à une jusqu'au nombre du tableau.
 */

const capitale = (mot) => mot[0].toUpperCase() + mot.slice(1);

/** Le fruit et le jour dont parle la question (null s'ils n'y sont pas). */
function lireQuestion(question) {
  const q = String(question ?? '');
  const f = regle.FRUITS.findIndex((fr) => q.includes(fr));
  const j = regle.JOURS.findIndex((jour) => q.includes(` ${jour}`));
  return { f: f >= 0 ? f : null, j: j >= 0 ? j : null };
}

/** Le CM2 : une seule ligne de données, celle qu'il faut mettre en diagramme. */
export function Donnees({ m }) {
  return (
    <div className="tableau-jeu__cadre">
      <table className="tableau-jeu">
        <caption>{`${capitale(m.fruit)} vendues au marché`}</caption>
        <thead>
          <tr>{regle.JOURS.map((j) => <th key={j} scope="col">{capitale(j)}</th>)}</tr>
        </thead>
        <tbody>
          <tr>{m.valeurs.map((v, j) => <td key={regle.JOURS[j]}>{v}</td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

/** Un diagramme en barres : une barre par jour, graduée de 0 à 20. */
export function Barres({ valeurs }) {
  const h = (v) => v * 4;
  return (
    <svg className="tableau-jeu__barres" viewBox="0 0 150 110" role="img" aria-label={`Un diagramme : ${valeurs.join(', ')}`}>
      {[0, 5, 10, 15, 20].map((g) => (
        <g key={g}>
          <line x1={22} y1={95 - h(g)} x2={146} y2={95 - h(g)} className="tableau-jeu__grille" />
          <text x={16} y={99 - h(g)} className="tableau-jeu__graduation">{g}</text>
        </g>
      ))}
      {valeurs.map((v, j) => (
        <rect key={regle.JOURS[j]} x={30 + j * 30} y={95 - h(v)} width={20} height={h(v)} rx={3} className="tableau-jeu__barre" />
      ))}
      {regle.JOURS.map((jour, j) => (
        <text key={jour} x={40 + j * 30} y={107} className="tableau-jeu__jour">{jour.slice(0, 2)}</text>
      ))}
    </svg>
  );
}

/**
 * Le classement d'une case une fois la réponse donnée : sur la ligne du fruit,
 * dans la colonne du jour, au croisement, ou la plus grande de la ligne.
 */
function surlignage(m, termine) {
  if (!termine || !m.tableau) return () => '';
  const { f, j } = lireQuestion(m.question);
  const ligne = f !== null ? m.tableau[f] : null;
  const max = ligne ? Math.max(...ligne) : null;
  return (i, k) => {
    const classes = [];
    if (m.consigne === 'lire') {
      if (i === f && (j === null || k <= j)) classes.push('sc-le-diagramme__ligne');
      if (k === j && (f === null || i <= f)) classes.push('sc-le-diagramme__colonne');
      if (i === f && k === j) classes.push('sc-le-diagramme__croisement');
    }
    if (m.consigne === 'total' && k === j) classes.push('sc-le-diagramme__colonne');
    if (m.consigne === 'plus' && i === f) {
      classes.push('sc-le-diagramme__ligne');
      if (ligne[k] === max) classes.push('sc-le-diagramme__etoile');
    }
    return classes.join(' ');
  };
}

/** Le tableau à double entrée : les fruits en lignes, les jours en colonnes. */
export function Tableau({ m, termine = false }) {
  if (m.consigne === 'diagramme') return <Donnees m={m} />;
  const classe = surlignage(m, termine);
  return (
    <div className="tableau-jeu__cadre">
      <table className="tableau-jeu">
        <caption>Fruits vendus au marché</caption>
        <thead>
          <tr>
            <td />
            {regle.JOURS.map((j, k) => <th key={j} scope="col" className={classe(-1, k).includes('colonne') ? 'sc-le-diagramme__entete' : undefined}>{capitale(j)}</th>)}
          </tr>
        </thead>
        <tbody>
          {regle.FRUITS.map((f, i) => (
            <tr key={f}>
              <th scope="row" className={classe(i, -1).includes('ligne') ? 'sc-le-diagramme__entete' : undefined}>{capitale(f)}</th>
              {m.tableau[i].map((v, k) => (
                <td key={regle.JOURS[k]} className={classe(i, k) || undefined} style={classe(i, k) ? rang(i + k) : undefined}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="phrase-a-trou">{m.question}</p>
    </div>
  );
}

/** Ce que montre la preuve, en une phrase : le croisement, l'addition de la colonne, le plus grand. */
function Preuve({ m }) {
  const { f, j } = lireQuestion(m.question);
  if (m.consigne === 'lire' && f !== null && j !== null) {
    return <p className="sc-le-diagramme__verdict">{`Ligne des ${regle.FRUITS[f]}, colonne du ${regle.JOURS[j]} : ${m.bonne}.`}</p>;
  }
  if (m.consigne === 'total' && j !== null) {
    const valeurs = m.tableau.map((l) => l[j]);
    return (
      <p className="sc-le-diagramme__verdict">
        {`Toute la colonne du ${regle.JOURS[j]} : `}
        {valeurs.map((v, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className="sc-le-diagramme__terme" style={rang(i)}>{`${i ? ' + ' : ''}${v}`}</span>
        ))}
        <strong className="sc-le-diagramme__terme" style={rang(valeurs.length)}>{` = ${m.bonne}`}</strong>
      </p>
    );
  }
  if (m.consigne === 'plus' && f !== null) {
    const max = Math.max(...m.tableau[f]);
    return <p className="sc-le-diagramme__verdict">{`Sur la ligne des ${regle.FRUITS[f]}, le plus grand nombre est ${max} : le ${m.bonne}.`}</p>;
  }
  if (m.consigne === 'diagramme') {
    return <p className="sc-le-diagramme__verdict">Chaque barre monte jusqu’au nombre du tableau, jour après jour.</p>;
  }
  return <p className="sc-le-diagramme__verdict">{String(m.bonne)}</p>;
}

/** Le bon diagramme, en grand : chaque barre monte jusqu'au nombre du tableau. */
function GrandDiagramme({ valeurs }) {
  const h = (v) => v * 6;
  const base = 136;
  return (
    <svg className="sc-le-diagramme__grand" viewBox="0 0 220 156" role="img" aria-label={`Le bon diagramme : ${valeurs.join(', ')}`}>
      {[0, 5, 10, 15, 20].map((g) => (
        <g key={g}>
          <line x1={26} y1={base - h(g)} x2={214} y2={base - h(g)} className="sc-le-diagramme__grille" />
          <text x={20} y={base + 4 - h(g)} className="sc-le-diagramme__graduation">{g}</text>
        </g>
      ))}
      {valeurs.map((v, j) => (
        <g key={regle.JOURS[j]} className="sc-le-diagramme__monte" style={rang(j)}>
          <line x1={26} y1={base - h(v)} x2={40 + j * 44} y2={base - h(v)} className="sc-le-diagramme__repere" />
          <rect x={40 + j * 44} y={base - h(v)} width={28} height={h(v)} rx={4} className="sc-le-diagramme__barre" />
          <text x={54 + j * 44} y={base - h(v) - 4} className="sc-le-diagramme__valeur">{v}</text>
        </g>
      ))}
      {regle.JOURS.map((jour, j) => (
        <text key={jour} x={54 + j * 44} y={151} className="sc-le-diagramme__jour">{capitale(jour.slice(0, 3))}</text>
      ))}
    </svg>
  );
}

/** Les cagettes de fruits sous l'étal. */
function Cagettes() {
  return (
    <div className="sc-le-diagramme__cagettes" aria-hidden="true">
      {regle.FRUITS.map((f) => (
        <span key={f} className={`sc-le-diagramme__cagette sc-le-diagramme__cagette--${f}`}>
          <i />
          <b>{capitale(f)}</b>
        </span>
      ))}
    </div>
  );
}

export function QuestionMarche({ m, termine }) {
  return (
    <div className={`sc-le-diagramme${termine ? ' est-termine' : ''}`}>
      <span className="sc-le-diagramme__store" aria-hidden="true" />
      <span className="sc-le-diagramme__abeille" aria-hidden="true"><i /></span>
      {/* Au CM2, des écrans de données flottent dans le ciel (voir le CSS). */}
      <span className="sc-le-diagramme__ecrans" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <div className="sc-le-diagramme__etal">
        <Tableau m={m} termine={termine} />
        {termine && m.consigne === 'diagramme' && m.barres?.juste && <GrandDiagramme valeurs={m.barres.juste} />}
      </div>
      {termine ? <Preuve m={m} /> : <Cagettes />}
    </div>
  );
}

export const SCENE_MARCHE = {
  rendreQuestion: (m, termine) => <QuestionMarche m={m} termine={termine} />,
  // La case, la colonne ou le diagramme allumés, et la phrase, montrent la réponse.
  rendreApres: () => null,
  rendreChoix: (c, m) => (m.consigne === 'diagramme' ? <Barres valeurs={m.barres[c.cle]} /> : c.libelle),
  // Des cagettes à étiquette d'ardoise : `.objet--sc-le-diagramme`.
  objets: 'sc-le-diagramme',
};

