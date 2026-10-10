import * as regle from '../../lib/jeux/passeComposeCM1';
import * as regleCM2 from '../../lib/jeux/participeAvoirCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * LE PASSÉ COMPOSÉ AVEC ÊTRE — le sujet qui s’éloigne au CM1, à l'écran.
 * Toute la règle vit dans `passeComposeCM1.js` ; la scène (le tableau des
 * départs, les wagons à atteler), dans `scenes/primaire-francais/PasseCompose.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'passe-compose-cm1',
  classe: 'jeu--sujet',
  ...pourJeuSimple('passe-compose-cm1'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'participe-avoir-cm2' } },
});
