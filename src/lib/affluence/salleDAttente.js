import { useSyncExternalStore } from 'react';
import { authService } from '../storage/authService';
// L'en-tête d'autorisation se décide à UN seul endroit (session enfant ou parent) :
// on l'emprunte, on ne le refait pas. Import circulaire sans danger, la fonction
// n'est appelée qu'après le chargement des deux modules.
import { enTeteAuth } from '../api/httpClient';

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
  /**
   * Refusé sans billet, on demande au guichet si l'on est vraiment en file. Voir `signalerAffluence` :
   * pendant cette demande, on ne montre PAS l'écran d'attente, le guichet laisse presque toujours entrer.
   */
  verification: false,
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
/** UNE SEULE DEMANDE AU GUICHET À LA FOIS : deux en même temps prendraient deux rangs. */
let enVol = null;

function demander() {
  if (!enVol) enVol = demanderAuGuichet().finally(() => { enVol = null; });
  return enVol;
}

async function demanderAuGuichet() {
  try {
    const jeton = lireBillet();
    const url = `${BASE}/affluence/billet${jeton ? `?jeton=${jeton}` : ''}`;
    // LE JETON DE CONNEXION VOYAGE AUSSI ICI (06/11/2026) : c'est à lui que le
    // guichet reconnaît un administrateur, admis sans prendre de place.
    const headers = { Accept: 'application/json' };
    const entete = await enTeteAuth().catch(() => null);
    if (entete) headers.Authorization = entete;
    const reponse = await fetch(url, { headers });

    if (!reponse.ok) {
      // Le guichet lui-même ne répond pas : on réessaie, sans rien conclure. Si l'on vérifiait, l'écran
      // d'attente s'affiche : le serveur a bien refusé, on ne peut pas montrer le site.
      if (etat.verification) definir({ verification: false, enFile: true });
      planifier(10);
      return;
    }

    const place = await reponse.json();

    if (place.billet) poserBillet(place.billet);

    if (place.admis) {
      clearTimeout(minuteur);
      definir({ enFile: false, verification: false, rang: 0, devant: 0, attenteSecondes: null });
      if (place.salle) demarrerBattement();
      else arreterBattement();
      return;
    }

    definir({
      enFile: true,
      verification: false,
      rang: place.rang ?? 0,
      devant: place.devant ?? 0,
      attenteSecondes: place.attenteSecondes ?? null,
    });
    planifier(place.rappelDans);
  } catch {
    // Réseau coupé : on retente. Le serveur garde la place quelques secondes
    // encore, et une erreur passagère ne doit pas renvoyer en queue.
    if (etat.verification) definir({ verification: false, enFile: true });
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
/**
 * « ACCÈS ADMINISTRATEUR » (Camara, le 06/11/2026), depuis l'écran de la file :
 * connecté, on redemande tout de suite au guichet, qui le laisse entrer ; sinon,
 * on part se connecter — le retour recharge la page, et la file avec.
 */
export async function entrerCommeAdministrateur() {
  // Une session d'enfant n'est jamais administrateur : il faut se connecter.
  const entete = await enTeteAuth().catch(() => null);
  if (!entete || entete.startsWith('Eleve ')) {
    authService.login();
    return 'connexion';
  }
  clearTimeout(minuteur);
  await demander();
  return etat.enFile ? 'refuse' : 'entre';
}

export function signalerAffluence(donnees) {
  arreterBattement();

  // REFUSÉ SANS BILLET (06/11/2026) : le serveur n'en crée plus à chaque appel —
  // une page en lançait dix à la fois, et un seul visiteur prenait dix rangs. On
  // va chercher LE billet au guichet, une seule fois.
  //
  // ET SANS MONTRER L'ÉCRAN D'ATTENTE TANT QUE LE GUICHET N'A PAS RÉPONDU — Camara, le 07/11/2026 : « au
  // chargement ou en faisant F5, on voit rapidement la page de file d'attente ». Un F5 rend le billet
  // (`pagehide`, voir `rendre`) : les premiers appels de la page suivante partent sans, le serveur les
  // refuse, et le guichet, aussitôt interrogé, laisse entrer. L'écran s'affichait le temps de cet
  // aller-retour. On attend sa réponse sur une page vide ; il ne s'affiche que si l'on est vraiment en file.
  if (!donnees?.billet) {
    if (!etat.enFile) definir({ verification: true });
    clearTimeout(minuteur);
    demander();
    return;
  }

  poserBillet(donnees.billet);
  definir({
    enFile: true,
    rang: donnees?.rang ?? 1,
    devant: donnees?.devant ?? 0,
    attenteSecondes: donnees?.attenteSecondes ?? null,
  });
  planifier(donnees?.rappelDans ?? 5);
}

/**
 * Le billet pour les appels faits sans axios (flux du cours, voix, événements) :
 * sans lui, un visiteur pourtant entré était refusé dès que la salle était
 * allumée (06/11/2026).
 */
export function avecBillet(entetes = {}) {
  const jeton = lireBillet();
  return jeton ? { ...entetes, 'X-Billet': jeton } : entetes;
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
