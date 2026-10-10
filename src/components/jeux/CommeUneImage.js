import * as regle from '../../lib/jeux/commeUneImage';
import * as regleCM2 from '../../lib/jeux/sensFigureCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * COMME UNE IMAGE — un jeu du CM1, à l'écran. Toute la règle vit dans
 * `commeUneImage.js` ; la scène (le viseur du poète, les photos sur le fil),
 * dans `scenes/primaire-francais/Image.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'comme-une-image',
  classe: 'jeu--image',
  ...pourJeuSimple('comme-une-image'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'sens-figure-cm2' } },
});
