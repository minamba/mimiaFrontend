import * as regle from '../../lib/jeux/suiteQuiContinue';
import jeuSimple from './JeuSimple';
import { ChoixSuite, QuestionSuite } from './scenes/primaire-maths-a/SceneSuite';

/**
 * LA SUITE QUI CONTINUE — un jeu du CM1, à l'écran. Toute la règle vit dans `suiteQuiContinue.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneSuite.js`) : l'escalier
 * de la couverture — chaque terme sur sa marche, la dernière vide ; les
 * réponses en pierres à poser ; après la réponse, la règle s'écrit pas à pas,
 * la pierre se pose et la coccinelle grimpe jusqu'au portail.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'suite-qui-continue',
  classe: 'jeu--suite',
  rendreQuestion: (m, termine) => <QuestionSuite m={m} termine={termine} />,
  rendreLesChoix: (props) => <ChoixSuite {...props} />,
});
