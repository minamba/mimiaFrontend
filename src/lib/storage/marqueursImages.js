/**
 * Les marqueurs `[image:N]` d'un message.
 *
 * LA MÊME RÈGLE QUE LE SERVEUR (`SchoolWebApp.Domain/Emails/MarqueursImages.cs`),
 * qui l'applique quand on retire une image d'un template enregistré. Deux règles
 * différentes finiraient par placer la mauvaise image au mauvais endroit.
 */
const MARQUEUR = /\[image:(\d+)\]/g;

/**
 * Le texte après le retrait de l'image de rang `rang` (à partir de 1) : son
 * marqueur disparaît, ceux des images suivantes reculent d'un rang.
 *
 * Sans cela, retirer la première de trois images laissait `[image:3]` dans le
 * texte alors qu'il n'en restait que deux : la dernière ne s'affichait plus, et
 * la deuxième prenait la place de la première.
 */
export function retirerMarqueurImage(texte, rang) {
  if (!texte) return texte ?? '';

  return texte.replace(MARQUEUR, (marqueur, chiffres) => {
    const n = Number(chiffres);

    if (n === rang) return '';
    return n > rang ? `[image:${n - 1}]` : marqueur;
  });
}
