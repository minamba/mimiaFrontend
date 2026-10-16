import { useEffect, useState } from 'react';
import { getAccesForfait } from '../api/elevesApi';

/**
 * LES FICHES ET LES JEUX DEMANDENT UN VRAI FORFAIT — Camara, le 16/10/2026 :
 * en essai, en pause ou sans abonnement, la carte des fiches est désactivée
 * et les jeux sont grisés.
 *
 * Rend `{ ouvert, motif }`. `ouvert` vaut NULL TANT QU'ON NE SAIT PAS : rien
 * n'est grisé le temps d'un chargement — mieux vaut un instant d'ouverture
 * qu'un enfant abonné qui voit sa page verrouillée en arrivant. Une erreur de
 * lecture laisse ouvert pour la même raison ; le serveur, lui, garde la porte
 * des fiches.
 */
export default function useAccesForfait(eleveId) {
  const [acces, setAcces] = useState({ ouvert: null, motif: null });

  useEffect(() => {
    if (!eleveId) return undefined;
    let vivant = true;
    // Dans une promesse dès le départ : une réponse vide ou un appel qui
    // échoue avant même de partir tombent dans le même filet (ouvert).
    Promise.resolve()
      .then(() => getAccesForfait(eleveId))
      .then(({ data }) => { if (vivant) setAcces({ ouvert: data?.ouvert !== false, motif: data?.motif ?? null }); })
      .catch(() => { if (vivant) setAcces({ ouvert: true, motif: null }); });
    return () => { vivant = false; };
  }, [eleveId]);

  return acces;
}

/** La phrase à montrer quand une fonctionnalité est fermée, selon qui la lit. */
export function messageForfait(enfant, fonctionnalite = 'cette fonctionnalité') {
  return enfant
    ? `Il faut un forfait pour accéder à ${fonctionnalite}. Demande à tes parents d’en choisir un.`
    : `Il faut un forfait pour accéder à ${fonctionnalite}. Choisissez une formule pour y accéder.`;
}
