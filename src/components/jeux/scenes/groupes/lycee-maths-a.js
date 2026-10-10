import { apresSauf } from '../lycee-maths-a/commun';
import { LeviersAutomatismes, QuestionAutomatismes, chaineDe } from '../lycee-maths-a/Automatismes';
import { QuestionIntervalles } from '../lycee-maths-a/Intervalles';
import { FruitsPuissances, QuestionPuissances, etapesDe } from '../lycee-maths-a/Puissances';
import { PavesFonctions, QuestionFonctions } from '../lycee-maths-a/FonctionsDeReference';
import { CabinesEquation, QuestionEquationDeDroite } from '../lycee-maths-a/EquationDeDroite';
import { QuestionVecteurs, VoiliersVecteurs } from '../lycee-maths-a/Vecteurs';
import { QuestionProbabilitesSeconde } from '../lycee-maths-a/ProbabilitesSeconde';
import { CarillonsStatistiques, QuestionStatistiques } from '../lycee-maths-a/Statistiques';
import { QuestionSuites } from '../lycee-maths-a/Suites';
import { ClesDeVoute, QuestionSecondDegre } from '../lycee-maths-a/SecondDegre';
import { QuestionDerivation } from '../lycee-maths-a/Derivation';
import { BullesExponentielle, QuestionExponentielle } from '../lycee-maths-a/Exponentielle';
import { PierresProduitScalaire, QuestionProduitScalaire } from '../lycee-maths-a/ProduitScalaire';
import { QuestionProbabilitesConditionnelles, VannesConditionnelles } from '../lycee-maths-a/ProbabilitesConditionnelles';
import { CaissesVariables, QuestionVariablesAleatoires } from '../lycee-maths-a/VariablesAleatoires';
import { QuestionVraiFaux } from '../lycee-maths-a/VraiFauxReciproque';
import { QuestionListes } from '../lycee-maths-a/ListesPython';
import { listesPasAPas } from '../lycee-maths-a/listesPasAPas';
import '../lycee-maths-a/lycee-maths-a.css';

/**
 * Les scènes du groupe « lycee-maths-a » — voir `../index.js`. Un univers par
 * jeu, repris de sa couverture (09/10/2026) ; les briques partagées sont dans
 * `../lycee-maths-a/commun.js`. Sous chaque manche finie, la bonne réponse
 * reste dans sa bulle, sauf quand la scène la montre déjà (`apresSauf`).
 */
const SCENES = {
  // Le hall d'horlogerie : leviers de laiton, chaîne de rouages qui rejoue le calcul.
  automatismes: {
    question: (m, termine) => <QuestionAutomatismes m={m} termine={termine} />,
    choix: (props) => <LeviersAutomatismes {...props} />,
    apres: apresSauf((m) => chaineDe(m)),
  },
  // L'écluse au bord de la mer : bouées, l'eau remplit le bon intervalle.
  'intervalles-et-inegalites': {
    question: (m, termine) => <QuestionIntervalles m={m} termine={termine} />,
    objets: 'sc-intervalles-et-inegalites',
  },
  // L'arbre géant : fruits d'or à cueillir, la règle qui pousse étape par étape.
  'puissances-et-racines-lycee': {
    question: (m, termine) => <QuestionPuissances m={m} termine={termine} />,
    choix: (props) => <FruitsPuissances {...props} />,
    apres: apresSauf((m) => etapesDe(m)),
  },
  // Les terrasses de marbre : sphère armillaire, balance qui compare, pavés sur le canal.
  'fonctions-de-reference': {
    question: (m, termine) => <QuestionFonctions m={m} termine={termine} />,
    choix: (props) => <PavesFonctions {...props} />,
  },
  // La gare du funiculaire : cabines au câble, la cabine parcourt la bonne droite.
  'equation-de-droite': {
    question: (m, termine) => <QuestionEquationDeDroite m={m} termine={termine} />,
    choix: (props) => <CabinesEquation {...props} />,
  },
  // La marina : voiliers à embarquer, le plan du port et le trajet du bateau.
  'vecteurs-et-coordonnees': {
    question: (m, termine) => <QuestionVecteurs m={m} termine={termine} />,
    choix: (props) => <VoiliersVecteurs {...props} />,
  },
  // La serre aux billes : bocaux, les bonnes billes s'allument.
  'probabilites-seconde': {
    question: (m, termine) => <QuestionProbabilitesSeconde m={m} termine={termine} />,
    objets: 'sc-probabilites-seconde',
  },
  // L'orgue de laiton : carillons à frapper, moyenne en ligne d'or, médiane qui sonne.
  'statistiques-seconde': {
    question: (m, termine) => <QuestionStatistiques m={m} termine={termine} />,
    choix: (props) => <CarillonsStatistiques {...props} />,
  },
  // Les orangeraies : cagettes d'oranges, le tapis roulant rejoue la suite terme à terme.
  suites: {
    question: (m, termine) => <QuestionSuites m={m} termine={termine} />,
    objets: 'sc-suites',
  },
  // Le pont en arc : clés de voûte à poser, Δ et la parabole après la réponse.
  'second-degre': {
    question: (m, termine) => <QuestionSecondDegre m={m} termine={termine} />,
    choix: (props) => <ClesDeVoute {...props} />,
  },
  // La route de montagne : panneaux indicateurs, la dérivation rejouée terme à terme.
  derivation: {
    question: (m, termine) => <QuestionDerivation m={m} termine={termine} />,
    objets: 'sc-derivation',
  },
  // La cité sous-marine : bulles à attraper, les règles qui remontent.
  exponentielle: {
    question: (m, termine) => <QuestionExponentielle m={m} termine={termine} />,
    choix: (props) => <BullesExponentielle {...props} />,
  },
  // Le chantier de pierre : la pierre qui manque (glisser ou toucher), le calcul pierre à pierre.
  'produit-scalaire': {
    question: (m, termine) => <QuestionProduitScalaire m={m} termine={termine} />,
    choix: (props) => <PierresProduitScalaire {...props} />,
  },
  // Les canaux : vannes à lever, l'eau coule dans les bons chemins de l'arbre.
  'probabilites-conditionnelles': {
    question: (m, termine) => <QuestionProbabilitesConditionnelles m={m} termine={termine} />,
    choix: (props) => <VannesConditionnelles {...props} />,
  },
  // Le port des montgolfières : caisses pendues aux grues, la loi de X en ballons.
  'variables-aleatoires': {
    question: (m, termine) => <QuestionVariablesAleatoires m={m} termine={termine} />,
    choix: (props) => <CaissesVariables {...props} />,
  },
  // Le jardin japonais : les buzzers Vraie / Fausse de l'écran commun (pas de `choix`),
  // des plaquettes votives sinon ; le pont des pierres P → Q rejoue la logique.
  'vrai-faux-reciproque': {
    question: (m, termine) => <QuestionVraiFaux m={m} termine={termine} />,
    objets: 'sc-vrai-faux-reciproque',
  },
  // L'étal du marché : carreaux de céramique, le marchand rejoue le programme.
  'listes-python': {
    question: (m, termine) => <QuestionListes m={m} termine={termine} />,
    objets: 'sc-listes-python',
    // L'étal en marche montre déjà l'affichage : pas de réponse répétée dessous.
    apres: apresSauf((m) => listesPasAPas(m.question).etapes.length > 0),
  },
};

export default SCENES;
