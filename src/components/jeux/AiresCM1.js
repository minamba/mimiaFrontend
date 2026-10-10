import * as regle from '../../lib/jeux/airesCM1';
import * as regleCM2 from '../../lib/jeux/airesCM2';
import jeuSimple from './JeuSimple';
import { QuestionAires } from './scenes/primaire-maths-a/SceneAires';

/**
 * LES AIRES DU CM1 — le tour du jardin au CM1, à l'écran. La figure est
 * dessinée ; le rectangle se dit en mots. Toute la règle vit dans
 * `airesCM1.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneAires.js`) : le jardin
 * de la couverture autour du quadrillage d'origine (qui y a déménagé, mêmes
 * classes), la parcelle et ses côtés gradués ; au CM2, la terrasse et son
 * rectangle de lumière. Les réponses en pancartes ; après la réponse, le
 * gazon se pose carreau par carreau, et le compte monte.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'aires-cm1',
  classe: 'jeu--jardin',
  rendreQuestion: (m, termine) => <QuestionAires m={m} termine={termine} />,
  objets: 'sc-aires-cm1',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'aires-cm2' } },
});
