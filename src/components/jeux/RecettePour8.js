import * as regle from '../../lib/jeux/recettePour8';
import * as regleCM2 from '../../lib/jeux/recetteCM2';
import jeuSimple from './JeuSimple';
import { QuestionRecette } from './scenes/primaire-maths-a/SceneRecette';

/**
 * LA RECETTE POUR 8 — un jeu du CM1, à l'écran. Toute la règle vit dans `recettePour8.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneRecette.js`) : la
 * cuisine de la couverture (au CM2, le circuit) — l'ardoise, l'ingrédient,
 * les tablées, le fouet qui tourne ; les réponses en bocaux (oui ou non : les
 * buzzers communs) ; après la réponse, les invités se regroupent et chaque
 * groupe reçoit sa part.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'recette-pour-8',
  classe: 'jeu--recette',
  rendreQuestion: (m, termine) => <QuestionRecette m={m} termine={termine} />,
  objets: 'sc-recette-pour-8',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'recette-cm2' } },
});
