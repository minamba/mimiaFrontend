import * as gn from '../../lib/jeux/grandsNombres';
import * as regleCM2 from '../../lib/jeux/nombresCM2';
import jeuSimple from './JeuSimple';
import { QuestionNombres } from './scenes/primaire-maths-a/SceneNombres';

/**
 * LES GRANDS NOMBRES — le coffre du CM1, à l'écran. Le nombre à lire ou à
 * écrire, gros, et trois écritures. Toute la règle vit dans
 * `grandsNombres.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneNombres.js`) :
 * l'observatoire de la couverture — le nombre sur l'écran lumineux, ses
 * classes en accolades, un hibou astronome ; les réponses en plaques
 * d'étoiles ; après la réponse, les classes s'allument une à une.
 */
export default jeuSimple({
  module: gn,
  prefixe: 'grands-nombres',
  classe: 'jeu--coffre',
  rendreQuestion: (m, termine) => <QuestionNombres m={m} termine={termine} />,
  objets: 'sc-grands-nombres',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'nombres-cm2' } },
});
