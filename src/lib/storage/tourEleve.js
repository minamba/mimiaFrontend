/**
 * Quand l'élève a-t-il VRAIMENT fini de parler ?
 *
 * Le transcripteur ferme un tour dès que la phrase lui paraît complète. C'est
 * le bon réglage pour un dialogue de calcul — question courte, réponse courte —
 * et le mauvais pour une justification : « alors, parce que si on prend 234… »
 * (l'élève réfléchit) « …on peut le couper en 200, 30 et 4 » arrivait en DEUX
 * tours. Le professeur commençait à répondre au premier, le second annulait sa
 * génération, et l'élève le voyait démarrer puis se taire.
 *
 * On sépare donc les deux notions : le transcripteur dit qu'une PHRASE est
 * finie, ce module décide qu'un TOUR l'est. Entre les deux, un court délai
 * pendant lequel un nouveau fragment vient se recoller au précédent.
 *
 * Rendre la détection elle-même plus patiente ne marchait pas : `low` a été
 * essayé, et une phrase terminée restait sans réponse tant que l'élève ne
 * reparlait pas. Le délai doit donc être court par défaut, et long seulement
 * quand on a de bonnes raisons d'attendre.
 */

/**
 * Assez court pour être imperceptible. C'est le cas normal : à « combien font
 * 200 fois 6 ? » on attend un nombre, et le professeur doit répondre aussitôt.
 */
export const DELAI_COURT = 150;

/**
 * De quoi laisser réfléchir au milieu d'un raisonnement. Un enfant qui
 * justifie s'arrête pour chercher ses mots, et cette pause-là ne signifie pas
 * qu'il a fini.
 */
export const DELAI_LONG = 2500;

/**
 * Le temps de poser un calcul dans sa tête.
 *
 * ENTRE LES DEUX, ET C'EST TOUT L'INTÉRÊT. « Combien font 234 ÷ 2 ? » attend
 * un nombre — donc pas les 2,5 s d'une justification, qui feraient traîner
 * chaque « oui » et chaque « douze ». Mais un enfant qui divise de tête se
 * tait deux à trois secondes AU MILIEU de sa phrase, et 150 ms expédiaient
 * la moitié de sa réponse pendant qu'il réfléchissait encore.
 *
 * 1,4 s est mesuré sur ce qu'on cherche à couvrir : la pause de calcul
 * mental, pas la pause de fin de tour. Au-delà, le professeur paraît lent à
 * répondre à un simple résultat ; en deçà, on recoupe l'enfant.
 */
export const DELAI_REFLEXION = 1400;

// Traits d'union ramenés à l'espace au même titre que les apostrophes : sans
// ça, « Qu'est-ce qui te fait dire ça ? » restait « qu est-ce qui », et le
// motif écrit en mots séparés ne s'y retrouvait pas.
const normaliser = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/['’-]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

/**
 * Le professeur vient-il de demander une explication ?
 *
 * C'est LUI qui sait quelle longueur de réponse il attend : il l'a décidé en
 * posant sa question. Plutôt qu'un compromis unique pour tous les cas, la
 * patience se règle sur ce qu'il vient de demander.
 *
 * `combien` est volontairement absent : c'est une question à réponse courte.
 */
const JUSTIFICATION = [
  /\bexplique\b|\bexpliquer\b|\bexplication\b/,
  /\bpourquoi\b/,
  /\bcomment\b/,
  /\bjustifie\b|\bjustifier\b/,
  /\bdetaille\b|\bdecris\b|\braconte\b/,
  /\bqu est ce qui te fait\b|\bqu est ce que tu en penses\b/,
  /\ba ton avis\b|\bselon toi\b|\bd apres toi\b/,

  // La compréhension orale (et la compréhension écrite) posent une question
  // qui n'a ni « pourquoi » ni « explique » : « qu'est-ce que tu as compris
  // de cette histoire ? » attend un résumé libre, aussi long qu'une
  // justification — et sans ce motif, elle recevait la même patience qu'un
  // « combien font 6 fois 7 ? ».
  /\bcompris\b|\bcomprehension\b|\bqu as tu retenu\b/,
];

export function demandeJustification(texte) {
  const propre = normaliser(texte);

  return JUSTIFICATION.some((motif) => motif.test(propre));
}

/**
 * Le professeur vient-il de demander un CALCUL ?
 *
 * CHERCHER SES MOTS N'EST PAS EXPLIQUER, MAIS ÇA PREND DU TEMPS AUSSI.
 * ------------------------------------------------------------------
 * Relevé par Camara le 13/09/2026 : en mathématiques, « au moins 80 à 95 % »
 * de ce qu'elle disait se perdait, alors que le français et l'anglais
 * marchaient. La cause n'était ni le micro ni la transcription — c'était
 * cette minuterie.
 *
 * Une question de maths ne contient par construction aucun mot de
 * justification : « combien font 234 ÷ 2 ? » attend un nombre, donc la
 * patience tombait à `DELAI_COURT` — un dixième de seconde de silence
 * toléré. Or un enfant qui POSE une division dans sa tête se tait trois à
 * cinq secondes, et il se tait AU MILIEU de sa réponse : « alors… deux cent
 * trente-quatre divisé par deux… ça fait… ». Chaque pause expédiait un
 * fragment, et chaque fragment annulait la génération du précédent (voir
 * `envoyerTexte` dans Chat.js). D'où l'impression que presque tout
 * disparaissait.
 *
 * Ces questions-là ne méritent pas les 2,5 s d'une justification — la
 * réponse reste courte — mais elles méritent le temps de réfléchir. D'où un
 * troisième palier.
 *
 * `combien` est ici ce qu'il n'est PAS dans `JUSTIFICATION` : la question la
 * plus courante en calcul mental, et la plus mal servie jusqu'ici.
 */
const REFLEXION = [
  // --- Chercher un résultat : mathématiques, physique-chimie, SVT ---
  /\bcombien\b/,
  /\bcalcule\b|\bcalculer\b|\bcalcul\b/,
  /\bresultat\b|\bresous\b|\bresoudre\b/,
  /\bpose\b|\bposer\b/,
  /\bconvertis\b|\bconvertir\b|\bsimplifie\b|\bsimplifier\b/,
  /\bdeveloppe\b|\bdevelopper\b|\bfactorise\b|\bfactoriser\b/,
  /\bmesure\b|\bcompare\b|\btrouve\b|\bdetermine\b/,
  /\bfont\b|\bfait\b|\begal\b|\begale\b/,

  // --- Chercher en mémoire : histoire-géo, SVT, français ---
  //
  // Fouiller sa mémoire fait hésiter au milieu d'une phrase exactement comme
  // poser une division : « euh… en… mille sept cent… quatre-vingt-neuf ».
  // Sans ces motifs, le correctif n'aurait servi qu'aux matières
  // scientifiques, alors que le défaut touche toutes les questions à réponse
  // factuelle.
  /\bquelle? est\b|\bquels? sont\b/,
  /\ben quelle annee\b|\bquelle date\b|\bquel siecle\b/,
  /\bcite\b|\bciter\b|\bnomme\b|\bnommer\b|\benumere\b/,
  /\bdonne moi\b|\bdonne\b/,
  /\bqui a\b|\bou se trouve\b|\bou est\b/,
];

/**
 * Le professeur attend-il une réponse qu'il faut CHERCHER — un calcul à
 * poser, une date à retrouver, une formule à se rappeler ?
 *
 * Aucune condition de matière ici, et c'est délibéré : ce n'est pas le cours
 * qui décide du temps de réflexion, c'est la question. « Combien de
 * chromosomes ? » en SVT et « combien font 6 × 7 ? » en maths font hésiter au
 * même endroit, pour la même raison.
 */
export function demandeReflexion(texte) {
  const propre = normaliser(texte);

  return REFLEXION.some((motif) => motif.test(propre));
}

/**
 * Mots sur lesquels une phrase ne s'arrête pas.
 *
 * Un fragment qui finit par « parce que » ou « donc » n'est pas une réponse,
 * c'est une phrase coupée en plein élan. Aucune question du professeur n'est
 * nécessaire pour le savoir : le texte le dit tout seul.
 */
const CHARNIERES = new RegExp(
  '\\b(parce que|par ce que|car|donc|alors|et|mais|ou|puis|ensuite|apres|'
  + 'si|quand|lorsque|comme|pour|afin|sauf|meme|du coup|en fait|c est a dire|'
  + 'a cause|grace|vu que|puisque|tandis que|alors que|alors qu|alors quon)\\s*$',
);

export function fragmentInacheve(texte) {
  const propre = normaliser(texte).replace(/[.!?…]+\s*$/, '').trim();
  if (!propre) return false;

  // Une virgule finale dit la même chose et se lit plus vite.
  if (/,$/.test(propre)) return true;

  return CHARNIERES.test(propre);
}

/**
 * Le seuil, en mots, à partir duquel une réponse sans ponctuation finale
 * mérite la même patience qu'une phrase coupée sur une charnière.
 *
 * EN DEÇÀ, ON NE TOUCHE À RIEN : « combien font 200 fois 6 ? » — « six
 * cents » ne se termine ni par un point ni par une charnière, et doit
 * pourtant partir vite. C'est tout l'intérêt du seuil : une réponse courte
 * finit toujours vite de toute façon, elle n'a pas besoin de patience en
 * plus ; seule une réponse qui s'allonge sans jamais conclure en a besoin.
 */
const MOTS_REPONSE_LONGUE = 12;

/**
 * Une réponse déjà longue, qui continue sans jamais conclure.
 *
 * Les charnières couvrent le cas où le DERNIER MOT annonce la suite —
 * « parce que », « donc ». Elles ne couvrent pas l'élève qui, en pleine
 * explication de vingt ou trente secondes au casque, reprend son souffle
 * entre deux phrases sans finir sur l'un de ces mots précis : la respiration
 * marque la même coupure, mais aucune charnière ne l'annonce par écrit.
 *
 * Relevé : une réponse longue envoyée par bouts de cent cinquante
 * millisecondes en silence — un fragment partait dès la première
 * respiration, le reste arrivait ensuite comme un second message, ou
 * disparaissait purement et simplement si le fournisseur le jugeait trop
 * court pour être de la parole. L'élève avait l'impression que seul « un
 * mot au hasard » de sa phrase était parti.
 */
function reponseLongueSansConclusion(texte) {
  const brut = (texte ?? '').trim();
  if (!brut) return false;
  if (/[.!?…]\s*$/.test(brut)) return false;

  return brut.split(/\s+/).filter(Boolean).length >= MOTS_REPONSE_LONGUE;
}

/**
 * Combien de temps attendre avant de considérer le tour terminé.
 *
 * Le fragment prime sur la question : une phrase manifestement coupée doit
 * attendre, même si le professeur demandait un simple résultat.
 *
 * @param accumule Le tour en cours de construction, fragment recollé sur
 *   fragment — pas seulement le dernier morceau arrivé. C'est LUI qui dit si
 *   la réponse s'allonge, un fragment isolé ne le dirait pas.
 */
export function delaiAssemblage({ demandeProf, fragment, accumule } = {}) {
  if (fragmentInacheve(fragment)) return DELAI_LONG;
  if (demandeJustification(demandeProf)) return DELAI_LONG;
  if (reponseLongueSansConclusion(accumule ?? fragment)) return DELAI_LONG;

  // Une réponse à chercher : le temps de la trouver, pas celui d'une
  // explication. Placé APRÈS les trois autres, qui l'emportent — une
  // justification demandée pendant un calcul reste une justification.
  if (demandeReflexion(demandeProf)) return DELAI_REFLEXION;

  return DELAI_COURT;
}

/**
 * Le plus longtemps qu'on attende une transcription avant d'envoyer quand même.
 *
 * Au-delà du chien de garde de l'écoute (huit secondes), qui aura eu le temps
 * de constater une oreille morte et de renvoyer le tour sur une liaison neuve.
 * Ce plafond ne sert qu'à ne jamais bloquer un envoi pour toujours sur une
 * transcription qui ne reviendra pas.
 */
export const ATTENTE_TRANSCRIPTION_MAX_MS = 12000;

/**
 * L'ENVOI DOIT-IL ENCORE ATTENDRE ?
 *
 * LE DÉFAUT QUE CETTE RÈGLE CORRIGE — relevé par Camara le 13/09/2026 :
 * « j'ai parlé trente secondes, j'ai vu mes paroles s'écrire et s'effacer, et
 * il a envoyé un bout de phrase alors que j'avais fait toute une
 * justification ».
 *
 * Le délai d'assemblage partait au SILENCE. Or au silence, le morceau qui
 * vient d'être dit n'est pas encore transcrit : l'ordre de transcription part
 * à cet instant, et le texte revient une demi-seconde à deux secondes plus
 * tard — plus pour un long morceau. Le délai expirait avant : le chat envoyait
 * ce qu'il avait, un bout de phrase, vidait le champ, et la suite de la
 * justification arrivait dans un champ vide, derrière une réponse déjà partie.
 *
 * On n'envoie donc jamais tant qu'un morceau dit est encore en route vers sa
 * transcription, ni tant que l'élève parle. Le délai d'assemblage garde son
 * rôle — laisser le temps de reprendre son souffle — mais il ne peut plus
 * trancher à la place d'une transcription qui n'est pas arrivée.
 *
 * @param parle                 l'élève parle-t-il en ce moment ?
 * @param transcriptionEnCours  un morceau dit attend-il encore son texte ?
 * @param attenteMs             depuis combien de temps on attend déjà.
 */
export function doitAttendreAvantEnvoi({ parle, transcriptionEnCours, attenteMs = 0 } = {}) {
  if (attenteMs >= ATTENTE_TRANSCRIPTION_MAX_MS) return false;

  return Boolean(parle || transcriptionEnCours);
}
