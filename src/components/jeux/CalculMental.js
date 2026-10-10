import * as regle from '../../lib/jeux/calculMental';
import * as regleCM2 from '../../lib/jeux/operationsCM2';
import jeuSimple from './JeuSimple';
import { ChoixCalcul, QuestionCalcul } from './scenes/primaire-maths-a/SceneCalcul';

/**
 * LE CALCUL MENTAL DU CM1 — la course des tables au CM1, à l'écran. Toute la règle vit dans `calculMental.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneCalcul.js`) : le gué
 * de la couverture — la question sur la grande pierre, les réponses en
 * pierres où sauter ; après la réponse, la grenouille suit la ruse jusqu'au
 * coffre. Au CM2, les îles du ciel, et l'opération qui se pose.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'calcul-mental',
  classe: 'jeu--course',
  rendreQuestion: (m, termine) => <QuestionCalcul m={m} termine={termine} />,
  rendreLesChoix: (props) => <ChoixCalcul {...props} />,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'operations-cm2' } },
});
