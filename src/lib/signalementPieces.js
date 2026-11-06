/**
 * CE QU'ON PEUT JOINDRE À UN SIGNALEMENT — les mêmes règles que le serveur
 * (`ReglesPieceSignalement`), qui reste seul juge. Vérifier ici évite seulement
 * d'envoyer dix mégaoctets pour se les voir refuser.
 */
export const TAILLE_MAX = 10 * 1024 * 1024;
export const PIECES_MAX = 10;

const EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.pdf', '.txt', '.csv', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.odt', '.ods', '.odp', '.zip',
];

export const ACCEPTE = EXTENSIONS.join(',');

const extension = (nom) => {
  const point = String(nom ?? '').lastIndexOf('.');
  return point < 0 ? '' : String(nom).slice(point).toLowerCase();
};

/** La raison du refus, ou null si le fichier peut partir. */
export function refusPiece(fichier) {
  if (!EXTENSIONS.includes(extension(fichier?.name))) {
    return `« ${fichier?.name} » : ce type de fichier n’est pas accepté.`;
  }

  if (fichier.size === 0) return `« ${fichier.name} » est vide.`;
  if (fichier.size > TAILLE_MAX) return `« ${fichier.name} » dépasse 10 Mo.`;

  return null;
}

/**
 * Ajoute ces fichiers à ceux déjà choisis, sans doublon ni dépassement.
 * Rend la nouvelle liste et les refus à afficher.
 */
export function ajouterAuxPieces(existants, nouveaux, dejaEnvoyes = 0) {
  const liste = [...existants];
  const refus = [];

  Array.from(nouveaux ?? []).forEach((fichier) => {
    const raison = refusPiece(fichier);

    if (raison) {
      refus.push(raison);
    } else if (liste.length + dejaEnvoyes >= PIECES_MAX) {
      refus.push(`Au plus ${PIECES_MAX} fichiers par signalement : « ${fichier.name} » n’a pas été ajouté.`);
    } else if (!liste.some((f) => f.name === fichier.name && f.size === fichier.size)) {
      liste.push(fichier);
    }
  });

  return { liste, refus };
}

export function tailleLisible(octets) {
  if (octets >= 1024 * 1024) return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
  return `${Math.max(1, Math.round(octets / 1024))} Ko`;
}
