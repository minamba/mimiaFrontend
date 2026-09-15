/**
 * Les classes, rangées pour une liste de choix.
 *
 * LE GROUPE VIENT DU SERVEUR (`groupe` : « Collège », « Série STMG »…), qui le
 * tient de la même table que le programme de chaque classe. Une liste plate
 * de cinquante classes serait illisible ; regroupées par cycle, les huit
 * séries technologiques se noyaient dans « Lycee ».
 *
 * LES CLASSES DE REGROUPEMENT NE SE CHOISISSENT PAS. « Terminale STMG (tronc
 * commun) » porte des compétences, pas des élèves : le serveur refuse d'y
 * inscrire un enfant. Seule exception, la classe où l'enfant se trouve DÉJÀ —
 * une ancienne « première technologique » sans série —, pour que la liste ne
 * mente pas sur sa classe actuelle le temps que son parent précise la série.
 *
 * @param niveaux la liste du référentiel
 * @param idCourant la classe actuelle de l'enfant, s'il en a une
 * @returns des paires [groupe, classes], dans l'ordre du référentiel
 */
export function grouperClasses(niveaux, idCourant = null) {
  const groupes = new Map();

  (niveaux ?? [])
    .filter((n) => n.selectionnable !== false || String(n.id) === String(idCourant))
    .forEach((niveau) => {
      const groupe = niveau.groupe || niveau.cycle || 'Autres';
      if (!groupes.has(groupe)) groupes.set(groupe, []);
      groupes.get(groupe).push(niveau);
    });

  return [...groupes.entries()];
}

/**
 * Les spécialités de la classe choisie : combien en cocher (3 en première
 * générale, 2 en terminale, 0 ailleurs) et lesquelles proposer. LES DEUX
 * VIENNENT DU SERVEUR, qui ne propose que les spécialités dont le professeur
 * existe.
 */
export function specialitesDeLaClasse(niveaux, id) {
  const niveau = (niveaux ?? []).find((n) => String(n.id) === String(id));
  const nombre = niveau?.nombreSpecialites ?? 0;
  const possibles = nombre > 0 ? niveau?.specialitesPossibles ?? [] : [];

  return { nombre: possibles.length > 0 ? nombre : 0, possibles };
}

/**
 * Coche ou décoche une spécialité. Une case de plus que la classe n'en permet
 * ne se coche pas : en terminale, on garde deux spécialités, pas trois.
 */
export function basculerSpecialite(liste, code, maximum) {
  const actuelles = liste ?? [];

  if (actuelles.includes(code)) return actuelles.filter((c) => c !== code);
  if (actuelles.length >= maximum) return actuelles;

  return [...actuelles, code];
}

/** Ce qu'on envoie au serveur : seulement des spécialités proposées, jamais plus que la classe n'en a. */
export function specialitesAEnvoyer(liste, { nombre, possibles }) {
  const codes = new Set(possibles.map((s) => s.code));
  return (liste ?? []).filter((c) => codes.has(c)).slice(0, nombre);
}

/** Vrai quand la classe choisie est une classe qu'on ne peut plus choisir : la série manque. */
export function serieAPreciser(niveaux, id) {
  const niveau = (niveaux ?? []).find((n) => String(n.id) === String(id));
  return Boolean(niveau && niveau.selectionnable === false);
}
