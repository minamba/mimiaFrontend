/**
 * LES DÉCORS DES COURS, EN IMAGES IMPORTÉES — Camara, le 16/11/2026 : les cartes de l'équipe de la page d'accueil
 * prennent le décor de la page de cours de leur matière. Le nom du décor vient de `murMatiere`
 * (lib/couleurMatiere.js) ; ici, le fichier. La page de cours garde ses propres règles CSS (`.chat__tete[data-mur]`).
 */
import anglais from '../assets/walls/w_anglais.webp';
import arts from '../assets/walls/w_artd.webp';
import droitEconomie from '../assets/walls/w_droit_economie.webp';
import espagnol from '../assets/walls/w_espagnol.webp';
import francais from '../assets/walls/w_francais.webp';
import histoireGeo from '../assets/walls/w_histoire_geo.webp';
import informatique from '../assets/walls/w_informatique.webp';
import math from '../assets/walls/w_math.webp';
import philosophie from '../assets/walls/w_philosophie.webp';
import physiqueChimie from '../assets/walls/w_phisique_chimie.webp';
import sante from '../assets/walls/w_sante.webp';
import sport from '../assets/walls/w_sport.webp';
import svt from '../assets/walls/w_svt.webp';
import chinois from '../assets/walls/w_chinois.webp';
import arabe from '../assets/walls/w_arabe.webp';
import allemand from '../assets/walls/w_allemand.webp';
import italien from '../assets/walls/w_italien.webp';
import ingenierie from '../assets/walls/w_ingenierie.webp';
import technologie from '../assets/walls/w_technologie.webp';

const IMAGES = {
  anglais,
  arts,
  droit_economie: droitEconomie,
  espagnol,
  francais,
  histoire_geo: histoireGeo,
  informatique,
  math,
  philosophie,
  physique_chimie: physiqueChimie,
  sante,
  sport,
  svt,
  chinois,
  arabe,
  allemand,
  italien,
  ingenierie,
  technologie,
};

/** L'image d'un décor (`math`, `francais`…), celle du français si le nom est inconnu. */
export function imageDuMur(mur) {
  return IMAGES[mur] ?? IMAGES.francais;
}
