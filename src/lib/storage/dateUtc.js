/**
 * Une date du serveur, lue comme UTC.
 *
 * Les dates d'Entity Framework sortent sans fuseau (« 2026-09-15T12:32:00 »),
 * que le navigateur prendrait pour une heure LOCALE : « Enregistré à 14:32 »
 * s'afficherait alors à 12:32. Une date qui porte déjà son fuseau est gardée
 * telle quelle.
 */
export function dateUtc(valeur) {
  if (!valeur) return null;

  const texte = String(valeur);
  const avecFuseau = /([zZ]|[+-]\d\d:?\d\d)$/.test(texte) ? texte : `${texte}Z`;
  const date = new Date(avecFuseau);

  return Number.isNaN(date.getTime()) ? null : date;
}
