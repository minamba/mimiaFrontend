/**
 * MICROSOFT CLARITY — chargé seulement si on a dit oui, et seulement dehors.
 *
 * Camara, le 23/09/2026. Clarity enregistre le parcours : mouvements, clics,
 * défilements, et le contenu affiché à l'écran pendant la session.
 *
 * DEUX VERROUS, ET LES DEUX COMPTENT
 * ----------------------------------
 * 1. LE CONSENTEMENT. Le script n'est pas dans la page ; il n'y entre qu'après
 *    un « Accepter » explicite. Un script posé d'avance et « mis en veille »
 *    dépose déjà ses cookies : c'est ce que font beaucoup de sites, et c'est
 *    précisément ce que la règle interdit.
 *
 * 2. LE SITE PUBLIC SEULEMENT — décidé avec Camara. Jamais dans l'espace
 *    connecté. Ce n'est pas une précaution de forme : l'enregistrement de
 *    session capterait le fil de discussion d'un enfant, son tableau, ses
 *    copies corrigées et son prénom. Des données scolaires d'enfants
 *    identifiés partiraient chez Microsoft, ce qu'aucun parent n'a accepté en
 *    s'abonnant. Un masquage écran par écran aurait été une promesse à tenir à
 *    chaque nouvel écran, et donc une promesse à oublier un jour.
 *
 * L'IDENTIFIANT EST FIGÉ AU BUILD (`REACT_APP_CLARITY_ID`). Absent — le cas en
 * développement et tant que Camara n'a pas créé le projet — rien ne se charge
 * et rien n'échoue.
 *
 * ON NE SAIT PAS LE DÉCHARGER. Une fois le script dans la page, seul un
 * rechargement l'en retire : c'est une contrainte de Clarity, pas un choix.
 * Au refus, on efface donc ses cookies et on ne le rechargera plus — voir
 * `refuserClarity`.
 */

const ID = process.env.REACT_APP_CLARITY_ID;

/** Les cookies déposés par Clarity, à citer dans la page de confidentialité. */
export const COOKIES_CLARITY = ['_clck', '_clsk'];

let charge = false;

/** Clarity peut-il être proposé ? Faux sans identifiant : inutile de demander. */
export function clarityConfigure() {
  return Boolean(ID);
}

/** Pour les tests : oublie qu'on a déjà chargé. */
export function reinitialiserClarity() {
  charge = false;
}

/**
 * Injecte le script, une seule fois.
 *
 * Le corps est celui que Microsoft publie, réécrit lisiblement : il pose la
 * file d'attente `clarity` avant l'arrivée du script, pour qu'un appel émis
 * entre-temps ne soit pas perdu.
 */
export function chargerClarity() {
  if (charge || !ID || typeof document === 'undefined') return false;
  charge = true;

  window.clarity = window.clarity || function file(...args) {
    (window.clarity.q = window.clarity.q || []).push(args);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${ID}`;
  document.head.appendChild(script);

  return true;
}

/**
 * Le visiteur refuse : on efface ce que Clarity aurait pu déposer.
 *
 * Utile quand quelqu'un revient sur un « oui » donné plus tôt. Les cookies
 * sont posés sur le domaine courant ; on les périme sur le chemin racine,
 * avec et sans le point de tête du domaine — les deux formes existent.
 */
export function refuserClarity() {
  if (typeof document === 'undefined') return;

  const hote = window.location.hostname;

  COOKIES_CLARITY.forEach((nom) => {
    [hote, `.${hote}`, ''].forEach((domaine) => {
      const cible = domaine ? `; domain=${domaine}` : '';
      document.cookie = `${nom}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${cible}`;
    });
  });
}
