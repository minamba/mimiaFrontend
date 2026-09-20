/**
 * Une durée en secondes, écrite À LA SECONDE PRÈS : « 49 min 54 s »,
 * « 1 h 05 min 32 s », « 12 s ».
 *
 * POURQUOI PAS `enHeures` DU TABLEAU : lui arrondit à la minute, ce qui va
 * pour un forfait. Le temps réellement passé en cours, lui, se compare au
 * coût de la même fenêtre — Camara le veut « à la seconde près ».
 *
 * Les unités nulles en tête disparaissent (« 12 s » plutôt que « 0 h 00 min
 * 12 s ») ; celles du milieu restent, sur deux chiffres, pour que les lignes
 * du tableau s'alignent.
 */
export function aLaSeconde(secondes) {
  const total = Math.max(0, Math.round(Number(secondes) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const deux = (n) => String(n).padStart(2, '0');

  if (h > 0) return `${h} h ${deux(m)} min ${deux(s)} s`;
  if (m > 0) return `${m} min ${deux(s)} s`;
  return `${s} s`;
}
