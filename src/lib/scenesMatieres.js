/**
 * LES CARTES DE PROFESSEURS ILLUSTRÉES — Camara, le 15/11/2026 : « pour les cards des professeurs je veux des choses
 * comme ça, dans ce style-là pour tous les professeurs en fonction de la matière ; touche pas à la photo ».
 *
 * Une SCÈNE par univers de matière (assets/scenes-matieres), posée sous le portrait : elle commence au bas du
 * portrait (le haut, effacé, reçoit le titre) et finit au-dessus de « Commencer ». `ratio` = hauteur / largeur de
 * l'image ; `haut` et `bas` = les couleurs de la carte autour (relevées sur la scène) ; `bouton` = le dégradé de
 * « Commencer ».
 *
 * UNE MATIÈRE SANS SCÈNE garde le même cadre, aux couleurs de son professeur (`paletteDeMatiere`). Pour en ajouter
 * une : l'image dans assets/scenes-matieres, une entrée dans SCENES, et ses codes dans PAR_CODE.
 */
import orientation from '../assets/scenes-matieres/orientation.webp';
import maths from '../assets/scenes-matieres/maths.webp';
import histoireGeo from '../assets/scenes-matieres/histoire_geo.webp';
import anglais from '../assets/scenes-matieres/anglais.webp';
import espagnol from '../assets/scenes-matieres/espagnol.webp';
import physiqueChimie from '../assets/scenes-matieres/physique_chimie.webp';
import svt from '../assets/scenes-matieres/svt.webp';
// LES SCÈNES DE CAMARA (15/11/2026), générées d'après le PDF, réduites en WebP 720 px de large (proportions gardées).
// Orientation, maths, histoire-géo, espagnol, physique-chimie et SVT : refaites par Camara en haute définition le même
// jour (elles venaient de la maquette, 360 px, floues). Reste à refaire : anglais.
import francais from '../assets/scenes-matieres/francais.webp';
import sciences from '../assets/scenes-matieres/sciences.webp';
import philosophie from '../assets/scenes-matieres/philosophie.webp';
import economie from '../assets/scenes-matieres/economie.webp';
import sante from '../assets/scenes-matieres/sante.webp';
import informatique from '../assets/scenes-matieres/informatique.webp';
import ingenierie from '../assets/scenes-matieres/ingenierie.webp';
import sport from '../assets/scenes-matieres/sport.webp';
import arts from '../assets/scenes-matieres/arts.webp';
import cinema from '../assets/scenes-matieres/cinema.webp';
import theatre from '../assets/scenes-matieres/theatre.webp';
import cirque from '../assets/scenes-matieres/cirque.webp';
import antiquite from '../assets/scenes-matieres/antiquite.webp';
import allemand from '../assets/scenes-matieres/allemand.webp';
import italien from '../assets/scenes-matieres/italien.webp';
import chinois from '../assets/scenes-matieres/chinois.webp';
import arabe from '../assets/scenes-matieres/arabe.webp';

export const SCENES = {
  orientation: { image: orientation, ratio: 1536 / 1024, haut: '#011a7a', bas: '#362a69', bord: '#b28cff', bouton: ['#b98cff', '#8a5cf0'] },
  // L'image fait 1672 / 941 (plus allongée que les autres) : la carte en montre le bas, à la hauteur des autres scènes —
  // seul son ciel vide du haut est coupé (la scène est calée en bas, voir App.css).
  maths: { image: maths, ratio: 1.45, haut: '#001941', bas: '#03204c', bord: '#4fd8e0', bouton: ['#7ff0f0', '#3fbcc6'] },
  histoire_geo: { image: histoireGeo, ratio: 1536 / 1024, haut: '#001e6e', bas: '#28256e', bord: '#b58cff', bouton: ['#f58ad0', '#d65fb4'] },
  anglais: { image: anglais, ratio: 187 / 358, haut: '#1c3c96', bas: '#5550a2', bord: '#8fb8ff', bouton: ['#a8d6ff', '#6fb0f5'] },
  espagnol: { image: espagnol, ratio: 1491 / 1055, haut: '#361864', bas: '#331d43', bord: '#ff7aa8', bouton: ['#ff8fb0', '#e4547f'] },
  physique_chimie: { image: physiqueChimie, ratio: 1497 / 1051, haut: '#00164d', bas: '#061b5a', bord: '#7fb0ff', bouton: ['#ffd982', '#e8b861'] },
  svt: { image: svt, ratio: 1387 / 1134, haut: '#03345f', bas: '#15452c', bord: '#8fe07a', bouton: ['#c4f07a', '#8fcf4f'] },
  francais: { image: francais, ratio: 1408 / 1024, haut: '#4c1e28', bas: '#441925', bord: '#ffb46b', bouton: ['#ffc27a', '#f08a3c'] },
  sciences: { image: sciences, ratio: 1408 / 1024, haut: '#355e46', bas: '#73442f', bord: '#6fe3d0', bouton: ['#9ff0e0', '#3fc4b0'] },
  philosophie: { image: philosophie, ratio: 1408 / 1024, haut: '#362d48', bas: '#402e47', bord: '#d9c27a', bouton: ['#f3dc8f', '#c9a94a'] },
  economie: { image: economie, ratio: 1408 / 1024, haut: '#163f33', bas: '#442224', bord: '#6fe0a8', bouton: ['#9df0c4', '#3fbf85'] },
  sante: { image: sante, ratio: 1408 / 1024, haut: '#4d797a', bas: '#696157', bord: '#7fe8d0', bouton: ['#a8f5e2', '#4fcdb0'] },
  informatique: { image: informatique, ratio: 1408 / 1024, haut: '#1a1e44', bas: '#1b1d40', bord: '#6fb8ff', bouton: ['#8fd0ff', '#4f8cff'] },
  ingenierie: { image: ingenierie, ratio: 1408 / 1024, haut: '#284370', bas: '#24223c', bord: '#ffb066', bouton: ['#ffc58a', '#f08a3c'] },
  sport: { image: sport, ratio: 1408 / 1024, haut: '#41467a', bas: '#662531', bord: '#ffa45c', bouton: ['#ffbe7a', '#f07a3c'] },
  arts: { image: arts, ratio: 1408 / 1024, haut: '#552a58', bas: '#693450', bord: '#ff8fd8', bouton: ['#ffb0e6', '#e45fc0'] },
  cinema: { image: cinema, ratio: 1408 / 1024, haut: '#1f1429', bas: '#401824', bord: '#ffcc66', bouton: ['#ffd98a', '#e0a83c'] },
  theatre: { image: theatre, ratio: 1408 / 1024, haut: '#511620', bas: '#3e1921', bord: '#ff7a7a', bouton: ['#ff9a8a', '#d94a4a'] },
  cirque: { image: cirque, ratio: 1408 / 1024, haut: '#101742', bas: '#69302f', bord: '#ffd04a', bouton: ['#ffe07a', '#f0b32c'] },
  antiquite: { image: antiquite, ratio: 1408 / 1024, haut: '#403f64', bas: '#5b333f', bord: '#f0d58a', bouton: ['#f7e2a0', '#d4b05a'] },
  allemand: { image: allemand, ratio: 1408 / 1024, haut: '#2c3762', bas: '#68342f', bord: '#ffcc55', bouton: ['#ffd977', '#e8a92c'] },
  italien: { image: italien, ratio: 1408 / 1024, haut: '#705163', bas: '#703c40', bord: '#8fe07a', bouton: ['#b5f09a', '#6fc45a'] },
  chinois: { image: chinois, ratio: 1408 / 1024, haut: '#654f5c', bas: '#431c2b', bord: '#ff6a5a', bouton: ['#ff8f7a', '#e04a3c'] },
  arabe: { image: arabe, ratio: 1408 / 1024, haut: '#402d49', bas: '#644a45', bord: '#5fd8d0', bouton: ['#8fe8e0', '#3fb8b0'] },
};

/** Les codes de matière, vers leur scène. Une spécialité prend la scène de sa matière de tronc commun. */
const PAR_CODE = {
  ORIENTATION: 'orientation',
  MATHS: 'maths',
  HISTOIRE_GEO: 'histoire_geo',
  HGGSP: 'histoire_geo',
  ANGLAIS: 'anglais',
  LLCER_ANGLAIS: 'anglais',
  AMC: 'anglais',
  ESPAGNOL: 'espagnol',
  LLCER_ESPAGNOL: 'espagnol',
  PHYSIQUE_CHIMIE: 'physique_chimie',
  SPCL: 'physique_chimie',
  PHYSIQUE_CHIMIE_MATHS: 'physique_chimie',
  SVT: 'svt',
  BIOTECHNOLOGIES: 'svt',
  BIOLOGIE_HUMAINE: 'svt',
  FRANCAIS: 'francais',
  SCIENCES: 'sciences',
  PHILOSOPHIE: 'philosophie',
  HLP: 'philosophie',
  SES: 'economie',
  ECONOMIE_DROIT: 'economie',
  ECONOMIE_GESTION: 'economie',
  DROIT_ECONOMIE: 'economie',
  MANAGEMENT: 'economie',
  SCIENCES_GESTION: 'economie',
  SANITAIRE_SOCIAL: 'sante',
  PSE: 'sante',
  NSI: 'informatique',
  SI: 'ingenierie',
  INGENIERIE: 'ingenierie',
  EPPCS: 'sport',
  ARTS_PLASTIQUES: 'arts',
  HISTOIRE_ARTS: 'arts',
  MUSIQUE: 'arts',
  DANSE: 'arts',
  CINEMA_AUDIOVISUEL: 'cinema',
  THEATRE: 'theatre',
  ARTS_CIRQUE: 'cirque',
  LLCA_LATIN: 'antiquite',
  LLCA_GREC: 'antiquite',
  ALLEMAND: 'allemand',
  ITALIEN: 'italien',
  CHINOIS: 'chinois',
  ARABE: 'arabe',
};

export function sceneDeMatiere(code) {
  return SCENES[PAR_CODE[code]] ?? null;
}

/**
 * Les variables CSS de la carte : celles de sa scène, ou à défaut celles tirées de la couleur du professeur.
 */
export function paletteDeMatiere(matiere) {
  const scene = sceneDeMatiere(matiere?.code);
  if (scene) {
    return {
      '--scene': `url(${scene.image})`,
      '--scene-ratio': scene.ratio,
      '--carte-haut': scene.haut,
      '--carte-bas': scene.bas,
      '--carte-bord': scene.bord,
      '--bouton-clair': scene.bouton[0],
      '--bouton-fonce': scene.bouton[1],
    };
  }
  const c = matiere?.profCouleur ?? '#7c5cff';
  return {
    '--carte-haut': `color-mix(in srgb, ${c} 55%, #0b1240)`,
    '--carte-bas': `color-mix(in srgb, ${c} 30%, #0b1240)`,
    '--carte-bord': `color-mix(in srgb, ${c} 65%, #ffffff)`,
    '--bouton-clair': `color-mix(in srgb, ${c} 55%, #ffffff)`,
    '--bouton-fonce': c,
  };
}
