import { useBandeau } from '../lib/storage/modeTest';

/**
 * LE BANDEAU D'INFORMATION, EN HAUT DE TOUT.
 *
 * « Maintenance dimanche de 8h à 10h », « les cours de SVT sont perturbés,
 * nous travaillons dessus ». Un mot de l'exploitant à ses visiteurs, écrit
 * dans l'administration et affiché en une seconde, sans déploiement.
 *
 * POURQUOI EN HAUT ET NON DANS UNE FENÊTRE
 * ----------------------------------------
 * Une fenêtre modale exige un clic avant de laisser passer : elle transforme
 * une information en péage. Un bandeau se lit en passant, ne bloque rien, et
 * reste là pour celui qui revient dessus. C'est la forme d'un avis, pas d'une
 * question.
 *
 * IL NE SE FERME PAS, ET C'EST DÉLIBÉRÉ
 * -------------------------------------
 * Une croix de fermeture ferait de l'affichage une option du visiteur : celui
 * qui ferme distraitement l'annonce d'une maintenance se présentera pendant la
 * coupure sans savoir pourquoi rien ne marche, et écrira au support. Un
 * bandeau n'est allumé que quand il y a quelque chose à dire — il s'éteint
 * dans l'administration, quand ce n'est plus vrai, pour tout le monde en même
 * temps.
 *
 * IL EST POLI, PAS DISCRET. Il occupe toute la largeur, au-dessus de la barre
 * de navigation, et il défile avec la page : une information de service n'a
 * pas à voler en permanence la place d'un écran de téléphone.
 */
export default function BandeauInfo() {
  const message = useBandeau();

  if (!message) return null;

  return (
    // `role="status"` et non `alert` : un lecteur d'écran doit l'annoncer
    // quand il en a l'occasion, pas interrompre la lecture en cours. Le
    // bandeau informe, il n'y a rien à faire dans la seconde.
    <div className="bandeau-info" role="status">
      <span className="bandeau-info__icone" aria-hidden="true">!</span>

      <p className="bandeau-info__texte">{message}</p>
    </div>
  );
}
