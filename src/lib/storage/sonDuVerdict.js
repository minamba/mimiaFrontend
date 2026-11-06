import { bruitage } from '../jeux/bruitages';

/**
 * LE SON DU VERDICT — Camara, le 04/11/2026 : « quand la bonne prononciation arrive, le son des
 * bonnes réponses dans les jeux ; pareil pour la mauvaise, le son des mauvaises réponses ».
 *
 * SANS CASQUE, LE MICRO ENTEND LE HAUT-PARLEUR. Pris pour une voix, ce son deviendrait un tour
 * de parole, et ce tour annulerait la réponse du professeur en train d'arriver. Le micro est
 * donc sourd le temps du son, comme pendant que le professeur parle. Il ne se rouvre pas si
 * le professeur a pris la parole entre-temps, ni si l'élève est en train de taper : leur
 * surdité à eux continue.
 *
 * Le bouton qui coupe le son du cours coupe aussi celui-ci.
 */

/** bad.mp3 dure 1,2 s et good.mp3 1,6 s : la marge laisse la fin du son s'éteindre. */
export const SURDITE_MS = 1900;

export function jouerSonDuVerdict({
  juste, muet = false, sansCasque = false, ecoute = null, professeurParle = () => false, eleveTape = () => false,
}) {
  if (muet) return;

  if (sansCasque && ecoute?.suspendre) {
    ecoute.suspendre(true, false);

    setTimeout(() => {
      if (!professeurParle()) ecoute.suspendre(eleveTape());
    }, SURDITE_MS);
  }

  bruitage(juste ? 'bonne' : 'mauvaise');
}
