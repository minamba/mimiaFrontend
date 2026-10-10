import '../college-maths-b/college-maths-b.css';
import { sceneSolides } from '../college-maths-b/SolidesEtPatrons';
import { sceneDiagramme } from '../college-maths-b/DiagrammeCollege';
import { sceneRobot } from '../college-maths-b/RobotCollege';
import { sceneDroite } from '../college-maths-b/DroiteDesRelatifs';
import { sceneAscenseur } from '../college-maths-b/AscenseurDesRelatifs';
import { sceneMachineX } from '../college-maths-b/MachineAX';
import { sceneMachineF } from '../college-maths-b/MachineAFonctions';
import { sceneAngles } from '../college-maths-b/ChasseurDAngles';
import { sceneNavale } from '../college-maths-b/BatailleNavale';
import { sceneBilles } from '../college-maths-b/SacDeBilles';
import { sceneBalance } from '../college-maths-b/BalanceDesEquations';
import { sceneEchelle } from '../college-maths-b/EchelleContreLeMur';
import { scenePhoto } from '../college-maths-b/PhotoAgrandie';
import { sceneToboggan } from '../college-maths-b/PenteDuToboggan';
import { sceneRacine } from '../college-maths-b/RacineCachee';
import { sceneTour } from '../college-maths-b/TourDesPuissances';
import { sceneGlobe } from '../college-maths-b/LeGlobe';

/**
 * Les scènes du groupe « college-maths-b » — voir `../index.js`. Une scène
 * par jeu, chacune dans son fichier (`../college-maths-b/`), son CSS préfixé
 * `sc-<clé du jeu>` dans `college-maths-b.css`.
 */
const SCENES = {
  'solides-et-patrons': sceneSolides,
  'diagramme-college': sceneDiagramme,
  'robot-college': sceneRobot,
  'droite-des-relatifs': sceneDroite,
  'ascenseur-des-relatifs': sceneAscenseur,
  'machine-a-x': sceneMachineX,
  'machine-a-fonctions': sceneMachineF,
  'chasseur-d-angles': sceneAngles,
  'bataille-navale': sceneNavale,
  'sac-de-billes-college': sceneBilles,
  'balance-des-equations': sceneBalance,
  'echelle-contre-le-mur': sceneEchelle,
  'photo-agrandie': scenePhoto,
  'pente-du-toboggan': sceneToboggan,
  'racine-cachee': sceneRacine,
  'tour-des-puissances': sceneTour,
  'le-globe': sceneGlobe,
};

export default SCENES;
