import * as regle from '../../lib/jeux/commeUneImage';
import * as regleCM2 from '../../lib/jeux/sensFigureCM2';
import jeuSimple from './JeuSimple';

/**
 * COMME UNE IMAGE — un jeu du CM1, à l'écran. Toute la règle vit dans `commeUneImage.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'comme-une-image',
  classe: 'jeu--image',
  parNiveau: { CM2: { module: regleCM2, prefixe: 'sens-figure-cm2' } },
});
