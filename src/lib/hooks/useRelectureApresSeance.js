import { useEffect, useRef } from 'react';
import { relecturesRestantes } from '../storage/sortieDeSeance';

/**
 * RELIRE UNE PAGE DE PRÉPARATION PENDANT QUE LE PROFESSEUR CONCLUT — signalement #65.
 *
 * Juste après « Quitter », le verdict de la séance n'est pas encore écrit : il
 * arrive en arrière-plan (voir `storage/sortieDeSeance.js`). La page appelle
 * `relire` aux délais qui restent, puis plus rien. Sans sortie récente, aucun
 * minuteur n'est posé : une visite ordinaire ne coûte aucun appel de plus.
 *
 * `relire` doit être SILENCIEUSE (pas de chargeur, pas de liste vidée) : l'enfant
 * voit sa carte changer de pastille, pas clignoter.
 *
 * Lue par une référence : une fonction recréée à chaque rendu ne relance pas les
 * minuteurs, qui ne sont posés qu'une fois par élève.
 */
export default function useRelectureApresSeance(relire, cle) {
  const relireRef = useRef(relire);
  relireRef.current = relire;

  useEffect(() => {
    const minuteurs = relecturesRestantes().map((delai) => setTimeout(() => relireRef.current?.(), delai));
    return () => minuteurs.forEach(clearTimeout);
  }, [cle]);
}
