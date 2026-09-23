import * as regle from '../../lib/jeux/boiteMystere';
import * as regleCM2 from '../../lib/jeux/boiteCM2';
import jeuSimple from './JeuSimple';

/**
 * LE SCHÉMA EN BARRES DU CM2. « De plus que » : deux barres égales, la plus
 * longue porte en plus l'écart. « Fois plus que » : une part pour le moins
 * cher, plusieurs parts égales pour l'autre. L'accolade porte le total ; la
 * part cherchée porte un « ? ».
 */
function Schema({ schema }) {
  const [premier, second] = schema.noms;
  const parts = (n, extra) => (
    <span className="schema__barre">
      {Array.from({ length: n }, (_, i) => <span key={i} className="schema__part">?</span>)}
      {extra != null && <span className="schema__part schema__part--ecart">{extra}</span>}
    </span>
  );
  return (
    <div className="schema" role="img" aria-label={`Un schéma en barres ; ${schema.total} en tout`}>
      <div className="schema__ligne">
        <span className="schema__nom">{premier}</span>
        {schema.sorte === 'plus' ? parts(1, schema.ecart) : parts(schema.fois)}
      </div>
      <div className="schema__ligne">
        <span className="schema__nom">{second}</span>
        {parts(1)}
      </div>
      <p className="schema__total">{`${schema.total}${schema.sorte === 'fois' ? ' €' : ''} en tout`}</p>
    </div>
  );
}

/**
 * LA BOÎTE MYSTÈRE — un jeu du CM1, à l'écran. Toute la règle vit dans
 * `boiteMystere.js` ; au CM2, dans `boiteCM2.js`, qui ajoute le schéma.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'boite-mystere',
  classe: 'jeu--mystere',
  rendreQuestion: (m) => (m.schema
    ? (
      <>
        <p className="texte-a-lire">{m.question}</p>
        <Schema schema={m.schema} />
      </>
    )
    : <p className="grands__nombre">{m.question}</p>),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'boite-cm2' } },
});
