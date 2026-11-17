import { useEffect, useRef } from 'react';

/**
 * COLLER UNE CAPTURE AU LIEU DE L'ENREGISTRER — Camara, le 11/11/2026 : « j'ai copié une image mais je ne peux pas
 * la coller directement, je dois d'abord l'enregistrer et l'importer, c'est chiant quand on veut aller vite ».
 *
 * Ctrl+V (ou Cmd+V) n'importe où dans le formulaire ouvert : les fichiers du presse-papiers rejoignent les pièces.
 *
 * LE TEXTE GARDE LA PRIORITÉ DANS UN CHAMP DE TEXTE : Word, Excel ou une page web copient AUSSI une image de ce qu'on
 * a sélectionné. Coller un paragraphe dans la description ne doit pas joindre une image en plus. Une capture
 * d'écran, elle, n'a pas de texte : elle part toujours en pièce.
 */

const EXTENSION_DU_TYPE = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
};

const deux = (n) => String(n).padStart(2, '0');

/**
 * Un nom lisible et unique : toutes les captures arrivent nommées « image.png », et la liste les prendrait pour des
 * doublons. Un fichier copié depuis l'explorateur garde son vrai nom.
 */
export function nommerFichierColle(fichier, rang = 0, maintenant = new Date()) {
  const nom = fichier?.name ?? '';
  const generique = !nom || /^image\.\w+$/i.test(nom);
  if (!generique) return fichier;

  const extension = EXTENSION_DU_TYPE[fichier.type] ?? (nom.match(/\.\w+$/)?.[0] ?? '');
  const horodatage = `${maintenant.getFullYear()}${deux(maintenant.getMonth() + 1)}${deux(maintenant.getDate())}`
    + `-${deux(maintenant.getHours())}${deux(maintenant.getMinutes())}${deux(maintenant.getSeconds())}`;
  const suffixe = rang > 0 ? `-${rang + 1}` : '';

  return new File([fichier], `capture-${horodatage}${suffixe}${extension}`, {
    type: fichier.type,
    lastModified: fichier.lastModified ?? maintenant.getTime(),
  });
}

/** Les fichiers d'un évènement « coller », renommés. */
export function fichiersDuPressePapier(donnees, maintenant = new Date()) {
  if (!donnees) return [];

  const depuisFiles = Array.from(donnees.files ?? []);
  const fichiers = depuisFiles.length > 0
    ? depuisFiles
    : Array.from(donnees.items ?? [])
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean);

  return fichiers.map((fichier, rang) => nommerFichierColle(fichier, rang, maintenant));
}

const estChampDeTexte = (cible) => {
  if (!cible) return false;
  if (cible.isContentEditable) return true;
  const balise = cible.tagName;
  if (balise === 'TEXTAREA') return true;
  return balise === 'INPUT' && !['file', 'checkbox', 'radio', 'button', 'submit'].includes(cible.type);
};

/** Faut-il prendre ces fichiers, ou laisser le texte se coller dans le champ ? */
export function prendreLesFichiers(donnees, cible) {
  const texte = donnees?.getData?.('text/plain') ?? '';
  return !(estChampDeTexte(cible) && texte.trim().length > 0);
}

/**
 * Écoute Ctrl+V tant que `actif` est vrai, et passe les fichiers collés à `surFichiers`. Le texte ordinaire se colle
 * comme d'habitude.
 */
export function useCollerFichiers(actif, surFichiers) {
  const rappel = useRef(surFichiers);
  rappel.current = surFichiers;

  useEffect(() => {
    if (!actif) return undefined;

    const coller = (evenement) => {
      const donnees = evenement.clipboardData;
      const fichiers = fichiersDuPressePapier(donnees);
      if (fichiers.length === 0 || !prendreLesFichiers(donnees, evenement.target)) return;

      evenement.preventDefault();
      rappel.current(fichiers);
    };

    document.addEventListener('paste', coller);
    return () => document.removeEventListener('paste', coller);
  }, [actif]);
}

/**
 * LE BOUTON « COLLER » — pour qui ne pense pas à Ctrl+V, et sur téléphone. Lit le presse-papiers par l'API du
 * navigateur (qui demande la permission la première fois). Rend [] si rien d'utilisable, ou si le navigateur refuse.
 */
export async function lirePressePapier(maintenant = new Date()) {
  if (!navigator.clipboard?.read) return [];

  const elements = await navigator.clipboard.read();
  const fichiers = [];

  for (const element of elements) {
    const type = element.types.find((t) => t.startsWith('image/') || t === 'application/pdf');
    if (type) {
      // eslint-disable-next-line no-await-in-loop
      const contenu = await element.getType(type);
      fichiers.push(new File([contenu], 'image' + (EXTENSION_DU_TYPE[type] ?? ''), { type }));
    }
  }

  return fichiers.map((fichier, rang) => nommerFichierColle(fichier, rang, maintenant));
}

export const collerDisponible = () => typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.read);
