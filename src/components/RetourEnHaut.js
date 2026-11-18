import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * EN HAUT DE LA NOUVELLE PAGE — Camara, le 17/11/2026 : « sur mobile, quand je clique sur n'importe quelle carte de la
 * page de cours, je veux que le défilement se fasse automatiquement en haut de la page ». Une application d'une seule
 * page garde la position de la précédente : on arrivait au milieu de « Ma carte » ou des podcasts.
 *
 * SUR TÉLÉPHONE ET TABLETTE (≤ 900 px), à chaque NOUVELLE adresse (lien, carte, bouton). Pas au retour arrière : le
 * navigateur y rend la position d'avant. Pas quand l'adresse vise un endroit (`#mes-controles`) : useAncreSection
 * s'en charge.
 */
export default function RetourEnHaut() {
  const { pathname, hash } = useLocation();
  const type = useNavigationType();

  useLayoutEffect(() => {
    if (type === 'POP' || hash) return;
    if (!window.matchMedia?.('(max-width: 900px)')?.matches) return;
    window.scrollTo?.(0, 0);
  }, [pathname, hash, type]);

  return null;
}
