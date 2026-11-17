/**
 * LES IMAGES DES MOTS DE L'ANGLAIS — Camara, le 07/11/2026 : « les images pour les mots en anglais sont prêtes, le
 * dossier c'est anglais-mots-CP-CM2-images, dedans les classes, et dans chaque classe les mots ; tu peux mettre ça en
 * place ». 242 mots du CP au CM2, chaque dessin porte son mot anglais et sa traduction (« apple / Pomme »).
 *
 * ILS SERVENT À DEUX EXERCICES DE MARINE :
 *  - l'écoute des mots : l'image s'affiche au tableau quand l'enfant a trouvé le mot (voir `imagesSonsAnglais.js`,
 *    `sonAnglaisTrouve`, qui choisit entre l'image du son et celle du mot) ;
 *  - la lecture des mots (`lectureDImage.js`) : l'image est au tableau, l'enfant lit le mot anglais.
 *
 * LES FICHIERS : servis par l'API depuis son dossier de données `images-mots-en` (/var/www/mimia/donnees/images-mots-en
 * sur le VPS), nommés comme le mot en minuscules (« Santa » → santa.webp). La même table vit côté serveur
 * (`MotsAnglaisIllustres.cs`) : les deux se modifient ensemble.
 */

/** Le mot, sa traduction écrite sur l'image, sa classe (correspondance.csv du dossier de Camara). */
export const MOTS_ANGLAIS = [
  { mot: 'red', francais: 'rouge', niveau: 'CP' }, { mot: 'blue', francais: 'bleu', niveau: 'CP' }, { mot: 'green', francais: 'vert', niveau: 'CP' },
  { mot: 'yellow', francais: 'jaune', niveau: 'CP' }, { mot: 'pink', francais: 'rose', niveau: 'CP' }, { mot: 'black', francais: 'noir', niveau: 'CP' },
  { mot: 'white', francais: 'blanc', niveau: 'CP' }, { mot: 'brown', francais: 'marron', niveau: 'CP' }, { mot: 'purple', francais: 'violet', niveau: 'CP' },
  { mot: 'grey', francais: 'gris', niveau: 'CP' }, { mot: 'one', francais: 'un', niveau: 'CP' }, { mot: 'four', francais: 'quatre', niveau: 'CP' },
  { mot: 'five', francais: 'cinq', niveau: 'CP' }, { mot: 'six', francais: 'six', niveau: 'CP' }, { mot: 'seven', francais: 'sept', niveau: 'CP' },
  { mot: 'eight', francais: 'huit', niveau: 'CP' }, { mot: 'nine', francais: 'neuf', niveau: 'CP' }, { mot: 'ten', francais: 'dix', niveau: 'CP' },
  { mot: 'cat', francais: 'chat', niveau: 'CP' }, { mot: 'dog', francais: 'chien', niveau: 'CP' }, { mot: 'bird', francais: 'oiseau', niveau: 'CP' },
  { mot: 'fish', francais: 'poisson', niveau: 'CP' }, { mot: 'duck', francais: 'canard', niveau: 'CP' }, { mot: 'cow', francais: 'vache', niveau: 'CP' },
  { mot: 'pig', francais: 'cochon', niveau: 'CP' }, { mot: 'horse', francais: 'cheval', niveau: 'CP' }, { mot: 'sheep', francais: 'mouton', niveau: 'CP' },
  { mot: 'frog', francais: 'grenouille', niveau: 'CP' }, { mot: 'lion', francais: 'lion', niveau: 'CP' }, { mot: 'mouse', francais: 'souris', niveau: 'CP' },
  { mot: 'rabbit', francais: 'lapin', niveau: 'CP' }, { mot: 'hen', francais: 'poule', niveau: 'CP' }, { mot: 'head', francais: 'tête', niveau: 'CP' },
  { mot: 'hand', francais: 'main', niveau: 'CP' }, { mot: 'eye', francais: 'œil', niveau: 'CP' }, { mot: 'ear', francais: 'oreille', niveau: 'CP' },
  { mot: 'arm', francais: 'bras', niveau: 'CP' }, { mot: 'leg', francais: 'jambe', niveau: 'CP' }, { mot: 'foot', francais: 'pied', niveau: 'CP' },
  { mot: 'hair', francais: 'cheveux', niveau: 'CP' }, { mot: 'face', francais: 'visage', niveau: 'CP' }, { mot: 'mum', francais: 'maman', niveau: 'CP' },
  { mot: 'dad', francais: 'papa', niveau: 'CP' }, { mot: 'baby', francais: 'bébé', niveau: 'CP' }, { mot: 'sister', francais: 'sœur', niveau: 'CP' },
  { mot: 'brother', francais: 'frère', niveau: 'CP' }, { mot: 'ball', francais: 'ballon', niveau: 'CP' }, { mot: 'doll', francais: 'poupée', niveau: 'CP' },
  { mot: 'teddy', francais: 'nounours', niveau: 'CP' }, { mot: 'car', francais: 'voiture', niveau: 'CP' }, { mot: 'kite', francais: 'cerf-volant', niveau: 'CP' },
  { mot: 'apple', francais: 'pomme', niveau: 'CP' }, { mot: 'banana', francais: 'banane', niveau: 'CP' }, { mot: 'monkey', francais: 'singe', niveau: 'CE1' },
  { mot: 'tiger', francais: 'tigre', niveau: 'CE1' }, { mot: 'giraffe', francais: 'girafe', niveau: 'CE1' }, { mot: 'zebra', francais: 'zèbre', niveau: 'CE1' },
  { mot: 'snake', francais: 'serpent', niveau: 'CE1' }, { mot: 'spider', francais: 'araignée', niveau: 'CE1' }, { mot: 'owl', francais: 'chouette', niveau: 'CE1' },
  { mot: 'goat', francais: 'chèvre', niveau: 'CE1' }, { mot: 'panda', francais: 'panda', niveau: 'CE1' }, { mot: 'penguin', francais: 'manchot', niveau: 'CE1' },
  { mot: 'turtle', francais: 'tortue', niveau: 'CE1' }, { mot: 'kangaroo', francais: 'kangourou', niveau: 'CE1' }, { mot: 'dolphin', francais: 'dauphin', niveau: 'CE1' },
  { mot: 'whale', francais: 'baleine', niveau: 'CE1' }, { mot: 'shark', francais: 'requin', niveau: 'CE1' }, { mot: 'fox', francais: 'renard', niveau: 'CE1' },
  { mot: 'wolf', francais: 'loup', niveau: 'CE1' }, { mot: 'hamster', francais: 'hamster', niveau: 'CE1' }, { mot: 'butterfly', francais: 'papillon', niveau: 'CE1' },
  { mot: 'cake', francais: 'gâteau', niveau: 'CE1' }, { mot: 'bread', francais: 'pain', niveau: 'CE1' }, { mot: 'milk', francais: 'lait', niveau: 'CE1' },
  { mot: 'cheese', francais: 'fromage', niveau: 'CE1' }, { mot: 'egg', francais: 'œuf', niveau: 'CE1' }, { mot: 'pizza', francais: 'pizza', niveau: 'CE1' },
  { mot: 'burger', francais: 'hamburger', niveau: 'CE1' }, { mot: 'jam', francais: 'confiture', niveau: 'CE1' }, { mot: 'honey', francais: 'miel', niveau: 'CE1' },
  { mot: 'candy', francais: 'bonbon', niveau: 'CE1' }, { mot: 'cookie', francais: 'cookie', niveau: 'CE1' }, { mot: 'pear', francais: 'poire', niveau: 'CE1' },
  { mot: 'cherry', francais: 'cerise', niveau: 'CE1' }, { mot: 'grape', francais: 'raisin', niveau: 'CE1' }, { mot: 'lemon', francais: 'citron', niveau: 'CE1' },
  { mot: 'pineapple', francais: 'ananas', niveau: 'CE1' }, { mot: 'strawberry', francais: 'fraise', niveau: 'CE1' }, { mot: 'hat', francais: 'chapeau', niveau: 'CE1' },
  { mot: 'cap', francais: 'casquette', niveau: 'CE1' }, { mot: 'coat', francais: 'manteau', niveau: 'CE1' }, { mot: 'dress', francais: 'robe', niveau: 'CE1' },
  { mot: 'shoes', francais: 'chaussures', niveau: 'CE1' }, { mot: 'socks', francais: 'chaussettes', niveau: 'CE1' }, { mot: 'scarf', francais: 'écharpe', niveau: 'CE1' },
  { mot: 'gloves', francais: 'gants', niveau: 'CE1' }, { mot: 'boots', francais: 'bottes', niveau: 'CE1' }, { mot: 'skirt', francais: 'jupe', niveau: 'CE1' },
  { mot: 'shirt', francais: 'chemise', niveau: 'CE1' }, { mot: 'trousers', francais: 'pantalon', niveau: 'CE1' }, { mot: 'shorts', francais: 'short', niveau: 'CE1' },
  { mot: 'jeans', francais: 'jean', niveau: 'CE1' }, { mot: 'jumper', francais: 'pull', niveau: 'CE1' }, { mot: 'tie', francais: 'cravate', niveau: 'CE1' },
  { mot: 'book', francais: 'livre', niveau: 'CE1' }, { mot: 'pencil', francais: 'crayon', niveau: 'CE1' }, { mot: 'ruler', francais: 'règle', niveau: 'CE1' },
  { mot: 'rubber', francais: 'gomme', niveau: 'CE1' }, { mot: 'glue', francais: 'colle', niveau: 'CE1' }, { mot: 'scissors', francais: 'ciseaux', niveau: 'CE1' },
  { mot: 'schoolbag', francais: 'cartable', niveau: 'CE1' }, { mot: 'desk', francais: 'bureau', niveau: 'CE1' }, { mot: 'board', francais: 'tableau', niveau: 'CE1' },
  { mot: 'notebook', francais: 'cahier', niveau: 'CE1' }, { mot: 'paper', francais: 'papier', niveau: 'CE1' }, { mot: 'house', francais: 'maison', niveau: 'CE2' },
  { mot: 'door', francais: 'porte', niveau: 'CE2' }, { mot: 'window', francais: 'fenêtre', niveau: 'CE2' }, { mot: 'table', francais: 'table', niveau: 'CE2' },
  { mot: 'sofa', francais: 'canapé', niveau: 'CE2' }, { mot: 'bed', francais: 'lit', niveau: 'CE2' }, { mot: 'lamp', francais: 'lampe', niveau: 'CE2' },
  { mot: 'bathroom', francais: 'salle de bains', niveau: 'CE2' }, { mot: 'bedroom', francais: 'chambre', niveau: 'CE2' }, { mot: 'kitchen', francais: 'cuisine', niveau: 'CE2' },
  { mot: 'shower', francais: 'douche', niveau: 'CE2' }, { mot: 'stairs', francais: 'escalier', niveau: 'CE2' }, { mot: 'mirror', francais: 'miroir', niveau: 'CE2' },
  { mot: 'clock', francais: 'horloge', niveau: 'CE2' }, { mot: 'phone', francais: 'téléphone', niveau: 'CE2' }, { mot: 'garden', francais: 'jardin', niveau: 'CE2' },
  { mot: 'sun', francais: 'soleil', niveau: 'CE2' }, { mot: 'rain', francais: 'pluie', niveau: 'CE2' }, { mot: 'snow', francais: 'neige', niveau: 'CE2' },
  { mot: 'cloud', francais: 'nuage', niveau: 'CE2' }, { mot: 'wind', francais: 'vent', niveau: 'CE2' }, { mot: 'fog', francais: 'brouillard', niveau: 'CE2' },
  { mot: 'sunny', francais: 'ensoleillé', niveau: 'CE2' }, { mot: 'rainy', francais: 'pluvieux', niveau: 'CE2' }, { mot: 'cloudy', francais: 'nuageux', niveau: 'CE2' },
  { mot: 'windy', francais: 'venteux', niveau: 'CE2' }, { mot: 'snowy', francais: 'neigeux', niveau: 'CE2' }, { mot: 'hot', francais: 'chaud', niveau: 'CE2' },
  { mot: 'winter', francais: 'hiver', niveau: 'CE2' }, { mot: 'summer', francais: 'été', niveau: 'CE2' }, { mot: 'spring', francais: 'printemps', niveau: 'CE2' },
  { mot: 'eleven', francais: 'onze', niveau: 'CE2' }, { mot: 'twelve', francais: 'douze', niveau: 'CE2' }, { mot: 'fourteen', francais: 'quatorze', niveau: 'CE2' },
  { mot: 'fifteen', francais: 'quinze', niveau: 'CE2' }, { mot: 'sixteen', francais: 'seize', niveau: 'CE2' }, { mot: 'seventeen', francais: 'dix-sept', niveau: 'CE2' },
  { mot: 'eighteen', francais: 'dix-huit', niveau: 'CE2' }, { mot: 'nineteen', francais: 'dix-neuf', niveau: 'CE2' }, { mot: 'twenty', francais: 'vingt', niveau: 'CE2' },
  { mot: 'bike', francais: 'vélo', niveau: 'CM1' }, { mot: 'plane', francais: 'avion', niveau: 'CM1' }, { mot: 'boat', francais: 'bateau', niveau: 'CM1' },
  { mot: 'ship', francais: 'navire', niveau: 'CM1' }, { mot: 'taxi', francais: 'taxi', niveau: 'CM1' }, { mot: 'school', francais: 'école', niveau: 'CM1' },
  { mot: 'hospital', francais: 'hôpital', niveau: 'CM1' }, { mot: 'library', francais: 'bibliothèque', niveau: 'CM1' }, { mot: 'park', francais: 'parc', niveau: 'CM1' },
  { mot: 'shop', francais: 'magasin', niveau: 'CM1' }, { mot: 'supermarket', francais: 'supermarché', niveau: 'CM1' }, { mot: 'station', francais: 'gare', niveau: 'CM1' },
  { mot: 'street', francais: 'rue', niveau: 'CM1' }, { mot: 'city', francais: 'ville', niveau: 'CM1' }, { mot: 'river', francais: 'rivière', niveau: 'CM1' },
  { mot: 'sea', francais: 'mer', niveau: 'CM1' }, { mot: 'beach', francais: 'plage', niveau: 'CM1' }, { mot: 'farm', francais: 'ferme', niveau: 'CM1' },
  { mot: 'doctor', francais: 'médecin', niveau: 'CM1' }, { mot: 'nurse', francais: 'infirmière', niveau: 'CM1' }, { mot: 'teacher', francais: 'professeur', niveau: 'CM1' },
  { mot: 'farmer', francais: 'fermier', niveau: 'CM1' }, { mot: 'pilot', francais: 'pilote', niveau: 'CM1' }, { mot: 'driver', francais: 'chauffeur', niveau: 'CM1' },
  { mot: 'king', francais: 'roi', niveau: 'CM1' }, { mot: 'queen', francais: 'reine', niveau: 'CM1' }, { mot: 'witch', francais: 'sorcière', niveau: 'CM1' },
  { mot: 'ghost', francais: 'fantôme', niveau: 'CM1' }, { mot: 'Santa', francais: 'père Noël', niveau: 'CM1' }, { mot: 'robot', francais: 'robot', niveau: 'CM1' },
  { mot: 'happy', francais: 'content', niveau: 'CM1' }, { mot: 'sad', francais: 'triste', niveau: 'CM1' }, { mot: 'hungry', francais: 'affamé', niveau: 'CM1' },
  { mot: 'tired', francais: 'fatigué', niveau: 'CM1' }, { mot: 'big', francais: 'grand', niveau: 'CM1' }, { mot: 'small', francais: 'petit', niveau: 'CM1' },
  { mot: 'tall', francais: 'grand (taille)', niveau: 'CM1' }, { mot: 'short', francais: 'petit (taille)', niveau: 'CM1' }, { mot: 'fast', francais: 'rapide', niveau: 'CM1' },
  { mot: 'slow', francais: 'lent', niveau: 'CM1' }, { mot: 'strong', francais: 'fort', niveau: 'CM1' }, { mot: 'funny', francais: 'drôle', niveau: 'CM1' },
  { mot: 'dirty', francais: 'sale', niveau: 'CM1' }, { mot: 'clean', francais: 'propre', niveau: 'CM1' }, { mot: 'old', francais: 'vieux', niveau: 'CM1' },
  { mot: 'ugly', francais: 'laid', niveau: 'CM1' }, { mot: 'jump', francais: 'sauter', niveau: 'CM2' }, { mot: 'swim', francais: 'nager', niveau: 'CM2' },
  { mot: 'sing', francais: 'chanter', niveau: 'CM2' }, { mot: 'read', francais: 'lire', niveau: 'CM2' }, { mot: 'write', francais: 'écrire', niveau: 'CM2' },
  { mot: 'draw', francais: 'dessiner', niveau: 'CM2' }, { mot: 'cook', francais: 'cuisiner', niveau: 'CM2' }, { mot: 'eat', francais: 'manger', niveau: 'CM2' },
  { mot: 'drink', francais: 'boire', niveau: 'CM2' }, { mot: 'walk', francais: 'marcher', niveau: 'CM2' }, { mot: 'fly', francais: 'voler', niveau: 'CM2' },
  { mot: 'play', francais: 'jouer', niveau: 'CM2' }, { mot: 'sit', francais: 's\'asseoir', niveau: 'CM2' }, { mot: 'stand', francais: 'se lever', niveau: 'CM2' },
  { mot: 'wash', francais: 'laver', niveau: 'CM2' }, { mot: 'listen', francais: 'écouter', niveau: 'CM2' }, { mot: 'speak', francais: 'parler', niveau: 'CM2' },
  { mot: 'basketball', francais: 'basket', niveau: 'CM2' }, { mot: 'tennis', francais: 'tennis', niveau: 'CM2' }, { mot: 'birthday', francais: 'anniversaire', niveau: 'CM2' },
  { mot: 'Halloween', francais: 'Halloween', niveau: 'CM2' }, { mot: 'Easter', francais: 'Pâques', niveau: 'CM2' }, { mot: 'pumpkin', francais: 'citrouille', niveau: 'CM2' },
  { mot: 'present', francais: 'cadeau', niveau: 'CM2' }, { mot: 'party', francais: 'fête', niveau: 'CM2' }, { mot: 'circle', francais: 'cercle', niveau: 'CM2' },
  { mot: 'square', francais: 'carré', niveau: 'CM2' }, { mot: 'triangle', francais: 'triangle', niveau: 'CM2' }, { mot: 'star', francais: 'étoile', niveau: 'CM2' },
  { mot: 'heart', francais: 'cœur', niveau: 'CM2' }, { mot: 'shoulder', francais: 'épaule', niveau: 'CM2' }, { mot: 'finger', francais: 'doigt', niveau: 'CM2' },
  { mot: 'toe', francais: 'orteil', niveau: 'CM2' }, { mot: 'tooth', francais: 'dent', niveau: 'CM2' }, { mot: 'tummy', francais: 'ventre', niveau: 'CM2' },
  { mot: 'feet', francais: 'pieds', niveau: 'CM2' }, { mot: 'England', francais: 'Angleterre', niveau: 'CM2' }, { mot: 'America', francais: 'Amérique', niveau: 'CM2' },
  { mot: 'world', francais: 'monde', niveau: 'CM2' }, { mot: 'moon', francais: 'lune', niveau: 'CM2' },
];

const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
const rang = (niveau) => CLASSES.indexOf((niveau ?? '').toUpperCase());

const PAR_MOT = new Map(MOTS_ANGLAIS.map((m) => [m.mot.toLowerCase(), m]));

/** Le mot illustré (« Apple. » → apple), ou null s'il n'a pas d'image. */
export const motAnglaisIllustre = (mot) => PAR_MOT.get((mot ?? '').toLowerCase().replace(/[^a-z]/g, '')) ?? null;

/** L'adresse de l'image du mot, ou null. */
export const imageDuMotAnglais = (mot) => {
  const trouve = motAnglaisIllustre(mot);
  return trouve ? `${process.env.REACT_APP_API_URL ?? ''}/images-mots-en/${trouve.mot.toLowerCase()}.webp` : null;
};

/** Les mots qu'un enfant de cette classe a vus : sa classe et les classes en dessous. */
export const motsAnglaisJusquA = (niveau) => {
  const r = rang(niveau);
  return r < 0 ? [] : MOTS_ANGLAIS.filter((m) => rang(m.niveau) <= r);
};
