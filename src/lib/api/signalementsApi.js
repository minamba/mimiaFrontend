import httpClient from './httpClient';

/**
 * Dépose un signalement depuis le bouton « Signaler », visible dès qu'on est
 * connecté — parent ou enfant. Le serveur résout seul le parent à prévenir :
 * rien à lui transmettre ici que la catégorie et le message.
 */
export const creerSignalement = (categorie, description) =>
  httpClient.post('/signalements', { categorie, description });

/** Joint une capture d'écran ou un document à son propre signalement, juste créé. */
export const joindrePieceSignalement = (id, fichier) => {
  const corps = new FormData();
  corps.append('fichier', fichier);
  return httpClient.post(`/signalements/${id}/pieces`, corps);
};
