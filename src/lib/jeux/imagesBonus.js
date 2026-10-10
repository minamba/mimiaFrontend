/* eslint-disable */
/**
 * LES FONDS ET COUVERTURES DES JEUX BONUS — FICHIER GÉNÉRÉ (09/10/2026), ne
 * pas l'écrire à la main. Camara dépose ses PNG dans src/assets/Jeux/Jeux bonus/
 * (le fond, nommé du titre du jeu) et covers/ (« <titre>_cover.png », le titre
 * peint dedans) ; le script scratchpad/anim/images-bonus.mjs les convertit en
 * WebP sous src/assets/Jeux/bonus/ et réécrit ce fichier. Clé : celle du jeu.
 *
 * HORS DE lib/jeux/bonus/ : ce dossier est lu par Node (script des voix, export
 * vers l'API), qui ne sait pas importer une image.
 */
import fond0 from '../../assets/Jeux/bonus/bonus-devine-le-mot.webp';
import couverture0 from '../../assets/Jeux/bonus/bonus-devine-le-mot_couverture.webp';
import fond1 from '../../assets/Jeux/bonus/bonus-mots-caches.webp';
import couverture1 from '../../assets/Jeux/bonus/bonus-mots-caches_couverture.webp';
import fond2 from '../../assets/Jeux/bonus/bonus-devine-la-phrase.webp';
import couverture2 from '../../assets/Jeux/bonus/bonus-devine-la-phrase_couverture.webp';
import fond3 from '../../assets/Jeux/bonus/bonus-paires.webp';
import couverture3 from '../../assets/Jeux/bonus/bonus-paires_couverture.webp';
import fond4 from '../../assets/Jeux/bonus/bonus-operations.webp';
import couverture4 from '../../assets/Jeux/bonus/bonus-operations_couverture.webp';
import fond5 from '../../assets/Jeux/bonus/bonus-puzzle.webp';
import couverture5 from '../../assets/Jeux/bonus/bonus-puzzle_couverture.webp';
import fond6 from '../../assets/Jeux/bonus/bonus-mot-de-passe.webp';
import couverture6 from '../../assets/Jeux/bonus/bonus-mot-de-passe_couverture.webp';
import fond7 from '../../assets/Jeux/bonus/bonus-drapeaux.webp';
import couverture7 from '../../assets/Jeux/bonus/bonus-drapeaux_couverture.webp';
import fond8 from '../../assets/Jeux/bonus/bonus-morpion.webp';
import couverture8 from '../../assets/Jeux/bonus/bonus-morpion_couverture.webp';
import fond9 from '../../assets/Jeux/bonus/bonus-echecs.webp';
import couverture9 from '../../assets/Jeux/bonus/bonus-echecs_couverture.webp';
import fond10 from '../../assets/Jeux/bonus/bonus-mot-secret.webp';
import couverture10 from '../../assets/Jeux/bonus/bonus-mot-secret_couverture.webp';
import fond11 from '../../assets/Jeux/bonus/bonus-planetes.webp';
import couverture11 from '../../assets/Jeux/bonus/bonus-planetes_couverture.webp';

export const IMAGES_BONUS = {
  'bonus-devine-le-mot': { fond: fond0, couverture: couverture0 },
  'bonus-mots-caches': { fond: fond1, couverture: couverture1 },
  'bonus-devine-la-phrase': { fond: fond2, couverture: couverture2 },
  'bonus-paires': { fond: fond3, couverture: couverture3 },
  'bonus-operations': { fond: fond4, couverture: couverture4 },
  'bonus-puzzle': { fond: fond5, couverture: couverture5 },
  'bonus-mot-de-passe': { fond: fond6, couverture: couverture6 },
  'bonus-drapeaux': { fond: fond7, couverture: couverture7 },
  'bonus-morpion': { fond: fond8, couverture: couverture8 },
  'bonus-echecs': { fond: fond9, couverture: couverture9 },
  'bonus-mot-secret': { fond: fond10, couverture: couverture10 },
  'bonus-planetes': { fond: fond11, couverture: couverture11 },
};
