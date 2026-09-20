import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * REVENIR LÀ D'OÙ L'ON EST PARTI, ET PAS EN HAUT DE LA PAGE.
 *
 * Camara, le 20/09/2026 : « quand je clique sur voir mes contrôles passés et
 * que je clique sur le bouton de retour, il me renvoie tout en haut de la page
 * au lieu de me renvoyer sur la section Mes contrôles » — et la même chose en
 * revenant du détail d'une épreuve d'examen. Ces deux sections vivent en bas
 * d'une page longue : remonter tout en haut oblige à refaire le chemin à
 * chaque aller-retour.
 *
 * POURQUOI PAS LE RETOUR DU NAVIGATEUR. Un lien de retour est une navigation
 * NEUVE, pas un retour en arrière : le navigateur n'a aucune position à
 * restaurer. Et même en passant par l'historique, il restaurerait une position
 * mesurée sur une page encore vide — les cartes de matières, les contrôles et
 * l'examen arrivent chacun de leur requête, et la page grandit sous nos pieds.
 * L'ancre survit à tout cela, et à un rafraîchissement.
 *
 * ON ATTEND QUE LA SECTION EXISTE. Au premier rendu, la page ne porte que son
 * squelette ; la section demandée n'apparaît qu'une fois ses données revenues.
 * On la cherche donc à chaque image pendant trois secondes, puis on renonce.
 *
 * ET ON REPASSE DEUX FOIS. Trouvée, la section peut encore se déplacer : ce
 * qui la précède finit de charger et la pousse vers le bas. Deux rappels
 * espacés rattrapent ce glissement sans donner de saccade.
 *
 * L'ENFANT GARDE LA MAIN : dès qu'il fait défiler lui-même, on abandonne.
 * Rien n'est plus désagréable qu'une page qui se recale sous le doigt.
 */
const DELAI_MAX = 3000;
const RAPPELS = [150, 500];

export default function useAncreSection() {
  const { hash } = useLocation();

  useEffect(() => {
    const id = hash.replace(/^#/, '');
    if (!id) return undefined;

    let arrete = false;
    const minuteurs = [];

    const renoncer = () => { arrete = true; };
    window.addEventListener('wheel', renoncer, { passive: true, once: true });
    window.addEventListener('touchstart', renoncer, { passive: true, once: true });
    window.addEventListener('keydown', renoncer, { once: true });

    const aller = () => {
      if (arrete) return;
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    };

    const debut = Date.now();

    const chercher = () => {
      if (arrete) return;

      if (document.getElementById(id)) {
        aller();
        RAPPELS.forEach((delai) => minuteurs.push(setTimeout(aller, delai)));
        return;
      }

      if (Date.now() - debut < DELAI_MAX) requestAnimationFrame(chercher);
    };

    chercher();

    return () => {
      arrete = true;
      minuteurs.forEach(clearTimeout);
      window.removeEventListener('wheel', renoncer);
      window.removeEventListener('touchstart', renoncer);
      window.removeEventListener('keydown', renoncer);
    };
  }, [hash]);
}
