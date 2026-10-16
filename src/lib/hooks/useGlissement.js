import { useRef } from 'react';

/** Le doigt doit parcourir au moins cette distance… */
const SEUIL = 60;
/** …nettement plus en largeur qu'en hauteur : sinon c'est la page qu'on fait défiler. */
const DOMINANCE = 1.5;
/** Un glissement est un geste vif ; un doigt posé longtemps lit, sélectionne ou hésite. */
const DUREE_MAX = 800;

/** Le doigt est-il posé dans un bloc qui défile lui-même en largeur (un tableau large) ? */
function defileEnLargeur(element, borne) {
  for (let n = element; n && n !== borne; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth + 1) {
      const debord = window.getComputedStyle(n).overflowX;
      if (debord === 'auto' || debord === 'scroll') return true;
    }
  }
  return false;
}

/**
 * GLISSER POUR CHANGER DE FICHE — Camara, le 16/10/2026 : « sur mobile, qu'on
 * puisse swiper pour passer d'une fiche à l'autre, qu'on ne soit pas obligé de
 * cliquer sur les boutons ».
 *
 * Doigt vers la gauche : la suivante (on tourne la page) ; vers la droite : la
 * précédente. Au TOUCHER seulement — à la souris, glisser sélectionne du texte.
 *
 * Ce qui n'est PAS un glissement : un geste surtout vertical (la lecture fait
 * défiler la fiche), un geste à deux doigts ou une page zoomée (on s'y
 * déplace), un geste parti d'un bloc qui défile lui-même en largeur.
 *
 * Les rappels sont relus à chaque geste : le parent peut les recréer à chaque
 * rendu sans que rien ne se rebranche.
 */
export default function useGlissement({ onVersLaGauche = null, onVersLaDroite = null }) {
  const depart = useRef(null);
  const rappels = useRef({});
  rappels.current = { onVersLaGauche, onVersLaDroite };

  return {
    onTouchStart(e) {
      depart.current = null;
      if (e.touches.length !== 1) return;
      if ((window.visualViewport?.scale ?? 1) > 1.01) return;
      if (defileEnLargeur(e.target, e.currentTarget)) return;
      const t = e.touches[0];
      depart.current = { x: t.clientX, y: t.clientY, quand: Date.now() };
    },
    onTouchMove(e) {
      if (e.touches.length > 1) depart.current = null;
    },
    onTouchEnd(e) {
      const d = depart.current;
      depart.current = null;
      const t = e.changedTouches?.[0];
      if (!d || !t || Date.now() - d.quand > DUREE_MAX) return;
      const dx = t.clientX - d.x;
      const dy = t.clientY - d.y;
      if (Math.abs(dx) < SEUIL || Math.abs(dx) < Math.abs(dy) * DOMINANCE) return;
      const rappel = dx < 0 ? rappels.current.onVersLaGauche : rappels.current.onVersLaDroite;
      rappel?.();
    },
    onTouchCancel() {
      depart.current = null;
    },
  };
}
