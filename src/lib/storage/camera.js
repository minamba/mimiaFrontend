/**
 * LA CAMÉRA PILOTÉE À LA VOIX.
 *
 * Dire « Photo » prend le cahier — ou le schéma, ou la copie — en photo sans
 * que l'élève ait à toucher l'écran ni à chercher le bon bouton pendant
 * qu'il tient sa page ouverte d'une main.
 *
 * LE NAVIGATEUR DEMANDE LA PERMISSION LUI-MÊME, TOUJOURS. Impossible à
 * contourner — et heureusement : c'est ce qui garde le geste sous le
 * contrôle de l'élève et de ses parents, pas du code. Ce module ne fait que
 * déclencher cette demande au bon moment, jamais avant qu'on en ait besoin,
 * et jamais sans un clic explicite de l'élève.
 */

export const camera = {
  supporte: Boolean(
    typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia,
  ),

  /**
   * Une caméra est-elle branchée ? Répond SANS demander la permission : la
   * présence d'un périphérique est visible avant tout accord, seul son nom
   * reste caché. Sert à ne proposer le bouton caméra que si l'appareil en a
   * une — pas de bouton mort sur un ordinateur qui n'en a pas.
   */
  async disponible() {
    if (!camera.supporte || !navigator.mediaDevices.enumerateDevices) return false;
    try {
      const peripheriques = await navigator.mediaDevices.enumerateDevices();
      return peripheriques.some((p) => p.kind === 'videoinput');
    } catch {
      return false;
    }
  },

  /**
   * Ouvre le flux vidéo, sans le son : ce n'est pas un appel, seulement une
   * photo à venir.
   *
   * TOUJOURS `environment`, ET TOUJOURS EN `ideal`. Sur téléphone, c'est la
   * caméra arrière — celle qui regarde le cahier, pas l'élève. Sur un
   * ordinateur qui n'a qu'une seule caméra, `ideal` ne fait pas échouer la
   * demande : le navigateur retombe simplement sur celle qu'il a. Pas besoin
   * de deviner le type d'appareil pour choisir entre les deux formes.
   */
  async demarrer() {
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' } },
    });
  },
};
