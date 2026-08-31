import httpClient, { API_BASE_URL, enTeteAuth } from './httpClient';

export const getConversations = (eleveId) =>
  httpClient.get('/conversations', { params: { eleveId } });

export const creerConversation = (data) => httpClient.post('/conversations', data);

export const getMessages = (conversationId) =>
  httpClient.get(`/conversations/${conversationId}/messages`);

/** Signale que l'élève quitte le cours : il sera accueilli à son retour. */
/**
 * Signale le départ AU MOMENT OÙ LA PAGE SE FERME.
 *
 * POURQUOI PAS `quitterCours`
 * ---------------------------
 * Une requête ordinaire lancée pendant la fermeture est annulée par le
 * navigateur : la page meurt avant que la connexion ne parte. L'élève qui ferme
 * son onglet — ce que font la plupart des enfants, plutôt que de cliquer sur
 * « Quitter le cours » — n'était donc jamais signalé.
 *
 * `sendBeacon` est fait pour ça : le navigateur prend la charge, garantit
 * l'envoi, et laisse la page mourir. Rien à attendre, rien à annuler.
 *
 * CE QUE ÇA CHANGE POUR LA FACTURE
 * --------------------------------
 * Sans ce signal, la séance n'est analysée qu'au balayage périodique, une
 * demi-heure plus tard. Avec lui, l'analyse part tout de suite et le balayage
 * redevient ce qu'il doit être : un filet pour les cas rares — coupure de
 * réseau, batterie vide, navigateur qui plante.
 *
 * SANS JETON D'AUTORISATION, et c'est une limite assumée : `sendBeacon` ne
 * permet pas d'en-tête. La route doit donc accepter cet appel sur le seul
 * identifiant de conversation. Ce qu'il déclenche — marquer une sortie — n'ouvre
 * aucune donnée et ne coûte rien à un tiers qui le rejouerait.
 */
export const signalerFermeture = (conversationId) => {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return false;

  return navigator.sendBeacon(
    `${API_BASE_URL}/conversations/${conversationId}/fermeture`,
  );
};

export const quitterCours = (conversationId) =>
  httpClient.post(`/conversations/${conversationId}/quitter`);

/**
 * Envoie un message et consomme la réponse en flux.
 *
 * Axios ne sait pas lire un corps de réponse au fil de l'eau : il attend la
 * réponse complète. On passe donc par fetch + ReadableStream, seule façon
 * d'afficher la réponse token par token.
 *
 * EventSource n'est pas utilisable non plus : il ne fait que du GET et ne
 * permet pas d'envoyer l'en-tête Authorization.
 *
 * @param onDelta  appelé à chaque fragment de texte
 * @param onErreur appelé si le serveur signale une erreur
 * @param onQuota  appelé si le forfait de la famille est épuisé
 * @param signal   AbortSignal pour interrompre la génération
 */
export const envoyerMessageStream = (conversationId, contenu, options = {}) => {
  const { secondesRestantes, pieceJointeId, ...flux } = options;

  // Le chronomètre est tenu ici, dans le navigateur : le serveur ne sait pas
  // quelle durée l'élève a choisie ni quand il a commencé. Sans cette valeur,
  // le professeur devine le temps restant — et il conclut trop tôt.
  return consommerFlux(
    `/conversations/${conversationId}/messages`,
    { contenu, secondesRestantes, pieceJointeId },
    flux,
  );
};

/**
 * Dépose un document AVANT de l'envoyer.
 *
 * Deux temps et non un seul, et c'est délibéré : le fichier monte pendant que
 * l'élève écrit sa phrase. Tout envoyer d'un bloc au moment du « Envoyer »
 * ferait attendre plusieurs secondes devant un écran figé, avec une photo de
 * trois mégaoctets sur un réseau de collège.
 *
 * Le serveur refuse ce qu'il ne sait pas lire, et son motif est écrit pour
 * l'élève — on l'affiche tel quel plutôt que d'en inventer un autre.
 */
export const deposerPieceJointe = (conversationId, fichier, options = {}) => {
  const corps = new FormData();
  corps.append('fichier', fichier, fichier.name);

  return httpClient.post(`/conversations/${conversationId}/pieces-jointes`, corps, {
    signal: options.signal,
    onUploadProgress: options.onProgression,
  });
};

/**
 * L'adresse d'un document, pour l'afficher.
 *
 * Elle passe par l'API et non par un fichier statique : ce sont des copies
 * d'enfants, elles ne doivent être lisibles que par le compte qui les a
 * déposées. La contrepartie est qu'un `<img src>` nu ne suffit pas — il faut
 * le jeton — d'où le chargement en blob par `chargerPieceJointe`.
 */
export const urlPieceJointe = (conversationId, pieceId) =>
  `${API_BASE_URL}/conversations/${conversationId}/pieces-jointes/${pieceId}`;

/**
 * Charge un document et rend une URL locale utilisable par `<img>`.
 *
 * L'appelant DOIT appeler `URL.revokeObjectURL` quand il a fini : sans ça,
 * chaque ouverture de conversation laisse plusieurs mégaoctets accrochés au
 * document, et l'onglet enfle jusqu'à ramer.
 */
export const chargerPieceJointe = async (conversationId, pieceId) => {
  const reponse = await httpClient.get(
    `/conversations/${conversationId}/pieces-jointes/${pieceId}`,
    { responseType: 'blob' },
  );

  return URL.createObjectURL(reponse.data);
};

/**
 * Fait parler l'agent en premier, à l'ouverture de la séance.
 * Aucun message élève n'est envoyé ni enregistré.
 */
export const accueilStream = (conversationId, options) =>
  consommerFlux(`/conversations/${conversationId}/accueil`, null, options);

/**
 * Prise de parole commandée par l'horloge de séance.
 * @param type 'fin-proche' à cinq minutes du terme, 'fin' à l'échéance.
 */
export const annonceStream = (conversationId, type, options) =>
  consommerFlux(`/conversations/${conversationId}/annonce?type=${type}`, null, options);

const consommerFlux = async (chemin, corps, { onDelta, onErreur, onQuota, signal } = {}) => {
  // `enTeteAuth` ET PAS `getAccessToken` : une session enfant n'a pas de jeton
  // OIDC. L'enfant entre par un code, ce qui lui ouvre une session « Eleve » —
  // un schéma d'autorisation différent, que seule `enTeteAuth` sait produire.
  //
  // Avec `getAccessToken`, l'en-tête valait littéralement « Bearer null » pour
  // un enfant : le serveur répondait 401 et l'écran affichait « La connexion a
  // été interrompue ». Or ce flux porte TOUTES les prises de parole du cours —
  // l'accueil, chaque message, les annonces de fin. Autrement dit le produit
  // fonctionnait pour le parent qui teste, et pour personne d'autre.
  const entete = await enTeteAuth();

  const reponse = await fetch(`${API_BASE_URL}${chemin}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(entete ? { Authorization: entete } : {}),
    },
    body: corps ? JSON.stringify(corps) : undefined,
    signal,
  });

  if (!reponse.ok) {
    throw new Error(`Le serveur a répondu ${reponse.status}.`);
  }

  const reader = reponse.body.getReader();

  // INTERROMPRE UNE REQUÊTE REJETTE DEUX PROMESSES, PAS UNE.
  //
  // Celle du `read()` en cours, qu'on attend juste en dessous et dont
  // l'AbortError est traitée par l'appelant — c'est le déroulement normal d'une
  // coupure de parole. Et celle-ci, `reader.closed`, que `getReader()` crée
  // toute seule et que personne n'observe : le navigateur la signale alors
  // comme rejet non géré.
  //
  // D'où le grand écran rouge « signal is aborted without reason » à chaque
  // fois que l'élève coupait la parole au professeur, alors que rien n'était
  // cassé — la trace pointait notre propre `controller.abort()`. L'overlay
  // n'existe qu'en développement, mais un rejet non géré reste un rejet non
  // géré : on le reconnaît explicitement au lieu de le laisser remonter.
  reader.closed.catch(() => {});

  const decoder = new TextDecoder();
  let tampon = '';

  // Un chunk réseau ne correspond pas à un événement SSE : il peut en contenir
  // plusieurs, ou couper le dernier en deux. On accumule et on ne traite que
  // les événements complets (séparés par une ligne vide).
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    tampon += decoder.decode(value, { stream: true });

    const evenements = tampon.split('\n\n');
    tampon = evenements.pop() ?? '';

    for (const evenement of evenements) {
      const ligne = evenement.split('\n').find((l) => l.startsWith('data: '));
      if (!ligne) continue;

      let charge;
      try {
        charge = JSON.parse(ligne.slice(6));
      } catch {
        continue; // fragment illisible : on l'ignore plutôt que de casser le flux
      }

      if (charge.type === 'delta') onDelta?.(charge.texte);
      // Distinct d'une erreur : « il n'y a plus d'heures » n'appelle ni le même
      // message ni la même action que « c'est cassé ».
      else if (charge.type === 'quota') onQuota?.(charge.motif);
      else if (charge.type === 'erreur') onErreur?.(charge.message);
    }
  }
};
