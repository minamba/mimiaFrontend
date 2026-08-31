import { call, cancel, fork, put, take, takeLatest } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import {
  getConversations,
  creerConversation,
  getMessages,
  envoyerMessageStream,
  accueilStream,
  annonceStream,
} from '../api/chatApi';
import {
  CONVERSATION_OPEN_REQUEST,
  CONVERSATION_OPEN_SUCCESS,
  CONVERSATION_OPEN_FAILURE,
  MESSAGES_LOAD_SUCCESS,
  MESSAGE_SEND_REQUEST,
  MESSAGE_SEND_FAILURE,
  MESSAGE_DELTA,
  MESSAGE_DONE,
  ACCUEIL_REQUEST,
  CHAT_RESET,
  ANNONCE_REQUEST,
  QUOTA_EPUISE,
} from '../actions/chatActions';

/**
 * Ouvre la conversation de l'élève pour cette matière, ou la crée si c'est
 * la première fois. On réutilise la conversation existante plutôt que d'en
 * créer une par visite : sinon l'historique — donc la mémoire de l'agent —
 * repartirait de zéro à chaque ouverture.
 */
function* ouvrirConversationSaga(action) {
  const { eleveId, matiereId, seanceFinie } = action.payload;

  try {
    const existantes = yield call(getConversations, eleveId);
    let conversation = existantes.data.find((c) => c.matiereId === matiereId);

    if (!conversation) {
      const creee = yield call(creerConversation, { eleveId, matiereId });
      conversation = creee.data;
    }

    yield put({ type: CONVERSATION_OPEN_SUCCESS, payload: conversation });

    const messages = yield call(getMessages, conversation.id);
    yield put({ type: MESSAGES_LOAD_SUCCESS, payload: messages.data });

    // L'agent prend la parole en premier — première séance comme retour. C'est
    // le serveur qui tranche : lui seul sait depuis combien de temps l'élève
    // est parti. Décider ici obligerait à dupliquer cette règle.
    //
    // SAUF SUR UNE SÉANCE DÉJÀ TERMINÉE, et cette exception-là ne peut venir
    // que du navigateur : le serveur ignore la durée choisie et l'heure de
    // départ, il ne peut pas savoir que le temps est écoulé.
    //
    // Sans elle, recharger une séance finie déclenchait un accueil — « on
    // reprend là où on s'était arrêtés » — sur un cours qui n'a pas repris. Et
    // chaque rechargement était un appel au modèle facturé, autant de fois que
    // l'élève appuyait sur F5.
    if (!seanceFinie) {
      yield put({ type: ACCUEIL_REQUEST, payload: { conversationId: conversation.id } });
    }
  } catch (error) {
    yield put({
      type: CONVERSATION_OPEN_FAILURE,
      payload: "Impossible d'ouvrir la conversation.",
    });
  }
}

/**
 * Transforme le flux SSE en canal redux-saga.
 *
 * C'est le pont indispensable : `call()` attend une promesse qui se résout une
 * fois, alors qu'un flux émet N fois. Un eventChannel permet de faire un `take`
 * à chaque fragment et de dispatcher au fil de l'eau.
 */
function creerCanalStream(conversationId, contenu, annonce, secondesRestantes, pieceJointeId) {
  return eventChannel((emit) => {
    const controller = new AbortController();

    /**
     * Le canal est-il déjà refermé ?
     *
     * Annuler la saga referme le canal PUIS interrompt la requête. La promesse
     * du flux se rejette alors avec une AbortError, et sa gestion tentait
     * d'émettre sur un canal qui n'existait plus — d'où l'écran rouge
     * « signal is aborted without reason ». Rien n'était cassé : c'était le
     * bruit d'une annulation normale, mais il s'affichait comme une panne.
     */
    let ferme = false;
    const emettre = (evenement) => {
      if (!ferme) emit(evenement);
    };

    const options = {
      signal: controller.signal,
      onDelta: (texte) => emettre({ type: MESSAGE_DELTA, payload: texte }),
      onQuota: (motif) => emettre({ type: QUOTA_EPUISE, payload: motif }),
      onErreur: (message) => emettre({ type: MESSAGE_SEND_FAILURE, payload: message }),
    };

    // Trois façons pour l'agent de prendre la parole : sur un message de
    // l'élève, à l'ouverture de la séance, ou parce que l'horloge le demande.
    let flux;
    if (annonce) flux = annonceStream(conversationId, annonce, options);
    else if (contenu === null) flux = accueilStream(conversationId, options);
    // Le temps restant n'accompagne que le message de l'élève : les annonces
    // portent déjà l'échéance dans leur type, et l'accueil ouvre la séance.
    else {
      flux = envoyerMessageStream(
        conversationId, contenu, { ...options, secondesRestantes, pieceJointeId },
      );
    }

    flux
      .then(() => {
        emettre({ type: MESSAGE_DONE });
        emettre(END);
      })
      .catch((error) => {
        // AbortError = l'élève a coupé la parole, ou a changé de page. C'est
        // le déroulement normal d'une interruption, pas une panne.
        if (error?.name !== 'AbortError') {
          emettre({
            type: MESSAGE_SEND_FAILURE,
            payload: 'La connexion a été interrompue, veuillez réessayer.',
          });
        }
        emettre(END);
      });

    // Appelé quand la saga est annulée (changement de page, nouvelle requête) :
    // coupe la génération côté serveur au lieu de la laisser tourner.
    return () => {
      ferme = true;
      controller.abort();
    };
  });
}

function* envoyerMessageSaga(action) {
  const {
    conversationId, contenu = null, annonce = null,
    secondesRestantes = null, pieceJointeId = null,
  } = action.payload;

  const canal = yield call(
    creerCanalStream, conversationId, contenu, annonce, secondesRestantes, pieceJointeId,
  );

  try {
    for (;;) {
      const evenement = yield take(canal);
      yield put(evenement);
    }
  } finally {
    canal.close();
  }
}

/**
 * UNE SEULE GÉNÉRATION À LA FOIS, quelle qu'en soit l'origine.
 * =============================================================
 *
 * Trois choses peuvent faire parler le professeur : le message de l'élève,
 * l'accueil à l'ouverture, et les annonces du minuteur. Elles avaient chacune
 * leur veilleur — `takeLatest` pour la première, `takeLeading` pour les deux
 * autres — et c'est là qu'était le défaut : `takeLatest` n'annule que les
 * tâches de SON type d'action. Une annonce de minuteur et un message d'élève
 * pouvaient donc streamer en même temps.
 *
 * Les trois écrivent pourtant dans le même tampon, `reponseEnCours`, par
 * simple concaténation. Deux flux simultanés donnaient très exactement ceci,
 * relevé en séance :
 *
 *     a_revParoir: Confirmer par une évaluation notée…
 *     [/RAPPORT]fait Bilal, à la prochaine alors !
 *
 * — le « Par » de « Parfait » inséré au milieu de « a_revoir ». Pire, le
 * `MESSAGE_START` du second flux remet le tampon à vide : le début du message
 * disparaît (« travaille: » devenu « ille: »), et avec lui la balise ouvrante
 * du bloc `[RAPPORT]`. Le filtre ne trouvant plus d'ouverture ne masque plus
 * rien, et le compte rendu destiné à la base s'est affiché en clair sous les
 * yeux de l'élève, `[/RAPPORT]` compris.
 *
 * D'où un veilleur unique, qui arbitre entre les trois :
 *
 *   — un message de l'élève ANNULE ce qui est en cours. C'est la coupure de
 *     parole, et c'est voulu : il parle pendant que le professeur répond.
 *   — une annonce ou un accueil qui arrive pendant une génération est
 *     ABANDONNÉ. Ce sont des relances du système, pas des tours de parole :
 *     mieux vaut en perdre une que l'intercaler dans une phrase. Le minuteur
 *     repassera, et son marqueur voyage de toute façon avec le tour suivant.
 *
 * Cette seconde règle ne suffisait PAS à elle seule, contrairement à ce qui
 * était écrit ici : elle suppose que le doublon arrive pendant que le premier
 * tourne. Au double montage de React, le second accueil n'est dispatché
 * qu'après trois requêtes HTTP de réouverture — largement le temps que le
 * premier ait fini. La garde ne voyait alors plus rien à écarter, et l'élève
 * recevait deux messages de bienvenue.
 *
 * D'où la troisième règle : CHAT_RESET — l'élève quitte l'écran — annule la
 * génération en cours.
 */
function* superviseurGeneration() {
  let tache = null;

  for (;;) {
    const action = yield take([
      MESSAGE_SEND_REQUEST, ACCUEIL_REQUEST, ANNONCE_REQUEST, CHAT_RESET,
    ]);
    const occupe = Boolean(tache && tache.isRunning());

    // QUITTER L'ÉCRAN COUPE LA GÉNÉRATION EN COURS.
    //
    // Rien ne le faisait, et c'est ce qui produisait DEUX accueils. Au double
    // montage de React en mode strict : le premier accueil partait, le
    // démontage ne l'arrêtait pas, et le second montage rejouait l'ouverture —
    // trois requêtes HTTP, assez de temps pour que le premier accueil ait fini.
    // La garde « occupé ? » ne voyait donc plus rien à écarter, et l'élève
    // recevait deux messages de bienvenue.
    //
    // C'est aussi ce qu'il faut faire en soi : un professeur qui parle à un
    // écran que l'élève a quitté coûte des jetons pour personne.
    if (action.type === CHAT_RESET) {
      if (occupe) yield cancel(tache);
      tache = null;
      continue;
    }

    if (action.type === MESSAGE_SEND_REQUEST) {
      // L'annulation ferme le canal, qui interrompt la requête : le serveur
      // cesse de générer, et on ne paie plus une réponse que personne
      // n'écoutera.
      if (occupe) yield cancel(tache);
    } else if (occupe) {
      continue;
    }

    tache = yield fork(envoyerMessageSaga, action);
  }
}

export default function* chatSaga() {
  yield takeLatest(CONVERSATION_OPEN_REQUEST, ouvrirConversationSaga);
  yield fork(superviseurGeneration);
}
