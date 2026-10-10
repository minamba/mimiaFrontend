import * as regle from '../../lib/jeux/poemeTheatreRecit';
import * as regleCM2 from '../../lib/jeux/narrateurCM2';
import jeuSimple from './JeuSimple';
import { pourJeuSimple } from './scenes/primaire-francais';

/**
 * POÈME, THÉÂTRE OU RÉCIT ? — à l'écran. L'extrait garde sa forme, retours
 * à la ligne compris : c'est elle qui donne la réponse. Toute la règle vit
 * dans `poemeTheatreRecit.js` ; la scène (le théâtre, ses rideaux, ses
 * accessoires suspendus), dans `scenes/primaire-francais/Genres.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'poeme-theatre-recit',
  classe: 'jeu--genres',
  ...pourJeuSimple('poeme-theatre-recit'),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'narrateur-cm2' } },
});
