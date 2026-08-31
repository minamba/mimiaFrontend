import httpClient from './httpClient';

/**
 * La grille tarifaire. Publique : la page de tarifs doit s'afficher sans être
 * connecté, sinon on demande à quelqu'un de créer un compte pour savoir
 * combien ça coûte.
 */
export const getOffres = () => httpClient.get('/abonnements/offres');

/** Où en est la famille de son quota du mois. 204 si aucun abonnement. */
export const getMonQuota = () => httpClient.get('/abonnements/mon-quota');

/** Combien d'enfants le compte peut encore enregistrer. Répond même sans abonnement. */
export const getCapaciteEnfants = () => httpClient.get('/abonnements/capacite-enfants');

/**
 * Souscrit une formule, à un rythme de facturation DONNÉ.
 *
 * La périodicité est exigée par le serveur, jamais déduite : un défaut
 * silencieux ferait souscrire au mois un parent qui croyait prendre l'année,
 * et il ne s'en apercevrait qu'au prélèvement suivant.
 *
 * RÉPOND DEUX CHOSES DIFFÉRENTES, et l'appelant doit les distinguer :
 * — `{ urlPaiement }` pour une formule payante. RIEN n'est souscrit ; il faut
 *   y envoyer le navigateur, et c'est le webhook Stripe qui ouvrira les droits
 *   après encaissement.
 * — l'état du quota pour l'essai et les comptes exemptés, qui ne passent pas
 *   par la caisse.
 *
 * @param periodicite « Mensuel » ou « Annuel »
 */
export const souscrire = (codeOffre, periodicite) =>
  httpClient.post(
    `/abonnements/souscrire?offre=${encodeURIComponent(codeOffre)}`
    + `&periodicite=${encodeURIComponent(periodicite)}`,
  );

/**
 * Ouvre l'essai gratuit, sans passer par la page des tarifs.
 *
 * SANS DANGER POUR UN COMPTE EXISTANT : le serveur refuse d'ouvrir un second
 * essai et rend l'abonnement en place. C'est ce qui permet de l'appeler depuis
 * « Commencer gratuitement », un bouton qui reste visible une fois connecté —
 * sinon un parent qui paie 99 € le retoucherait par habitude et se
 * retrouverait avec trente minutes.
 */
export const ouvrirEssai = () => httpClient.post('/abonnements/essai');

/**
 * Rattrape un paiement dont le webhook n'est pas arrivé.
 *
 * Appelée au retour de la page de paiement, et seulement là. Le webhook reste
 * le chemin principal — il vient de Stripe, il est signé, il arrive même si le
 * navigateur est fermé. Mais il peut se perdre, et un parent qui a payé sans
 * rien recevoir n'a aucun moyen de s'en sortir seul.
 *
 * Sans effet quand tout s'est bien passé : le serveur voit l'abonnement déjà
 * enregistré et rend simplement l'état courant.
 */
export const rattraperPaiement = () => httpClient.post('/abonnements/rattraper');

export const mettreEnPause = () => httpClient.post('/abonnements/pause');

export const reprendre = () => httpClient.post('/abonnements/reprendre');

/**
 * Achète un pack d'heures.
 *
 * RÉPOND DEUX CHOSES DIFFÉRENTES, comme la souscription :
 * — `{ urlPaiement }` dans le cas normal. RIEN n'est crédité ; il faut y
 *   envoyer le navigateur, et c'est le webhook Stripe qui ajoutera les heures
 *   après encaissement.
 * — l'état du quota pour les comptes exemptés, qui ne passent pas par la
 *   caisse.
 *
 * Avant, cette route créditait directement : les heures étaient offertes à qui
 * cliquait. Le crédit ne se fait plus qu'au webhook, une seule fois par
 * session de paiement.
 */
export const recharger = (codePack) =>
  httpClient.post(`/abonnements/recharger?pack=${encodeURIComponent(codePack)}`);

/**
 * Résilie l'abonnement. L'accès continue jusqu'à la fin de la période payée —
 * le serveur n'interrompt rien sur-le-champ.
 */
export const resilier = () => httpClient.post('/abonnements/resilier');

/** Revient sur une résiliation, tant que la période court encore. */
export const annulerResiliation = () => httpClient.post('/abonnements/annuler-resiliation');

/**
 * Annule une descente de gamme programmée.
 *
 * Une descente ne prend effet qu'au renouvellement — le parent garde jusque-là
 * les heures qu'il a payées. Tant qu'elle n'a pas basculé, il doit pouvoir
 * revenir dessus, sinon la seule façon de rester sur sa formule serait de la
 * reprendre après coup.
 */
export const annulerChangement = () => httpClient.post('/abonnements/annuler-changement');

/**
 * Ouvre le portail de facturation Stripe : carte, factures, résiliation.
 * Répond `{ urlPortail }`, ou 404 si le compte n'a jamais rien payé.
 */
export const ouvrirPortail = () => httpClient.post('/abonnements/portail');
