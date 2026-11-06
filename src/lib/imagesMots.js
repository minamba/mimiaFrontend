/**
 * L'IMAGE DU MOT TROUVÉ — Camara, le 05-06/11/2026 : « quand l'enfant donne la bonne réponse, le professeur met
 * l'image visuelle qui représente le mot ; ça peut être ludique pour les enfants », au CP, dans les exercices de mots.
 *
 * LA RÈGLE EST ICI, PAS DANS LE PROMPT : un modèle oublie une consigne, le code non (voir la mémoire « une règle de
 * prompt ne vaut pas un fait »). L'image s'affiche quand, et seulement quand :
 *  - l'élève est en CP ;
 *  - sa réponse a été JUGÉE juste par le serveur (`sonJuste === true`) ;
 *  - c'est un MOT, jamais une syllabe : en exercice d'écoute, la question précédente annonçait un mot (« Voici le
 *    premier mot », « Voici le prochain mot », « Je te le redis ») et le mot est celui de sa balise [FR] ; en
 *    exercice de prononciation, le son jugé est le mot lui-même ;
 *  - ce mot a une image.
 *
 * LES IMAGES : dessinées par Camara (originaux PNG hors du code, dans Documents\Mimia - images des mots, un dossier
 * par thème), réduites en WebP 384 px (3,8 Mo pour les 164) et SERVIES PAR L'API depuis son dossier de données
 * `images-mots` (/var/www/mimia/donnees/images-mots sur le VPS, voir Program.cs) — Camara, le 06/11/2026 : « pas
 * dans src, dans un dossier de données ». Une image par mot de CP de la banque des mots, nommée comme le mot sans
 * accent (« âne » → ane.webp, « sœur » → soeur.webp).
 */
export const MOTS_ILLUSTRES = new Set([
  'abeille', 'air', 'ami', 'ane', 'araignee', 'arbre', 'balle', 'ballon', 'banane', 'bateau', 'beau', 'bebe',
  'blanc', 'bleu', 'bonbon', 'bouche', 'boule', 'bras', 'cafe', 'cahier', 'canard', 'carotte', 'chaise',
  'chapeau', 'char', 'chat', 'chaud', 'chaussure', 'chemise', 'cheval', 'chevre', 'chocolat', 'ciel', 'cinq',
  'citron', 'classe', 'clef', 'cochon', 'coeur', 'cour', 'crayon', 'dent', 'dix', 'doigt', 'dos', 'ecole',
  'enfant', 'ete', 'etoile', 'fee', 'fenetre', 'feuille', 'fille', 'fleur', 'foret', 'four', 'frere',
  'fromage', 'fusee', 'gare', 'gateau', 'genou', 'girafe', 'gomme', 'grand', 'gros', 'guitare', 'herbe',
  'huit', 'jambe', 'jardin', 'jaune', 'jouet', 'jour', 'jupe', 'jus', 'lait', 'lampe', 'lapin', 'lent',
  'ligne', 'lit', 'livre', 'loup', 'lourd', 'lune', 'maison', 'maman', 'manteau', 'mere', 'moins', 'montagne',
  'moto', 'mouton', 'neige', 'neuf', 'nez', 'niche', 'nid', 'noir', 'nuage', 'nuit', 'oiseau', 'orange',
  'oreille', 'oui', 'ours', 'pantalon', 'papa', 'peau', 'peigne', 'pere', 'petit', 'peur', 'pied', 'plage',
  'pluie', 'poisson', 'pomme', 'porte', 'poule', 'poupee', 'quatre', 'rat', 'reine', 'riz', 'robe', 'robot',
  'roche', 'roue', 'rouge', 'route', 'sable', 'salade', 'savon', 'sel', 'sept', 'singe', 'six', 'soeur',
  'soleil', 'soupe', 'souris', 'stylo', 'sucre', 'table', 'tasse', 'tete', 'the', 'tigre', 'tomate', 'tortue',
  'tour', 'tulipe', 'vache', 'velo', 'vent', 'ventre', 'verre', 'vert', 'vite', 'vol', 'zebre', 'zero',
]);

/** « Âne. » → « ane » ; « Sœur » → « soeur » : le nom du fichier. */
export const nomDeFichier = (mot) => (mot ?? '')
  .toLowerCase()
  .replace(/œ/g, 'oe')
  .replace(/æ/g, 'ae')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z]/g, '');

/** L'adresse de l'image du mot, ou null s'il n'en a pas. */
export const imageDuMot = (mot) => {
  const nom = nomDeFichier(mot);
  return nom && MOTS_ILLUSTRES.has(nom) ? `${process.env.REACT_APP_API_URL ?? ''}/images-mots/${nom}.webp` : null;
};

/**
 * LES SYLLABES (06/11/2026) — Camara : « le jeu des syllabes, quand l'enfant donnera une bonne réponse, on affichera
 * une image ». Les images arrivent au fil de l'eau dans le dossier de données `images-syllabes` de l'API : aucune liste
 * ici, la carte n'apparaît que si l'image se charge (voir Chat.js).
 *
 * LE NOM DU FICHIER : sans accent, et « -aigu » quand la syllabe a un « é », car « je » et « jé » ne se disent pas
 * pareil (17 paires dans la banque) : « la » → la.webp, « jé » → je-aigu.webp, « blé » → ble-aigu.webp.
 */
export const nomDeSyllabe = (syllabe) => {
  const s = (syllabe ?? '').toLowerCase().trim();
  const base = nomDeFichier(s);
  if (!base) return '';
  const nom = `${base}${s.includes('é') ? '-aigu' : ''}`;
  // WINDOWS INTERDIT CERTAINS NOMS DE FICHIER (« con », « aux », « nul »…), quelle que soit l'extension : la syllabe
  // « con » ne pouvait pas exister sur la machine de Camara. Elle s'appelle con-syllabe.webp.
  return NOMS_RESERVES_WINDOWS.has(nom) ? `${nom}-syllabe` : nom;
};

const NOMS_RESERVES_WINDOWS = new Set([
  'con', 'prn', 'aux', 'nul',
  'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
  'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
]);

export const imageDeSyllabe = (syllabe) => {
  const nom = nomDeSyllabe(syllabe);
  return nom ? `${process.env.REACT_APP_API_URL ?? ''}/images-syllabes/${nom}.webp` : null;
};

/** Le verdict d'écoute écrit par le serveur : « J'ai entendu le mot niche. » / « J'ai entendu la syllabe na. » */
const VERDICT_ECOUTE = /^\s*j.ai entendu (le mot|la syllabe)\s+(.+?)\s*[.!?]?\s*$/i;

/** Une question d'écoute qui annonce un MOT (le texte vient du serveur, `VerificationSonService.EcouteDesMots`). */
const ANNONCE_DE_MOT = /\b(?:voici le (?:premier|prochain) mot|je te le redis)\b/i;
const ANNONCE_DE_SYLLABE = /\b(?:voici la (?:première|premiere|prochaine) syllabe|je te la redis)\b/i;
const BALISE_FR = /\[FR\]([\s\S]*?)\[\/FR\]/gi;

const estCP = (eleve) => eleve?.niveauCode === 'CP' || eleve?.niveauLibelle === 'CP';
/** Les syllabes se travaillent au CP et au CE1 (la liste des images couvre les deux, PDF du 05/11/2026). */
const estCPouCE1 = (eleve) => estCP(eleve) || eleve?.niveauCode === 'CE1' || eleve?.niveauLibelle === 'CE1';
const SYLLABE_DANS_LA_QUESTION = /\bsyllabe\b/i;

/** Le dernier mot dit à l'écoute dans un message du professeur : « [FR]souris[/FR] » → « souris ». */
const dernierPassage = (contenu) => {
  const passages = [...(contenu ?? '').matchAll(BALISE_FR)].map((m) => m[1].trim()).filter(Boolean);
  return passages.length > 0 ? passages[passages.length - 1] : null;
};

const nettoyer = (texte) => (texte ?? '').replace(/[«»"“”.!?…,;:]/g, '').trim();

/** Une syllabe trouvée : son image (qui peut ne pas exister encore : la carte attend qu'elle se charge). */
const syllabeTrouvee = (syllabe) => {
  const propre = nettoyer(syllabe).toLowerCase();
  const image = propre && !/\s/.test(propre) ? imageDeSyllabe(propre) : null;
  return image ? { mot: propre, image, type: 'syllabe' } : null;
};

/**
 * Le mot ou la syllabe que l'élève vient de trouver, s'il faut montrer son image : `{ mot, image, type }`, sinon
 * null. `precedent` : le dernier message du professeur avant la réponse.
 *  - un MOT : au CP, l'image vient de la liste `MOTS_ILLUSTRES` ;
 *  - une SYLLABE : au CP et au CE1, l'image est demandée au dossier des syllabes, qui se remplit peu à peu.
 */
export function motTrouve(message, precedent, eleve) {
  if (message?.role !== 'user' || message?.sonJuste !== true) return null;

  const contenu = message.contenu ?? '';
  const question = precedent?.contenu ?? '';
  const verdict = VERDICT_ECOUTE.exec(contenu);

  let mot = null;
  if (verdict) {
    // L'ÉCOUTE. Ce qu'on a trouvé est ce que le professeur a fait entendre (sa balise), pas l'orthographe de la
    // transcription ; à défaut, ce qu'écrit le verdict.
    if (/^la syllabe$/i.test(verdict[1])) {
      if (!estCPouCE1(eleve) || ANNONCE_DE_MOT.test(question)) return null;
      return syllabeTrouvee((ANNONCE_DE_SYLLABE.test(question) && dernierPassage(question)) || verdict[2]);
    }
    if (ANNONCE_DE_SYLLABE.test(question)) return null;
    mot = (ANNONCE_DE_MOT.test(question) && dernierPassage(question)) || verdict[2];
  } else {
    // LA PRONONCIATION : le son jugé est le mot, ou la syllabe quand la question parlait de syllabe. Un mot illustré
    // passe d'abord (« lis ce mot, syllabe par syllabe » reste un mot).
    if (/\s/.test(contenu.trim())) return null;
    const motIllustre = estCP(eleve) && !ANNONCE_DE_SYLLABE.test(question) && imageDuMot(nettoyer(contenu));
    if (!motIllustre && (ANNONCE_DE_SYLLABE.test(question) || SYLLABE_DANS_LA_QUESTION.test(question))) {
      return estCPouCE1(eleve) ? syllabeTrouvee(contenu) : null;
    }
    mot = contenu;
  }

  if (!estCP(eleve)) return null;
  const propre = nettoyer(mot);
  const image = imageDuMot(propre);
  return image ? { mot: propre.toLowerCase(), image, type: 'mot' } : null;
}
