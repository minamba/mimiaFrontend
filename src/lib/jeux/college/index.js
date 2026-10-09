/**
 * LES JEUX DU COLLÈGE, DE LA 6e À LA 3e — Camara, le 06/10/2026 : « code-moi
 * tous les jeux du PDF, plus les escape games pour les maths, l'histoire-géo,
 * le français, l'anglais et les sciences ».
 *
 * UN MODULE PAR FAMILLE DE JEU, ET NON PAR CLASSE. « Les fractions » de la 6e,
 * de la 5e et de la 4e sont un seul fichier, qui choisit sa banque d'après la
 * classe : `serie(graine, niveau)`. Chaque module se décrit lui-même —
 * `FAMILLE`, `PAR_CLASSE`, `CLASSES` — et ce fichier en tire tout le reste :
 * l'entrée du catalogue, l'écran, les voix. Ajouter un jeu du collège, c'est
 * écrire son module et l'importer ici, rien d'autre.
 *
 * L'ORDRE EST CELUI DE LA LUDOTHÈQUE : les matières s'y rangent dans l'ordre
 * où leur premier jeu apparaît, et l'escape game ouvre sa matière — c'est le
 * jeu qu'on montre en premier.
 *
 * LES IMPORTS PORTENT LEUR EXTENSION `.js` : le script d'enregistrement des
 * voix lit ces modules avec Node, qui l'exige.
 */

// ------------------------------------------------------ mathématiques
import * as escapeMaths from './escape-maths.js';
import * as grandsNombres from './grands-nombres-college.js';
import * as loupe from './loupe-college.js';
import * as operations from './operations-college.js';
import * as partage from './partage-college.js';
import * as calculMental from './calcul-mental-college.js';
import * as bonneParenthese from './bonne-parenthese.js';
import * as crible from './crible-college.js';
import * as fractions from './fractions-college.js';
import * as droiteDesFractions from './droite-des-fractions.js';
import * as deuxTiers from './deux-tiers-du-sac.js';
import * as recette from './recette-college.js';
import * as metreRuban from './metre-ruban-college.js';
import * as combienDeTemps from './combien-de-temps-college.js';
import * as tourDuJardin from './tour-du-jardin-college.js';
import * as rapporteur from './rapporteur.js';
import * as detectiveDesFigures from './detective-des-figures.js';
import * as miroir from './miroir-college.js';
import * as solides from './solides-et-patrons.js';
import * as diagramme from './diagramme-college.js';
import * as robot from './robot-college.js';
import * as droiteDesRelatifs from './droite-des-relatifs.js';
import * as ascenseur from './ascenseur-des-relatifs.js';
import * as machineAX from './machine-a-x.js';
import * as machineAFonctions from './machine-a-fonctions.js';
import * as tourDesPuissances from './tour-des-puissances.js';
import * as chasseurDAngles from './chasseur-d-angles.js';
import * as batailleNavale from './bataille-navale.js';
import * as sacDeBilles from './sac-de-billes-college.js';
import * as balance from './balance-des-equations.js';
import * as echelle from './echelle-contre-le-mur.js';
import * as photo from './photo-agrandie.js';
import * as toboggan from './pente-du-toboggan.js';
import * as racine from './racine-cachee.js';
import * as globe from './le-globe.js';

// ------------------------------------------------------ français
import * as escapeFrancais from './escape-francais.js';
import * as detectiveDesClasses from './detective-des-classes.js';
import * as codOuCoi from './cod-ou-coi.js';
import * as roueDesVerbes from './roue-des-verbes-college.js';
import * as decorOuAction from './decor-ou-action.js';
import * as homophones from './homophones-college.js';
import * as participe from './participe-passe-college.js';
import * as simpleOuComplexe from './simple-ou-complexe.js';
import * as motJuste from './le-mot-juste.js';
import * as schemaNarratif from './schema-narratif.js';
import * as quiRaconte from './qui-raconte-college.js';
import * as dieuxEtHeros from './dieux-et-heros.js';
import * as quiParle from './qui-parle.js';
import * as triDesSubordonnees from './tri-des-subordonnees.js';
import * as actifOuPassif from './actif-ou-passif.js';
import * as accords from './les-accords-college.js';
import * as commeUneImage from './comme-une-image-college.js';
import * as poemeTheatre from './poeme-theatre-college.js';
import * as pourquoiOnRit from './pourquoi-on-rit.js';
import * as chevalier from './le-chevalier.js';
import * as compteurDeSyllabes from './compteur-de-syllabes.js';
import * as quelRegistre from './quel-registre.js';
import * as infoOuOpinion from './info-ou-opinion.js';
import * as siJEtais from './si-j-etais.js';
import * as surOuPasSur from './sur-ou-pas-sur.js';
import * as chasseAuxFautes from './chasse-aux-fautes.js';
import * as theseArgument from './these-argument-exemple.js';
import * as implicite from './ce-qui-n-est-pas-dit.js';

// ------------------------------------------------------ les autres escape games
import * as escapeHistoireGeo from './escape-histoire-geo.js';
import * as escapeAnglais from './escape-anglais.js';
import * as escapeSciences from './escape-sciences.js';
import * as escapePhysiqueChimie from './escape-physique-chimie.js';
import * as escapeSvt from './escape-svt.js';

/** Tous les modules du collège, dans l'ordre de la ludothèque. */
export const MODULES_COLLEGE = [
  escapeMaths,
  grandsNombres, loupe, operations, partage, calculMental, bonneParenthese, crible,
  fractions, droiteDesFractions, deuxTiers, recette, metreRuban, combienDeTemps,
  tourDuJardin, rapporteur, detectiveDesFigures, miroir, solides, diagramme, robot,
  droiteDesRelatifs, ascenseur, machineAX, machineAFonctions, tourDesPuissances,
  chasseurDAngles, batailleNavale, sacDeBilles, balance, echelle, photo, toboggan,
  racine, globe,

  escapeFrancais,
  detectiveDesClasses, codOuCoi, roueDesVerbes, decorOuAction, homophones, participe,
  simpleOuComplexe, motJuste, schemaNarratif, quiRaconte, dieuxEtHeros, quiParle,
  triDesSubordonnees, actifOuPassif, accords, commeUneImage, poemeTheatre,
  pourquoiOnRit, chevalier, compteurDeSyllabes, quelRegistre, infoOuOpinion,
  siJEtais, surOuPasSur, chasseAuxFautes, theseArgument, implicite,

  escapeHistoireGeo,
  escapeAnglais,
  escapeSciences, escapePhysiqueChimie, escapeSvt,
];

/**
 * LE LIBELLÉ DE CHAQUE MATIÈRE, tel qu'il est en base (table `Matiere`, lu le
 * 06/10/2026) : c'est lui qui donne sa couleur à la section et à la carte.
 */
export const LIBELLES_MATIERE = {
  MATHS: 'Mathématiques',
  FRANCAIS: 'Français',
  HISTOIRE_GEO: 'Histoire-Géographie',
  ANGLAIS: 'Anglais',
  SCIENCES: 'Sciences et technologie',
  PHYSIQUE_CHIMIE: 'Physique-Chimie',
  SVT: 'SVT',
};

/**
 * L'ENTRÉE DU CATALOGUE D'UN MODULE : la première classe donne le titre,
 * l'accroche et les compétences ; les suivantes passent par `parNiveau`,
 * comme pour tous les jeux qui servent plusieurs classes.
 */
export function entreeDuCatalogue(module) {
  const { cle, matiereCode } = module.FAMILLE;
  const [premiere, ...autres] = module.CLASSES;
  const propre = (niveau) => {
    const { titre, accroche, competences } = module.PAR_CLASSE[niveau];
    return { titre, accroche, competences };
  };
  return {
    cle,
    ...propre(premiere),
    matiere: LIBELLES_MATIERE[matiereCode],
    matiereCode,
    niveaux: [...module.CLASSES],
    ...(autres.length ? { parNiveau: Object.fromEntries(autres.map((n) => [n, propre(n)])) } : {}),
    escape: Boolean(module.ESCAPE),
    college: true,
  };
}

export const CATALOGUE_COLLEGE = MODULES_COLLEGE.map(entreeDuCatalogue);
