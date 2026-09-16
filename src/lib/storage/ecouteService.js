/**
 * Reconnaissance vocale — l'élève parle.
 *
 * S'appuie sur la Web Speech API du navigateur : aucun appel serveur, aucun
 * coût. Disponible sur Chrome, Edge et Safari ; absente de Firefox, où le
 * champ texte reste le seul moyen de saisie.
 *
 * Attention : sur Chrome, l'audio est transmis aux serveurs de Google pour la
 * transcription. Sans réseau, la reconnaissance démarre mais ne renvoie rien.
 */

const Reconnaissance =
  typeof window !== 'undefined'
    ? window.SpeechRecognition ?? window.webkitSpeechRecognition
    : null;

/** Silence après lequel on considère que l'élève a fini sa phrase. */
const SILENCE_MS = 1600;

/**
 * Combien de temps on laisse à l'élève AVANT qu'il commence à parler.
 *
 * Sans rapport avec le silence qui suit une phrase : ici il n'a encore rien
 * dit, il réfléchit à une question qu'on vient de lui poser. Douze secondes,
 * c'est le temps de poser un calcul dans sa tête.
 */
const ATTENTE_DEMARRAGE_MS = 12000;

/**
 * Durée maximale absolue d'une écoute.
 *
 * Filet de sécurité indispensable : si le navigateur détecte du son mais ne
 * renvoie jamais de transcription — micro muet, service Google injoignable —
 * aucun autre événement ne viendra clore l'écoute. Sans ce plafond, le micro
 * reste actif pour toujours et l'élève n'a aucun retour.
 */
const DUREE_MAX_MS = 20000;

/**
 * Amplitude en dessous de laquelle on considère le micro silencieux.
 * Mesurée sur une échelle 0–127 : le bruit ambiant d'une pièce calme dépasse
 * déjà 4, donc rester sous ce seuil signifie que rien n'arrive du tout.
 */
const SEUIL_SILENCE = 4;

/**
 * L'IPHONE, ET POURQUOI « MICRO AUTORISÉ » NE SUFFIT PAS — relevé par Camara
 * le 15/09/2026 : le micro était autorisé et la page affichait pourtant
 * « bloqué par le système », même après rechargement.
 *
 * Sur iPhone et iPad, la reconnaissance vocale du navigateur est celle
 * d'Apple (Siri et Dictée). Deux conditions, qu'aucune autorisation de site
 * ne remplace :
 *   1. SAFARI SEULEMENT. Chrome, Firefox, Edge sur iPhone exposent l'objet
 *      mais le service leur est refusé : l'erreur `service-not-allowed`
 *      tombe à chaque essai, quelle que soit l'autorisation du micro.
 *   2. SIRI ET DICTÉE ACTIVÉS dans les réglages de l'appareil.
 *
 * Et une troisième, propre au code : sur iPhone, ouvrir le micro une seconde
 * fois en parallèle (la sonde de niveau plus bas) fait échouer la
 * reconnaissance. La sonde n'y est donc pas lancée.
 */
const SUR_IOS = typeof navigator !== 'undefined' && (
  /iPad|iPhone|iPod/.test(navigator.userAgent)
  // iPadOS se déclare « Macintosh » : c'est l'écran tactile qui le trahit.
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

/** Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS)… sur iPhone : pas Safari. */
const NAVIGATEUR_TIERS_IOS = SUR_IOS
  && /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(navigator.userAgent);

const MESSAGE_IOS_TIERS =
  "Sur iPhone, la dictée ne marche que dans Safari. Ouvre mimia.fr dans Safari, "
  + "ou remplis les champs à la main.";

const MESSAGE_IOS_SIRI =
  "La dictée est coupée sur ce téléphone. Active « Siri » et « Dictée » dans "
  + "Réglages, puis réessaie — ou remplis les champs à la main.";

const MESSAGES = {
  'not-allowed': "Le micro est bloqué. Autorise-le dans les réglages du navigateur.",
  // Le message dit quoi FAIRE, et ce qu'il faut faire dépend de l'appareil.
  'service-not-allowed': SUR_IOS
    ? (NAVIGATEUR_TIERS_IOS ? MESSAGE_IOS_TIERS : MESSAGE_IOS_SIRI)
    : "La dictée est bloquée par le système. Tu peux remplir les champs à la main.",
  'audio-capture': "Aucun micro détecté. Vérifie qu'il est bien branché.",
  network: "La reconnaissance vocale n'a pas pu joindre le service. Vérifie ta connexion.",
};

export const ecouteService = {
  supporte: Boolean(Reconnaissance),

  /**
   * Démarre l'écoute.
   *
   * @param onPartiel  transcription provisoire, affichée au fil de la parole
   * @param onFinal    transcription stabilisée
   * @param onFin      appelé une seule fois, avec le texte complet (peut être vide)
   * @param onErreur   message prêt à afficher
   * @param langue     code BCP-47 — voir `langueTranscription.js`. Le français
   *                   par défaut convient à tout sauf aux cours de langue,
   *                   où le forcer abîme la réponse qu'on évalue.
   * @returns un objet avec .arreter()
   */
  ecouter({ onPartiel, onFinal, onFin, onErreur, langue = 'fr-FR' } = {}) {
    if (!Reconnaissance) return { arreter: () => {} };

    // Chrome & co. sur iPhone : le service sera refusé à coup sûr. On le dit
    // tout de suite, plutôt que de faire demander le micro pour rien.
    if (NAVIGATEUR_TIERS_IOS) {
      onErreur?.(MESSAGE_IOS_TIERS);
      onFin?.('', { niveauMax: 0, peripherique: null, muet: false });
      return { arreter: () => {} };
    }

    const reconnaissance = new Reconnaissance();
    reconnaissance.lang = langue;

    // Continu : sans ça, Chrome coupe à la première hésitation, et un enfant
    // qui cherche ses mots se ferait interrompre en plein milieu. C'est le
    // chronomètre de silence ci-dessous qui décide de la fin, pas le navigateur.
    reconnaissance.continuous = true;
    reconnaissance.interimResults = true;

    let final = '';
    let termine = false;
    let chrono = null;

    // --- Sonde de niveau -----------------------------------------------
    // La reconnaissance ne dit jamais POURQUOI elle n'a rien transcrit. On
    // écoute donc le micro en parallèle, uniquement pour mesurer s'il sort du
    // son. Un niveau resté à zéro désigne un périphérique muet — mauvaise
    // entrée sélectionnée, casque débranché — et pas un élève trop timide.
    let niveauMax = 0;
    let peripherique = null;
    let fermerSonde = null;

    (async () => {
      // PAS SUR IPHONE : un second accès au micro pendant la reconnaissance la
      // fait échouer (voir SUR_IOS). On y perd le diagnostic « micro muet »,
      // pas la dictée.
      if (SUR_IOS) return;

      try {
        const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (termine) {
          flux.getTracks().forEach((piste) => piste.stop());
          return;
        }

        peripherique = flux.getAudioTracks()[0]?.label || null;

        const contexte = new AudioContext();
        const analyseur = contexte.createAnalyser();
        contexte.createMediaStreamSource(flux).connect(analyseur);

        const echantillons = new Uint8Array(analyseur.fftSize);
        const mesure = setInterval(() => {
          analyseur.getByteTimeDomainData(echantillons);
          for (const valeur of echantillons) {
            const ecart = Math.abs(valeur - 128); // 128 = silence absolu
            if (ecart > niveauMax) niveauMax = ecart;
          }
        }, 200);

        fermerSonde = () => {
          clearInterval(mesure);
          flux.getTracks().forEach((piste) => piste.stop());
          contexte.close();
        };
      } catch {
        // Permission refusée : onerror s'en charge, la sonde n'a rien à dire.
      }
    })();

    const arreterMoteur = () => {
      try {
        reconnaissance.stop();
      } catch {
        // stop() lève si la reconnaissance est déjà terminée : sans gravité,
        // mais il faut alors conclure nous-mêmes, onend ne viendra pas.
        conclure();
      }
    };

    /**
     * (Re)lance le compte à rebours de silence. C'est lui qui déclenche l'envoi :
     * l'élève porte un casque, lui demander de recliquer sur le micro pour
     * valider casserait complètement la sensation de conversation.
     *
     * Un chronomètre tourne TOUJOURS entre le démarrage et la fin — c'est ce
     * qui garantit qu'une écoute finit toujours par se terminer.
     */
    const armerChrono = (delai = SILENCE_MS) => {
      if (chrono) clearTimeout(chrono);
      chrono = setTimeout(arreterMoteur, delai);
    };

    function conclure() {
      if (termine) return; // onend peut suivre un stop() manuel : une seule fois
      termine = true;
      if (chrono) clearTimeout(chrono);
      clearTimeout(plafond);
      fermerSonde?.();

      if (process.env.NODE_ENV !== 'production') {
        console.log('[micro] bilan — niveau max :', niveauMax, '| périphérique :', peripherique);
      }

      onFin?.(final.trim(), { niveauMax, peripherique, muet: niveauMax < SEUIL_SILENCE });
    }

    // Plafond absolu, jamais annulé : quoi qu'il arrive, l'écoute se termine.
    const plafond = setTimeout(arreterMoteur, DUREE_MAX_MS);

    reconnaissance.onresult = (evenement) => {
      let partiel = '';

      for (let i = evenement.resultIndex; i < evenement.results.length; i += 1) {
        const resultat = evenement.results[i];
        if (resultat.isFinal) final += resultat[0].transcript;
        else partiel += resultat[0].transcript;
      }

      if (partiel) onPartiel?.(final + partiel);
      else if (final) onFinal?.(final);

      armerChrono();
    };

    // Pendant que l'élève parle, on laisse une fenêtre plus large — mais on
    // ne coupe JAMAIS le chronomètre : sans lui, une parole détectée sans
    // transcription bloquerait l'écoute indéfiniment.
    reconnaissance.onspeechstart = () => armerChrono(SILENCE_MS * 3);
    reconnaissance.onspeechend = () => armerChrono();
    reconnaissance.onsoundstart = () => armerChrono(SILENCE_MS * 3);

    reconnaissance.onerror = (evenement) => {
      // `no-speech` et `aborted` sont des fins normales, pas des pannes.
      if (evenement.error !== 'no-speech' && evenement.error !== 'aborted') {
        onErreur?.(MESSAGES[evenement.error] ?? "Le micro n'a pas fonctionné. Réessaie.");
      }
      conclure();
    };

    reconnaissance.onend = conclure;

    // Trace des événements bruts en développement : c'est la seule façon de
    // distinguer « le micro ne capte rien » de « la transcription n'arrive pas ».
    if (process.env.NODE_ENV !== 'production') {
      ['audiostart', 'soundstart', 'speechstart', 'speechend', 'soundend', 'audioend', 'nomatch']
        .forEach((nom) => {
          reconnaissance.addEventListener(nom, () => console.log('[micro]', nom));
        });
      reconnaissance.addEventListener('error', (e) => console.log('[micro] error:', e.error));
      reconnaissance.addEventListener('result', (e) =>
        console.log('[micro] result:', e.results[e.resultIndex]?.[0]?.transcript));
    }

    try {
      reconnaissance.start();

      // Le temps de se lancer. Généreux, et volontairement : l'élève vient
      // d'entendre une question et il CHERCHE. Fermer la fenêtre au bout de
      // six secondes rouvrait le micro en boucle et faisait croire au
      // professeur que la pièce était vide.
      armerChrono(ATTENTE_DEMARRAGE_MS);
    } catch {
      // start() lève si une reconnaissance tourne déjà.
      onErreur?.("Le micro est déjà utilisé. Attends une seconde et réessaie.");
      conclure();
    }

    return {
      arreter: arreterMoteur,
    };
  },
};
