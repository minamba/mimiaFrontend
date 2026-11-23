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
 * `relire` doit être SILENCIEUSE : pas de chargeur, pas de liste vidée, et un
 * ÉCHEC NE CHANGE RIEN À L'ÉCRAN (ni message d'erreur, ni liste vidée) — l'enfant
 * voit sa carte changer de pastille, jamais disparaître parce qu'une relecture
 * de confort a raté (v2, contrôle d'Omar).
 *
 * `relire(vivant)` reçoit une fonction `vivant()` : elle rend `false` dès que la
 * page est démontée ou a changé de `cle` (autre élève, autre fiche). Une réponse
 * arrivée APRÈS ce moment doit être ignorée — sinon elle écrirait l'examen d'une
 * fiche qu'on vient de quitter.
 *
 * Lue par une référence : une fonction recréée à chaque rendu ne relance pas les
 * minuteurs, qui ne sont posés qu'une fois par `cle`.
 */
export default function useRelectureApresSeance(relire, cle) {
  const relireRef = useRef(relire);
  relireRef.current = relire;

  useEffect(() => {
    let vivant = true;
    const estVivant = () => vivant;

    const minuteurs = relecturesRestantes().map((delai) => setTimeout(() => {
      if (vivant) relireRef.current?.(estVivant);
    }, delai));

    return () => {
      vivant = false;
      minuteurs.forEach(clearTimeout);
    };
  }, [cle]);
}
