import { API_BASE_URL, enTeteAuth } from '../api/httpClient';
import { mesurerMicro } from '../api/mesuresApi';

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
 * LE MICRO EST-IL MORT ? — Camara, le 16/09/2026 : trois familles, trois PC,
 * « comme si leur micro était en mute », casque ou haut-parleur, et rien à
 * reproduire sur son Mac, son PC ni son téléphone.
 *
 * Un micro vivant a TOUJOURS un bruit de fond : avec le contrôle de gain
 * demandé au navigateur, il dépasse largement ce seuil même dans une pièce
 * silencieuse. Un micro coupé par le système, un mauvais périphérique par
 * défaut ou un casque Bluetooth sur le mauvais profil donnent zéro, ou
 * presque. Dix fois sous le seuil de voix : on ne conclut que sur le certain.
 */
const SEUIL_MUET = 0.0005;

/**
 * Combien de temps observer avant de conclure. Assez long pour qu'un enfant
 * qui cherche ses mots ne soit pas déclaré muet ; assez court pour qu'un
 * parent ne reste pas une minute devant une icône allumée qui n'entend rien.
 */
const DELAI_MUET_MS = 8000;

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
 * revenir. Si rien ne vient, l'oreille est morte : on raccroche la LIAISON, et
 * on rappelle le serveur sur une neuve — sans défaire l'écoute, et en renvoyant
 * le tour resté sans verdict (voir `abandonner`).
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
 * Le son parti sans texte revenu, au-delà duquel un texte est EN ROUTE.
 *
 * Au-dessus de la traîne (TRAINE_MS, six cents millisecondes) : après un
 * texte, la fin de souffle qui part encore ne doit pas faire attendre chaque
 * réponse. En dessous d'une réponse d'un mot : un « oui » dit après coup doit
 * être transcrit avant que le message parte.
 */
const SEUIL_EN_ROUTE_MS = 700;

/**
 * La mémoire tampon de la parole, en millisecondes d'audio.
 *
 * VOULUE PAR CAMARA LE 13/09/2026 : « tout ce que je dis doit être mis dans
 * une mémoire tampon et envoyé uniquement quand le système est prêt ; si la
 * connexion se coupe, rien n'est perdu, tout part quand elle revient ».
 *
 * Elle remplace l'amorce de quatre secondes, qui était la même idée bridée :
 * au-delà de quatre secondes de liaison pas encore prête — une reconnexion
 * après un incident en prend souvent davantage —, le début de la phrase était
 * effacé pour faire de la place à la fin.
 *
 * Deux minutes et pas l'infini : c'est de la mémoire vive, et une panne plus
 * longue n'est plus une coupure mais une séance perdue, que le repli sur le
 * moteur du navigateur prend en charge. Seule la PAROLE y entre : le silence
 * entre deux phrases est jeté comme il l'est en ligne, sans quoi une coupure
 * d'une minute remplirait la mémoire de bruit de fond.
 */
const TAMPON_MAX_MS = 120000;

/**
 * Les délais entre deux tentatives de reconnexion ; le dernier se répète.
 *
 * Rapides d'abord : la plupart des coupures durent le temps d'un changement de
 * réseau. Espacés ensuite, pour ne pas marteler un serveur en panne.
 */
const DELAIS_RECONNEXION_MS = [300, 1000, 2000, 5000];

/**
 * Tentatives ratées d'affilée — sans une seule ouverture réussie — avant de
 * renoncer et de laisser l'appelant basculer sur le moteur du navigateur.
 *
 * Vingt tentatives, plus d'une minute et demie : on préfère attendre une
 * liaison qui revient que perdre la séance sur une panne passagère. La parole
 * dite pendant ce temps reste dans la mémoire tampon.
 */
const RECONNEXIONS_MAX = 20;

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
/**
 * La fenêtre du crédit de son : seul le son transmis depuis ce délai peut
 * justifier un texte.
 *
 * Quarante-cinq secondes couvrent la plus longue justification d'un enfant.
 * Au-delà, le crédit se périme : une phrase inventée sur un silence, longtemps
 * après la dernière vraie parole, ne peut pas s'appuyer sur elle.
 */
const FENETRE_CREDIT_MS = 45000;

/**
 * Inscrit du son TRANSMIS au crédit. Voir `jugerTranscription`.
 *
 * @param credit      la liste des versements, la plus ancienne en tête ;
 *                    MODIFIÉE en place.
 * @param echantillons le nombre d'échantillons partis.
 * @param maintenant  l'horloge du versement, en millisecondes.
 */
export function crediter(credit, echantillons, maintenant) {
  credit.push({ t: maintenant, n: echantillons });
}

/**
 * CE TEXTE A-T-IL PU SORTIR DU SON RÉELLEMENT TRANSMIS ?
 *
 * POURQUOI UN CRÉDIT, ET PLUS UN APPARIEMENT — relevé par Camara le
 * 13/09/2026 : « toute ma justification, cinq ou six lignes, s'est écrite
 * puis effacée, et ensuite il a envoyé un bout de phrase ».
 *
 * On associait chaque texte revenu à la durée d'UN ordre de fin de tour, en
 * supposant qu'à chaque ordre répondait exactement un texte. C'est faux par
 * construction : le fournisseur détecte AUSSI les fins de phrase, et quand il
 * le fait avant nous, le serveur écarte notre ordre — plus rien à clore — et
 * aucun texte ne lui répond. Une durée orpheline restait dans la file, et le
 * texte SUIVANT lui était associé : la justification de vingt-cinq secondes
 * jugée contre les trois secondes du bout de phrase d'avant, déclarée
 * impossible, jetée — et effacée de l'écran.
 *
 * Le crédit ne suppose rien de l'ordre d'arrivée. Tout le son transmis est
 * versé ; chaque texte accepté en consomme la durée MINIMALE qu'il lui a
 * fallu, le plus ancien d'abord. Un texte n'est impossible que s'il dépasse ce
 * que tout le son récent aurait pu porter. La justification passe ; la phrase
 * inventée sur un silence, sans crédit récent, reste écartée.
 *
 * @param credit     les versements (voir `crediter`) ; MODIFIÉE en place — le
 *                   périmé tombe, le consommé est retiré.
 * @param maintenant l'horloge du jugement, en millisecondes.
 * @returns `{ impossible, secondes }` — `secondes` : le crédit disponible au
 *          moment du jugement, pour le journal.
 */
export function jugerTranscription(texte, credit, maintenant) {
  while (credit.length > 0 && maintenant - credit[0].t > FENETRE_CREDIT_MS) credit.shift();

  const disponible = credit.reduce((somme, versement) => somme + versement.n, 0);
  const secondes = disponible / FREQUENCE;

  // eslint-disable-next-line no-use-before-define
  if (debitImpossible(texte, secondes)) return { impossible: true, secondes };

  const propre = (texte ?? '').trim();
  let besoin = Math.ceil((propre.length / CARACTERES_PAR_SECONDE_MAX) * FREQUENCE);

  while (besoin > 0 && credit.length > 0) {
    const pris = Math.min(besoin, credit[0].n);
    credit[0].n -= pris;
    besoin -= pris;
    if (credit[0].n === 0) credit.shift();
  }

  return { impossible: false, secondes };
}

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
   * @param onReprise      l'élève REPREND la parole après un silence de fin de
   *                       tour. Contrairement à `onVoix`, qui ne sert qu'une
   *                       fois pour couper le professeur, celui-ci se répète à
   *                       chaque reprise : c'est le seul signal qui dise « il
   *                       n'avait pas fini », et il annule l'envoi programmé.
   * @param onFermeture    la liaison est DÉFINITIVEMENT perdue, après
   *                       `RECONNEXIONS_MAX` rappels ratés d'affilée. Une
   *                       coupure ordinaire ne l'appelle plus : l'écoute
   *                       rappelle seule, en gardant la parole en mémoire
   *                       tampon. À l'appelant, alors seulement, de basculer.
   * @param onOuverture    une liaison est établie — la première ou une
   *                       nouvelle après un rappel. Sert à l'appelant pour
   *                       oublier les échecs précédents.
   * @param onOreilleMorte appelé UNIQUEMENT quand le chien de garde
   *                       `SANS_RETOUR_MS` déclenche — jamais sur une fermeture
   *                       normale. L'écoute raccroche alors la liaison et en
   *                       rappelle une neuve elle-même ; ce signal sert à le
   *                       DIRE à l'élève, plutôt que de le laisser parler dans
   *                       un silence qui ne s'explique jamais.
   */
  ecouter({
    conversationId, chemin, onPartiel, onFinal, onErreur, onVoix, onSilence, onReprise,
    onFermeture, onOuverture, onOreilleMorte, onMuet,
  }) {
    // LE MÊME MICRO HORS D'UNE SÉANCE — `chemin` remplace l'identifiant de
    // conversation dans l'adresse (« dictee/12 » pour la dictée d'un contrôle,
    // voir `ControleForm`). Tout le reste — capture, mémoire tampon, rappels —
    // est celui des cours, à l'identique.
    const cible = chemin ?? conversationId;
    let socket = null;
    let contexte = null;
    let flux = null;
    let arrete = false;

    // Le diagnostic du micro — voir SEUIL_MUET. Le niveau maximal est mesuré
    // sur TOUT ce qui arrive, pause sourde comprise : le système livre des
    // échantillons que le micro soit écouté ou non, et c'est ce qui dit s'il
    // est vivant.
    let niveauMax = 0;
    let gardeMuet = null;
    let pisteMuette = false;
    let diagnosticFait = false;

    /**
     * LE CRÉDIT DE SON : ce qui a été réellement transmis, et qui peut encore
     * justifier un texte. Voir `jugerTranscription` — c'est lui qui remplace
     * l'appariement d'un texte à « son » ordre de fin de tour, faux dès que le
     * fournisseur clôt une phrase avant nous.
     */
    const credit = [];

    /**
     * Le son parti depuis le DERNIER texte reçu, quel qu'il soit.
     *
     * Tant qu'il y en a assez, un texte est en route : le chat ne doit pas
     * envoyer ce qu'il a déjà. Remis à zéro par chaque texte, accepté ou
     * écarté — un texte écarté est revenu, lui aussi.
     */
    let sonDepuisDernierTexte = 0;

    /**
     * CE QUI EST À L'ÉCRAN NE S'EFFACE JAMAIS TANT QUE ÇA N'A PAS ÉTÉ ENVOYÉ.
     *
     * Règle posée par Camara le 13/09/2026, après avoir vu trois fois une
     * justification entière s'écrire puis disparaître : « il ne devrait pas
     * s'effacer tant qu'il n'a pas encore été envoyé ; l'enfant peut fuir la
     * plateforme si on efface à chaque fois ce qu'il dit ».
     *
     * Chaque garde-fou — débit impossible, hésitation seule, alphabet non
     * latin — écartait un texte ET effaçait le provisoire affiché. Or ce
     * provisoire, c'était la parole de l'enfant, transcrite au fil de l'eau ;
     * quand le garde-fou se trompait, elle disparaissait sous ses yeux. Un
     * garde-fou n'a désormais le droit que de NE PAS AJOUTER un texte : jamais
     * de retirer ce qui est déjà là. Ce qui est affiché part à l'envoi.
     *
     * UNE SEULE EXCEPTION, et elle ne peut rien perdre : quand AUCUN son n'a
     * été transmis, ce qui est affiché n'a été dit par personne — c'est la
     * phrase inventée sur un silence, « Qu'est-ce que signifie auxiliaire ? »,
     * partie un jour au professeur. Elle seule s'efface encore.
     */
    const effacerSiRienDit = (secondesTransmises) => {
      if (secondesTransmises > 0) return;
      onPartiel?.('');
    };

    /**
     * LA MÉMOIRE TAMPON DE LA PAROLE — voir TAMPON_MAX_MS.
     *
     * Tout ce qui doit partir au serveur passe par cette file, dans l'ordre où
     * c'est dit : les trames de son ET les ordres de fin de tour. Les garder
     * dans la même file est ce qui préserve l'ordre à la reconnexion — un
     * « fin_tour » envoyé avant le son de sa phrase clôturerait un tampon vide
     * chez le fournisseur, et la phrase partirait sans jamais être transcrite.
     *
     * Elle ne se vide que sur une liaison OUVERTE ; fermée, elle se remplit.
     */
    const fileEnAttente = [];
    let fileEchantillons = 0;

    /**
     * Ce qui est déjà PARTI mais pas encore TRANSCRIT : trames de son et ordres
     * de fin de tour, horodatés, dans l'ordre d'envoi.
     *
     * Envoyer n'est pas livrer : si la liaison tombe après l'envoi, le son
     * était chez le fournisseur, dans une session qui meurt avec elle. Sans
     * cette copie, la phrase disparaissait au moment précis où l'élève avait
     * fini de la dire. On la renvoie donc sur la liaison suivante.
     *
     * DEUX FAÇONS D'EN SORTIR, ET AUCUNE NE SUPPOSE « UN ORDRE, UN TEXTE » :
     * chaque texte revenu libère la plus ancienne phrase close ; et une
     * phrase close depuis plus de SANS_RETOUR_MS est oubliée — si son texte
     * s'était perdu, le chien de garde l'aurait déjà constaté et renvoyée.
     */
    let enVol = [];
    let enVolEchantillons = 0;

    const garderEnVol = (element) => {
      enVol.push(element);
      if (!element.pcm) return;
      enVolEchantillons += element.pcm.length;

      // Même plafond que la mémoire tampon : une copie ne doit pas coûter
      // plus de mémoire que l'original.
      // eslint-disable-next-line no-use-before-define
      while (enVolEchantillons > tamponMax && enVol.length > 1) {
        const ancien = enVol.shift();
        if (ancien.pcm) enVolEchantillons -= ancien.pcm.length;
      }
    };

    /** Retire les éléments jusqu'à l'indice donné, inclus. */
    const retirerEnVolJusqua = (indice) => {
      if (indice < 0) return;
      enVol.splice(0, indice + 1).forEach((element) => {
        if (element.pcm) enVolEchantillons -= element.pcm.length;
      });
    };

    /** Oublie les phrases closes depuis plus de SANS_RETOUR_MS. */
    const elaguerEnVol = (maintenant) => {
      let dernierVieux = -1;
      enVol.forEach((element, i) => {
        if (element.fin && maintenant - element.t > SANS_RETOUR_MS) dernierVieux = i;
      });
      retirerEnVolJusqua(dernierVieux);
    };

    /** Un texte est revenu : la plus ancienne phrase close n'a plus à être renvoyée. */
    const libererPremierePhrase = () => {
      retirerEnVolJusqua(enVol.findIndex((element) => element.fin));
    };

    // La reconnexion : combien d'échecs d'affilée, et la tentative programmée.
    let reconnexionsRatees = 0;
    let minuteurReconnexion = null;

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

    // La réserve accumulée pendant la pause en cours vaut-elle la peine
    // d'être transmise à la reprise ? Voir `suspendre`.
    let avanceGardee = true;


    // Le sondage qui attend que le son soit vraiment parti. Voir `armerQuandLivre`.
    let attenteLivraison = null;

    const desarmer = () => {
      if (sansRetour) clearTimeout(sansRetour);
      sansRetour = null;
      if (attenteLivraison) clearInterval(attenteLivraison);
      attenteLivraison = null;
    };

    /**
     * ARME LE CHIEN DE GARDE QUAND LE SON EST PARTI — pas quand on l'a confié au
     * navigateur.
     *
     * Relevé par Camara le 13/09/2026, après une tirade de cinquante secondes
     * dite pendant une coupure. À la reconnexion, la mémoire tampon rendait
     * tout d'un coup : des mégaoctets de son, que `send` accepte à l'instant
     * mais que le réseau met de longues secondes à acheminer. Le chien de garde
     * partait pourtant dès l'appel à `send`, concluait à une oreille morte au
     * bout de huit secondes — alors que le son était encore en route —, coupait
     * la liaison en plein envoi, et renvoyait le tout sur la suivante. Qui
     * n'avait pas le temps non plus. Une boucle sans fin, le bandeau « petit
     * souci de connexion » allumé en permanence, et rien de livré.
     *
     * `bufferedAmount` dit ce qui attend encore dans le navigateur. Tant qu'il
     * n'est pas vide, le silence du serveur n'est pas une panne : il n'a
     * simplement pas encore tout reçu. On attend qu'il le soit, PUIS on laisse
     * au serveur ses huit secondes pour répondre.
     */
    const armerQuandLivre = () => {
      if (sansRetour || attenteLivraison) return;

      const toutEstParti = () => (socket?.bufferedAmount ?? 0) === 0;

      if (toutEstParti()) {
        // eslint-disable-next-line no-use-before-define
        sansRetour = setTimeout(abandonner, SANS_RETOUR_MS);
        return;
      }

      attenteLivraison = setInterval(() => {
        if (!socket || arrete) {
          clearInterval(attenteLivraison);
          attenteLivraison = null;
          return;
        }

        if (!toutEstParti()) return;

        clearInterval(attenteLivraison);
        attenteLivraison = null;
        // eslint-disable-next-line no-use-before-define
        if (!sansRetour) sansRetour = setTimeout(abandonner, SANS_RETOUR_MS);
      }, 250);
    };

    /**
     * Met l'émission en pause, ou la reprend.
     *
     * En pause, le son continue d'alimenter la RÉSERVE : sans elle, la reprise
     * tronquerait la première syllabe, exactement comme au démarrage.
     *
     * MAIS CE QUE VAUT LA RÉSERVE DÉPEND DU MOTIF DE LA PAUSE.
     *
     * Pause parce que l'élève TAPE : ces 300 ms ne contiennent que le bruit
     * de la pièce, et les garder évite de manger sa première syllabe quand
     * il repose le clavier pour parler. C'est le cas historique, et un test
     * le protège.
     *
     * Pause parce que le PROFESSEUR PARLE — sur un appareil sans casque —
     * la réserve contient sa voix. La transmettre au premier mot de
     * l'élève collerait cette queue de phrase en tête de son tour, et le
     * transcripteur en ferait un mot qu'il n'a jamais dit. C'est exactement
     * la boucle qu'on cherche à casser, revenue par la porte de service.
     *
     * D'où le second paramètre : l'appelant sait pourquoi il suspend, la
     * réserve ne peut pas le deviner.
     *
     * @param {boolean} oui Suspendre (vrai) ou reprendre (faux).
     * @param {boolean} garderLAvance Conserver les 300 ms captées pendant la
     *   pause. Vrai par défaut — le comportement du clavier.
     */
    const suspendre = (oui, garderLAvance = true) => {
      const nouveau = Boolean(oui);

      // DÉJÀ EN PAUSE, MAIS LE MOTIF PEUT S'AGGRAVER. L'élève tapait — pause
      // qui garde son avance — quand le professeur prend la parole : la
      // réserve va maintenant capter sa voix. Sans cette ligne, le premier
      // motif l'emportait, et la reprise renvoyait la fin de la phrase du
      // professeur en tête du tour de l'élève. Le motif sourd l'emporte
      // toujours sur celui du clavier, jamais l'inverse.
      if (nouveau && suspendu && !garderLAvance) avanceGardee = false;

      if (nouveau === suspendu) return;
      suspendu = nouveau;

      if (!suspendu) {
        // Le motif est celui de la pause qui se termine, pas de la
        // prochaine : d'où le drapeau retenu au moment de suspendre.
        if (!avanceGardee) {
          reserve.length = 0;
          reserveEchantillons = 0;
        }

        avanceGardee = true;
        return;
      }

      avanceGardee = garderLAvance;

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
      if (minuteurReconnexion) clearTimeout(minuteurReconnexion);
      minuteurReconnexion = null;

      if (gardeMuet) clearTimeout(gardeMuet);
      gardeMuet = null;

      flux?.getTracks().forEach((piste) => piste.stop());
      contexte?.close().catch(() => {});

      if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
    };

    const tamponMax = Math.floor((TAMPON_MAX_MS / 1000) * FREQUENCE);
    const seuilEnRoute = Math.floor((SEUIL_EN_ROUTE_MS / 1000) * FREQUENCE);

    /**
     * Range un élément dans la mémoire tampon, en queue — ou en tête quand on
     * y remet ce qui était parti sans être transcrit.
     *
     * Au-delà du plafond, c'est le SON le plus ancien qui cède, jamais un
     * ordre de fin de tour : sans lui, la phrase qui suit ne serait jamais
     * transcrite, et la mémoire aurait gardé du son pour rien.
     */
    const ranger = (element, enTete = false) => {
      if (enTete) fileEnAttente.unshift(element);
      else fileEnAttente.push(element);

      if (!element.pcm) return;
      fileEchantillons += element.pcm.length;

      while (fileEchantillons > tamponMax) {
        const ancien = fileEnAttente.findIndex((e) => e.pcm);
        if (ancien < 0) break;
        fileEchantillons -= fileEnAttente[ancien].pcm.length;
        fileEnAttente.splice(ancien, 1);
      }
    };

    /**
     * Envoie ce qui attend, dans l'ordre, tant que la liaison est OUVERTE.
     *
     * C'est le SEUL endroit qui parle au serveur. Qu'une trame arrive sur une
     * liaison prête, pendant une reconnexion ou juste après, elle passe par
     * ici et part à sa place — jamais avant ce qui a été dit avant elle.
     */
    const vider = () => {
      while (fileEnAttente.length > 0 && socket?.readyState === WebSocket.OPEN) {
        const element = fileEnAttente.shift();

        if (element.pcm) {
          const taille = element.pcm.length;
          fileEchantillons -= taille;
          socket.send(element.pcm.buffer);

          // LE SON EST PARTI : il nourrit le crédit qui juge les textes, il
          // compte comme « en route » jusqu'au prochain texte, et on en garde
          // la copie tant qu'il peut encore se perdre avec la liaison.
          const envoyeLe = performance.now();
          crediter(credit, taille, envoyeLe);
          sonDepuisDernierTexte += taille;
          garderEnVol({ pcm: element.pcm, t: envoyeLe });
          continue;
        }

        socket.send(JSON.stringify({ type: 'fin_tour' }));

        const closLe = performance.now();
        garderEnVol({ fin: true, t: closLe });
        elaguerEnVol(closLe);

        // On vient de réclamer une transcription : à partir d'ici, le silence
        // du serveur n'est plus une attente, c'est une panne. On n'écrase pas
        // une échéance déjà en cours — une oreille vraiment morte doit être
        // constatée au premier tour perdu, pas repoussée par les suivants.
        // eslint-disable-next-line no-use-before-define
        armerQuandLivre();
      }
    };

    /** Une trame de son ou une fin de tour : envoyée si possible, gardée sinon. */
    const emettre = (element) => {
      ranger(element);
      vider();
    };

    /**
     * La liaison est perdue : ce qui était PARTI SANS ÊTRE TRANSCRIT revient
     * en tête de la mémoire tampon, dans son ordre d'origine, devant ce qui a
     * été dit pendant la coupure.
     *
     * La session du fournisseur meurt avec la liaison, et le son qu'elle
     * contenait avec elle. Le renvoyer est le prix de « ne jamais perdre » —
     * au risque, rare, de transcrire deux fois une phrase dont le verdict
     * s'est perdu en route. Une phrase en double se voit et se corrige ; une
     * phrase perdue, l'enfant doit la redire sans savoir pourquoi.
     *
     * Les mesures repartent de zéro : elles seront reconstruites trame par
     * trame au renvoi, appariées aux verdicts de la nouvelle session.
     */
    const reprendreLesToursEnVol = () => {
      const aRenvoyer = enVol.map(({ pcm, fin }) => (fin ? { fin: true } : { pcm }));

      enVol = [];
      enVolEchantillons = 0;

      // Ce qui repart sera recompté trame par trame à l'envoi. Le crédit, lui,
      // n'est pas remis à zéro : le son renvoyé le nourrira de nouveau, ce qui
      // ne peut que rendre le jugement plus généreux, jamais plus sévère.
      sonDepuisDernierTexte = 0;

      for (let i = aRenvoyer.length - 1; i >= 0; i -= 1) ranger(aRenvoyer[i], true);
    };

    /**
     * Rappelle le serveur, de plus en plus patiemment.
     *
     * LA CAPTURE, ELLE, NE S'ARRÊTE PAS : c'est ce qui change tout. Pendant
     * qu'on rappelle, l'élève continue de parler, et tout ce qu'il dit entre
     * dans la mémoire tampon. Autrefois, la liaison perdue emportait l'écoute
     * entière — micro, réserve, tours en cours — et l'appelant en rebâtissait
     * une neuve, qui ne capturait rien tant qu'elle n'avait pas redemandé le
     * micro au navigateur.
     *
     * On ne renonce qu'après RECONNEXIONS_MAX échecs d'affilée : l'appelant
     * bascule alors sur le moteur du navigateur.
     */
    const programmerReconnexion = () => {
      if (arrete || minuteurReconnexion) return;

      reconnexionsRatees += 1;

      if (reconnexionsRatees > RECONNEXIONS_MAX) {
        onErreur?.("L'écoute a été interrompue. Tu peux écrire à la place.");
        arreter();

        // La liaison est définitivement perdue : l'appelant peut basculer
        // sur le moteur du navigateur.
        onFermeture?.();
        return;
      }

      const rang = Math.min(reconnexionsRatees - 1, DELAIS_RECONNEXION_MS.length - 1);

      minuteurReconnexion = setTimeout(() => {
        minuteurReconnexion = null;
        // eslint-disable-next-line no-use-before-define
        ouvrirLiaison();
      }, DELAIS_RECONNEXION_MS[rang]);
    };

    /**
     * Plus rien ne revient : on RACCROCHE, ON RAPPELLE — et on ne perd rien.
     *
     * Autrefois on raccrochait l'écoute entière et l'appelant en rebâtissait
     * une neuve : tout ce qui attendait sa transcription disparaissait, et
     * l'élève devait redire la phrase qu'il venait de finir. Désormais seule
     * la liaison est remplacée. Le tour sans verdict repart sur la nouvelle,
     * et l'annonce est toujours faite — ce silence avait une cause, l'élève
     * mérite de la connaître.
     */
    const abandonner = (motif) => {
      if (arrete) return;

      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          typeof motif === 'string'
            ? `[ecoute] ${motif} : on rappelle.`
            : `[ecoute] aucune réponse depuis ${SANS_RETOUR_MS} ms : oreille morte, on rappelle.`,
        );
      }

      onOreilleMorte?.();
      desarmer();

      // On oublie la liaison AVANT de la fermer : son `onclose` se reconnaît
      // alors comme celui d'une liaison déjà remplacée, et ne programme pas
      // une seconde reconnexion par-dessus celle-ci.
      const mourante = socket;
      socket = null;
      if (mourante && mourante.readyState <= WebSocket.OPEN) mourante.close();

      reprendreLesToursEnVol();
      programmerReconnexion();
    };

    /**
     * Ouvre une liaison vers le serveur : la première, ou une nouvelle après
     * une coupure.
     *
     * SÉPARÉE DE LA CAPTURE, ET C'EST LE CŒUR DU CORRECTIF DU 13/09/2026.
     * La liaison et le micro naissaient dans le même bloc et mouraient
     * ensemble : une coupure détruisait l'écoute entière, et la suivante ne
     * capturait rien tant qu'elle n'avait pas redemandé le micro au
     * navigateur. Désormais le micro s'ouvre une fois pour la séance, et la
     * liaison va et vient derrière lui sans qu'il s'en aperçoive.
     */
    const ouvrirLiaison = async () => {
      if (arrete) return;

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

        // SANS SESSION, RAPPELER NE SERT À RIEN : aucune tentative ne
        // l'inventera. On le dit tout de suite plutôt qu'au vingtième essai.
        if (!entete) {
          onErreur?.("L'écoute n'a pas pu s'ouvrir. Tu peux écrire ton message.");
          arreter();
          return;
        }

        if (arrete) return;

        const base = API_BASE_URL.replace(/^http/, 'ws');

        // UNE VARIABLE PAR LIAISON, ET PAS SEULEMENT `socket`. Après une
        // reconnexion, les événements d'une liaison déjà remplacée arrivent
        // encore : chacun vérifie qu'il appartient à la liaison EN COURS avant
        // d'agir, sans quoi une vieille fermeture programmerait un rappel
        // par-dessus une liaison qui marche.
        const liaison = new WebSocket(
          `${base}/api/ecoute/${cible}?access_token=${encodeURIComponent(entete)}`,
        );
        liaison.binaryType = 'arraybuffer';
        socket = liaison;

        liaison.onclose = (evenement) => {
          if (process.env.NODE_ENV !== 'production') {
            console.info(`[ecoute] liaison fermée (code ${evenement.code})`, evenement.reason);
          }

          // Une liaison déjà remplacée n'a plus rien à dire.
          if (socket !== liaison || arrete) return;

          // FERMETURE NON VOULUE : ON RAPPELLE, SANS DÉFAIRE L'ÉCOUTE.
          //
          // Une session de transcription a une durée de vie limitée chez le
          // fournisseur, et le réseau d'un enfant coupe. Autrefois on
          // prévenait l'appelant, qui détruisait l'écoute et en rebâtissait
          // une — avec tout ce qu'elle contenait. Désormais seule la liaison
          // change : ce qui était parti sans verdict repasse en tête de file,
          // et la capture n'a jamais cessé d'écouter.
          desarmer();
          socket = null;
          reprendreLesToursEnVol();
          programmerReconnexion();
        };

        // L'OUVERTURE EST UN SIGNAL, PAS SEULEMENT UNE TRACE.
        //
        // C'est la seule preuve que la liaison fonctionne vraiment — un élève
        // qui réfléchit en silence n'en produit aucune autre. L'appelant s'en
        // sert pour oublier les échecs passés : sans elle, il ne peut que
        // compter les pannes, jamais les guérisons.
        liaison.onopen = () => {
          if (socket !== liaison || arrete) return;

          if (process.env.NODE_ENV !== 'production') {
            console.info('[ecoute] liaison ouverte');
          }

          onOuverture?.();

          // CE QUI ATTENDAIT PART MAINTENANT, dans l'ordre où ça a été dit :
          // la parole prononcée pendant l'ouverture, et, après une coupure,
          // les tours restés sans verdict.
          vider();
        };

        liaison.onmessage = (evenement) => {
          if (socket !== liaison) return;

          // N'IMPORTE QUEL MESSAGE VAUT SIGNE DE VIE, MÊME UNE ERREUR.
          //
          // Ce qu'on surveille n'est pas la qualité de la transcription mais
          // l'existence du relais. Un tour rendu vide en est une preuve aussi
          // bonne qu'une phrase entière — et c'est aussi la seule preuve de
          // guérison qui remet le compteur de rappels à zéro : une liaison
          // qui s'ouvre puis ne répond jamais n'a rien guéri.
          desarmer();

          let charge;
          try {
            charge = JSON.parse(evenement.data);
          } catch {
            return;
          }

          // UNE ERREUR N'EST PAS UNE GUÉRISON. Elle prouve que le relais est
          // vivant, pas qu'il transcrit : remettre le compteur de rappels à
          // zéro sur elle ferait tourner en boucle, sans jamais basculer sur le
          // moteur du navigateur, un serveur qui échoue à chaque session.
          if (charge.type !== 'erreur') reconnexionsRatees = 0;

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
          if (charge.type === 'partiel') {
            // UN PARTIEL VIDE N'EST PAS UN PARTIEL, C'EST UN EFFACEMENT — et
            // il vient du serveur, pas d'ici. Le distinguer dans le journal
            // sépare d'un coup d'œil « le filtre d'écho a mangé la phrase » de
            // « le navigateur l'a écartée », deux causes qui produisent
            // exactement le même vide à l'écran.
            if (process.env.NODE_ENV !== 'production' && !charge.texte?.trim()) {
              console.warn('[ecoute] effacement demandé par le serveur (écho repéré).');
            }

            onPartiel?.(charge.texte);
          }
          else if (charge.type === 'erreur') {
            // UNE PANNE DU RELAIS N'EST PAS UNE FIN D'ÉCOUTE — relevé par
            // Camara le 13/09/2026, le jour même où la mémoire tampon est née.
            //
            // Quand la transcription échoue, le serveur envoie ce message
            // PUIS ferme la liaison. Le message remontait tel quel à
            // l'appelant, qui détruisait l'écoute et en rebâtissait une
            // neuve : la mémoire tampon partait avec, les tours sans verdict
            // aussi, et le temps mort du démarrage revenait — exactement au
            // moment où « le professeur a un problème ».
            //
            // On le traite donc comme l'oreille morte : la liaison est
            // remplacée, la parole reste, le tour sans verdict repart. La
            // fermeture qui suit arrive sur une liaison déjà remplacée et ne
            // programme pas un second rappel. L'appelant n'est prévenu, par
            // `onErreur`, qu'après RECONNEXIONS_MAX échecs d'affilée.
            abandonner(`erreur du relais (${charge.message ?? 'sans détail'})`);
            return;
          }
          else if (charge.type === 'final') {
            // UN TEXTE EST REVENU : le son parti avant lui n'est plus en route,
            // et la plus ancienne phrase close n'a plus à être renvoyée.
            sonDepuisDernierTexte = 0;
            libererPremierePhrase();

            // JUGÉ CONTRE LE CRÉDIT DE SON, ET NON CONTRE « SON » ORDRE DE FIN
            // DE TOUR — voir `jugerTranscription`. L'appariement jetait une
            // justification entière dès que le fournisseur avait clos une
            // phrase avant nous.
            const jugement = jugerTranscription(charge.texte, credit, performance.now());
            const { secondes } = jugement;

            // Une phrase qu'aucune bouche n'a eu le temps de dire. Voir
            // CARACTERES_PAR_SECONDE_MAX : c'est ainsi qu'est partie au
            // professeur une question que l'élève n'avait jamais posée.
            if (jugement.impossible) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `[ecoute] tour écarté : ${charge.texte.length} caractères `
                  + `pour ${secondes.toFixed(2)} s d'audio.`,
                );
              }

              effacerSiRienDit(secondes);
              return;
            }

            // Une hésitation seule n'est pas une réponse : on ne l'ajoute pas,
            // et on continue d'écouter, comme le ferait un professeur qui voit
            // que l'élève cherche encore.
            if (estUneHesitation(charge.texte)) {
              // CE CHEMIN EFFAÇAIT SANS RIEN DIRE, et c'est ce qui rendait le
              // défaut introuvable : l'élève voit son texte disparaître, et le
              // journal ne porte aucune trace de qui l'a effacé. Trois chemins
              // mènent au même effacement — on ne peut pas les départager en
              // les regardant, seulement en les faisant parler.
              if (process.env.NODE_ENV !== 'production') {
                console.warn('[ecoute] tour écarté : hésitation seule —', charge.texte);
              }

              effacerSiRienDit(secondes);
              return;
            }

            // Transcription hallucinée sur du bruit : on ne l'ajoute pas, et
            // on continue d'écouter, plutôt que d'envoyer au professeur un
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

              effacerSiRienDit(secondes);
              return;
            }

            onFinal?.(charge.texte);
          }
        };

        // UNE ERREUR DE LIAISON N'EST PLUS UNE FIN D'ÉCOUTE. Le navigateur
        // fait toujours suivre `onerror` d'une fermeture, et c'est elle qui
        // rappelle le serveur. Prévenir l'appelant ici lui ferait détruire
        // l'écoute — et tout ce qu'elle garde — pour une coupure qui va se
        // réparer.
        liaison.onerror = () => {};
      } catch {
        // La liaison n'a pas pu naître (réseau absent, adresse injoignable) :
        // la parole reste en mémoire, et on rappelle.
        if (!arrete) programmerReconnexion();
      }
    };

    (async () => {
      try {
        // LA LIAISON ET LE MICRO S'OUVRENT EN MÊME TEMPS, pas l'un après
        // l'autre : attendre l'une pour demander l'autre ajouterait sa durée
        // au temps mort du démarrage. Ce que l'élève dit avant que la liaison
        // soit prête attend dans la mémoire tampon.
        ouvrirLiaison();

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

        // CE QUE LE SYSTÈME A VRAIMENT DONNÉ. Obtenir le micro ne veut pas
        // dire l'entendre : Windows peut livrer une piste MUETTE — accès
        // refusé au navigateur dans les réglages de confidentialité, antivirus,
        // touche « muet » du casque — sans lever la moindre erreur. C'est la
        // seule information que le navigateur a sur ce cas, et elle n'était
        // pas lue.
        const piste = flux.getAudioTracks?.()?.[0] ?? null;
        pisteMuette = Boolean(piste?.muted);

        if (piste) {
          piste.onmute = () => { pisteMuette = true; };
          piste.onunmute = () => { pisteMuette = false; };
        }

        // LE CHIEN DE GARDE DU MICRO MORT. Une seule conclusion par écoute,
        // écrite et jamais prononcée, et qui ne coupe rien : si la mesure se
        // trompe, l'élève continue. Le relevé part au serveur dans TOUS les
        // cas — les micros sains servent de point de comparaison.
        const debutObservation = performance.now();

        gardeMuet = setTimeout(() => {
          gardeMuet = null;
          if (arrete || diagnosticFait) return;
          diagnosticFait = true;

          const muet = pisteMuette || niveauMax < SEUIL_MUET;
          const diagnostic = {
            muet,
            pisteMuette,
            peripherique: piste?.label || null,
            etatPiste: piste?.readyState ?? null,
            frequencePiste: piste?.getSettings?.()?.sampleRate ?? null,
            frequenceContexte: contexte?.sampleRate ?? null,
            niveauMax,
            secondes: (performance.now() - debutObservation) / 1000,
          };

          const envoyer = (entrees) => mesurerMicro({ ...diagnostic, entrees });

          // Les entrées audio, avec leurs noms : la permission vient d'être
          // accordée, ils sont lisibles. C'est là qu'on voit « Hands-Free AG
          // Audio » (Bluetooth sur le mauvais profil) ou « Stereo Mix » choisi
          // par défaut à la place du vrai micro.
          const lister = navigator.mediaDevices?.enumerateDevices?.();

          if (lister?.then) {
            lister
              .then((liste) => envoyer(
                liste.filter((d) => d.kind === 'audioinput').map((d) => d.label || '?').join(' | '),
              ))
              .catch(() => envoyer(null));
          } else {
            envoyer(null);
          }

          if (muet) onMuet?.(diagnostic);
        }, DELAI_MUET_MS);

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

        // La réserve de SILENCE : les 300 ms qui précèdent la voix, pour ne
        // pas tronquer la première syllabe. Rien à voir avec la mémoire
        // tampon — elle n'y entre qu'au moment où la voix commence.
        const garderEnReserve = (bloc) => {
          reserve.push(bloc);
          reserveEchantillons += bloc.length;

          while (reserveEchantillons > avanceMax && reserve.length > 1) {
            reserveEchantillons -= reserve.shift().length;
          }
        };

        capture.port.onmessage = ({ data }) => {
          if (arrete) return;

          const bloc = reechantillonner(data, contexte.sampleRate, FREQUENCE);

          // Mesuré AVANT la pause sourde : le micro livre des échantillons
          // qu'on l'écoute ou non, et c'est ce qui dit s'il est vivant.
          const amplitude = niveau(bloc);
          if (amplitude > niveauMax) niveauMax = amplitude;

          // EN PAUSE, SOURD D'ABORD — avant toute question de liaison.
          //
          // Pendant que le professeur parle sans casque, ou que l'élève tape,
          // rien n'entre dans la mémoire tampon. La réserve de silence tourne
          // pour la reprise, et `suspendre` la jette si la pause était sourde.
          //
          // Cette vérification venait APRÈS celle de la liaison : pendant une
          // reconnexion, la voix du professeur entrait alors dans l'amorce, et
          // repartait en tête du tour de l'élève.
          if (suspendu) {
            garderEnReserve(bloc);
            return;
          }

          const parle = amplitude > SEUIL_VOIX;
          const maintenant = performance.now();

          if (parle) {
            // Rien n'est remis à zéro ici : ce qui compte est le son TRANSMIS,
            // mesuré dans `vider`, et jugé contre le crédit — voir
            // `jugerTranscription`.
            if (silenceSignale) {
              // IL REPARLE : ce qui était programmé pendant la pause n'a plus
              // lieu d'être. C'est le seul signal qui distingue « il a fini »
              // de « il reprend son souffle ».
              onReprise?.();
            }

            dernierSon = maintenant;
            silenceSignale = false;
          } else if (!silenceSignale && maintenant - dernierSon > SILENCE_FIN_MS) {
            silenceSignale = true;

            // ON CLÔT LE TOUR NOUS-MÊMES : nous mesurons le son, le
            // fournisseur le suppose. L'ordre entre dans la mémoire tampon À SA
            // PLACE, derrière le son de sa phrase : même si la liaison est
            // coupée à cet instant, il partira dans le bon ordre, et jamais
            // avant le son qu'il doit clore.
            emettre({ fin: true });

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

          // Hors voix et hors traîne : le silence reste en réserve. Il ne part
          // pas en ligne — c'est ce qui fait tomber la facture —, et il n'entre
          // pas non plus dans la mémoire tampon pendant une coupure, qu'une
          // minute de bruit de fond remplirait pour rien.
          if (!parle && maintenant - dernierSon > TRAINE_MS) {
            garderEnReserve(bloc);
            voixSignalee = false;
            return;
          }

          // ON PARLE : la réserve entre d'abord dans la file, puis le bloc
          // courant. Partis sur-le-champ si la liaison est prête, gardés dans
          // l'ordre sinon — c'est `vider` qui décide, et lui seul.
          while (reserve.length > 0) {
            ranger({ pcm: versPcm16(reserve.shift()) });
          }
          reserveEchantillons = 0;

          emettre({ pcm: versPcm16(bloc) });
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

        // Le refus se fait remonter aussi : « NotAllowedError » chez trois
        // familles et jamais chez nous, c'est déjà une réponse.
        mesurerMicro({ erreur: erreur?.name || 'inconnue' });

        onErreur?.(
          erreur?.name === 'NotAllowedError'
            ? "Le micro est bloqué. Autorise-le dans la barre d'adresse, ou écris ton message."
            : "Le micro n'a pas pu démarrer. Tu peux écrire ton message.",
        );
        arreter();
      }
    })();

    /**
     * L'élève est-il en train de parler, MAINTENANT ?
     *
     * Mesuré sur l'amplitude du micro, pas deviné sur le texte : c'est la
     * seule information fiable pour savoir s'il a fini. Vrai depuis sa
     * première syllabe jusqu'à SILENCE_FIN_MS après la dernière.
     *
     * Sert à ne JAMAIS programmer l'envoi d'un tour pendant qu'il parle
     * encore — le défaut qui lui faisait perdre les neuf dixièmes d'une
     * longue explication, chaque bout partant seul dès que le fournisseur
     * le transcrivait.
     */
    const parleEnCeMoment = () => !arrete && !suspendu && !silenceSignale;

    /**
     * Un morceau déjà dit attend-il encore sa transcription ?
     *
     * Vrai quand du son est parti depuis le dernier texte reçu — au-delà de
     * SEUIL_EN_ROUTE_MS —, ou quand de la parole attend dans la mémoire tampon
     * pendant une coupure. C'est la seule source qui sache qu'un texte est EN
     * ROUTE : le chat, lui, ne voit que ce qui est déjà arrivé, et il envoyait
     * des bouts de phrase faute de le savoir. Voir `doitAttendreAvantEnvoi`.
     *
     * COMPTÉ SUR LE SON, PAS SUR LES ORDRES DE FIN DE TOUR : un ordre que le
     * serveur écarte — le fournisseur ayant clos la phrase avant nous — ne
     * reçoit aucun texte, et un indicateur bâti sur les ordres serait resté
     * allumé, faisant attendre chaque envoi jusqu'au plafond.
     */
    const transcriptionEnCours = () => !arrete
      && (sonDepuisDernierTexte >= seuilEnRoute || fileEchantillons > 0);

    return { arreter, suspendre, parleEnCeMoment, transcriptionEnCours };
  },
};

export default ecouteTempsReel;
