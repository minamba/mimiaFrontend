import * as regle from '../../lib/jeux/robot';
import * as regleCM2 from '../../lib/jeux/robotCM2';
import jeuSimple from './JeuSimple';
import { SCENE_ROBOT } from './scenes/primaire-maths-b/RobotEtoile';

/**
 * LE ROBOT — à l'écran. Toute la règle vit dans `robot.js` (et `robotCM2.js`
 * au CM2, la boucle). Le plateau, le robot qui rejoue le programme touché
 * (Camara, 22/09/2026), le programme en blocs, le robot compagnon et les
 * cartouches-réponses vivent dans `scenes/primaire-maths-b/RobotEtoile.js`
 * (09/10/2026).
 */
export { chemin } from './scenes/primaire-maths-b/RobotEtoile';

export default jeuSimple({
  module: regle,
  prefixe: 'robot',
  classe: 'jeu--robot',
  ...SCENE_ROBOT,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'robot-cm2' } },
});
