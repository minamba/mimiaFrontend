import * as regle from '../../lib/jeux/mesuresCM1';
import * as regleCM2 from '../../lib/jeux/longueursCM2';
import jeuSimple from './JeuSimple';
import { QuestionMesures } from './scenes/primaire-maths-a/SceneMesures';

/**
 * LES MASSES ET LES CONTENANCES DU CM1 — le mètre ruban au CM1, à l'écran. Toute la règle vit dans `mesuresCM1.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneMesures.js`) : la
 * fontaine de la couverture — l'étiquette de la question, le poteau des
 * unités, la balance ou le pichet qui verse (au CM2, le mètre ruban et son
 * escargot) ; les réponses en étiquettes ; après la réponse, le tableau de
 * conversion où la virgule saute d'une colonne à l'autre.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'mesures-cm1',
  classe: 'jeu--ruban',
  rendreQuestion: (m, termine) => <QuestionMesures m={m} termine={termine} />,
  objets: 'sc-mesures-cm1',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'longueurs-cm2' } },
});
