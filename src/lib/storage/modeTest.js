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
 *
 * Le bandeau, lui, part à `null` : afficher un avertissement sur une panne
 * de lecture inquiéterait sans rien apprendre.
 */
const PAR_DEFAUT = {
  modeTest: false, essaisOuverts: true, maintenance: false, bandeau: null,

  // ÉTEINTE TANT QU'ON NE SAIT PAS. Une promotion affichée sur une panne
  // de lecture promet un cadeau que le serveur ne donnera pas — et le
  // parent, lui, aura payé en la voyant.
  offreLancement: {
    active: false, texte: '', fin: null, bandeau: false, heures: 0,
    formules: [], formulesTexte: '',
  },
};

/**
 * TOUT EST LU UNE FOIS PAR SESSION, SAUF QUE LE BANDEAU, LUI, CHANGE.
 *
 * Les autres drapeaux se décident une fois pour toutes : on n'ouvre pas
 * l'essai gratuit en milieu d'après-midi. Le bandeau, si — il existe pour
 * annoncer un incident PENDANT que les gens sont sur le site. Un message
 * que seuls verraient ceux qui rechargent la page arriverait toujours trop
 * tard.
 *
 * DEUX MINUTES : assez court pour qu’une annonce atteigne un parent en
 * cours de navigation, assez long pour que la charge reste nulle — une
 * requête de quelques octets, moins souvent que le battement de la
 * diffusion.
 */
const RAFRAICHISSEMENT_MS = 120_000;

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

          // Le serveur n'envoie le texte que si le bandeau est allumé :
          // ici il n’y a rien à décider, juste à recopier. Une chaîne
          // vide vaut absence — un bandeau vide est un bandeau cassé.
          bandeau: data?.bandeau?.trim() ? data.bandeau : null,

          // `active` VIENT DU SERVEUR, on ne le recalcule pas ici. Il tient
          // déjà compte de l'échéance, et c'est lui qui décidera aussi de
          // créditer les heures au moment du paiement. Deux horloges qui
          // jugeraient séparément la même promotion finiraient par se
          // contredire — et c'est le visiteur qui verrait la contradiction.
          offreLancement: data?.offreLancement?.active
            ? {
                active: true,
                texte: data.offreLancement.texte || 'OFFRE LANCEMENT',
                fin: data.offreLancement.fin ?? null,

                // Le serveur a déjà croisé ce drapeau avec la vitalité de
                // l'offre : un décompte ne peut pas survivre à la
                // promotion qu'il annonce.
                bandeau: Boolean(data.offreLancement.bandeau),

                // CALCULÉ ICI, UNE FOIS. Le serveur envoie des minutes — la
                // seule unité qui ne perd rien. Les convertir dans chaque
                // écran ferait diverger les arrondis : « 1,5 h » ici et
                // « 2 h » là.
                heures: Math.round((data.offreLancement.minutesOffertes ?? 0) / 6) / 10,

                // LES CODES POUR RECONNAÎTRE LES CARTES, LE TEXTE POUR LE
                // DIRE. Le second est composé par le serveur, seul à
                // connaître les libellés : « Solo et Duo » plutôt que
                // « SOLO, DUO ».
                formules: Array.isArray(data.offreLancement.formules)
                  ? data.offreLancement.formules
                  : [],
                formulesTexte: data.offreLancement.formulesTexte ?? '',
              }
            : PAR_DEFAUT.offreLancement,
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
 * Le message d'information à afficher en haut du site, ou `null`.
 *
 * SEUL DRAPEAU RELU EN COURS DE SESSION, et c'est sa raison d'être : il
 * sert à prévenir d'un incident pendant que les gens naviguent. Le
 * battement vit ici et non dans le composant — le cache est partagé, et
 * deux bandeaux affichés (le site, un aperçu) ne doivent pas doubler les
 * appels.
 */
export function useBandeau() {
  const message = useDrapeaux().bandeau;

  useEffect(() => {
    const battement = setInterval(oublierReglages, RAFRAICHISSEMENT_MS);

    return () => clearInterval(battement);
  }, []);

  return message;
}

/**
 * L'offre de lancement : est-elle vivante, comment s'appelle-t-elle, et
 * jusqu'à quand ?
 *
 * RENDUE EN BLOC plutôt qu'en trois crochets séparés. Les trois valeurs
 * n'ont de sens qu'ensemble : un texte sans drapeau habille une promotion
 * éteinte, une échéance sans drapeau fait tourner un compte à rebours pour
 * rien. Le composant qui les reçoit ne peut pas en oublier une.
 */
export function useOffreLancement() {
  return useDrapeaux().offreLancement;
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
