import httpClient from './httpClient';

/**
 * Envoie un message depuis le formulaire de contact.
 *
 * L'adresse n'est transmise que pour un visiteur non connecté : quand le jeton
 * en porte une, c'est elle qui fait foi côté serveur. Un formulaire ne décide
 * pas de qui l'on est.
 */
export const envoyerMessageContact = (message) =>
  httpClient.post('/contact', message).then((r) => r.data);
