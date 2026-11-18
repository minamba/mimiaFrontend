import { useEffect, useState } from 'react';
import { getAccesForfait } from '../api/elevesApi';

/**
 * LES FICHES ET LES JEUX DEMANDENT UN VRAI FORFAIT — Camara, le 16/10/2026 :
 * en essai, en pause ou sans abonnement, la carte des fiches est désactivée
 * et les jeux sont grisés.
 *
 * EN ESSAI (Camara, le 18/10/2026) : deux jeux de mathématiques ouverts, et UN
 * cours de fiches par famille. `essaiFiches` dit où en est ce cours : libre,
 * en-route (parti, pas encore fini), utilise. Null hors essai.
 *
 * Rend `{ ouvert, motif, essaiFiches }`. `ouvert` vaut NULL TANT QU'ON NE SAIT PAS : rien
 * n'est grisé le temps d'un chargement — mieux vaut un instant d'ouverture
 * qu'un enfant abonné qui voit sa page verrouillée en arrivant. Une erreur de
 * lecture laisse ouvert pour la même raison ; le serveur, lui, garde la porte
 * des fiches.
 */
export default function useAccesForfait(eleveId) {
  // `conseillere` (14/11/2026) : faux seulement quand le serveur dit que la formule n'en a pas (Starter) ; null tant
  // qu'on ne sait pas, et en cas d'erreur — la carte reste ouverte, le serveur garde la porte des séances.
  // `podcasts` (15/11/2026) : pareil — faux seulement quand la formule n'en a pas (Starter).
  const [acces, setAcces] = useState({ ouvert: null, motif: null, essaiFiches: null, conseillere: null, podcasts: null });

  useEffect(() => {
    if (!eleveId) return undefined;
    let vivant = true;
    let minuteur = null;

    // UNE LECTURE RATÉE SE RETENTE AVANT D'OUVRIR — Camara, le 15/11/2026 : un parent en essai, sur téléphone, avait
    // tous les jeux de la classe de son enfant ouverts. Une erreur de lecture ouvrait tout pour la durée de la page ;
    // sur un téléphone, une lecture échoue pour un rien (réseau qui hésite, refus de la salle d'attente juste après
    // un rechargement, jeton qu'on renouvelle). On retente donc trois fois (1 s, 2 s, 4 s), en restant « on ne sait
    // pas » ; ce n'est qu'au bout que l'on ouvre, comme avant.
    const ESSAIS = [1000, 2000, 4000];
    const lire = (rang) => {
      // Dans une promesse dès le départ : une réponse vide ou un appel qui
      // échoue avant même de partir tombent dans le même filet.
      Promise.resolve()
        .then(() => getAccesForfait(eleveId))
        .then(({ data }) => {
          if (vivant) {
            setAcces({
              ouvert: data?.ouvert !== false,
              motif: data?.motif ?? null,
              essaiFiches: data?.essaiFiches ?? null,
              conseillere: data?.conseillere !== false,
              podcasts: data?.podcasts !== false,
            });
          }
        })
        .catch(() => {
          if (!vivant) return;
          if (rang < ESSAIS.length) {
            minuteur = setTimeout(() => lire(rang + 1), ESSAIS[rang]);
            return;
          }
          setAcces({ ouvert: true, motif: null, essaiFiches: null, conseillere: true, podcasts: true });
        });
    };
    lire(0);

    return () => { vivant = false; clearTimeout(minuteur); };
  }, [eleveId]);

  return acces;
}

/** LA PHRASE DE L'ESSAI DES FICHES UTILISÉ — les mots de Camara, le 18/10/2026. */
export const MESSAGE_ESSAI_FICHES = 'Il faut être abonné pour continuer à générer des fiches de révision.';

/**
 * Les fiches sont-elles consultables ? Sans forfait, seulement en essai : la
 * famille y retrouve la fiche de son essai.
 */
export function fichesConsultables({ ouvert, motif }) {
  return ouvert !== false || motif === 'essai';
}

/**
 * COMPTE INACTIF = PAS DE COURS POSSIBLE (17/11/2026) : sans abonnement, en pause, ou impayé. PAS L'ESSAI : un compte en
 * essai garde ses cours jusqu'à la dernière seconde de ses 30 minutes (Camara : « ils doivent pouvoir utiliser leur
 * abonnement ou essai jusqu'à la dernière seconde ») ; c'est la séance elle-même qui s'arrête net à zéro.
 * `ouvert` vaut false en essai (les fiches et les jeux y sont fermés) : ce test-ci ne s'y fie donc pas seul.
 */
export function compteInactif({ ouvert, motif }) {
  return ouvert === false && motif !== 'essai';
}

/** La phrase à montrer quand une fonctionnalité est fermée, selon qui la lit. */
export function messageForfait(enfant, fonctionnalite = 'cette fonctionnalité') {
  return enfant
    ? `Il faut un forfait pour accéder à ${fonctionnalite}. Demande à tes parents d’en choisir un.`
    : `Il faut un forfait pour accéder à ${fonctionnalite}. Choisissez une formule pour y accéder.`;
}
