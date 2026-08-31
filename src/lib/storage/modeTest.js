import { useEffect, useState } from 'react';
import { getReglagesPublics } from '../api/reglagesApi';

/**
 * Les drapeaux publics du service, lus une fois et partagés.
 *
 * Interrogés une SEULE fois par session et partagés entre tous les appelants.
 * La barre de navigation, le pied de page, l'accueil et la page des tarifs en
 * ont besoin ; un aller-retour par composant ferait quatre appels pour deux
 * booléens qui ne changent pas d'une seconde à l'autre.
 *
 * VALEURS DE DÉPART : celles du produit OUVERT — mode test éteint, essais
 * ouverts. Tant qu'on ne sait pas, on n'affiche rien de différent : un site qui
 * masque ses tarifs une demi-seconde puis les fait réapparaître est pire qu'un
 * site qui les garde. Et un bouton qui dit « Commencer gratuitement » puis se
 * change en « S'inscrire » sous le curseur donne l'impression d'une offre
 * retirée à la dernière seconde.
 */
const PAR_DEFAUT = { modeTest: false, essaisOuverts: true, maintenance: false };

let valeurs = PAR_DEFAUT;
let sonde = null;
const abonnes = new Set();

function interroger() {
  if (!sonde) {
    sonde = getReglagesPublics()
      .then(({ data }) => {
        valeurs = {
          modeTest: Boolean(data?.modeTest),
          // `?? true` et non `Boolean(...)` : une API antérieure à ce drapeau
          // ne l'envoie pas, et le lire comme « fermé » couperait l'essai
          // partout le temps d'un déploiement.
          essaisOuverts: data?.essaisOuverts ?? true,

          // ÉTEINT TANT QU'ON NE SAIT PAS, et ici ce n'est pas du confort :
          // une API muette ou une erreur réseau afficherait la page d'attente
          // à tout le monde. Le site se fermerait tout seul sur une panne de
          // lecture de réglage — exactement l'inverse de ce qu'on veut.
          maintenance: Boolean(data?.maintenance),
        };

        abonnes.forEach((notifier) => notifier(valeurs));
        return valeurs;
      })
      .catch(() => {
        // Réglages illisibles : on laisse le produit ouvert. Le serveur, lui,
        // refusera ce qu'il doit refuser — c'est là qu'est la vraie garde,
        // pas dans l'affichage.
        return PAR_DEFAUT;
      });
  }

  return sonde;
}

function useDrapeaux() {
  const [etat, setEtat] = useState(valeurs);

  useEffect(() => {
    let vivant = true;

    const notifier = (v) => { if (vivant) setEtat(v); };
    abonnes.add(notifier);

    interroger().then(notifier);

    return () => {
      vivant = false;
      abonnes.delete(notifier);
    };
  }, []);

  return etat;
}

/** Vrai quand le service est en accès privé. */
export function useModeTest() {
  return useDrapeaux().modeTest;
}

/**
 * Vrai quand l'essai gratuit est proposé aux nouveaux venus.
 *
 * Fermé, l'accueil invite à s'inscrire au lieu de promettre du gratuit, et
 * aucun chemin n'ouvre plus d'essai. Le serveur refuse de toute façon : ce
 * drapeau ne fait qu'éviter de promettre ce qui sera refusé.
 */
export function useEssaisOuverts() {
  return useDrapeaux().essaisOuverts;
}

/**
 * Vrai quand le site affiche sa page d'attente.
 *
 * NE PROTÈGE RIEN, ET IL FAUT LE SAVOIR. C'est un rideau : l'API continue de
 * répondre normalement derrière — sans quoi l'administrateur qui vient de le
 * tirer ne pourrait plus le lever. Pour fermer vraiment le service, on arrête
 * l'API ; c'est un autre geste.
 */
export function useMaintenance() {
  return useDrapeaux().maintenance;
}

/**
 * Oublie les valeurs retenues. Appelé après un changement dans
 * l'administration : sans ça, l'administrateur qui bascule un interrupteur ne
 * verrait rien bouger avant d'avoir rechargé la page.
 */
export function oublierReglages() {
  sonde = null;
  interroger();
}

/** Ancien nom, gardé le temps que les appels existants migrent. */
export const oublierModeTest = oublierReglages;
