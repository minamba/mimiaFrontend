/**
 * EST-IL PRÊT POUR SON CONTRÔLE ? La pastille, et rien d'autre.
 *
 * POURQUOI LE STATUT N'EST PAS CALCULÉ ICI
 * ---------------------------------------
 * Le serveur l'envoie déjà calculé (`preparation.pretStatut`), et c'est
 * délibéré : la règle mêle un fait que seule l'application connaît — la
 * révision a-t-elle commencé — et un jugement que seul le professeur peut
 * porter. La recomposer à l'écran, c'est accepter qu'un jour la carte et la
 * fiche ne disent plus la même chose.
 *
 * CE QUE CE COMPOSANT GARANTIT
 * ----------------------------
 * Le mot est TOUJOURS écrit, jamais porté par la seule couleur — même règle
 * que sur les états de notions et les barres de progression. Un enfant
 * daltonien lit cette pastille comme les autres, et une capture en noir et
 * blanc reste lisible.
 *
 * Un statut inconnu — un serveur plus ancien, un champ absent — ne rend RIEN
 * plutôt qu'une pastille grise par défaut : mieux vaut une carte sans pastille
 * qu'une pastille qui affirme quelque chose de faux sur un enfant.
 */

/**
 * Les quatre statuts, leur mot et leur couleur.
 *
 * Voulus par Camara le 13/09/2026. « Pas encore commencé » est déduit par le
 * code ; les trois autres sont le verdict du professeur — le pourcentage ne
 * décide jamais, parce qu'il mesure ce qui est acquis sans savoir ce que le
 * contrôle demandera.
 */
export const STATUTS_PRET = {
  'pas-commence': { libelle: 'Révision pas commencée', classe: 'est-pas-commence' },
  'pas-pret': { libelle: 'Pas encore prêt', classe: 'est-pas-pret' },
  bientot: { libelle: 'Bientôt prêt', classe: 'est-bientot' },
  pret: { libelle: 'Prêt pour le contrôle', classe: 'est-pret' },
};

/**
 * `cible` ne change que le mot du verdict « prêt » : sur une épreuve d'examen,
 * « Prêt pour le contrôle » serait faux — et c'est précisément le mot que
 * l'enfant retient.
 */
export default function PastillePret({ statut, titre, cible = 'controle' }) {
  const etat = STATUTS_PRET[statut];
  if (!etat) return null;

  const libelle = statut === 'pret' && cible === 'epreuve' ? 'Prêt pour l’épreuve' : etat.libelle;

  return (
    <span className={`pastille-pret ${etat.classe}`} title={titre || undefined}>
      <span className="pastille-pret__point" aria-hidden="true" />
      {libelle}
    </span>
  );
}
