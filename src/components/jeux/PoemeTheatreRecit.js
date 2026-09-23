import * as regle from '../../lib/jeux/poemeTheatreRecit';
import * as regleCM2 from '../../lib/jeux/narrateurCM2';
import jeuSimple from './JeuSimple';

/**
 * POÈME, THÉÂTRE OU RÉCIT ? — à l'écran. L'extrait garde sa forme, retours
 * à la ligne compris : c'est elle qui donne la réponse. Toute la règle vit
 * dans `poemeTheatreRecit.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'poeme-theatre-recit',
  classe: 'jeu--genres',
  rendreQuestion: (m) => <blockquote className="texte-a-lire texte-a-lire--forme">{m.question}</blockquote>,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'narrateur-cm2' } },
});
