/**
 * « Ajouter un contrôle » — le bouton d'entrée de toute la mécanique.
 *
 * EXTRAIT PARCE QU'IL APPARAÎT À QUATRE ENDROITS : l'en-tête de la section
 * d'accueil, sa carte vide, l'en-tête de la page dédiée et sa carte vide. Un
 * bouton recopié quatre fois finit par diverger — et c'est celui-ci qui doit
 * se reconnaître d'un écran à l'autre, puisque c'est toujours le même geste.
 *
 * IL PORTE L'ORANGE DES CONTRÔLES, PAS LE CORAIL DES BOUTONS. Partout
 * ailleurs dans l'application, le corail veut dire « action principale » ;
 * ici, la teinte dit en plus DE QUOI on parle — la même que la case du
 * calendrier, la pastille de la fenêtre et la barre de préparation.
 */

/** Un calendrier et un plus : ce qu'on va faire, et où ça va atterrir. */
function IconeAjout() {
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
      <path d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v3h-15v-3Z" />
      <path d="M4.5 9.5h15v9A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5v-9Z" />
      <path d="M8 3v3M16 3v3" />
      <path d="M12 12.5v5M9.5 15h5" />
    </svg>
  );
}

export default function BoutonAjoutControle({ onClick, libelle = 'Ajouter un contrôle' }) {
  return (
    <button type="button" className="btn-controle" onClick={onClick}>
      <span className="btn-controle__icone" aria-hidden="true">
        <IconeAjout />
      </span>
      {libelle}
    </button>
  );
}
