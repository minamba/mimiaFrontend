import * as gn from '../../lib/jeux/grandsNombres';
import * as regleCM2 from '../../lib/jeux/nombresCM2';
import jeuSimple from './JeuSimple';

/**
 * LES GRANDS NOMBRES — le coffre du CM1, à l'écran. Le nombre à lire ou à
 * écrire, gros, et trois écritures. Toute la règle vit dans
 * `grandsNombres.js`.
 */
export default jeuSimple({
  module: gn,
  prefixe: 'grands-nombres',
  classe: 'jeu--coffre',
  rendreQuestion: (m) => <p className="grands__nombre">{m.question}</p>,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'nombres-cm2' } },
});
