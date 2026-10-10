import * as fr from '../../lib/jeux/fractionsCM1';
import * as regleCM2 from '../../lib/jeux/fractionsCM2';
import jeuSimple from './JeuSimple';
import { QuestionFractions } from './scenes/primaire-maths-a/SceneFractions';

/**
 * LES FRACTIONS DU CM1 — les parts de pizza au CM1, à l'écran. La fraction ou
 * la quantité, trois réponses. Toute la règle vit dans `fractionsCM1.js`.
 *
 * LA SCÈNE (09/10/2026, `scenes/primaire-maths-a/SceneFractions.js`) : la
 * pizzeria du bord de mer (au CM2, le ciel des disques de verre) — l'ardoise
 * et les données dessinées ; les réponses en pizzas ; après la réponse, les
 * parts se rangent, les bonbons se partagent, les chiffres tombent dans le
 * tableau des dixièmes.
 */
export default jeuSimple({
  module: fr,
  prefixe: 'fractions-cm1',
  classe: 'jeu--pizza',
  rendreQuestion: (m, termine) => <QuestionFractions m={m} termine={termine} />,
  objets: 'sc-fractions-cm1',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'fractions-cm2' } },
});
