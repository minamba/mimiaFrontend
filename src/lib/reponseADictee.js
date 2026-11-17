/**
 * CE QUE L'ÉLÈVE DOIT ÉCRIRE NE S'AFFICHE PAS — Camara, le 11/11/2026, signalement du 09/11 : « Lorsque Nora demande
 * à l'élève d'écrire le nombre qu'elle vient de prononcer, la réponse apparaît à l'écrit. Ex : écoute bien, écris
 * soixante. » Et : « il faut le corriger pour tous les professeurs, c'est un problème général. »
 *
 * L'ÉCRAN SEUL : la voix lit toujours le texte brut, l'élève entend donc ce qu'il doit écrire. Dans la bulle, à la
 * place, un 🔊 : « Écoute bien, écris 🔊. »
 *
 * ÉTROIT, VOLONTAIREMENT. Il faut un verbe d'écriture (écris, note, tape…), suivi seulement de mots de consigne
 * (« le nombre », « le mot », « que je dis », « en lettres », « sur ton cahier »…), puis la cible, en fin de phrase :
 * un nombre en lettres ou en chiffres, ou un texte entre guillemets. « Écris le résultat de quatre plus deux » ou
 * « écris trois phrases » ne bougent pas : ce sont des consignes, pas une dictée.
 *
 * Les exercices de sons du primaire ont leur propre règle, côté serveur (CacherLaReponse) : ce filet ne les gêne pas.
 */

const VERBE = String.raw`(?:écris|écrit|écrivez|écrire|note|notes|notez|tape|tapes|tapez|recopie|recopies)`;

// Les mots qu'une consigne de dictée peut porter entre le verbe et la cible, et rien d'autre.
const CONSIGNE = String.raw`(?:moi|le|ce|un|une|la|cette|l|nombre|mot|chiffre|syllabe|lettre|phrase|que|qu|je|j|tu|te|dis|dit|entends|vais|viens|de|dire|prononcer|en|lettres|chiffres|toutes|sur|ton|ta|cahier|ardoise|au|clavier|dans|champ|bien|maintenant|vite|s'il|il|plaît)`;

const NOMBRE_EN_LETTRES = String.raw`(?:(?:zéro|zero|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingts?|trente|quarante|cinquante|soixante|cents?|mille|et)(?:[-\s]+(?=\S)(?:zéro|zero|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingts?|trente|quarante|cinquante|soixante|cents?|mille|et))*)`;

const CHIFFRES = String.raw`\d+(?:[.,]\d+)?`;
const GUILLEMETS = String.raw`(?:«\s*[^»\n]{1,60}?\s*»|"[^"\n]{1,60}?"|“[^”\n]{1,60}?”)`;

// Après la cible : au plus une précision de support, puis la fin de la phrase.
const APRES = String.raw`(?=(?:\s+(?:en\s+lettres|en\s+chiffres|sur\s+ton\s+(?:cahier|ardoise)|au\s+clavier|dans\s+le\s+champ))?\s*(?:[.!?…\n]|$))`;

const DICTEE = new RegExp(
  // `\b` ignore les lettres accentuées en JavaScript : « écris » ne commencerait jamais un mot. D'où ces bornes Unicode.
  // `(?<!s['’])` (14/11/2026) : « ça s'écrit bien soixante et onze » est une CORRECTION, pas une consigne.
  String.raw`((?<!\p{L})(?<!s['’])${VERBE}(?!\p{L})(?:[\s,:'’-]+${CONSIGNE}(?!\p{L}))*[\s,:'’-]*)((?<!\p{L})${NOMBRE_EN_LETTRES}(?!\p{L})|${CHIFFRES}|${GUILLEMETS})${APRES}`,
  'giu',
);

// LA CIBLE ANNONCÉE AVANT LA CONSIGNE (14/11/2026, signalement rouvert) : « Je te dis un nombre : soixante.
// Écris-le en chiffres. » Le nombre vient d'abord, après « un nombre : » ou « le mot : », et la phrase SUIVANTE
// demande de l'écrire (« écris-le », « note-la »…). Sans cette seconde phrase, rien ne bouge : « Le nombre : soixante. »
// seul peut être une correction.
const ANNONCE = new RegExp(
  String.raw`((?<!\p{L})(?:un|le|ce|une|la|cette)\s+(?:nombre|mot|chiffre|syllabe)\s*:\s*)((?<!\p{L})${NOMBRE_EN_LETTRES}(?!\p{L})|${CHIFFRES}|${GUILLEMETS})(?=\s*[.!…]\s+[^.!?\n]{0,40}?(?<!\p{L})${VERBE}[-\s]+(?:le|la|l['’])(?!\p{L}))`,
  'giu',
);

// LA SÉRIE DE DICTÉE (14/11/2026, séance de Test Kid en prod) : la consigne d'écrire n'est donnée qu'UNE fois, puis le
// professeur annonce seulement les nombres : « Je te dis un autre nombre : 65. », « Je le redis doucement :
// soixante-dix-huit. ». Aucun verbe d'écriture : les deux règles plus haut ne pouvaient pas les voir. Une annonce
// (je te dis, je te redis, je le redis, je te donne, écoute bien), éventuellement « un autre nombre », deux-points,
// puis la cible en fin de phrase → 🔊. La voix la dit toujours : masquer ne retire rien à l'exercice, même quand
// l'enfant écrit sous une autre forme que celle affichée.
const ANNONCE_DE_SERIE = new RegExp(
  String.raw`((?<!\p{L})(?:je\s+te\s+(?:dis|redis|donne)|je\s+(?:le|la)\s+redis|écoute(?:\s+bien)?)(?!\p{L})(?:\s+(?:un|le|ce|une|la|cette)(?:\s+(?:autre|nouveau|nouvelle|prochain|prochaine|dernier|dernière))?\s+(?:nombre|mot|chiffre|syllabe))?(?:\s+(?:doucement|lentement|encore|bien))?\s*:\s*)((?<!\p{L})${NOMBRE_EN_LETTRES}(?!\p{L})|${CHIFFRES}|${GUILLEMETS})${APRES}`,
  'giu',
);

export const SIGNE_A_ECOUTER = '🔊';

/** Le texte du professeur tel qu'il s'affiche : ce qu'il dicte à écrire remplacé par 🔊. */
export function masquerReponseADictee(texte) {
  if (!texte) return texte;
  return texte
    .replace(DICTEE, (tout, avant) => `${avant}${SIGNE_A_ECOUTER}`)
    .replace(ANNONCE, (tout, avant) => `${avant}${SIGNE_A_ECOUTER}`)
    .replace(ANNONCE_DE_SERIE, (tout, avant) => `${avant}${SIGNE_A_ECOUTER}`);
}

/**
 * LA BALISE [A_ECOUTER] — Camara, le 14/11/2026 : « fais-le ». Le professeur y met lui-même ce que l'élève doit écrire
 * en l'ENTENDANT (« Écoute bien : [A_ECOUTER]soixante[/A_ECOUTER]. »). La voix dit le contenu (`texteParle` retire
 * seulement les balises) ; l'écran ne montre que 🔊, dans la bulle comme au tableau.
 *
 * POURQUOI PAS [FR], comme pour les sons : un passage [FR] est un passage d'ÉCOUTE, et l'écran pose alors la carte
 * « choisis ta vitesse », qui retient la voix jusqu'au choix — en plein milieu d'une dictée de nombres.
 *
 * EN FLUX, une balise ouverte et pas encore fermée masque déjà tout ce qui suit, et un début de balise (« [A_ECO »)
 * ne s'affiche pas : le nombre ne doit pas apparaître une fraction de seconde avant d'être caché.
 */
export const OUVERTURE_A_ECOUTER = '[A_ECOUTER]';
export const FERMETURE_A_ECOUTER = '[/A_ECOUTER]';
const BALISE_A_ECOUTER = /\[A_ECOUTER\][\s\S]*?(?:\[\/A_ECOUTER\]|$)/gi;

export function masquerBaliseAEcouter(texte) {
  if (!texte) return texte;
  let sortie = texte.replace(BALISE_A_ECOUTER, SIGNE_A_ECOUTER);
  const debut = sortie.match(/\[\/?[A-Z_]*$/);
  if (debut && (OUVERTURE_A_ECOUTER.startsWith(debut[0]) || FERMETURE_A_ECOUTER.startsWith(debut[0]))) {
    sortie = sortie.slice(0, debut.index);
  }
  return sortie;
}

/** Pour la voix et les relectures : les balises tombent, le contenu reste. */
export const sansBalisesAEcouter = (texte) => (texte ?? '').replace(/\[\/?A_ECOUTER\]/gi, '');

/**
 * UN NOMBRE SEUL AU TABLEAU, PENDANT UNE DICTÉE — Camara, le 14/11/2026 : « il faut qu'il n'apparaisse pas au tableau
 * non plus ». Le tableau ne montre plus ce qu'il faut écrire quand TROIS conditions sont réunies :
 * - le bloc ne contient qu'un nombre (en lettres ou en chiffres) ;
 * - le reste du message parle d'ÉCOUTE (écoute, tu entends, je te dis, je le redis, que je dis, dictée…) — sans ça,
 *   « Écris le nombre qui vient après » avec 42 au tableau est une question, pas une dictée ;
 * - la forme demandée n'est pas une AUTRE forme : 81 au tableau et « écris-le en lettres », c'est un exercice de
 *   conversion, l'élève n'y lit pas sa réponse (règle du testeur : « si l'élève doit écrire en chiffres, OK »).
 */
const NOMBRE_SEUL = new RegExp(
  String.raw`^\s*[«"“]?\s*(?:(${NOMBRE_EN_LETTRES})|(\d{1,3}(?:[\s  ]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?))\s*[»"”]?\s*[.!]?\s*$`,
  'iu',
);
const PARLE_D_ECOUTE = /(?<!\p{L})(?:écoute\p{L}*|entend\p{L}*|dict[ée]\p{L}*|je\s+(?:te\s+)?(?:dis|redis|prononce)|je\s+(?:le|la)\s+redis|que\s+je\s+(?:dis|viens\s+de\s+dire))(?!\p{L})/iu;
const BLOC_ARDOISE = /(\[ARDOISE\])([\s\S]*?)(\[\/ARDOISE\])/gi;

export function masquerNombreAuTableau(texte) {
  if (!texte || !/\[ARDOISE\]/i.test(texte)) return texte;
  const horsTableau = texte.replace(BLOC_ARDOISE, ' ');
  if (!PARLE_D_ECOUTE.test(horsTableau)) return texte;

  const demandee = /(?<!\p{L})en\s+lettres(?!\p{L})/iu.test(horsTableau) ? 'lettres'
    : /(?<!\p{L})en\s+chiffres(?!\p{L})/iu.test(horsTableau) ? 'chiffres'
      : null;

  return texte.replace(BLOC_ARDOISE, (tout, ouverture, corps, fermeture) => {
    const nombre = corps.match(NOMBRE_SEUL);
    if (!nombre) return tout;
    const affichee = nombre[1] ? 'lettres' : 'chiffres';
    if (demandee && demandee !== affichee) return tout;
    return `${ouverture} ${SIGNE_A_ECOUTER} ${fermeture}`;
  });
}

/**
 * TOUT CE QUE L'ÉCRAN CACHE D'UN MESSAGE DU PROFESSEUR, dans l'ordre : la balise [A_ECOUTER], puis les consignes de
 * dictée reconnues (dans la bulle comme dans le tableau), puis le nombre seul au tableau. La voix, elle, lit le texte
 * brut (balises retirées) : l'élève entend toujours ce qu'il doit écrire.
 */
export function masquerPourLEcran(texte) {
  if (!texte) return texte;
  return masquerNombreAuTableau(masquerReponseADictee(masquerBaliseAEcouter(texte)));
}
