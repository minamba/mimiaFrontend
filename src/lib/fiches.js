/**
 * Ce qu'une fiche de révision annonce à l'élève.
 *
 * Deux informations distinctes, à ne pas confondre :
 *
 *   — la NOUVEAUTÉ : « il y a quelque chose à lire ici ». Elle s'éteint dès
 *     que l'élève ouvre la fiche.
 *   — l'ÉTAT : « où j'en suis sur cette notion ». Il ne bouge que lorsque le
 *     professeur réécrit la fiche après une évaluation réussie.
 *
 * Une fiche peut très bien être acquise ET mise à jour, ou en cours et déjà
 * lue. Les deux vivent leur vie.
 */

/**
 * La pastille d'attention, ou null s'il n'y a rien à signaler.
 *
 * DEUX pastilles, et pas une seule.
 * ---------------------------------
 * Ce module n'en portait qu'une, la réécriture, au nom de la rareté : une
 * pastille que presque toutes les cartes arborent n'est plus une pastille.
 * Le raisonnement se tenait, mais il ignorait d'où vient l'élève. La carte de
 * la matière lui annonce « 5 fiches à consulter » — et ce compteur-là, côté
 * serveur, additionne les jamais-lues ET les réécrites. Il arrivait donc sur
 * une page où rien n'était marqué, avec une promesse en tête et aucun moyen
 * de savoir laquelle ouvrir. Une pastille discrète sur cinq cartes vaut mieux
 * qu'une promesse non tenue.
 *
 * Les deux ne pèsent pas pareil, et c'est ce qui sauve la rareté :
 *
 *   — RÉÉCRITE : pastille pleine, la carte prend un liseré. L'élève croyait
 *     la notion connue, le professeur y a remis quelque chose parce qu'il a
 *     rebuté sur le même piège. Ça, il ne peut pas le deviner : c'est le
 *     signal fort.
 *   — JAMAIS OUVERTE : pastille en contour seul, pas de liseré. Il sort de la
 *     séance qui l'a produite, il sait de quoi elle parle — la lire est de la
 *     consolidation. On le lui rappelle, on ne le presse pas.
 */
export function nouveaute(fiche) {
  if (fiche?.miseAJourNonLue) {
    return {
      cle: 'maj',
      libelle: 'Mise à jour',
      titre: 'Le professeur l’a réécrite depuis ta dernière lecture',
    };
  }

  if (fiche?.jamaisLue) {
    return {
      cle: 'neuve',
      libelle: 'À consulter',
      titre: 'Tu ne l’as pas encore ouverte',
    };
  }

  return null;
}

/** L'état de la notion. Toujours présent : une fiche est dans l'un ou l'autre. */
export function etatFiche(fiche) {
  return fiche?.acquise
    ? { cle: 'acquise', libelle: 'Acquise', titre: 'Vérifiée par une évaluation réussie' }
    : {
        cle: 'en-cours',
        libelle: 'En cours',
        titre: 'Notion travaillée, pas encore vérifiée par une évaluation',
      };
}
