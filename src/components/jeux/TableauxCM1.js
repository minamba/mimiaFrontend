import * as regle from '../../lib/jeux/tableauxCM1';
import * as regleCM2 from '../../lib/jeux/tableauxCM2';
import jeuSimple from './JeuSimple';

const capitale = (mot) => mot[0].toUpperCase() + mot.slice(1);

/** Le CM2 : une seule ligne de données, celle qu'il faut mettre en diagramme. */
function Donnees({ m }) {
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
function Barres({ valeurs }) {
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

/** Le tableau à double entrée : les fruits en lignes, les jours en colonnes. */
function Tableau({ m }) {
  if (m.consigne === 'diagramme') return <Donnees m={m} />;
  return (
    <div className="tableau-jeu__cadre">
      <table className="tableau-jeu">
        <caption>Fruits vendus au marché</caption>
        <thead>
          <tr>
            <td />
            {regle.JOURS.map((j) => <th key={j} scope="col">{capitale(j)}</th>)}
          </tr>
        </thead>
        <tbody>
          {regle.FRUITS.map((f, i) => (
            <tr key={f}>
              <th scope="row">{capitale(f)}</th>
              {m.tableau[i].map((v, j) => <td key={regle.JOURS[j]}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="phrase-a-trou">{m.question}</p>
    </div>
  );
}

/**
 * LES TABLEAUX DU CM1 — le diagramme au CM1, à l'écran. Toute la règle vit
 * dans `tableauxCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'tableaux-cm1',
  classe: 'jeu--diagramme',
  rendreQuestion: (m) => <Tableau m={m} />,
  rendreChoix: (c, m) => (m.consigne === 'diagramme' ? <Barres valeurs={m.barres[c.cle]} /> : c.libelle),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'tableaux-cm2' } },
});
