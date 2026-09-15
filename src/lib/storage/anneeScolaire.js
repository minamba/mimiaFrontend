/**
 * L'ANNÉE SCOLAIRE EN COURS, CÔTÉ NAVIGATEUR — LE REPLI, PAS LA SOURCE.
 *
 * La source est le serveur (`getAnneeScolaire`, route publique) : c'est lui
 * qui porte la règle avec le référentiel et l'administration. Mais un badge
 * qui resterait vide parce qu'un appel réseau a échoué serait pire qu'un
 * badge calculé ici avec la MÊME règle : la bascule au 1er août, comme
 * `AnneeScolaire.cs` côté serveur. Les deux doivent rester d'accord.
 */

/** L'année civile où commence l'année scolaire qui contient cette date. */
export const debutAnneeScolaire = (date = new Date()) =>
  (date.getMonth() + 1 >= 8 ? date.getFullYear() : date.getFullYear() - 1);

/** « 2026-2027 ». */
export const anneeScolaireCourante = (date = new Date()) => {
  const debut = debutAnneeScolaire(date);
  return `${debut}-${debut + 1}`;
};

/** « Programmes officiels 2026-2027 » — le même libellé que le serveur. */
export const libelleProgrammes = (date = new Date()) =>
  `Programmes officiels ${anneeScolaireCourante(date)}`;
