import { API_BASE_URL, enTeteAuth } from '../api/httpClient';

/**
 * Écoute en flux : le micro part vers notre serveur, les transcriptions
 * reviennent au fil de l'eau.
 *
 * Remplace le Web Speech du navigateur, qui avait deux défauts qu'aucun
 * réglage ne corrigeait : il n'existe pas sur Firefox, et sa détection de fin
 * de tour attend un silence long et non réglable — c'est lui qui donnait
 * l'impression de parler à une machine qui attend son tour.
 *
 * L'interface est volontairement la MÊME que celle d'ecouteService : le chat
 * n'a pas à savoir lequel des deux il utilise, et le repli se fait en une
 * ligne si la liaison échoue.
 */

/** Ce que le fournisseur attend : PCM 16 bits, mono. */
const FREQUENCE = 24000;

/**
 * Seuil de voix, en amplitude moyenne. Au-dessus, on considère que quelqu'un
 * parle. Réglé bas : rater le début d'un mot coûte plus cher que transmettre
 * une demi-seconde de souffle.
 */
const SEUIL_VOIX = 0.006;

/**
 * Seuil pour COUPER LA PAROLE au professeur, nettement plus haut.
 *
 * Deux décisions différentes, deux seuils. Transmettre un peu de souffle ne
 * coûte rien et évite de perdre une réponse ; faire taire le professeur au
 * moindre bruit, si. Un raclement de gorge, un clavier, ou sa propre voix
 * revenant des haut-parleurs suffisaient à le couper en plein milieu d'une
 * phrase.
 */
const SEUIL_COUPURE = 0.025;

/**
 * Durée de son soutenu, au-dessus du seuil de coupure, avant de considérer
 * que l'élève a vraiment pris la parole.
 *
 * Un bruit est bref, une parole dure. Deux cent cinquante millisecondes, c'est
 * moins qu'une syllabe entière — l'interruption reste immédiate à l'oreille —
 * mais c'est assez pour écarter tout ce qui n'est pas une voix.
 */
const DUREE_COUPURE_MS = 250;

/**
 * Au-delà, le son n'est plus une voix : c'est du souffle.
 *
 * POURQUOI LE VOLUME NE SUFFIT PAS
 * --------------------------------
 * Relevé en séance : « je fais pas parlé, juste j'ai respiré fort ou fait un
 * soupirement, la voix du professeur coupe ». Un soupir est FORT et SOUTENU —
 * il passait les deux tests précédents sans difficulté. Monter le seuil de
 * volume ne réglerait rien : un soupir est aussi fort qu'un mot.
 *
 * Ce qui sépare les deux n'est pas l'intensité, c'est le VOISEMENT. Une voyelle
 * est périodique : les cordes vocales vibrent, l'onde repasse par zéro à la
 * fréquence du son, deux fois par période. Un souffle est un bruit large bande,
 * qui repasse par zéro dix à vingt fois plus souvent.
 *
 * On compte donc ces passages. Une voix d'enfant, même aiguë, tourne autour de
 * 0,02 à 0,06 par échantillon ; un souffle, entre 0,15 et 0,35. Le seuil est
 * posé entre les deux, plus près de la voix — rater une interruption est moins
 * grave que d'en inventer une.
 */
const SEUIL_VOISEMENT = 0.1;

/**
 * Part de blocs voisés exigée pour couper la parole.
 *
 * PAS TOUS, ET C'EST ESSENTIEL. Une phrase contient des consonnes sourdes —
 * le « s » de « stop », le « ch » de « chut » — qui sont, elles aussi, du bruit
 * large bande. Exiger la perfection ferait retomber le compteur à chaque
 * sifflante, et l'élève ne pourrait plus jamais couper son professeur.
 *
 * Sur deux cent cinquante millisecondes, une parole réelle est voisée à
 * cinquante ou soixante-dix pour cent. Un soupir l'est à zéro.
 */
const PART_VOISEE_MIN = 0.35;

/**
 * On continue d'émettre pendant ce délai après la dernière syllabe.
 *
 * Sa seule raison d'être aujourd'hui : que la FIN de la phrase parte bien. Le
 * seuil de voix se franchit à la baisse un peu avant le dernier souffle, et
 * couper net tronquerait le mot final.
 *
 * Elle a valu 2500 pendant longtemps, et c'était du temps mort pur : on
 * diffusait du silence en espérant que le fournisseur se décide de lui-même à
 * clore le tour. Avec la génération et la synthèse par-dessus, la réponse
 * mettait cinq à six secondes — on avait réglé le mutisme en détruisant la
 * fluidité. Depuis qu'on clôt le tour NOUS-MÊMES (voir SILENCE_FIN_MS), il n'y
 * a plus rien à espérer et donc plus rien à attendre.
 */
const TRAINE_MS = 600;

/**
 * Le silence après lequel ON DÉCLARE le tour terminé.
 *
 * C'est désormais le seul juge, et c'est ce qui a réglé le « allo ».
 * -----------------------------------------------------------------
 * La détection sémantique du fournisseur ne transcrit qu'APRÈS avoir décidé
 * que la phrase était finie. Quand elle ne décide pas, elle n'envoie rien du
 * tout — pas même un fragment provisoire. On ne pouvait donc ni attendre son
 * verdict, ni le deviner : il n'y avait rien à deviner.
 *
 * À ce seuil, on lui envoie l'ordre de clore (`input_audio_buffer.commit`) et
 * il transcrit sur-le-champ. Le navigateur MESURE le niveau sonore ; lui ne
 * fait que le supposer. Le mieux placé des deux décide.
 *
 * Juste au-delà de la traîne, pour que la fin de phrase soit partie avant
 * qu'on ne clôture. Deux cent cinquante millisecondes suffisent — chaque
 * dixième ajouté ici se retrouve tel quel dans l'attente de l'élève.
 *
 * Et s'il s'agissait d'une simple respiration, rien n'est perdu : le tampon
 * d'assemblage recolle les morceaux avant l'envoi, et attend plus longtemps
 * quand la phrase s'achève sur « parce que ».
 */
const SILENCE_FIN_MS = TRAINE_MS + 250;

/**
 * Le délai au-delà duquel on déclare l'oreille MORTE.
 *
 * POURQUOI CE CHIEN DE GARDE EXISTE
 * ---------------------------------
 * Relevé en séance : « on dirait que mon micro est en mute alors qu'il l'est
 * pas ». Le champ restait vide PENDANT qu'il parlait — donc rien ne revenait
 * du tout, pas même un provisoire.
 *
 * Une liaison WebSocket peut rester parfaitement ouverte alors que ce qu'il y
 * a au bout ne répond plus : le relais serveur s'est arrêté, la session du
 * fournisseur a expiré, un incident qu'on n'a pas su nommer. Rien de tout cela
 * ne ferme la liaison, et le navigateur continuait donc d'y déverser du son
 * pour l'éternité, l'onde bleue allumée, avec « Je t'écoute… » à l'écran.
 *
 * On ne peut pas énumérer les causes ; on peut constater le symptôme. Nous
 * avons émis de la parole ET annoncé la fin du tour : une réponse DOIT
 * revenir. Si rien ne vient, l'oreille est morte, on raccroche, et l'effet de
 * réouverture en rebâtit une trois cents millisecondes plus tard.
 *
 * Huit secondes : la transcription mesurée tient sous les deux. On ne veut pas
 * raccrocher sur une lenteur passagère — une reconnexion à tort coûte une
 * session de transcription, et un cours muet coûte la séance.
 */
const SANS_RETOUR_MS = 8000;

/**
 * Longueur du son gardé en réserve AVANT que la voix soit détectée.
 *
 * Le seuil se franchit toujours un peu après la première syllabe : sans cette
 * avance, chaque phrase commencerait tronquée. Trois cents millisecondes
 * suffisent et ne coûtent presque rien.
 */
const AVANCE_MS = 300;

/**
 * Le petit programme qui tourne dans le fil audio.
 *
 * Il vit dans un AudioWorklet et non dans le fil principal : la capture ne doit
 * pas hoqueter parce que React rend un message. Écrit ici et chargé depuis un
 * Blob plutôt que servi comme fichier — il reste ainsi avec le code qui
 * l'utilise, et il n'y a rien à déployer à côté.
 */
const PROGRAMME_CAPTURE = `
class Capture extends AudioWorkletProcessor {
  process(entrees) {
    const canal = entrees[0]?.[0];
    if (canal) this.port.postMessage(new Float32Array(canal));
    return true;
  }
}
registerProcessor('capture', Capture);
`;

/**
 * Le débit maximum d'une parole humaine, en caractères par seconde.
 *
 * POURQUOI CE GARDE-FOU EXISTE
 * ----------------------------
 * Relevé en séance : « Qu'est-ce que signifie "auxiliaire" ? » est parti au
 * professeur alors que l'élève n'avait rien dit. Ce n'était pas un écho de la
 * voix du professeur — le mot « auxiliaire » n'apparaît nulle part dans ce
 * qu'il venait de dire — mais une phrase INVENTÉE sur du quasi-silence, bâtie
 * autour d'un mot de la liste de vocabulaire qu'on souffle au transcripteur.
 *
 * Cette famille de modèles fait ça : sur un fragment vide, elle rend quelque
 * chose de plausible plutôt que rien. On ne peut pas l'en empêcher.
 *
 * MAIS UNE PHRASE INVENTÉE N'A PAS D'AUDIO DERRIÈRE. C'est le seul critère qui
 * ne se discute pas : un enfant qui prononce trente-sept caractères y met au
 * moins une seconde et demie. Trente-sept caractères tirés de quatre cents
 * millisecondes de souffle sont physiquement impossibles, quelle que soit la
 * qualité de la transcription.
 *
 * VINGT-CINQ EST TRÈS AU-DESSUS DU RÉEL. Une parole rapide monte à quinze ou
 * vingt ; on ne coupe donc que l'absurde. Et le compte joue en faveur de
 * l'élève : on transmet aussi les trois cents millisecondes d'avance et les six
 * cents de traîne, donc l'audio mesuré est plus long que la parole elle-même.
 */
const CARACTERES_PAR_SECONDE_MAX = 25;

/**
 * En dessous, on ne juge pas.
 *
 * Les tout premiers fragments d'un tour arrivent alors qu'une fraction de
 * seconde a été transmise : « Qu'est » sur deux cents millisecondes donne un
 * débit énorme sans rien d'anormal. Le test n'a de sens que sur une phrase.
 */
const LONGUEUR_MINIMUM_JUGEE = 12;

/**
 * Les bruits de réflexion.
 *
 * Un enfant qui cherche pense à voix haute : « euh », « hmm », « ben ». La
 * détection sémantique du fournisseur les reconnaît déjà comme une phrase non
 * terminée, mais elle finit par clore le tour si le silence s'éternise — et le
 * professeur se met alors à répondre à un « euh ». Ce second filet ne coûte
 * rien et évite l'interruption la plus agaçante qui soit.
 */
const HESITATIONS = new Set([
  'euh', 'heu', 'eu', 'hum', 'hmm', 'hm', 'mmh', 'mm', 'mh',
  'ben', 'bah', 'ba', 'bon', 'alors', 'donc', 'hein', 'ah', 'oh',
]);

/**
 * Le texte ne dit-il rien d'autre qu'une hésitation ?
 *
 * On ne filtre QUE si tous les mots en sont : « euh je crois que c'est trois »
 * est une vraie réponse, et la tronquer serait pire que de la laisser passer.
 */
/**
 * Cette transcription peut-elle être du français ?
 *
 * POURQUOI CE FILTRE EXISTE
 * -------------------------
 * Relevé en séance : l'élève parle français et le champ se remplit de
 * « الشمالاين ». Le professeur répond alors « je ne comprends pas ce message »,
 * et l'élève ne comprend pas non plus ce qui vient de se passer.
 *
 * Ce n'est pas un problème de configuration — la langue est bien imposée au
 * fournisseur. C'est le comportement connu des modèles de transcription sur un
 * fragment quasi vide : un souffle, un bruit de clavier, une porte, et le
 * modèle invente une phrase plausible. Sur du bruit, l'indication de langue ne
 * le retient pas toujours, et il sort parfois un autre alphabet.
 *
 * On ne peut pas empêcher l'hallucination ; on peut refuser de la transmettre.
 * Une phrase de français contient forcément des lettres latines — un tour de
 * parole qui n'en contient aucune n'en est pas un.
 *
 * Volontairement PERMISSIF : il suffit d'UNE lettre latine pour passer. Un
 * élève qui écrit « ça fait 3,5 » ou qui emploie un mot étranger ne doit pas
 * voir son tour disparaître. On ne coupe que le cas franchement absurde.
 */
export function alphabetPlausible(texte) {
  if (!texte || !texte.trim()) return false;

  // LES CHIFFRES COMPTENT AUTANT QUE LES LETTRES.
  //
  // « 32 » est une réponse entière en mathématiques, et elle ne contient pas
  // une seule lettre. Le test ne portait que sur l'alphabet latin : un élève
  // qui répondait par un nombre voyait son tour disparaître sans un mot.
  //
  // Les chiffres arabes orientaux — ٣ — n'en sont pas : le cas qu'on écarte
  // reste écarté.
  return /[a-zà-öø-ÿ0-9]/i.test(texte);
}

/**
 * Ce texte mérite-t-il de partir au professeur ?
 *
 * POURQUOI CE JUGE EST UNIQUE ET EXPORTÉ
 * --------------------------------------
 * Il y a DEUX chemins par lesquels une parole devient un tour : le verdict du
 * fournisseur, et notre propre filet quand il ne tranche pas. Les deux
 * finissent au même endroit, mais un seul était gardé.
 *
 * Relevé en séance : des bulles ne contenant qu'un point, envoyées alors que
 * l'élève n'avait rien dit. Le point arrivait en transcription PROVISOIRE, et
 * le filet le prenait pour définitif sans rien vérifier — les deux garde-fous
 * étaient sur l'autre chemin.
 *
 * D'où ce juge unique : deux portes, une seule serrure.
 */
export function estUnTourDeParole(texte) {
  const propre = (texte ?? '').trim();
  if (!propre) return false;

  return !estUneHesitation(propre) && alphabetPlausible(propre);
}

/**
 * Ce texte peut-il physiquement sortir de cette durée d'audio ?
 *
 * Le seul juge qui ne dépende ni du vocabulaire, ni de la langue, ni de la
 * matière : personne ne parle plus vite que la parole.
 */
export function debitImpossible(texte, secondes) {
  const propre = (texte ?? '').trim();
  if (propre.length < LONGUEUR_MINIMUM_JUGEE) return false;

  // Aucun son transmis et pourtant une phrase : le cas le plus net de tous.
  if (secondes <= 0) return true;

  return propre.length / secondes > CARACTERES_PAR_SECONDE_MAX;
}

export function estUneHesitation(texte) {
  const mots = (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return mots.length > 0 && mots.every((mot) => HESITATIONS.has(mot));
}

/** Float32 [-1, 1] vers PCM 16 bits signé. */
function versPcm16(echantillons) {
  const sortie = new Int16Array(echantillons.length);

  for (let i = 0; i < echantillons.length; i += 1) {
    const borne = Math.max(-1, Math.min(1, echantillons[i]));
    sortie[i] = borne < 0 ? borne * 0x8000 : borne * 0x7fff;
  }

  return sortie;
}

/**
 * Le son est-il VOISÉ, c'est-à-dire produit par des cordes vocales ?
 *
 * On compte les passages par zéro, rapportés au nombre d'échantillons. C'est la
 * mesure la moins chère qui sépare une voyelle d'un souffle, et elle tient en
 * une boucle — le fil audio ne peut pas s'offrir une transformée de Fourier
 * cinquante fois par seconde.
 *
 * AUTOUR DE LA MOYENNE ET NON DE ZÉRO. Un micro peut avoir une composante
 * continue : l'onde oscille alors autour de 0,01 sans jamais franchir zéro, et
 * on compterait zéro passage pour un souffle parfaitement bruyant.
 */
function estVoise(echantillons) {
  let somme = 0;
  for (let i = 0; i < echantillons.length; i += 1) somme += echantillons[i];
  const moyenne = somme / echantillons.length;

  let passages = 0;
  for (let i = 1; i < echantillons.length; i += 1) {
    const avant = echantillons[i - 1] - moyenne;
    const apres = echantillons[i] - moyenne;
    if ((avant < 0) !== (apres < 0)) passages += 1;
  }

  return passages / echantillons.length < SEUIL_VOISEMENT;
}

/** Amplitude moyenne du bloc. Sert à décider s'il y a de la voix. */
function niveau(echantillons) {
  let somme = 0;
  for (let i = 0; i < echantillons.length; i += 1) somme += Math.abs(echantillons[i]);
  return somme / echantillons.length;
}

/**
 * Rééchantillonne par interpolation linéaire.
 *
 * N'est appelé que si le navigateur refuse d'ouvrir le contexte à 24 kHz —
 * Chrome l'accepte, Safari impose parfois la fréquence du périphérique.
 */
function reechantillonner(echantillons, deA, versB) {
  if (deA === versB) return echantillons;

  const rapport = deA / versB;
  const sortie = new Float32Array(Math.floor(echantillons.length / rapport));

  for (let i = 0; i < sortie.length; i += 1) {
    const position = i * rapport;
    const bas = Math.floor(position);
    const haut = Math.min(bas + 1, echantillons.length - 1);
    sortie[i] = echantillons[bas] + (echantillons[haut] - echantillons[bas]) * (position - bas);
  }

  return sortie;
}

export const ecouteTempsReel = {
  /** Rien à vérifier côté reconnaissance : tout navigateur sait capter un micro. */
  supporte: Boolean(
    typeof window !== 'undefined'
      && window.WebSocket
      && navigator.mediaDevices?.getUserMedia
      && (window.AudioContext || window.webkitAudioContext),
  ),

  /**
   * Ouvre l'écoute. Renvoie un objet avec `arreter()`.
   *
   * @param conversationId la séance à écouter
   * @param onPartiel      texte reconnu, encore provisoire
   * @param onFinal        texte reconnu, tour de parole terminé
   * @param onErreur       message lisible en cas de panne
   * @param onVoix         appelé au tout premier son de l'élève. Sert à couper
   *                       la parole du professeur sans attendre la transcription.
   * @param onSilence      l'élève s'est tu depuis assez longtemps pour qu'on
   *                       n'attende plus le verdict du fournisseur. Sert à
   *                       envoyer soi-même la transcription en attente.
   * @param onFermeture    la liaison est tombée. À l'appelant de relancer :
   *                       sans ce signal, le micro tournait dans le vide et
   *                       l'interface affichait « je t'écoute » alors que plus
   *                       rien ne partait.
   * @param onOuverture    la liaison est établie. Sert à l'appelant pour
   *                       oublier les échecs précédents — c'est la seule preuve
   *                       de bon fonctionnement qu'un élève silencieux produise.
   */
  ecouter({
    conversationId, onPartiel, onFinal, onErreur, onVoix, onSilence, onFermeture, onOuverture,
  }) {
    let socket = null;
    let contexte = null;
    let flux = null;
    let arrete = false;

    /**
     * Le son RÉELLEMENT transmis depuis le début de ce tour, en échantillons.
     *
     * C'est lui qu'on oppose à la longueur du texte reçu. Il compte ce qui est
     * parti sur le réseau, pas ce que le micro a entendu : le silence gardé en
     * réserve n'en fait pas partie, et c'est bien ce qu'on veut — le
     * transcripteur ne l'a jamais eu.
     */
    let echantillonsDuTour = 0;

    // Le son gardé d'avance, pour ne pas tronquer la première syllabe.
    const reserve = [];
    let reserveEchantillons = 0;
    let dernierSon = 0;
    let voixSignalee = false;

    // Le silence de fin de tour n'est signalé qu'UNE fois : sans ce drapeau,
    // chaque bloc audio suivant le redéclencherait cinquante fois par seconde.
    let silenceSignale = true;

    // Depuis quand le son est fort ET continu. Remis à zéro dès qu'il retombe :
    // seule une parole soutenue coupe le professeur.
    let debutVoixForte = 0;

    // Et dans ce laps de temps, combien de blocs étaient voisés. C'est ce
    // rapport qui distingue une phrase d'un soupir. Voir PART_VOISEE_MIN.
    let blocsForts = 0;
    let blocsVoises = 0;

    // Le chien de garde : armé quand on annonce une fin de tour, désarmé au
    // premier signe de vie. Voir SANS_RETOUR_MS.
    let sansRetour = null;

    /**
     * L'ÉMISSION EST COUPÉE, LA LIAISON RESTE.
     *
     * Quand l'élève tape au clavier, plus rien de ce qu'il dit n'est pris —
     * son champ lui appartient. Continuer d'envoyer son micro au
     * transcripteur ne ferait que payer des minutes pour un texte qu'on jette.
     *
     * MAIS ON NE FERME PAS LA LIAISON. Sa consigne demande au professeur de
     * faire TAPER trois lettres quand une terminaison ne s'entend pas : fermer
     * et rouvrir une session de transcription pour « ée » coûterait plus cher
     * que ce qu'on économise, et la reprise ne serait plus instantanée.
     */
    let suspendu = false;


    const desarmer = () => {
      if (sansRetour) clearTimeout(sansRetour);
      sansRetour = null;
    };

    /**
     * Met l'émission en pause, ou la reprend.
     *
     * En pause, le son continue d'alimenter la RÉSERVE : sans elle, la reprise
     * tronquerait la première syllabe, exactement comme au démarrage.
     */
    const suspendre = (oui) => {
      const nouveau = Boolean(oui);
      if (nouveau === suspendu) return;
      suspendu = nouveau;

      if (!suspendu) return;

      // Le tour en cours est clos net : rien ne part, donc rien n'est réclamé,
      // et le chien de garde n'a plus de réponse à attendre.
      silenceSignale = true;
      voixSignalee = false;
      debutVoixForte = 0;
      blocsForts = 0;
      blocsVoises = 0;
      desarmer();
    };

    const arreter = () => {
      if (arrete) return;
      arrete = true;

      desarmer();
      flux?.getTracks().forEach((piste) => piste.stop());
      contexte?.close().catch(() => {});

      if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
    };

    /**
     * Plus rien ne revient : on raccroche et on le DIT.
     *
     * L'annonce est faite ici et non par `onclose`, qui se tait sur les
     * fermetures voulues — et celle-ci l'est. Sans elle, on aurait remplacé un
     * micro qui tourne dans le vide par un micro éteint en silence.
     */
    const abandonner = () => {
      if (arrete) return;

      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[ecoute] aucune réponse depuis ${SANS_RETOUR_MS} ms : oreille morte, on rouvre.`);
      }

      arreter();
      onFermeture?.();
    };

    (async () => {
      try {
        // ON TRANSPORTE L'EN-TÊTE ENTIÈRE, SCHÉMA COMPRIS.
        //
        // Un WebSocket de navigateur n'accepte aucune en-tête : l'autorisation
        // ne peut voyager que dans l'URL, et le serveur la replace ensuite dans
        // `Authorization`. Encore faut-il qu'il sache DE QUEL schéma il s'agit.
        //
        // Un parent porte « Bearer … », un enfant « Eleve … » — deux schémas
        // distincts. Envoyer le jeton nu obligeait le serveur à en supposer un,
        // il supposait « Bearer », et toute session enfant se faisait fermer sur
        // le champ (code 1006). Le schéma part donc avec le jeton.
        const entete = await enTeteAuth();
        if (!entete) throw new Error("Aucune session : l'écoute ne peut pas s'ouvrir.");

        const base = API_BASE_URL.replace(/^http/, 'ws');

        socket = new WebSocket(
          `${base}/api/ecoute/${conversationId}?access_token=${encodeURIComponent(entete)}`,
        );
        socket.binaryType = 'arraybuffer';

        socket.onclose = (evenement) => {
          if (process.env.NODE_ENV !== 'production') {
            console.info(`[ecoute] liaison fermée (code ${evenement.code})`, evenement.reason);
          }

          // Fermeture non voulue : on prévient, pour que l'appelant relance.
          // Une session de transcription a une durée de vie limitée chez le
          // fournisseur ; sans reprise, le micro se taisait pour le reste du
          // cours sans que rien ne l'indique.
          if (!arrete) onFermeture?.();
        };

        // L'OUVERTURE EST UN SIGNAL, PAS SEULEMENT UNE TRACE.
        //
        // C'est la seule preuve que la liaison fonctionne vraiment — un élève
        // qui réfléchit en silence n'en produit aucune autre. L'appelant s'en
        // sert pour oublier les échecs passés : sans elle, il ne peut que
        // compter les pannes, jamais les guérisons.
        socket.onopen = () => {
          if (process.env.NODE_ENV !== 'production') {
            console.info('[ecoute] liaison ouverte');
          }

          onOuverture?.();
        };

        socket.onmessage = (evenement) => {
          // N'IMPORTE QUEL MESSAGE VAUT SIGNE DE VIE, MÊME UNE ERREUR.
          //
          // Ce qu'on surveille n'est pas la qualité de la transcription mais
          // l'existence du relais. Un tour rendu vide en est une preuve
          // aussi bonne qu'une phrase entière.
          desarmer();

          let charge;
          try {
            charge = JSON.parse(evenement.data);
          } catch {
            return;
          }

          if (process.env.NODE_ENV !== 'production') {
            console.info(`[ecoute] ${charge.type} :`, charge.texte ?? charge.message);
          }

          // LE TEXTE ARRIVE DÉJÀ RECOLLÉ, ET C'EST VOULU.
          //
          // Le recollage a vécu ici quelques heures, et c'était le mauvais
          // endroit : le filtre d'écho du vocabulaire vit sur le serveur, et il
          // ne voyait donc que des miettes de moins de trente caractères. Elles
          // passaient une par une, et c'est ici qu'elles redevenaient la liste
          // entière — envoyée au professeur, en boucle, sous le nom de l'élève.
          //
          // Un texte vide est un ORDRE D'EFFACEMENT : le serveur vient de
          // reconnaître un écho et retire ce qu'il avait déjà laissé passer.
          if (charge.type === 'partiel') onPartiel?.(charge.texte);
          else if (charge.type === 'erreur') onErreur?.(charge.message);
          else if (charge.type === 'final') {
            // La durée de TOUT le tour, y compris si le fournisseur le
            // découpe en plusieurs verdicts. Voir la remise à zéro plus haut.
            const secondes = echantillonsDuTour / FREQUENCE;

            // Une phrase qu'aucune bouche n'a eu le temps de dire. Voir
            // CARACTERES_PAR_SECONDE_MAX : c'est ainsi qu'est partie au
            // professeur une question que l'élève n'avait jamais posée.
            if (debitImpossible(charge.texte, secondes)) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `[ecoute] tour écarté : ${charge.texte.length} caractères `
                  + `pour ${secondes.toFixed(2)} s d'audio.`,
                );
              }

              onPartiel?.('');
              return;
            }

            // Une hésitation seule n'est pas une réponse : on l'efface du champ
            // et on continue d'écouter, comme le ferait un professeur qui voit
            // que l'élève cherche encore.
            if (estUneHesitation(charge.texte)) {
              onPartiel?.('');
              return;
            }

            // Transcription hallucinée sur du bruit : on l'efface et on
            // continue d'écouter, plutôt que d'envoyer au professeur un
            // message qu'il ne pourra que déclarer incompréhensible.
            if (!alphabetPlausible(charge.texte)) {
              // DEUX CAS SOUS LE MÊME REFUS, ET UN SEUL MÉRITE QU'ON REGARDE.
              //
              // Un tour vide, c'est du silence : un souffle, une porte, le
              // détecteur de fin de tour qui referme sur rien. Il n'y a aucun
              // tour de parole perdu, et l'annoncer comme une « transcription
              // écartée » fait chercher un problème là où il n'y en a pas.
              //
              // Une transcription NON VIDE refusée ici, en revanche, est le cas
              // pour lequel ce filtre existe : le modèle a rendu « الشمالاين »
              // pendant qu'un enfant parlait français. Celle-là doit se voir.
              if (process.env.NODE_ENV !== 'production' && charge.texte?.trim()) {
                console.warn(
                  '[ecoute] transcription écartée, alphabet non latin :', charge.texte,
                );
              }

              onPartiel?.('');
              return;
            }

            onFinal?.(charge.texte);
          }
        };

        socket.onerror = () => onErreur?.("L'écoute a été interrompue. Tu peux écrire à la place.");

        // Annulation de l'écho demandée au navigateur : sans casque, le micro
        // capte la voix du professeur et la prend pour une interruption. Le
        // Web Speech ne laissait aucun moyen de le régler.
        flux = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });

        if (arrete) return;

        const Contexte = window.AudioContext || window.webkitAudioContext;
        contexte = new Contexte({ sampleRate: FREQUENCE });

        const url = URL.createObjectURL(
          new Blob([PROGRAMME_CAPTURE], { type: 'application/javascript' }),
        );
        await contexte.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);

        if (arrete) return;

        const source = contexte.createMediaStreamSource(flux);
        const capture = new AudioWorkletNode(contexte, 'capture');

        const avanceMax = Math.floor((AVANCE_MS / 1000) * FREQUENCE);

        const garderEnReserve = (bloc) => {
          reserve.push(bloc);
          reserveEchantillons += bloc.length;

          while (reserveEchantillons > avanceMax && reserve.length > 1) {
            reserveEchantillons -= reserve.shift().length;
          }
        };

        capture.port.onmessage = ({ data }) => {
          if (arrete || socket?.readyState !== WebSocket.OPEN) return;

          const bloc = reechantillonner(data, contexte.sampleRate, FREQUENCE);

          // EN PAUSE : on écoute sans transmettre. La réserve continue de
          // tourner pour que la reprise ne coupe pas le premier mot.
          if (suspendu) {
            garderEnReserve(bloc);
            return;
          }

          const amplitude = niveau(bloc);
          const parle = amplitude > SEUIL_VOIX;
          const maintenant = performance.now();

          if (parle) {
            // LE COMPTEUR REPART AU DÉBUT DU TOUR, PAS À CHAQUE VERDICT.
            //
            // Le remettre à zéro sur chaque « final » condamnerait le second
            // verdict d un tour que le fournisseur aurait découpé en deux : il
            // arriverait sur un compteur vidé, donc sans audio, donc jeté.
            // Le tour commence quand la voix revient après un silence.
            if (silenceSignale) echantillonsDuTour = 0;

            dernierSon = maintenant;
            silenceSignale = false;
          } else if (!silenceSignale && maintenant - dernierSon > SILENCE_FIN_MS) {
            silenceSignale = true;

            // On CLÔT LE TOUR nous-mêmes, au lieu d'attendre que le
            // fournisseur veuille bien le faire. C'est ce qui supprime à la
            // fois le mutisme et l'attente : il transcrit dès qu'il reçoit cet
            // ordre, et nous savons mieux que lui quand l'élève s'est tu —
            // nous mesurons le son, il le suppose.
            if (socket?.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'fin_tour' }));

              // On vient de réclamer une transcription : à partir d'ici, le
              // silence du serveur n'est plus une attente, c'est une panne.
              // On n'écrase pas une échéance déjà en cours — une oreille
              // vraiment morte doit être constatée au premier tour perdu, pas
              // repoussée par chaque tour suivant.
              if (!sansRetour) sansRetour = setTimeout(abandonner, SANS_RETOUR_MS);
            }

            onSilence?.();
          }

          // La coupure de parole se décide séparément, et plus sévèrement :
          // il faut du son FORT, CONTINU, et VOISÉ. Un bruit est bref, un
          // souffle n'a pas de cordes vocales derrière, une voix a les trois.
          if (amplitude > SEUIL_COUPURE) {
            if (debutVoixForte === 0) {
              debutVoixForte = maintenant;
              blocsForts = 0;
              blocsVoises = 0;
            }

            blocsForts += 1;
            if (estVoise(bloc)) blocsVoises += 1;

            if (!voixSignalee
                && maintenant - debutVoixForte >= DUREE_COUPURE_MS
                && blocsVoises >= blocsForts * PART_VOISEE_MIN) {
              voixSignalee = true;
              onVoix?.();
            }
          } else {
            debutVoixForte = 0;
            blocsForts = 0;
            blocsVoises = 0;
          }

          // Hors voix et hors traîne : on garde le son en réserve sans
          // l'émettre. C'est ce qui fait tomber la facture de transcription —
          // l'élève ne parle que cinq pour cent du temps.
          if (!parle && maintenant - dernierSon > TRAINE_MS) {
            garderEnReserve(bloc);
            voixSignalee = false;
            return;
          }

          // On parle : la réserve part d'abord, puis le bloc courant.
          while (reserve.length > 0) {
            const avance = reserve.shift();
            echantillonsDuTour += avance.length;
            socket.send(versPcm16(avance).buffer);
          }
          reserveEchantillons = 0;

          echantillonsDuTour += bloc.length;
          socket.send(versPcm16(bloc).buffer);
        };

        source.connect(capture);

        // Nécessaire sur Chrome : sans destination, le graphe ne tourne pas.
        // Le gain à zéro évite de renvoyer le micro dans les haut-parleurs.
        const silence = contexte.createGain();
        silence.gain.value = 0;
        capture.connect(silence).connect(contexte.destination);

        // UN CONTEXTE AUDIO PEUT NAÎTRE SUSPENDU, ET IL NE LE DIT PAS.
        //
        // Le navigateur le suspend quand la page n'a pas encore été touchée —
        // et le mode mains libres rouvre le micro tout seul, sans clic. Le
        // programme de capture ne tourne alors jamais : pas une erreur, pas un
        // événement, juste un micro allumé à l'écran qui n'envoie rien.
        await contexte.resume().catch(() => {});
      } catch (erreur) {
        if (arrete) return;

        onErreur?.(
          erreur?.name === 'NotAllowedError'
            ? "Le micro est bloqué. Autorise-le dans la barre d'adresse, ou écris ton message."
            : "Le micro n'a pas pu démarrer. Tu peux écrire ton message.",
        );
        arreter();
      }
    })();

    return { arreter, suspendre };
  },
};

export default ecouteTempsReel;
