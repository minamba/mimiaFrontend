import { useSyncExternalStore } from 'react';

/**
 * LA SALLE D'ATTENTE, CÔTÉ NAVIGATEUR.
 *
 * Voulue par Camara le 25/09/2026 : « mettre les personnes dans une file
 * d'attente si le serveur ne supporte pas ». Le rang affiché ici n'est que la
 * partie visible — c'est le serveur qui compte les places et décide, dans
 * `Services/Affluence/SalleDAttente.cs`.
 *
 * ON NE DEMANDE RIEN AU DÉMARRAGE, ET C'EST LE CHOIX CENTRAL
 * ----------------------------------------------------------
 * La salle est éteinte la plupart du temps. Interroger le serveur à chaque
 * ouverture de page « pour voir » ajouterait une requête à tous les visiteurs,
 * tous les jours, pour une fonction qui ne sert que les jours d'affluence —
 * c'est-à-dire une dépense permanente contre un problème occasionnel, sur le
 * serveur qu'on essaie justement de soulager.
 *
 * La file se déclenche donc à la première requête REFUSÉE : le serveur répond
 * 503 avec le billet déjà dedans, et l'écran d'attente s'affiche. Tant que la
 * salle est éteinte, ce fichier ne fait strictement rien.
 *
 * LE BILLET VIT DANS L'ONGLET (`sessionStorage`), pas dans le navigateur.
 * Deux onglets font deux visiteurs — c'est discutable, mais c'est le sens de
 * la mesure : deux onglets font deux fois le travail au serveur. Et fermer
 * l'onglet rend la place, ce qu'un stockage persistant ne ferait pas.
 */

// LA MÊME BASE QUE LE CLIENT HTTP, RECOPIÉE PLUTÔT QU'IMPORTÉE. Le client
// importe ce fichier pour intercepter les refus ; l'importer en retour ferait
// un cycle, et un cycle sur une constante lue au chargement donne `undefined`
// une fois sur deux selon l'ordre des imports.
const BASE = process.env.REACT_APP_API_URL ?? '';

const CLE = 'mimia-billet';

/** Le rythme du battement une fois entré, en millisecondes. */
const BATTEMENT = 30_000;

let etat = {
  /** La salle nous retient-elle ? */
  enFile: false,
  rang: 0,
  devant: 0,
  attenteSecondes: null,
};

const abonnes = new Set();
let minuteur = null;
let battement = null;

function notifier() {
  abonnes.forEach((f) => f());
}

function definir(suite) {
  etat = { ...etat, ...suite };
  notifier();
}

/**
 * Le stockage peut manquer : navigation privée, stockage bloqué, iframe.
 * Aucun de ces cas ne doit casser le site — au pire le visiteur reprend un
 * billet, et repart au bout de la file.
 */
function lireBillet() {
  try {
    return window.sessionStorage.getItem(CLE) || '';
  } catch {
    return '';
  }
}

function poserBillet(jeton) {
  if (!jeton) return;
  try {
    window.sessionStorage.setItem(CLE, jeton);
  } catch {
    /* sans stockage, le billet ne survit pas au rechargement. Tant pis. */
  }
}

function oublierBillet() {
  try {
    window.sessionStorage.removeItem(CLE);
  } catch {
    /* rien à faire */
  }
}

/**
 * ON N'ARRIVE JAMAIS TOUS À LA MÊME SECONDE.
 *
 * Mille personnes refusées à la même seconde reviendraient toutes ensemble
 * trois secondes plus tard, puis trois secondes après — une vague qui se
 * reforme à chaque tour, sur un serveur déjà à genoux. Le décalage aléatoire
 * étale la même charge sur toute la fenêtre.
 */
function avecDecalage(secondes) {
  return (secondes * 1000) * (1 + Math.random() * 0.3);
}

function planifier(secondes) {
  clearTimeout(minuteur);
  minuteur = setTimeout(demander, avecDecalage(secondes || 5));
}

function demarrerBattement() {
  clearInterval(battement);
  battement = setInterval(demander, BATTEMENT);
}

function arreterBattement() {
  clearInterval(battement);
  battement = null;
}

/**
 * Demande sa place, ou renouvelle celle qu'on a.
 *
 * PAR `fetch` ET NON PAR LE CLIENT HTTP : celui-ci intercepte les 503 pour
 * alimenter cette file. L'y faire passer serait une boucle.
 */
async function demander() {
  try {
    const jeton = lireBillet();
    const url = `${BASE}/affluence/billet${jeton ? `?jeton=${jeton}` : ''}`;
    const reponse = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!reponse.ok) {
      // Le guichet lui-même ne répond pas : on réessaie, sans rien conclure.
      planifier(10);
      return;
    }

    const place = await reponse.json();

    if (place.billet) poserBillet(place.billet);

    if (place.admis) {
      clearTimeout(minuteur);
      definir({ enFile: false, rang: 0, devant: 0, attenteSecondes: null });
      if (place.salle) demarrerBattement();
      else arreterBattement();
      return;
    }

    definir({
      enFile: true,
      rang: place.rang ?? 0,
      devant: place.devant ?? 0,
      attenteSecondes: place.attenteSecondes ?? null,
    });
    planifier(place.rappelDans);
  } catch {
    // Réseau coupé : on retente. Le serveur garde la place quelques secondes
    // encore, et une erreur passagère ne doit pas renvoyer en queue.
    planifier(10);
  }
}

/**
 * Appelé par l'intercepteur quand une requête revient en 503 d'affluence.
 *
 * LE BILLET ARRIVE AVEC LE REFUS, et c'est ce qui évite un aller-retour de
 * plus au pire moment : le serveur a déjà pris le rang, il n'y a qu'à
 * l'afficher.
 */
export function signalerAffluence(donnees) {
  if (donnees?.billet) poserBillet(donnees.billet);

  arreterBattement();
  definir({
    enFile: true,
    rang: donnees?.rang ?? 1,
    devant: donnees?.devant ?? 0,
    attenteSecondes: donnees?.attenteSecondes ?? null,
  });
  planifier(donnees?.rappelDans ?? 5);
}

/**
 * Rend sa place en fermant l'onglet.
 *
 * `keepalive` PARCE QU'UNE REQUÊTE ORDINAIRE EST ANNULÉE quand la page se
 * ferme : le navigateur ne l'attend pas. Rien de tout cela n'est garanti — la
 * place se libère de toute façon après quelques secondes de silence — mais
 * chaque place rendue plus tôt fait avancer toute la file.
 */
function rendre() {
  const jeton = lireBillet();
  if (!jeton) return;
  try {
    // `keepalive` EST TOUT CE QUI COMPTE ICI : sans lui, le navigateur annule
    // la requête au moment où il ferme la page, c'est-à-dire toujours.
    // (`sendBeacon` ferait la même chose, mais il ne sait envoyer qu'un POST,
    // et rendre une place est une suppression.)
    fetch(`${BASE}/affluence/billet?jeton=${jeton}`, {
      method: 'DELETE',
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* rien à faire */
  }
  oublierBillet();
}

if (typeof window !== 'undefined') {
  // `pagehide` ET NON `unload` : c'est le seul que les navigateurs mobiles
  // déclenchent de façon fiable, et `unload` empêche la mise en cache de la
  // page au retour arrière.
  window.addEventListener('pagehide', rendre);
}

/**
 * L'en-tête à joindre aux requêtes. Vide tant qu'aucun billet n'a été pris —
 * c'est-à-dire tant que la salle n'a jamais refusé personne.
 */
export function enTeteBillet() {
  return lireBillet();
}

export function etatSalle() {
  return etat;
}

function abonner(f) {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

/** L'état de la file, pour le verrou et l'écran d'attente. */
export function useSalleDAttente() {
  return useSyncExternalStore(abonner, etatSalle, etatSalle);
}
