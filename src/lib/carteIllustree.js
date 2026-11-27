/**
 * « MA CARTE » ILLUSTRÉE — Camara, le 15/11/2026 : la page de l'enfant d'après sa maquette. Chaque rangée de
 * matière porte une pastille ronde (drapeau, livre, globe, π, fiole, feuille) et un décor au milieu (Big Ben,
 * Sagrada Família, plume, pyramides, triangle, atome, ADN), découpés dans la maquette (assets/carte-illustre).
 *
 * La progression ne transmet pas le code de la matière, seulement son libellé : on reconnaît l'univers d'après
 * le libellé (une spécialité d'anglais prend le décor de l'anglais). Une matière sans décor garde une rangée
 * sobre, sa pastille de couleur à la place de l'icône.
 *
 * POUR AJOUTER UN DÉCOR : l'image `rangee-<cle>.png` (panorama 1400 × 200) et `pastille-<cle>.png` converties en
 * WebP dans assets/carte-illustre, une entrée dans DECORS (`plein: true`), et son mot-clé dans UNIVERS. Depuis le
 * 16/11/2026, TOUTES les rangées sont des panoramas de Camara (matières et années, « carte-generees - Copie ») ;
 * les petits motifs découpés dans la première maquette ne servent plus.
 */
import pastilleAnglais from '../assets/carte-illustre/pastille-anglais.webp';
import pastilleEspagnol from '../assets/carte-illustre/pastille-espagnol.webp';
import pastilleFrancais from '../assets/carte-illustre/pastille-francais.webp';
import pastilleHistoireGeo from '../assets/carte-illustre/pastille-histoire_geo.webp';
import pastilleMaths from '../assets/carte-illustre/pastille-maths.webp';
import pastillePhysiqueChimie from '../assets/carte-illustre/pastille-physique_chimie.webp';
import pastilleSvt from '../assets/carte-illustre/pastille-svt.webp';
// LES 7 MATIÈRES DE LA PREMIÈRE MAQUETTE ET LES ANNÉES, EN PANORAMAS (Camara, le 16/11/2026).
import rangeeAnglais from '../assets/carte-illustre/rangee-anglais.webp';
import rangeeEspagnol from '../assets/carte-illustre/rangee-espagnol.webp';
import rangeeFrancais from '../assets/carte-illustre/rangee-francais.webp';
import rangeeHistoireGeo from '../assets/carte-illustre/rangee-histoire_geo.webp';
import rangeeMaths from '../assets/carte-illustre/rangee-maths.webp';
import rangeePhysiqueChimie from '../assets/carte-illustre/rangee-physique_chimie.webp';
import rangeeSvt from '../assets/carte-illustre/rangee-svt.webp';
import anneeCp from '../assets/carte-illustre/rangee-annee-cp.webp';
import anneeCe1 from '../assets/carte-illustre/rangee-annee-ce1.webp';
import anneeCe2 from '../assets/carte-illustre/rangee-annee-ce2.webp';
import anneeCm1 from '../assets/carte-illustre/rangee-annee-cm1.webp';
import anneeCm2 from '../assets/carte-illustre/rangee-annee-cm2.webp';
import annee6e from '../assets/carte-illustre/rangee-annee-6e.webp';
import annee5e from '../assets/carte-illustre/rangee-annee-5e.webp';
import annee4e from '../assets/carte-illustre/rangee-annee-4e.webp';
import annee3e from '../assets/carte-illustre/rangee-annee-3e.webp';
import annee2de from '../assets/carte-illustre/rangee-annee-2de.webp';
import annee1re from '../assets/carte-illustre/rangee-annee-1re.webp';
import anneeTle from '../assets/carte-illustre/rangee-annee-tle.webp';
// LES 16 UNIVERS GÉNÉRÉS PAR CAMARA (15/11/2026, d'après le PDF) : un panorama de rangée (1400 × 200) et une pastille.
import rangeeAllemand from '../assets/carte-illustre/rangee-allemand.webp';
import pastilleAllemand from '../assets/carte-illustre/pastille-allemand.webp';
import rangeeAntiquite from '../assets/carte-illustre/rangee-antiquite.webp';
import pastilleAntiquite from '../assets/carte-illustre/pastille-antiquite.webp';
import rangeeArabe from '../assets/carte-illustre/rangee-arabe.webp';
import pastilleArabe from '../assets/carte-illustre/pastille-arabe.webp';
import rangeeArts from '../assets/carte-illustre/rangee-arts.webp';
import pastilleArts from '../assets/carte-illustre/pastille-arts.webp';
import rangeeChinois from '../assets/carte-illustre/rangee-chinois.webp';
import pastilleChinois from '../assets/carte-illustre/pastille-chinois.webp';
import rangeeCinema from '../assets/carte-illustre/rangee-cinema.webp';
import pastilleCinema from '../assets/carte-illustre/pastille-cinema.webp';
import rangeeCirque from '../assets/carte-illustre/rangee-cirque.webp';
import pastilleCirque from '../assets/carte-illustre/pastille-cirque.webp';
import rangeeEconomie from '../assets/carte-illustre/rangee-economie.webp';
import pastilleEconomie from '../assets/carte-illustre/pastille-economie.webp';
import rangeeInformatique from '../assets/carte-illustre/rangee-informatique.webp';
import pastilleInformatique from '../assets/carte-illustre/pastille-informatique.webp';
import rangeeIngenierie from '../assets/carte-illustre/rangee-ingenierie.webp';
import pastilleIngenierie from '../assets/carte-illustre/pastille-ingenierie.webp';
import rangeeScienceIngenierie from '../assets/carte-illustre/rangee-science_ingenierie.webp';
import pastilleScienceIngenierie from '../assets/carte-illustre/pastille-science_ingenierie.webp';
import rangeeTechnologie from '../assets/carte-illustre/rangee-technologie.webp';
import pastilleTechnologie from '../assets/carte-illustre/pastille-technologie.webp';
import rangeeItalien from '../assets/carte-illustre/rangee-italien.webp';
import pastilleItalien from '../assets/carte-illustre/pastille-italien.webp';
import rangeePhilosophie from '../assets/carte-illustre/rangee-philosophie.webp';
import pastillePhilosophie from '../assets/carte-illustre/pastille-philosophie.webp';
import rangeeSante from '../assets/carte-illustre/rangee-sante.webp';
import pastilleSante from '../assets/carte-illustre/pastille-sante.webp';
import rangeeSciences from '../assets/carte-illustre/rangee-sciences.webp';
import pastilleSciences from '../assets/carte-illustre/pastille-sciences.webp';
import rangeeSport from '../assets/carte-illustre/rangee-sport.webp';
import pastilleSport from '../assets/carte-illustre/pastille-sport.webp';
import rangeeTheatre from '../assets/carte-illustre/rangee-theatre.webp';
import pastilleTheatre from '../assets/carte-illustre/pastille-theatre.webp';

export { default as banniereCarte } from '../assets/carte-illustre/banniere.webp';
export { default as fondScore } from '../assets/carte-illustre/score.webp';
export { default as pastilleAnnee } from '../assets/carte-illustre/pastille-annee.webp';
export { default as livreSeparateur } from '../assets/carte-illustre/livre-separateur.webp';

const DECORS = {
  anglais: { decor: rangeeAnglais, pastille: pastilleAnglais, plein: true },
  espagnol: { decor: rangeeEspagnol, pastille: pastilleEspagnol, plein: true },
  francais: { decor: rangeeFrancais, pastille: pastilleFrancais, plein: true },
  histoire_geo: { decor: rangeeHistoireGeo, pastille: pastilleHistoireGeo, plein: true },
  maths: { decor: rangeeMaths, pastille: pastilleMaths, plein: true },
  physique_chimie: { decor: rangeePhysiqueChimie, pastille: pastillePhysiqueChimie, plein: true },
  svt: { decor: rangeeSvt, pastille: pastilleSvt, plein: true },
  // `plein` : un panorama qui couvre toute la rangée (toutes les matières depuis le 16/11/2026).
  allemand: { decor: rangeeAllemand, pastille: pastilleAllemand, plein: true },
  antiquite: { decor: rangeeAntiquite, pastille: pastilleAntiquite, plein: true },
  arabe: { decor: rangeeArabe, pastille: pastilleArabe, plein: true },
  arts: { decor: rangeeArts, pastille: pastilleArts, plein: true },
  chinois: { decor: rangeeChinois, pastille: pastilleChinois, plein: true },
  cinema: { decor: rangeeCinema, pastille: pastilleCinema, plein: true },
  cirque: { decor: rangeeCirque, pastille: pastilleCirque, plein: true },
  economie: { decor: rangeeEconomie, pastille: pastilleEconomie, plein: true },
  informatique: { decor: rangeeInformatique, pastille: pastilleInformatique, plein: true },
  ingenierie: { decor: rangeeIngenierie, pastille: pastilleIngenierie, plein: true },
  // Lucas et Amine (25/11/2026) : générés par Camara en 2172 × 724 ; la bande 1400 × 200 est découpée sur le sujet
  // (le pont-serre, la serre et ses éoliennes). Originaux dans carte-generees.
  science_ingenierie: { decor: rangeeScienceIngenierie, pastille: pastilleScienceIngenierie, plein: true },
  technologie: { decor: rangeeTechnologie, pastille: pastilleTechnologie, plein: true },
  italien: { decor: rangeeItalien, pastille: pastilleItalien, plein: true },
  philosophie: { decor: rangeePhilosophie, pastille: pastillePhilosophie, plein: true },
  sante: { decor: rangeeSante, pastille: pastilleSante, plein: true },
  sciences: { decor: rangeeSciences, pastille: pastilleSciences, plein: true },
  sport: { decor: rangeeSport, pastille: pastilleSport, plein: true },
  theatre: { decor: rangeeTheatre, pastille: pastilleTheatre, plein: true },
};

/** Le libellé normalisé (sans accents, en minuscules) → l'univers. Le premier qui correspond l'emporte. */
const UNIVERS = [
  // Les plus précis d'abord : « Sciences de gestion et numérique » est de l'économie, pas de l'informatique ;
  // « Histoire des arts » est des arts, pas de l'histoire-géo ; « Sciences de l'ingénieur » n'est pas « Sciences ».
  [/econom|gestion|management|\bdroit\b|\bses\b/, 'economie'],
  [/histoire des arts|arts plastiques|\bmusique\b|\bdanse\b/, 'arts'],
  [/cinema|audiovisuel/, 'cinema'],
  [/theatre/, 'theatre'],
  [/cirque/, 'cirque'],
  [/antiquite|\blatin\b|\bgrec\b/, 'antiquite'],
  [/philosophie|humanites|^hlp$/, 'philosophie'],
  // L'ingénierie de STI2D (Lucas) a son décor depuis le 25/11/2026 ; « Sciences de l'ingénieur » (Yann) garde l'ancien.
  [/^ingenierie/, 'science_ingenierie'],
  [/ingenieur|ingenierie/, 'ingenierie'],
  // La technologie du collège (25/11/2026) : le libellé SEUL, « Sciences et technologie » reste aux sciences.
  [/^technologie$/, 'technologie'],
  [/sanitaire|\bsante\b|prevention/, 'sante'],
  [/informatique|^nsi$/, 'informatique'],
  [/sport|education physique|^eppcs$/, 'sport'],
  [/allemand/, 'allemand'],
  [/italien/, 'italien'],
  [/chinois/, 'chinois'],
  [/arabe/, 'arabe'],
  [/^francais$/, 'francais'],
  [/anglais|\bamc\b/, 'anglais'],
  [/espagnol/, 'espagnol'],
  [/histoire.?geo|hggsp|geopolitique/, 'histoire_geo'],
  [/^mathematiques$|^maths?$/, 'maths'],
  [/physique.?chimie|sciences physiques/, 'physique_chimie'],
  [/^svt$|sciences de la vie|biotechnolog|biologie/, 'svt'],
  [/^sciences( et technologie)?$/, 'sciences'],
];

const normaliser = (texte) => (texte ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Le décor et la pastille d'une matière d'après son libellé, ou null. */
export function decorDeMatiere(libelle) {
  const l = normaliser(libelle);
  const trouve = UNIVERS.find(([motif]) => motif.test(l));
  return trouve ? DECORS[trouve[1]] : null;
}

/**
 * L'univers d'une matière d'après son libellé (« maths », « histoire_geo », « economie »…), ou null. Mêmes clés que
 * les scènes de lib/scenesMatieres.js : les cartes de contrôle (16/11/2026), qui n'ont que le libellé, s'en servent
 * pour trouver la scène de leur matière.
 */
export function universDeMatiere(libelle) {
  const l = normaliser(libelle);
  return UNIVERS.find(([motif]) => motif.test(l))?.[1] ?? null;
}

/** Les décors des années (16/11/2026 : un panorama par année, CP → Terminale) ; une année inconnue en prend un
 * à tour de rôle. « Terminale » et « Tle » donnent la même. */
const ANNEES = { 'cp': anneeCp, 'ce1': anneeCe1, 'ce2': anneeCe2, 'cm1': anneeCm1, 'cm2': anneeCm2, '6e': annee6e, '5e': annee5e, '4e': annee4e, '3e': annee3e, '2de': annee2de, '1re': annee1re, 'tle': anneeTle, terminale: anneeTle, seconde: annee2de, premiere: annee1re };
const ROTATION = [anneeCp, anneeCe1, anneeCe2, anneeCm1, anneeCm2, annee6e, annee5e, annee4e, annee3e, annee2de, annee1re, anneeTle];

export function decorDAnnee(libelle, rang = 0) {
  return ANNEES[normaliser(libelle)] ?? ROTATION[rang % ROTATION.length];
}
