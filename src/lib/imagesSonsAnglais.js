/**
 * LES IMAGES DES SONS DE L'ANGLAIS — Camara, le 06/11/2026 : « pour les sons, j'ai un dossier pour les illustrations,
 * un dossier par classe du CP au CM2 avec les images des sons ; tu peux les intégrer ». Le pendant anglais des images
 * de syllabes (`imagesMots.js`), au tableau de Marine.
 *
 * UNE IMAGE PAR SON, ET UN MOT PAR IMAGE : le dessin porte son mot anglais, le son en orange, et sa traduction (« cAt /
 * Chat »). L'exercice de sons de l'anglais fait dire de PETITS MOTS anglais (il n'y a pas de syllabes, voir
 * `FaitSonsAnglais` côté serveur) : l'image s'affiche quand l'enfant a trouvé, JUGÉ JUSTE par le serveur, le mot d'une
 * image. Le serveur donne ces mots au professeur à chaque tour, pour qu'il les choisisse.
 *
 * LES FICHIERS : servis par l'API depuis son dossier de données `images-sons-en` (/var/www/mimia/donnees/images-sons-en
 * sur le VPS), nommés comme le son (« sh » → sh.webp, « oo-long » → oo-long.webp). 66 images : « th » voisé (this) n'a
 * pas d'image simple. « thumb » (mb) et « knee » (kn) ne sont pas dans la liste du micro : leur image ne sortira pas.
 */

import { imageDuMotAnglais, motAnglaisIllustre } from './imagesMotsAnglais';

/** Le son, le mot de son image, la classe où il se travaille (correspondance.csv du dossier de Camara). */
export const SONS_ANGLAIS = [
  ['a', 'cat', 'CP'], ['e', 'egg', 'CP'], ['i', 'pig', 'CP'], ['o', 'dog', 'CP'], ['u', 'sun', 'CP'],
  ['b', 'ball', 'CP'], ['c', 'car', 'CP'], ['d', 'duck', 'CP'], ['f', 'frog', 'CP'], ['g', 'goat', 'CP'],
  ['h', 'hat', 'CP'], ['j', 'jam', 'CP'], ['k', 'kite', 'CP'], ['l', 'lion', 'CP'], ['m', 'moon', 'CP'],
  ['n', 'nurse', 'CP'], ['p', 'pizza', 'CP'], ['r', 'rabbit', 'CP'], ['s', 'snake', 'CP'], ['t', 'tiger', 'CP'],
  ['v', 'vegetable', 'CP'], ['w', 'window', 'CP'], ['y', 'yellow', 'CP'], ['z', 'zebra', 'CP'], ['x', 'box', 'CP'],
  ['qu', 'queen', 'CP'],
  ['sh', 'ship', 'CE1'], ['ch', 'cheese', 'CE1'], ['th', 'tooth', 'CE1'], ['ng', 'king', 'CE1'], ['ck', 'duck', 'CE1'],
  ['wh', 'whale', 'CE1'], ['ph', 'phone', 'CE1'],
  ['ai', 'rain', 'CE2'], ['ay', 'play', 'CE2'], ['ee', 'sheep', 'CE2'], ['ea', 'sea', 'CE2'], ['oa', 'boat', 'CE2'],
  ['ie', 'tie', 'CE2'], ['igh', 'night', 'CE2'], ['oo-long', 'moon', 'CE2'], ['oo-court', 'book', 'CE2'],
  ['ow-o', 'snow', 'CE2'], ['ow-aou', 'cow', 'CE2'], ['ou', 'house', 'CE2'], ['oy', 'toy', 'CE2'],
  ['ar', 'car', 'CM1'], ['or', 'horse', 'CM1'], ['er', 'teacher', 'CM1'], ['ir', 'bird', 'CM1'], ['ur', 'turtle', 'CM1'],
  ['air', 'hair', 'CM1'], ['ear', 'ear', 'CM1'], ['a_e', 'cake', 'CM1'], ['i_e', 'kite', 'CM1'], ['o_e', 'home', 'CM1'],
  ['u_e', 'june', 'CM1'],
  ['aw', 'draw', 'CM2'], ['wr', 'write', 'CM2'], ['mb', 'thumb', 'CM2'], ['kn', 'knee', 'CM2'], ['c-doux', 'circle', 'CM2'],
  ['g-doux', 'giraffe', 'CM2'], ['y-ai', 'fly', 'CM2'], ['y-i', 'sunny', 'CM2'], ['tion', 'station', 'CM2'],
].map(([son, mot, niveau]) => ({ son, mot, niveau }));

const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
const rang = (niveau) => CLASSES.indexOf((niveau ?? '').toUpperCase());

/**
 * Le son illustré par ce mot, pour un élève de cette classe, ou null. QUATRE MOTS ONT DEUX IMAGES (duck : d et ck ;
 * car : c et ar ; kite : k et i_e ; moon : m et oo-long) : on prend le son de sa classe ou, à défaut, celui de la
 * classe la plus proche en dessous ; un CP qui dit « duck » voit le d, un CE1 le ck.
 */
export function sonDuMot(mot, niveau) {
  const propre = (mot ?? '').toLowerCase().replace(/[^a-z]/g, '');
  const candidats = SONS_ANGLAIS.filter((s) => s.mot === propre);
  if (candidats.length === 0) return null;
  const r = rang(niveau);
  const atteints = candidats.filter((s) => rang(s.niveau) <= r);
  const choisis = atteints.length > 0 ? atteints : candidats;
  return choisis.reduce((a, b) => (rang(b.niveau) > rang(a.niveau) ? b : a));
}

export const imageDuSonAnglais = (son) => (son
  ? `${process.env.REACT_APP_API_URL ?? ''}/images-sons-en/${son}.webp`
  : null);

const VERDICT_ECOUTE = /^\s*j.ai entendu (?:le mot|la syllabe)\s+(.+?)\s*[.!?]?\s*$/i;
const BALISE_EN = /\[EN\]([\s\S]*?)\[\/EN\]/gi;
const nettoyer = (texte) => (texte ?? '').replace(/[«»"“”.!?…,;:]/g, '').trim();

const dernierPassage = (contenu) => {
  const passages = [...(contenu ?? '').matchAll(BALISE_EN)].map((m) => nettoyer(m[1])).filter(Boolean);
  return passages.length > 0 ? passages[passages.length - 1] : null;
};

/** Du CP au CM2 : les sons de l'anglais ne se travaillent qu'à l'élémentaire. */
const aLElementaire = (eleve) => rang(eleve?.niveauCode ?? eleve?.niveauLibelle) >= 0;

/**
 * Le son que l'élève vient de trouver, s'il faut montrer son image : `{ mot, image, type: 'son' }`, sinon null.
 * `precedent` : le dernier message du professeur avant la réponse. À l'écoute, ce qu'il a trouvé est le mot dit
 * par le professeur (sa balise [EN]), pas l'orthographe de la transcription ; à la prononciation, son seul mot.
 */
export function sonAnglaisTrouve(message, precedent, eleve) {
  if (message?.role !== 'user' || message?.sonJuste !== true || !aLElementaire(eleve)) return null;

  const contenu = message.contenu ?? '';
  const verdict = VERDICT_ECOUTE.exec(contenu);
  let mot;
  if (verdict) {
    const dit = dernierPassage(precedent?.contenu);
    mot = dit && !/\s/.test(dit) ? dit : verdict[1];
  } else {
    if (/\s/.test(contenu.trim())) return null;
    mot = contenu;
  }

  // L'IMAGE DU SON OU CELLE DU MOT (07/11/2026) : dans l'exercice des sons, le professeur annonce le son (« le son sh »)
  // et l'image du son le montre en couleur ; ailleurs, l'image du mot, s'il en a une (`imagesMotsAnglais.js`).
  const propre = nettoyer(mot);
  const son = sonDuMot(propre, eleve?.niveauCode ?? eleve?.niveauLibelle);
  const motIllustre = motAnglaisIllustre(propre);
  const exerciceDeSons = EXERCICE_DE_SONS.test(precedent?.contenu ?? '');
  if (son && (exerciceDeSons || !motIllustre)) return { mot: son.mot, image: imageDuSonAnglais(son.son), type: 'son' };
  return motIllustre ? { mot: motIllustre.mot, image: imageDuMotAnglais(motIllustre.mot), type: 'mot-anglais' } : null;
}

/** « Le son sh. », « le a de cat » : la question de l'exercice des sons (voir `FaitSonsAnglais` côté serveur). */
const EXERCICE_DE_SONS = /(?<!\p{L})(?:le|du|ce)\s+son(?!\p{L})|(?<!\p{L})le\s+\S{1,4}\s+de\s+[a-z]+/iu;
