import '../college-maths-a/college-maths-a.css';
import { QuestionGrandsNombres, ToursDeLaCite } from '../college-maths-a/GrandsNombres';
import { QuestionLoupe, Nenuphars } from '../college-maths-a/LoupeCollege';
import { QuestionOperations } from '../college-maths-a/Operations';
import { QuestionPartage, Assiettes } from '../college-maths-a/Partage';
import { QuestionCalculMental, Etoiles } from '../college-maths-a/CalculMental';
import { QuestionParenthese } from '../college-maths-a/BonneParenthese';
import { QuestionCrible, Feves } from '../college-maths-a/Crible';
import { QuestionFractions, Ilots } from '../college-maths-a/Fractions';
import { QuestionDroiteFractions, Fanions } from '../college-maths-a/DroiteFractions';
import { QuestionDeuxTiers } from '../college-maths-a/DeuxTiers';
import { QuestionRecette } from '../college-maths-a/Recette';
import { QuestionMetreRuban } from '../college-maths-a/MetreRuban';
import { QuestionCombienDeTemps, Billets } from '../college-maths-a/CombienDeTemps';
import { QuestionTourDuJardin } from '../college-maths-a/TourDuJardin';
import { QuestionRapporteur, Cadran } from '../college-maths-a/Rapporteur';
import { QuestionDetective, Suspects } from '../college-maths-a/Detective';
import { QuestionMiroir, Lanternes } from '../college-maths-a/Miroir';

/**
 * LES SCÈNES DU GROUPE « COLLÈGE, MATHS A » (09/10/2026) — voir `../index.js`.
 * Dix-sept jeux de la 6e (et leurs suites en 5e, 4e, 3e), chacun dans
 * l'univers de sa couverture. Chaque scène montre, une fois la réponse
 * donnée, une explication animée qui finit sur la bonne réponse : la bulle
 * par défaut ferait doublon (`apres: () => null`).
 *
 * LES RÉPONSES JOUÉES AUTREMENT (`choix`) — onze jeux sur dix-sept : les
 * tours de la cité, les nénuphars, les assiettes, les étoiles à attraper,
 * les fèves à verser dans le crible (glisser OU cliquer), les îlots, les
 * fanions, les billets à composter, le cadran de laiton, les suspects, les
 * lanternes flottantes. Les six autres gardent les boutons communs, habillés
 * (`objets`) : perles de boulier, lanternes de jardin, sachets de grain,
 * bocaux, poids de laiton, étiquettes de semis.
 */
const sans = () => null;

const SCENES = {
  'grands-nombres-college': {
    question: (m, termine) => <QuestionGrandsNombres m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <ToursDeLaCite {...props} />,
  },
  'loupe-college': {
    question: (m, termine) => <QuestionLoupe m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Nenuphars {...props} />,
  },
  'operations-college': {
    question: (m, termine) => <QuestionOperations m={m} termine={termine} />,
    apres: sans,
    objets: 'sc-operations-college',
  },
  'partage-college': {
    question: (m, termine) => <QuestionPartage m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Assiettes {...props} />,
  },
  'calcul-mental-college': {
    question: (m, termine) => <QuestionCalculMental m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Etoiles {...props} />,
  },
  'bonne-parenthese': {
    question: (m, termine) => <QuestionParenthese m={m} termine={termine} />,
    apres: sans,
    objets: 'sc-bonne-parenthese',
  },
  'crible-college': {
    question: (m, termine) => <QuestionCrible m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Feves {...props} />,
  },
  'fractions-college': {
    question: (m, termine) => <QuestionFractions m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Ilots {...props} />,
  },
  'droite-des-fractions': {
    question: (m, termine) => <QuestionDroiteFractions m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Fanions {...props} />,
  },
  'deux-tiers-du-sac': {
    question: (m, termine) => <QuestionDeuxTiers m={m} termine={termine} />,
    apres: sans,
    objets: 'sc-deux-tiers-du-sac',
  },
  'recette-college': {
    question: (m, termine) => <QuestionRecette m={m} termine={termine} />,
    apres: sans,
    // « Proportionnel ? Oui / Non » garde ses deux buzzers : l'écran commun s'en charge.
    objets: 'sc-recette-college',
  },
  'metre-ruban-college': {
    question: (m, termine) => <QuestionMetreRuban m={m} termine={termine} />,
    apres: sans,
    objets: 'sc-metre-ruban-college',
  },
  'combien-de-temps-college': {
    question: (m, termine) => <QuestionCombienDeTemps m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Billets {...props} />,
  },
  'tour-du-jardin-college': {
    question: (m, termine) => <QuestionTourDuJardin m={m} termine={termine} />,
    apres: sans,
    objets: 'sc-tour-du-jardin-college',
  },
  rapporteur: {
    question: (m, termine) => <QuestionRapporteur m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Cadran {...props} />,
  },
  'detective-des-figures': {
    question: (m, termine) => <QuestionDetective m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Suspects {...props} />,
  },
  'miroir-college': {
    question: (m, termine) => <QuestionMiroir m={m} termine={termine} />,
    apres: sans,
    choix: (props) => <Lanternes {...props} />,
  },
};

export default SCENES;
