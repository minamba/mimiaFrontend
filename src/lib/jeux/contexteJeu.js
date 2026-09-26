import { createContext, useContext } from 'react';
import { TRANQUILLE } from './coeurs';

/**
 * CE QUE LE JEU OUVERT SAIT DE LUI-MÊME : sa clé de catalogue et la classe
 * pour laquelle il tourne.
 *
 * UN CONTEXTE, ET NON DES PARAMÈTRES PASSÉS DE MAIN EN MAIN
 * ---------------------------------------------------------
 * Le record a besoin de deux choses que la page connaît et que les jeux
 * ignorent. Les faire descendre en paramètres obligerait à toucher la
 * signature de vingt-trois composants — dont plusieurs ne sont que des
 * aiguilleurs qui relaient `...props` vers un autre écran. Chaque ajout
 * serait une occasion d'oublier un fichier, et l'oubli ne se verrait pas :
 * le record manquerait sur un jeu, en silence.
 *
 * Le contexte pose la donnée une fois, au-dessus du jeu, et l'écran de fin la
 * ramasse là où il en a besoin. Un nouveau jeu en hérite sans rien déclarer.
 *
 * IL PORTE AUSSI LE MODE DE JEU depuis le 25/09/2026 : « tranquille » ou
 * « défi », choisi par l'enfant à l'ouverture, et le nombre de cœurs qui va
 * avec. Même raison qu'au-dessus — la barre de cœurs s'affiche dans vingt-deux
 * écrans qui n'ont pas à savoir d'où vient le réglage.
 *
 * ET `rejouerPartie` : perdre tous ses cœurs doit pouvoir relancer le jeu, or
 * aucun écran ne sait se remettre à zéro de l'extérieur. La page, elle, n'a
 * qu'à changer la clé React du jeu — il repart neuf, graine comprise.
 *
 * ET `terminerDefi` (26/09) : au dernier cœur, la barre de cœurs prévient la
 * page, qui démonte le jeu et affiche la fin du défi à sa place. Démonter est
 * ce qui arrête vraiment le jeu — sa question suivante et sa voix avec.
 *
 * VIDE PAR DÉFAUT, ET C'EST UTILE : l'aperçu des jeux côté parent n'installe
 * pas ce contexte. Sans clé, rien n'est enregistré — un parent qui essaie un
 * jeu ne touche pas au record de son enfant — et sans mode, aucun cœur ne
 * s'affiche.
 */
const ContexteJeu = createContext({
  jeuCle: '',
  niveau: '',
  mode: TRANQUILLE,
  coeursMax: 0,
  rejouerPartie: () => {},
  terminerDefi: () => {},
});

export const FournirJeu = ContexteJeu.Provider;

export function useJeuOuvert() {
  return useContext(ContexteJeu);
}
