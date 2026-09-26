import { useEffect, useState } from 'react';

/**
 * L'écran est-il étroit ?
 *
 * POURQUOI UN HOOK PLUTÔT QUE DU CSS. Le CSS sait cacher et réarranger ; il ne
 * sait pas rendre un AUTRE balisage. Or c'est ce qu'il faut ici : un tableau de
 * sept colonnes ne se replie pas en carte à coups de `display: block`, il faut
 * une autre structure. Voir `FicheEleve` — le même contenu y est rendu en
 * tableau sur ordinateur et en cartes sur téléphone.
 *
 * ET POURQUOI PAS LES DEUX BALISAGES AVEC L'UN CACHÉ : ce serait doubler le
 * document, donc doubler ce que lisent les lecteurs d'écran et les moteurs, et
 * charger vingt lignes de tableau que personne ne verra.
 *
 * IL SUIT LA ROTATION. Un téléphone tourné franchit le seuil : sans l'écouteur,
 * la page garderait la forme qu'elle avait au chargement — et un parent qui
 * met son téléphone à l'horizontale pour mieux lire resterait en cartes.
 *
 * LA VALEUR EST LUE AVANT LE PREMIER RENDU (fonction d'initialisation) : lue
 * dans un effet, elle aurait laissé passer un premier affichage à la mauvaise
 * forme, visible comme un saut.
 *
 * `window.matchMedia` peut manquer — rendu côté serveur, très vieux
 * navigateur. On répond alors « non », c'est-à-dire la forme la plus riche :
 * un tableau trop large se fait défiler, une carte tronquée ne se répare pas.
 */
export default function useSurMobile(requete) {
  const [surMobile, setSurMobile] = useState(
    () => (typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(requete).matches
      : false),
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const sonde = window.matchMedia(requete);
    const suivre = (e) => setSurMobile(e.matches);

    // Relu à l'abonnement : entre le premier rendu et cet effet, la largeur a
    // pu changer (rotation pendant le chargement, fenêtre redimensionnée).
    setSurMobile(sonde.matches);
    sonde.addEventListener('change', suivre);

    return () => sonde.removeEventListener('change', suivre);
  }, [requete]);

  return surMobile;
}
