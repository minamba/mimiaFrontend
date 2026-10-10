import './primaire-francais.css';
import accords from './Accords';
import complements from './Complements';
import genres from './Genres';
import homophones from './Homophones';
import image from './Image';
import liaison from './Liaison';
import passeCompose from './PasseCompose';
import phrases from './Phrases';
import pronom from './Pronom';
import temps from './Temps';
import vocabulaire from './Vocabulaire';

/**
 * LES SCÈNES DES JEUX DE FRANÇAIS DU CM1 ET DU CM2 (09/10/2026) — un univers
 * par jeu, repris de sa couverture. Ces jeux ne passent pas par le registre
 * des scènes du collège (`scenes/index.js`) : chaque écran (`AQuiLePronom.js`,
 * `AccordsCM1.js`…) prend la sienne ici, par la clé de son module du CM1, et
 * la confie à `jeuSimple`. Une scène sert les deux classes de l'écran.
 *
 * Une scène : { question(m, termine, extra), apres?(m), objets?, choix?({ m, choix, fautes, choisir, objet }) }.
 */
export const SCENES = {
  'a-qui-le-pronom': pronom,
  'accords-cm1': accords,
  'comme-une-image': image,
  'complements-cm1': complements,
  'homophones-cm1': homophones,
  'mots-de-liaison': liaison,
  'passe-compose-cm1': passeCompose,
  'phrases-cm1': phrases,
  'poeme-theatre-recit': genres,
  'temps-cm1': temps,
  'vocabulaire-cm1': vocabulaire,
};

/** Une scène, dans les mots de `jeuSimple`. */
export function pourJeuSimple(cle) {
  const scene = SCENES[cle];
  return {
    rendreQuestion: scene.question,
    rendreApres: scene.apres,
    objets: scene.objets,
    rendreLesChoix: scene.choix,
  };
}
