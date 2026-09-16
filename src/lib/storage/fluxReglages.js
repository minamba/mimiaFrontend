import { API_BASE_URL } from '../api/httpClient';

/**
 * L'ÉCOUTE DES CHANGEMENTS DE RÉGLAGE, EN TEMPS RÉEL — Camara, le 16/09/2026 :
 * « quand j'active Blue Sky, ça ne change pas sur tous les ordinateurs et
 * mobiles de manière instantanée ».
 *
 * Le serveur annonce, ce module écoute, et prévient `modeTest.js` qui relit
 * les drapeaux et applique le style. Rien ne transite que le nom de la clé
 * changée : la valeur, elle, vient toujours de la route publique.
 *
 * `EventSource` PLUTÔT QU'UN WEBSOCKET : la diffusion est à sens unique, et
 * le navigateur se reconnecte tout seul — c'est lui qui gère la coupure de
 * réseau, le tunnel, le passage en 4G. Un WebSocket demanderait d'écrire
 * cette reconnexion à la main.
 *
 * TROIS FILETS, PARCE QU'UNE CONNEXION PERSISTANTE N'EST JAMAIS SÛRE :
 *
 *   1. le navigateur reconnecte seul après une coupure ;
 *   2. si la connexion échoue plusieurs fois de suite — serveur plus ancien
 *      que ce flux, proxy qui coupe le streaming — on s'arrête et on relit
 *      périodiquement, comme avant ;
 *   3. AU RETOUR AU PREMIER PLAN, on relit toujours. C'est le cas du
 *      téléphone : l'écran s'éteint, le système coupe la connexion, et
 *      l'onglet revient plusieurs heures plus tard avec un style périmé.
 */
const RECONNEXIONS_MAX = 5;

/**
 * Le `readyState` d'un `EventSource` qui a renoncé (0 en cours, 1 ouvert,
 * 2 fermé). La valeur littérale de la spécification plutôt que la constante
 * `EventSource.CLOSED` : le navigateur ferme DÉFINITIVEMENT sur un statut HTTP
 * invalide — un 503 quand le serveur est saturé, un 404 quand il est plus
 * ancien que ce flux — et c'est ce cas-là qu'il faut reconnaître.
 */
const FERME = 2;

/** Le repli quand le flux n'est pas disponible : une relecture par minute. */
const REPLI_MS = 60_000;

let flux = null;
let replis = null;
let echecs = 0;
let visibiliteInstallee = false;

/**
 * Le flux a échoué pour de bon — on ne le rouvrira pas de la session.
 *
 * DISTINCT DE « ÉTEINT PAR L'ADMINISTRATION », et il faut les distinguer :
 * le repli rappelle la lecture des réglages, qui repasse ici. Sans ce
 * drapeau, un flux cassé serait rouvert à chaque minute — une boucle de
 * reconnexion déguisée en relecture.
 */
let abandonne = false;

function passerAuRepli(relire) {
  if (replis) return;

  replis = setInterval(relire, REPLI_MS);
}

/**
 * Ouvre l'écoute, une seule fois par onglet.
 *
 * @param relire appelé à chaque annonce du serveur — en pratique
 *   `oublierReglages`, qui relit les drapeaux et applique le style.
 * @param actif le coupe-circuit `FLUX_SSE` de l'administration. Éteint, on
 *   relit périodiquement, comme avant que ce flux existe.
 */
export function demarrerFluxReglages(relire, actif = true) {
  // AU RETOUR SUR L'ONGLET, ON RELIT — quel que soit l'état du flux. Sur
  // téléphone, la connexion ne survit pas à la mise en veille, et le
  // navigateur ne prévient pas toujours de sa reprise. Posé une seule fois :
  // cette fonction est rappelée à chaque relecture des réglages.
  if (!visibiliteInstallee) {
    visibiliteInstallee = true;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') relire();
    });
  }

  // ÉTEINT PAR L'ADMINISTRATION : on relit périodiquement, et on referme
  // l'écoute s'il y en avait une. Le serveur a déjà coupé de son côté ;
  // l'onglet, lui, ne doit pas la rouvrir.
  if (!actif) {
    if (flux) {
      flux.close();
      flux = null;
    }

    passerAuRepli(relire);
    return;
  }

  // RALLUMÉ : on quitte le repli pour reprendre le temps réel sans attendre
  // que l'onglet soit rechargé. Camara, le 16/09/2026 : un interrupteur doit
  // marcher dans les deux sens.
  if (replis) {
    clearInterval(replis);
    replis = null;
  }

  if (flux || abandonne) return;

  if (typeof window.EventSource !== 'function') {
    passerAuRepli(relire);
    return;
  }

  try {
    flux = new EventSource(`${API_BASE_URL}/reglages/flux`);
  } catch {
    passerAuRepli(relire);
    return;
  }

  flux.onopen = () => { echecs = 0; };

  flux.onmessage = () => {
    // Le contenu n'est pas lu : l'annonce dit « relis », la route publique
    // dit quoi. Une seule source de vérité pour les valeurs.
    relire();
  };

  flux.onerror = () => {
    echecs += 1;

    // LE NAVIGATEUR A RENONCÉ, IL NE RETENTERA RIEN. Attendre cinq échecs qui
    // ne viendront jamais laisserait l'onglet sans flux ET sans relecture —
    // c'est le cas d'un serveur saturé qui refuse, et celui d'un serveur
    // déployé avant l'existence de cette route.
    if (flux.readyState === FERME) {
      flux = null;
      abandonne = true;
      passerAuRepli(relire);
      return;
    }

    // Sinon `EventSource` retente tout seul ; on ne s'en mêle qu'au bout de
    // plusieurs échecs, signe que ce n'est pas la ligne mais le serveur.
    if (echecs >= RECONNEXIONS_MAX) {
      flux.close();
      flux = null;
      abandonne = true;
      passerAuRepli(relire);
    }
  };
}

/** Pour les tests : referme tout et remet le module à zéro. */
export function arreterFluxReglages() {
  if (flux) flux.close();
  if (replis) clearInterval(replis);

  flux = null;
  replis = null;
  echecs = 0;
  abandonne = false;
  visibiliteInstallee = false;
}
