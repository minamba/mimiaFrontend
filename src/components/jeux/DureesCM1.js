import * as regle from '../../lib/jeux/dureesCM1';
import * as regleCM2 from '../../lib/jeux/dureesCM2';
import jeuSimple from './JeuSimple';
import { ChoixDurees, QuestionDurees } from './scenes/primaire-maths-a/SceneDurees';

/**
 * LES DURÉES DU CM1 — combien de temps ? au CM1, à l'écran. Toute la règle vit dans `dureesCM1.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneDurees.js`) : la gare
 * de la couverture (au CM2, la tour à horloge) — la question sur le tableau
 * des départs, l'horloge du quai, le train ; les réponses en billets à
 * composter ; après la réponse, la frise du temps, que le train parcourt en
 * passant par l'heure pile.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'durees-cm1',
  classe: 'jeu--duree',
  rendreQuestion: (m, termine) => <QuestionDurees m={m} termine={termine} />,
  rendreLesChoix: (props) => <ChoixDurees {...props} />,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'durees-cm2' } },
});
