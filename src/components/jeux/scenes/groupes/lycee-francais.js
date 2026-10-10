import { ChoixVersification, QuestionVersification } from '../lycee-francais/Versification';
import { QuestionFigures } from '../lycee-francais/FiguresDeStyle';
import { QuestionGrammaire } from '../lycee-francais/QuestionDeGrammaire';
import { ChoixMouvements, QuestionMouvements } from '../lycee-francais/MouvementsLitteraires';
import { QuestionGenres } from '../lycee-francais/GenresEtRegistres';
import { QuestionPhrase } from '../lycee-francais/PhraseEtEffets';
import { ChoixArgumenter, QuestionArgumenter } from '../lycee-francais/Argumenter';
import { QuestionVocabulaire } from '../lycee-francais/VocabulaireAnalyse';
import { QuestionDissertation } from '../lycee-francais/Dissertation';
import { ChoixExplication, QuestionExplication } from '../lycee-francais/ExplicationLineaire';
import { QuestionProcedes } from '../lycee-francais/ProcedesEtEffets';
import { ChoixCulture, QuestionCulture } from '../lycee-francais/CultureLitteraire';
import { QuestionEssai } from '../lycee-francais/Essai';
import { ChoixContraction, QuestionContraction } from '../lycee-francais/Contraction';
import { ChoixDebat, QuestionDebat } from '../lycee-francais/DebatIdees';
import { ChoixEcrit, QuestionEcrit } from '../lycee-francais/EcritProfessionnel';
import { QuestionGroupement } from '../lycee-francais/GroupementTextes';
import '../lycee-francais/lycee-francais.css';

/**
 * Les scènes du groupe « lycee-francais » — voir `../index.js`. Dix-sept jeux
 * de français du lycée, un univers chacun (09/10/2026) : le dessin est dans
 * `../lycee-francais/`, un fichier par jeu.
 */
const SCENES = {
  // La serre de grammaire : la subordonnée en branche greffée, la fiche du botaniste.
  'question-de-grammaire': {
    question: (m, termine) => <QuestionGrammaire m={m} termine={termine} />,
    // L'étiquette de la bonne réponse s'accroche à la fiche d'analyse.
    apres: () => null,
    objets: 'sc-question-de-grammaire',
  },

  // Le beffroi des deux fontaines : la phrase s'allume là où la figure travaille.
  'figures-de-style-lycee': {
    question: (m, termine) => <QuestionFigures m={m} termine={termine} />,
    // La cloche inscrit la figure (et l'effet) une fois la réponse donnée.
    apres: () => null,
    objets: 'sc-figures-de-style-lycee',
  },

  // Le jardin des glycines : syllabes sur les pierres de gué, carillons à faire sonner.
  versification: {
    question: (m, termine) => <QuestionVersification m={m} termine={termine} />,
    // Le gué, les lettres des rimes ou le saut du rejet disent déjà la réponse.
    apres: () => null,
    choix: (props) => <ChoixVersification {...props} />,
  },

  // L'archipel du ciel : on aborde une île volante, puis la frise des siècles s'allume.
  'mouvements-litteraires': {
    question: (m, termine) => <QuestionMouvements m={m} termine={termine} />,
    // La frise nomme le mouvement (ou allume le siècle) une fois la réponse donnée.
    apres: () => null,
    choix: (props) => <ChoixMouvements {...props} />,
  },

  // Le théâtre au bord de la mer : des billets pour réponses, le masque du registre descend.
  'genres-et-registres': {
    question: (m, termine) => <QuestionGenres m={m} termine={termine} />,
    // Le masque et son carton, ou l'affiche du genre, disent la réponse.
    apres: () => null,
    objets: 'sc-genres-et-registres',
  },

  // L'orgue de verre : le rythme de la phrase en tubes de lumière, après la réponse.
  'phrase-et-effets': {
    question: (m, termine) => <QuestionPhrase m={m} termine={termine} />,
    // Le verdict sous l'orgue nomme le procédé, l'effet ou la forme.
    apres: () => null,
    objets: 'sc-phrase-et-effets',
  },

  // L'agora de mosaïque : on pose une tesselle, puis le raisonnement se dessine.
  argumenter: {
    question: (m, termine) => <QuestionArgumenter m={m} termine={termine} />,
    // Le pont, l'emblème ou le chemin du texte nomment déjà la réponse.
    apres: () => null,
    choix: (props) => <ChoixArgumenter {...props} />,
  },

  // L'observatoire des lentilles : une seconde lentille grossit l'indice, après la réponse.
  'vocabulaire-analyse': {
    question: (m, termine) => <QuestionVocabulaire m={m} termine={termine} />,
    // La seconde lentille porte la bonne réponse.
    apres: () => null,
    objets: 'sc-vocabulaire-analyse',
  },

  // Le temple de marbre : le bon plan se dresse en colonnes, la problématique en arche.
  dissertation: {
    question: (m, termine) => <QuestionDissertation m={m} termine={termine} />,
    // Le chantier (arche, fondation, temple, connecteur posé) montre la réponse.
    apres: () => null,
    objets: 'sc-dissertation',
  },

  // La galerie de cristal : une vitre par phrase, les mouvements se colorent après la réponse.
  'explication-lineaire': {
    question: (m, termine) => <QuestionExplication m={m} termine={termine} />,
    // Le bilan sous la galerie nomme le tournant, le rôle, le projet ou l'exercice.
    apres: () => null,
    choix: (props) => <ChoixExplication {...props} />,
  },

  // Le laboratoire du prisme : le texte traverse le prisme du procédé et ressort en effet.
  'procedes-et-effets': {
    question: (m, termine) => <QuestionProcedes m={m} termine={termine} />,
    // Le banc d'optique nomme le procédé, l'effet, le présent ou la focalisation.
    apres: () => null,
    objets: 'sc-procedes-et-effets',
  },

  // Le jardin d'automne : on attrape une feuille d'érable, la fiche de l'œuvre se remplit.
  'culture-litteraire': {
    question: (m, termine) => <QuestionCulture m={m} termine={termine} />,
    // La fiche allume le champ de la réponse.
    apres: () => null,
    choix: (props) => <ChoixCulture {...props} />,
  },

  // La rotonde de la sphère : l'essai se monte pierre à pierre, chaque phrase à son rôle.
  essai: {
    question: (m, termine) => <QuestionEssai m={m} termine={termine} />,
    // La chaîne des rôles, le connecteur posé, la question posée ou l'appui disent la réponse.
    apres: () => null,
    objets: 'sc-essai',
  },

  // La distillerie de cristal : on choisit un flacon, l'essence du texte s'y dépose.
  contraction: {
    question: (m, termine) => <QuestionContraction m={m} termine={termine} />,
    // Le flacon, les étapes ou l'éprouvette graduée portent la réponse.
    apres: () => null,
    choix: (props) => <ChoixContraction {...props} />,
  },

  // La balance de l'agora : on pose sa carte de parole, la balance penche du côté de la raison.
  'debat-idees': {
    // `extra.derniereFaute` : une carte écartée fait trembler la balance.
    question: (m, termine, extra) => <QuestionDebat m={m} termine={termine} extra={extra} />,
    // La tablette posée, le verdict ou le tampon du sophisme disent la réponse.
    apres: () => null,
    choix: (props) => <ChoixDebat {...props} />,
  },

  // Le bureau de verre : on insère un brouillon, le bon texte s'écrit à sa place dans le courriel.
  'ecrit-professionnel': {
    question: (m, termine) => <QuestionEcrit m={m} termine={termine} />,
    // Le courriel écrit (ou la ligne chassée, ou la structure allumée) montre la réponse.
    apres: () => null,
    choix: (props) => <ChoixEcrit {...props} />,
  },

  // Les pavillons sur la mer : chaque document est un pavillon ; après la réponse, on les relie.
  'groupement-textes': {
    question: (m, termine) => <QuestionGroupement m={m} termine={termine} />,
    // L'île du thème ou le verdict sous les pavillons disent la réponse.
    apres: () => null,
    objets: 'sc-groupement-textes',
  },
};

export default SCENES;
