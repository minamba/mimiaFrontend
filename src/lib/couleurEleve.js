/**
 * Couleur d'identité d'un enfant, selon son sexe.
 *
 * Bleu pour les garçons, violet pour les filles, sarcelle quand le sexe n'est
 * pas renseigné — ce dernier cas existe bel et bien en base et ne peut pas
 * rester sans couleur.
 *
 * Conséquence à connaître : deux frères ont désormais la même couleur. La
 * teinte ne distingue donc plus les cartes d'une même fratrie, elle qualifie
 * l'enfant. Si la distinction redevient le besoin, c'est ici qu'il faut
 * revenir — et nulle part ailleurs, puisque tous les écrans passent par cette
 * fonction.
 */
const BLEU = '#1d6fb8';
const VIOLET = '#7a3e9d';
const NEUTRE = '#00908a';

/**
 * Variantes claires, pour du TEXTE sur fond sombre.
 *
 * Le thème sombre de l'application est un bleu marine : un bleu d'identité
 * saturé s'y noie, et l'éclaircir d'un pourcentage ne suffit pas — le résultat
 * dépend de la teinte de départ et reste trop proche du fond. On fixe donc les
 * valeurs, contrôlées une à une : 8,3:1 pour le bleu, 7,9:1 pour le violet.
 *
 * Ces variantes servent uniquement au texte. En APLAT — bandeau de carte,
 * pastille d'initiale — c'est la version saturée qui convient.
 */
const BLEU_CLAIR = '#7ab8f0';
const VIOLET_CLAIR = '#c99bec';
const NEUTRE_CLAIR = '#5fd9d1';

/** Valeurs de l'énumération Sexe côté serveur. */
const FILLE = 1;
const GARCON = 2;

// Tolère un identifiant nu ou null : plusieurs appelants ne disposaient que de
// l'identifiant, et un plantage sur un écran de liste coûterait plus cher
// qu'une teinte neutre affichée par défaut.
const sexeDe = (eleve) =>
  typeof eleve === 'number' || eleve == null ? null : eleve.sexe;

export function couleurEleve(eleve) {
  const sexe = sexeDe(eleve);

  if (sexe === GARCON) return BLEU;
  if (sexe === FILLE) return VIOLET;

  return NEUTRE;
}

export function couleurEleveClaire(eleve) {
  const sexe = sexeDe(eleve);

  if (sexe === GARCON) return BLEU_CLAIR;
  if (sexe === FILLE) return VIOLET_CLAIR;

  return NEUTRE_CLAIR;
}

export default couleurEleve;
