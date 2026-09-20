import { Link } from 'react-router-dom';

/**
 * « Voir les contrôles passés » — le jumeau calme de « Ajouter un contrôle ».
 *
 * Voulu par Camara le 20/09/2026 : « à côté du bouton ajouter un contrôle,
 * qu'il y ait un bouton pour voir les contrôles passés, dans le même style,
 * même avec une couleur différente ».
 *
 * MÊME FORME, AUTRE TEINTE. Il porte la classe `.btn-controle` — même
 * pastille, même arrondi, même ombre — et son modificateur ne change que la
 * couleur. Deux boutons de formes différentes côte à côte auraient donné deux
 * niveaux d'importance là où il n'y en a qu'un : ajouter et consulter sont
 * deux gestes ordinaires.
 *
 * LA SARCELLE, ET PAS UNE AUTRE. L'orange dit « contrôle à venir » partout
 * dans l'application ; le corail dit « action principale » ; le violet, les
 * vacances ; l'ambre, les évaluations passées. La sarcelle était la seule
 * teinte de la palette sans sens déjà pris — et, complémentaire de l'orange,
 * elle sépare les deux boutons au premier coup d'œil.
 *
 * UN LIEN, PAS UN BOUTON : il mène à la page dédiée, ouverte sur son onglet
 * « Passés ». Un enfant doit pouvoir l'ouvrir dans un nouvel onglet, et le
 * retour du navigateur doit le ramener à son cours.
 */

/** Une horloge et sa flèche arrière : regarder derrière soi. */
function IconeHistorique() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.2 4.6v4.2h4.2" />
      <path d="M12 7.6V12l3 1.8" />
    </svg>
  );
}

export default function BoutonControlesPasses({ eleveId, libelle = 'Voir les contrôles passés' }) {
  return (
    <Link
      to={`/eleves/${eleveId}/controles?onglet=passes`}
      className="btn-controle btn-controle--passes"
    >
      <span className="btn-controle__icone" aria-hidden="true">
        <IconeHistorique />
      </span>
      {libelle}
    </Link>
  );
}
