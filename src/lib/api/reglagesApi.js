import httpClient from './httpClient';

/**
 * Les drapeaux que le site lit AVANT toute connexion.
 *
 * Route anonyme : la barre de navigation doit savoir s'il faut masquer les
 * tarifs alors que personne n'est encore identifié — c'est précisément le cas
 * d'usage du mode test.
 *
 * Rien de secret n'y transite. Savoir que le service est en accès privé
 * n'ouvre aucune porte : c'est le serveur d'identité qui refuse les
 * inscriptions, pas l'affichage.
 */
export const getReglagesPublics = () => httpClient.get('/reglages/publics');

export default getReglagesPublics;
