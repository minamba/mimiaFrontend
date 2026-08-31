const CLE = 'mimia-essai-vise';

/**
 * « Commencer gratuitement » traverse la connexion.
 *
 * LE PROBLÈME
 * ----------
 * Le visiteur clique sur une promesse de gratuité, part s'inscrire sur le
 * serveur d'identité, revient — et atterrit sur la liste de ses enfants. Pour
 * que son enfant puisse ouvrir un cours, il lui faut encore trouver la page
 * des tarifs et y choisir l'essai. On lui fait re-décider ce qu'il avait déjà
 * décidé, et la grille tarifaire, à ce moment-là, ressemble à un péage.
 *
 * POURQUOI `sessionStorage`
 * ------------------------
 * L'intention doit survivre à une redirection complète vers un autre domaine
 * et retour : ni l'état React ni une variable ne passent ce voyage. Elle doit
 * en revanche mourir avec l'onglet — la retrouver trois jours plus tard
 * ouvrirait un essai que plus personne n'a demandé.
 *
 * CE QUE ÇA NE GARANTIT PAS
 * ------------------------
 * Rien du tout, et c'est voulu : n'importe qui peut écrire cette clé à la
 * main. C'est le serveur qui décide, et il n'accorde l'essai qu'à un compte
 * qui n'a jamais eu d'abonnement. Ici on ne transporte qu'une intention.
 */
export const viserEssai = () => sessionStorage.setItem(CLE, '1');

export const essaiVise = () => sessionStorage.getItem(CLE) === '1';

/** À appeler une fois l'essai demandé — réussi ou non, on ne réessaie pas. */
export const oublierEssai = () => sessionStorage.removeItem(CLE);
