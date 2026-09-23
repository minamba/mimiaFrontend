import * as regle from '../../lib/jeux/suiteQuiContinue';
import jeuSimple from './JeuSimple';

/**
 * LA SUITE QUI CONTINUE — un jeu du CM1, à l'écran. Toute la règle vit dans `suiteQuiContinue.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'suite-qui-continue',
  classe: 'jeu--suite',
  rendreQuestion: (m) => <p className="grands__nombre">{m.question}</p>,
});
