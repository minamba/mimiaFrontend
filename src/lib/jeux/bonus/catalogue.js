import { CLASSES_DU_CATALOGUE } from '../frise.js';

/**
 * LES JEUX BONUS DANS LE CATALOGUE (09/10/2026) — voir `reglages.js`.
 *
 * LEUR PROPRE RAYON : « Jeux bonus » est leur matière, si bien que
 * `parMatiere` leur ouvre une section à part, après les matières.
 * AUCUNE COMPÉTENCE, et `bonus: true` : l'export vers l'API les laisse de
 * côté — le professeur ne propose en fin de cours que des jeux du programme.
 * `defi` dit ce que le mode défi change, à la place des cœurs :
 *   - 'chrono' : un compte à rebours pour toute la partie ;
 *   - 'rapide' : moins de temps pour chaque question (drapeaux, mot de passe) ;
 *   - 'adversaire' : l'ordinateur joue plus fort (morpion) ;
 *   - 'sans-aide' : ni coups montrés ni coup repris (échecs).
 */
const commun = {
  matiere: 'Jeux bonus',
  matiereCode: 'BONUS',
  niveaux: CLASSES_DU_CATALOGUE,
  competences: [],
  bonus: true,
  defi: 'chrono',
};

export const CATALOGUE_BONUS = [
  {
    ...commun, cle: 'bonus-devine-le-mot', titre: 'Devine le mot', accroche: 'Lettre par lettre, avec un indice.',
  },
  {
    ...commun, cle: 'bonus-mots-caches', titre: 'Les mots cachés', accroche: 'Trace les mots cachés dans la grille.',
  },
  {
    ...commun, cle: 'bonus-devine-la-phrase', titre: 'Devine la phrase', accroche: 'Une expression cachée, un indice, à toi de jouer.',
  },
  {
    ...commun, cle: 'bonus-paires', titre: 'Les paires', accroche: 'Retourne les cartes et retrouve les paires.',
  },
  {
    ...commun, cle: 'bonus-operations', titre: 'Les opérations à trous', accroche: 'Pose le bon signe pour que le calcul tombe juste.',
  },
  // Le 09/10/2026, deuxième fournée.
  {
    ...commun, cle: 'bonus-puzzle', titre: 'Le puzzle', accroche: 'Échange les pièces et reconstitue l’image.',
  },
  {
    ...commun, cle: 'bonus-mot-de-passe', titre: 'Le mot de passe', accroche: 'Trois indices, un seul mot secret.', defi: 'rapide',
  },
  {
    ...commun, cle: 'bonus-drapeaux', titre: 'Le défi des drapeaux', accroche: 'À quel pays est ce drapeau ? Vite !', defi: 'rapide',
  },
  {
    ...commun, cle: 'bonus-morpion', titre: 'Le morpion', accroche: 'Aligne trois croix avant l’ordinateur.', defi: 'adversaire',
  },
  // Le 09/10/2026, troisième fournée.
  {
    ...commun, cle: 'bonus-echecs', titre: 'Les échecs', accroche: 'Choisis ta difficulté et affronte l’ordinateur.', defi: 'sans-aide',
  },
  {
    ...commun, cle: 'bonus-mot-secret', titre: 'Le mot secret', accroche: 'Une lettre, une définition, un mot à trouver.', defi: 'rapide',
  },
  {
    ...commun, cle: 'bonus-planetes', titre: 'Les planètes', accroche: 'Range les planètes autour du Soleil.',
  },
  // Le 10/10/2026 : l'histoire et la géographie (« Détective de l'Histoire » et
  // « Cap sur le Monde »), images générées par Camara, voix de Salim.
  {
    ...commun, cle: 'bonus-image-qui-ment', titre: 'L’image qui ment', accroche: 'Trouve l’objet impossible caché dans la scène.',
  },
  {
    ...commun, cle: 'bonus-mythe-ou-histoire', titre: 'Mythe ou Histoire', accroche: 'Vrai fait ou idée reçue ? À toi de trancher.', defi: 'rapide',
  },
  {
    ...commun, cle: 'bonus-ou-sur-terre', titre: 'Où sur Terre ?', accroche: 'Lis les preuves et trouve le lieu sur la carte.',
  },
  {
    ...commun, cle: 'bonus-enquete-carte', titre: 'Enquête sur la carte', accroche: 'Suis les indices jusqu’au bon endroit.',
  },
  {
    ...commun, cle: 'bonus-grand-jeu-de-geo', titre: 'Le grand jeu de géo', accroche: 'Trouve-le sur la carte, en chrono !', defi: 'rapide',
  },
];
