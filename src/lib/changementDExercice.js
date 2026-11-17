/**
 * L'ÉLÈVE CHANGE D'EXERCICE QUAND IL VEUT — Camara, le 14/11/2026, signalement d'une famille (Adrien, CP) : « il faut
 * absolument que le professeur change sans poser de question et qu'il ne revienne pas sur l'exercice précédent ; un
 * enfant peut changer d'exercice autant qu'il veut ». Pour tous les professeurs.
 *
 * L'essentiel est au serveur (`Services/ChangementDExercice.cs`) : le fait donné au professeur, et la coupure qui ferme
 * l'exercice que le code tenait. ICI, LE JUMEAU pour l'écran : la lecture à voix haute se reconnaît aussi dans les douze
 * derniers messages du professeur (`lectureAVoixHaute.js`), et tout ce que l'enfant disait ensuite au micro devenait
 * « 🔊 Lu à voix haute », sa demande de changement comprise.
 *
 * LES MÊMES RÈGLES QUE LE SERVEUR : à modifier des deux côtés. `\b` ignore les lettres accentuées en JavaScript, d'où
 * les bornes Unicode.
 */

const D = String.raw`(?<![\p{L}\d])`;
const F = String.raw`(?![\p{L}\d])`;
const re = (motif) => new RegExp(motif, 'iu');

// « change d'exercice », « on change d'activité », « changer de jeu ».
const CHANGE_DE = re(String.raw`${D}chang\p{L}*\s+(?:d['’]\s*(?:exercice|exo|activit[ée])|de\s+(?:jeu|sujet|th[èe]me|le[çc]on|chapitre))`);

// « on change », « je veux changer » — mais pas « on change de syllabe » : le suivant du même exercice.
const CHANGE_TOUT_COURT = re(String.raw`${D}(?:on|je\s+(?:veux|voudrais|peux|aimerais|pr[ée]f[èe]re)|j['’]aimerais|tu\s+peux|peux[- ]tu|on\s+peut|est-ce\s+qu['’]on\s+peut)\s+(?:bien\s+)?chang(?:e|er)${F}(?!\s+(?:de${F}|d['’]))`);

// « un autre exercice », « un nouvel exercice », « l'exercice suivant », « un exercice différent ».
const AUTRE_EXERCICE = re(String.raw`${D}(?:autres?|nouvel|nouveaux?|nouvelles?|prochaine?s?)\s+(?:exercices?|exos?|activit[ée]s?|jeux?)${F}|${D}(?:exercices?|exos?|activit[ée]s?|jeux?)\s+(?:suivante?s?|diff[ée]rente?s?)${F}|${D}autre\s+(?:type|genre|sorte)\s+d['’]\s*(?:exercice|exo|activit[ée])`);

// « propose-moi un exercice », « donne-moi un jeu ».
const DONNE_UN_EXERCICE = re(String.raw`${D}(?:propose|donne|fais|trouve|invente|choisis)\p{L}*[- ](?:moi|nous)\s+une?\s+(?:exercice|exo|activit[ée]|jeu)${F}`);

// « on fait autre chose », « je veux passer à autre chose ». Pas « j'ai entendu autre chose ».
const AUTRE_CHOSE = re(String.raw`${D}(?:fai\p{L}*|pass\p{L}*|veux|voudrais|aimerais|pr[ée]f[èe]re\p{L}*|propose\p{L}*|donne\p{L}*|essa\p{L}*)${F}[^.?!\n]{0,25}${D}autre\s+chose${F}|^[^\p{L}\d]*autre\s+chose[^\p{L}\d]*$`);

// « j'en ai marre », « je veux plus faire ça », « on arrête ». Jamais « stop » ni « arrête » seuls : des mots à lire.
const LASSITUDE = re(String.raw`${D}j['’]en\s+ai\s+(?:marre|assez|ras)${F}|${D}je\s+(?:ne\s+)?(?:veux|voudrais)\s+plus\s+(?:faire|continuer|lire|jouer|[ée]couter|r[ée]p[ée]ter|ça|ca|de\s+(?:ça|ca|syllabes|mots|nombres))${F}|${D}j['’]ai\s+plus\s+envie${F}|${D}je\s+n['’]ai\s+plus\s+envie${F}|${D}(?:j['’]aime|je\s+n['’]aime)\s+pas\s+(?:cet?\s+(?:exercice|exo|jeu)|cette\s+activit[ée])|${D}on\s+arr[êe]te${F}|${D}j['’]arr[êe]te${F}|${D}je\s+(?:veux|voudrais)\s+arr[êe]ter${F}|${D}arr[êe]t\p{L}*\s+(?:cet?\s+(?:exercice|exo|jeu)|cette\s+activit[ée]|l['’]\s*(?:exercice|exo|activit[ée])|les\s+(?:syllabes|mots|nombres|sons))`);

// « t'as encore changé d'exercice », « pourquoi tu changes d'exercice » : une plainte.
const PLAINTE = re(String.raw`${D}(?:t['’]as|tu\s+as|t['’]a|il\s+a|elle\s+a)\s+(?:encore\s+|d[ée]j[àa]\s+)?chang[ée]|${D}pourquoi${F}[^.?!\n]{0,40}${D}chang`);

// « je veux pas changer », « pas d'autre exercice », « on change pas ».
const REFUS = re(String.raw`${D}(?:pas|jamais)\s+(?:envie\s+de\s+|besoin\s+de\s+)?(?:chang\p{L}*|d['’]\s*autres?\s+(?:exercice|exo|activit[ée]|jeu)|un\s+autre\s+(?:exercice|exo|jeu)|une\s+autre\s+activit[ée]|autre\s+chose|arr[êe]t\p{L}*)|${D}chang\p{L}*\s+pas${F}`);

// « J'ai lu la syllabe… », « J'ai entendu le mot… » : une réponse à l'exercice, écrite par le relais du micro.
const REPONSE_A_L_EXERCICE = re(String.raw`^[^\p{L}\d]*j['’]ai\s+(?:lu|entendu)${F}`);

const MOTS_MAX = 40;

/** L'élève demande-t-il à changer d'exercice ou à arrêter celui-ci ? Les faits entre crochets joints au message sont écartés. */
export function demandeDeChangement(message) {
  if (typeof message !== 'string') return false;
  const dit = message.replace(/\[[^\]]*\]/g, ' ').trim();
  if (dit.length === 0 || dit.split(/\s+/).length > MOTS_MAX) return false;
  if (REPONSE_A_L_EXERCICE.test(dit) || PLAINTE.test(dit) || REFUS.test(dit)) return false;

  return CHANGE_DE.test(dit) || CHANGE_TOUT_COURT.test(dit) || AUTRE_EXERCICE.test(dit)
    || DONNE_UN_EXERCICE.test(dit) || AUTRE_CHOSE.test(dit) || LASSITUDE.test(dit);
}

/**
 * Les messages qui suivent sa dernière demande de changement : eux seuls disent quel exercice est en cours. On ne
 * remonte pas plus loin que `portee` messages du professeur (la fenêtre de l'exercice) ; sans demande, tout revient.
 * Une réponse déjà jugée (elle porte un verdict) n'est jamais une demande.
 */
export function depuisLaDemande(messages, portee = 12) {
  const liste = messages ?? [];
  let vus = 0;
  for (let i = liste.length - 1; i >= 0 && vus < portee; i -= 1) {
    const m = liste[i];
    if (m?.role === 'assistant') vus += 1;
    else if (m?.role === 'user' && typeof m.sonJuste !== 'boolean' && demandeDeChangement(m.contenu)) return liste.slice(i + 1);
  }
  return liste;
}
