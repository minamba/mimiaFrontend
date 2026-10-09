/**
 * LES JEUX DU LYCÉE, DE LA 2de À LA TERMINALE — Camara, le 07/10/2026 : « fais
 * moi un PDF et derrière code tous les jeux », escape games « sans la
 * philosophie, SES et NSI ».
 *
 * MÊME MODÈLE QUE LE COLLÈGE (voir `college/index.js`) : un module par famille
 * de jeu, qui se décrit lui-même, et dont ce fichier tire l'entrée du
 * catalogue, l'écran et les voix.
 *
 * LES CLASSES SONT DES PROGRAMMES : `PREMIERE_TECHNO` vaut pour toutes les
 * séries technologiques, `PREMIERE_PRO` pour la voie professionnelle. La
 * classe de l'élève y est ramenée par `programmeDeLaClasse` (voir `frise.js`).
 *
 * « LES ŒUVRES AU PROGRAMME » DU BAC DE FRANÇAIS N'Y SONT PAS : la liste
 * officielle de l'année n'est pas en base, et ce jeu ne s'écrit pas de mémoire.
 *
 * LES IMPORTS PORTENT LEUR EXTENSION `.js` : le script des voix les lit avec Node.
 */
import { entreeDuCatalogue } from '../college/index.js';

// ------------------------------------------------------ mathématiques
import * as escapeMaths from './escape-maths-lycee.js';
import * as automatismes from './automatismes.js';
import * as intervalles from './intervalles-et-inegalites.js';
import * as puissances from './puissances-et-racines-lycee.js';
import * as fonctionsReference from './fonctions-de-reference.js';
import * as equationDroite from './equation-de-droite.js';
import * as vecteurs from './vecteurs-et-coordonnees.js';
import * as probaSeconde from './probabilites-seconde.js';
import * as statsSeconde from './statistiques-seconde.js';
import * as pythonVariable from './python-variable.js';
import * as suites from './suites.js';
import * as secondDegre from './second-degre.js';
import * as derivation from './derivation.js';
import * as exponentielle from './exponentielle.js';
import * as produitScalaire from './produit-scalaire.js';
import * as probaConditionnelles from './probabilites-conditionnelles.js';
import * as variablesAleatoires from './variables-aleatoires.js';
import * as vraiFaux from './vrai-faux-reciproque.js';
import * as listesPython from './listes-python.js';
import * as limites from './limites-et-continuite.js';
import * as logarithme from './logarithme.js';
import * as integrales from './primitives-et-integrales.js';
import * as binomiale from './loi-binomiale.js';
import * as denombrement from './denombrement.js';
import * as espace from './geometrie-espace.js';
import * as convexite from './convexite.js';
import * as recurrence from './recurrence.js';
import * as evolutions from './les-evolutions.js';
import * as paraboles from './fonctions-et-paraboles.js';
import * as interets from './interets-et-pourcentages.js';
import * as proportions from './proportions-et-grandeurs.js';
import * as graphique from './lire-un-graphique.js';
import * as probaPro from './probabilites-pro.js';
import * as atelier from './geometrie-atelier.js';
import * as nuage from './ajuster-un-nuage.js';

// ------------------------------------------------------ français
import * as escapeFrancais from './escape-francais-lycee.js';
import * as grammaire from './question-de-grammaire.js';
import * as figures from './figures-de-style-lycee.js';
import * as versification from './versification.js';
import * as mouvements from './mouvements-litteraires.js';
import * as registres from './genres-et-registres.js';
import * as phrase from './phrase-et-effets.js';
import * as argumenter from './argumenter.js';
import * as vocabulaire from './vocabulaire-analyse.js';
import * as dissertation from './dissertation.js';
import * as explication from './explication-lineaire.js';
import * as procedes from './procedes-et-effets.js';
import * as culture from './culture-litteraire.js';
import * as essai from './essai.js';
import * as contraction from './contraction.js';
import * as debat from './debat-idees.js';
import * as ecritPro from './ecrit-professionnel.js';
import * as groupement from './groupement-textes.js';

// ------------------------------------------------------ les autres escape games
import * as escapeHistoireGeo from './escape-histoire-geo-lycee.js';
import * as escapeAnglais from './escape-anglais-lycee.js';
import * as escapePhysiqueChimie from './escape-physique-chimie-lycee.js';
import * as escapeSvt from './escape-svt-lycee.js';

/** Tous les modules du lycée, dans l'ordre de la ludothèque. */
export const MODULES_LYCEE = [
  escapeMaths, automatismes,
  intervalles, puissances, fonctionsReference, equationDroite, vecteurs, probaSeconde, statsSeconde, pythonVariable,
  suites, secondDegre, derivation, exponentielle, produitScalaire, probaConditionnelles, variablesAleatoires,
  vraiFaux, listesPython,
  limites, logarithme, integrales, binomiale, denombrement, espace, convexite, recurrence,
  evolutions, paraboles,
  interets, proportions, graphique, probaPro, atelier, nuage,

  escapeFrancais, grammaire,
  figures, versification, mouvements, registres, phrase, argumenter, vocabulaire,
  dissertation, explication, procedes, culture, essai, contraction,
  debat, ecritPro, groupement,

  escapeHistoireGeo,
  escapeAnglais,
  escapePhysiqueChimie, escapeSvt,
];

export const CATALOGUE_LYCEE = MODULES_LYCEE.map((m) => ({ ...entreeDuCatalogue(m), college: false, lycee: true }));
