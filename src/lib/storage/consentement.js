import { useCallback, useEffect, useState } from 'react';

/**
 * LE CHOIX DU VISITEUR SUR LA MESURE D'AUDIENCE.
 *
 * Camara, le 23/09/2026 : « mettre en place Microsoft Clarity […] du coup va
 * falloir mettre la petite fenêtre pour les cookies ».
 *
 * TROIS ÉTATS, ET LE TROISIÈME COMPTE AUTANT QUE LES DEUX AUTRES :
 * accepté, refusé, et PAS ENCORE RÉPONDU. Ne pas avoir répondu n'est pas
 * accepter — c'est la règle, et c'est pour ça que Clarity ne se charge que
 * sur un « oui » explicite, jamais par défaut ni au premier défilement.
 *
 * DANS LE STOCKAGE LOCAL, PAS DANS UN COOKIE. Le choix ne concerne que cet
 * appareil, il n'a aucune raison de voyager dans chaque requête vers le
 * serveur. Même convention de clé que le reste de la maison :
 * `mimia-visiteur`, `mimia-essai-vise`, et maintenant `mimia-consentement`.
 *
 * LE STOCKAGE PEUT ÊTRE INDISPONIBLE — navigation privée verrouillée, réglage
 * d'entreprise. On retombe alors sur « pas encore répondu » : le bandeau
 * reparaîtra à chaque visite, ce qui est pénible mais honnête. L'inverse —
 * supposer un accord qu'on ne sait pas enregistrer — ne se discute pas.
 */

const CLE = 'mimia-consentement';

export const ACCEPTE = 'accepte';
export const REFUSE = 'refuse';

/** Le choix enregistré, ou `null` si le visiteur n'a pas encore répondu. */
export function consentement() {
  try {
    const valeur = localStorage.getItem(CLE);
    return valeur === ACCEPTE || valeur === REFUSE ? valeur : null;
  } catch {
    return null;
  }
}

/** Enregistre le choix et prévient les autres onglets de la même page. */
export function definirConsentement(valeur) {
  try {
    localStorage.setItem(CLE, valeur);
  } catch { /* sans stockage, le choix ne vaut que pour cette visite */ }

  // `storage` ne se déclenche que dans les AUTRES onglets : sans cet
  // événement maison, le bandeau de l'onglet courant ne se refermerait pas.
  window.dispatchEvent(new CustomEvent('mimia-consentement', { detail: valeur }));
}

/** Rouvre la question — ce qui fait reparaître le bandeau. */
export function oublierConsentement() {
  try {
    localStorage.removeItem(CLE);
  } catch { /* rien à oublier */ }

  window.dispatchEvent(new CustomEvent('mimia-consentement', { detail: null }));
}

/**
 * Le choix courant, et de quoi le changer.
 *
 * Il écoute les deux canaux : l'événement maison pour cet onglet, et
 * `storage` pour les autres. Un parent qui accepte dans un onglet ne doit pas
 * retrouver la question dans celui d'à côté.
 */
export function useConsentement() {
  const [choix, setChoix] = useState(consentement);

  useEffect(() => {
    const relire = () => setChoix(consentement());

    window.addEventListener('mimia-consentement', relire);
    window.addEventListener('storage', relire);

    return () => {
      window.removeEventListener('mimia-consentement', relire);
      window.removeEventListener('storage', relire);
    };
  }, []);

  const accepter = useCallback(() => definirConsentement(ACCEPTE), []);
  const refuser = useCallback(() => definirConsentement(REFUSE), []);

  return { choix, accepter, refuser, rouvrir: oublierConsentement };
}
