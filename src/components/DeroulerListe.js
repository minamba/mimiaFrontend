/**
 * Le pied d'un historique servi par tranches.
 *
 * LE PROBLÈME QU'IL RÉSOUT
 * -----------------------
 * La fiche d'un enfant montrait ses évaluations et ses séances jusqu'à un
 * plafond de vingt. Deux défauts en un : les points fragiles, qui sont la
 * raison d'être de cette page, se retrouvaient à vingt lignes de fond de
 * page ; et au-delà de vingt, l'historique était TRONQUÉ SANS LE DIRE — le
 * parent d'un élève qui a passé soixante évaluations en voyait vingt et
 * croyait les avoir toutes vues.
 *
 * Dix lignes, puis le serveur en sert dix de plus à la demande. Le compte
 * « 10 sur 214 » dit ce qu'on ne voit pas encore ; c'est lui qui distingue
 * cet écran-ci de celui d'avant.
 *
 * POURQUOI « VOIR PLUS » ET NON DES PAGES NUMÉROTÉES
 * ------------------------------------------------
 * Un parent lit du plus récent vers le plus ancien et s'arrête quand il a
 * trouvé. Le déroulé suit ce geste et garde sous les yeux ce qu'il a déjà
 * lu ; des pages numérotées le lui retirent à chaque clic, et « page 3 sur
 * 14 » ne veut rien dire quand on cherche « la semaine dernière ».
 *
 * POURQUOI PAS DE « TOUT AFFICHER »
 * --------------------------------
 * Il y en avait un tant que la liste tenait déjà en mémoire. Maintenant que
 * chaque tranche est un aller-retour, ce bouton demanderait vingt requêtes
 * d'un coup pour poser deux cents lignes dans une page — beaucoup de travail
 * pour un écran que personne ne lit en entier.
 *
 * POURQUOI IL NE POSSÈDE PAS LA LISTE
 * ----------------------------------
 * On aurait voulu un composant qui enveloppe les lignes et se charge de tout.
 * Impossible ici : les deux listes sont des tableaux, et le bouton doit sortir
 * du `<tbody>` — un `<div>` entre `<tbody>` et `<table>` est du HTML invalide
 * que le navigateur ré-arrange. Le composant ne rend donc que le pied.
 */
export default function DeroulerListe({
  visibles,
  total,
  nom,
  pas = 10,
  encore,
  chargement,
  erreur,
  onPlus,
}) {
  // Ce qui décide, c'est le curseur du serveur — `encore` — et non un calcul
  // sur le total. Le total est un compte pris au moment de la requête ; si
  // l'enfant termine une séance entre deux clics, il ne colle plus au nombre
  // de lignes réellement servies, et un pied déduit de lui proposerait de
  // charger une suite qui n'existe pas.
  if (!encore && !erreur) return null;

  const restants = Math.max(0, total - visibles);

  return (
    <div className="derouler">
      <button
        type="button"
        className="btn-ghost btn-ghost--mini"
        onClick={onPlus}
        disabled={chargement}
      >
        {/* Le bouton dit COMBIEN il reste : « Voir 10 séances de plus »
            permet de décider si ça vaut le clic, « Voir plus » ne le
            permet pas. */}
        {chargement
          ? 'Chargement…'
          : `Voir ${restants > 0 && restants < pas ? restants : pas} ${nom} de plus`}
      </button>

      {erreur && <span className="derouler__erreur">{erreur}</span>}

      <span className="derouler__compte">
        {visibles} sur {total}
      </span>
    </div>
  );
}
