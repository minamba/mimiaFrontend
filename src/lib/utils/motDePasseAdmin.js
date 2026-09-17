/**
 * Les deux champs de mot de passe des fenêtres de l'administration — Camara,
 * le 17/09/2026.
 *
 * POURQUOI UN MODULE À PART PLUTÔT QUE TROIS LIGNES DANS `Admin.js`
 * ---------------------------------------------------------------
 * Ces règles sont courtes mais leurs conséquences ne le sont pas : un champ
 * vide traité comme un mot de passe couperait les sessions d'un parent qu'on
 * venait renommer, et deux saisies différentes poseraient un mot de passe que
 * personne ne connaît — que l'administrateur croit pourtant avoir donné de
 * vive voix. `Admin.js` fait deux mille lignes et ne se rend pas sous Jest ;
 * ici, chaque cas se vérifie pour ce qu'il est.
 */

/**
 * Ce qu'il faut faire des deux champs.
 *
 * VIDE VEUT DIRE « ON N'Y TOUCHE PAS », et c'est le cas le plus fréquent : la
 * fenêtre de modification sert d'abord à corriger un nom mal saisi. Exiger un
 * mot de passe à chaque passage serait absurde ; en poser un par inadvertance
 * déconnecterait le parent sans prévenir.
 *
 * LES ESPACES NE SONT PAS ROGNÉS DU MOT DE PASSE LUI-MÊME. On ne s'en sert que
 * pour décider si le champ est rempli : un mot de passe peut légitimement
 * commencer ou finir par une espace, et le rogner en poserait un autre que
 * celui que l'administrateur a tapé et lira à voix haute.
 *
 * @returns {{ envoyer: boolean, valeur: string|undefined, erreur: string|null }}
 */
export function lireMotDePasse({ motDePasse, confirmation } = {}) {
  const saisi = motDePasse ?? '';

  if (!saisi.trim()) {
    // RIEN À ENVOYER, ET AUCUNE ERREUR : une confirmation laissée pleine
    // pendant qu'on efface le premier champ n'est pas une faute, c'est un
    // changement d'avis.
    return { envoyer: false, valeur: undefined, erreur: null };
  }

  if (saisi !== (confirmation ?? '')) {
    return {
      envoyer: false,
      valeur: undefined,
      erreur: 'Les deux mots de passe ne sont pas identiques.',
    };
  }

  return { envoyer: true, valeur: saisi, erreur: null };
}

/**
 * La fiche SANS les deux champs de mot de passe.
 *
 * Laissés dans la charge, ils partiraient à l'API métier — qui les ignorerait,
 * mais on aurait envoyé un mot de passe en clair à une route qui n'a rien à en
 * faire, et il finirait dans ses journaux.
 */
export function sansMotDePasse(donnees) {
  const { motDePasse, confirmation, ...fiche } = donnees ?? {};
  return fiche;
}
