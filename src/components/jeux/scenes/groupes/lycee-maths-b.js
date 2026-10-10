import '../lycee-maths-b/lycee-maths-b.css';
import { QuestionLimites, RadeauxLimites } from '../lycee-maths-b/Limites';
import { QuestionLogarithme } from '../lycee-maths-b/Logarithme';
import { QuestionPrimitives } from '../lycee-maths-b/Primitives';
import { BacsBinomiale, QuestionBinomiale } from '../lycee-maths-b/Binomiale';
import { QuestionDenombrement } from '../lycee-maths-b/Denombrement';
import { QuestionEspace } from '../lycee-maths-b/Espace';
import { QuestionConvexite } from '../lycee-maths-b/Convexite';
import { DominosRecurrence, QuestionRecurrence } from '../lycee-maths-b/Recurrence';
import { ManettesEvolutions, QuestionEvolutions } from '../lycee-maths-b/Evolutions';
import { QuestionParaboles } from '../lycee-maths-b/Paraboles';
import { PiecesInterets, QuestionInterets } from '../lycee-maths-b/Interets';
import { BouteillesProportions, QuestionProportions } from '../lycee-maths-b/Proportions';
import { GaresGraphique, QuestionGraphique } from '../lycee-maths-b/Graphique';
import { QuestionProbabilites } from '../lycee-maths-b/Probabilites';
import { QuestionAtelier } from '../lycee-maths-b/Atelier';
import { QuestionNuage } from '../lycee-maths-b/Nuage';

/**
 * Les scènes du groupe « lycee-maths-b » — voir `../index.js`. Seize jeux de
 * maths du lycée (terminale générale, voie technologique, voie pro), chacun
 * avec son univers, repris de sa couverture (`../lycee-maths-b/*.js`) ; ses
 * classes CSS et ses animations sont préfixées `sc-<cle>`. Une fois la
 * réponse donnée, l'explication animée prend la place du décor — le texte de
 * la question et son dessin restent à l'écran — ; la bonne réponse reste dite
 * dessous, dans la bulle commune. Sept jeux jouent leurs réponses autrement
 * (radeaux, bacs de Galton, dominos, manettes, pièces à glisser, bouteilles,
 * gares) ; les autres ont des objets à leur image.
 */
const SCENES = {
  // Le canyon des cascades : la stèle, la randonneuse, et des radeaux pour répondre.
  'limites-et-continuite': {
    question: (m, termine) => <QuestionLimites m={m} termine={termine} />,
    choix: (p) => <RadeauxLimites {...p} />,
  },
  // Le palais des pavillons de cuivre : la plaque de laiton, la règle à calcul qui rejoue ln a + ln b.
  logarithme: {
    question: (m, termine) => <QuestionLogarithme m={m} termine={termine} />,
    objets: 'sc-logarithme',
  },
  // Les marais salants au couchant : le bassin qui se remplit sous la courbe.
  'primitives-et-integrales': {
    question: (m, termine) => <QuestionPrimitives m={m} termine={termine} />,
    objets: 'sc-primitives-et-integrales',
  },
  // La planche de Galton : on lâche sa bille dans le bon bac, puis l'histogramme de B(n ; p).
  'loi-binomiale': {
    question: (m, termine) => <QuestionBinomiale m={m} termine={termine} />,
    choix: (p) => <BacsBinomiale {...p} />,
  },
  // La salle des joyaux : les cristaux du présentoir, puis les écrins qui se multiplient.
  denombrement: {
    question: (m, termine) => <QuestionDenombrement m={m} termine={termine} />,
    objets: 'sc-denombrement',
  },
  // Le chantier dans le ciel : le repère lumineux, les plans de verre, la situation en perspective.
  'geometrie-espace': {
    question: (m, termine) => <QuestionEspace m={m} termine={termine} />,
    objets: 'sc-geometrie-espace',
  },
  // Les toits de tuiles : la bille dans le creux, puis les tangentes qui se posent.
  convexite: {
    question: (m, termine) => <QuestionConvexite m={m} termine={termine} />,
    objets: 'sc-convexite',
  },
  // Le palais des dominos : on renverse le bon domino, puis la file rejoue la preuve.
  recurrence: {
    question: (m, termine) => <QuestionRecurrence m={m} termine={termine} />,
    choix: (p) => <DominosRecurrence {...p} />,
  },
  // La cité des turbines : on abaisse une manette, puis les écluses montrent les coefficients.
  'les-evolutions': {
    question: (m, termine) => <QuestionEvolutions m={m} termine={termine} />,
    choix: (p) => <ManettesEvolutions {...p} />,
  },
  // La centrale solaire : le miroir parabolique et son foyer, puis le calcul terme à terme.
  'fonctions-et-paraboles': {
    question: (m, termine) => <QuestionParaboles m={m} termine={termine} />,
    objets: 'sc-fonctions-et-paraboles',
  },
  // L'atelier de la monnaie : on glisse sa pièce dans le coffre, puis les piles des années.
  'interets-et-pourcentages': {
    question: (m, termine) => <QuestionInterets m={m} termine={termine} />,
    choix: (p) => <PiecesInterets {...p} />,
  },
  // La fabrique de jus d'orange : on prend une bouteille sur le tapis, puis le calcul posé.
  'proportions-et-grandeurs': {
    question: (m, termine) => <QuestionProportions m={m} termine={termine} />,
    choix: (p) => <BouteillesProportions {...p} />,
  },
  // Le banc d'essai des rails : on choisit une gare, puis la lecture faite sur la courbe.
  'lire-un-graphique': {
    question: (m, termine) => <QuestionGraphique m={m} termine={termine} />,
    choix: (p) => <GaresGraphique {...p} />,
  },
  // L'entrepôt des bacs jaunes : le tri refait — tableau, arbre, ensembles.
  'probabilites-pro': {
    question: (m, termine) => <QuestionProbabilites m={m} termine={termine} />,
    objets: 'sc-probabilites-pro',
  },
  // L'atelier de charpente : la formule gravée au fer, et le calcul avec les cotes.
  'geometrie-atelier': {
    question: (m, termine) => <QuestionAtelier m={m} termine={termine} />,
    objets: 'sc-geometrie-atelier',
  },
  // La terrasse des étoiles : le point moyen qui se forme, la droite, la zone de confiance.
  'ajuster-un-nuage': {
    question: (m, termine) => <QuestionNuage m={m} termine={termine} />,
    objets: 'sc-ajuster-un-nuage',
  },
};

export default SCENES;
