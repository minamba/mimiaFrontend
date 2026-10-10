import { avecVisuel } from '../base';
import { EtiquettesDetective, QuestionDetective } from '../college-francais-a/DetectiveDesClasses';
import { QuestionCodCoi } from '../college-francais-a/CodOuCoi';
import { QuestionRoue, RoueDesReponses } from '../college-francais-a/RoueDesVerbes';
import { LanternesDecorAction, QuestionDecorAction } from '../college-francais-a/DecorOuAction';
import { MaisonsHomophones, QuestionHomophones } from '../college-francais-a/Homophones';
import { QuestionParticipe } from '../college-francais-a/ParticipePasse';
import { QuestionSimpleComplexe } from '../college-francais-a/SimpleOuComplexe';
import { PotsMotJuste, QuestionMotJuste } from '../college-francais-a/LeMotJuste';
import { ChoixSchema, QuestionSchema } from '../college-francais-a/SchemaNarratif';
import { PlaquesQuiRaconte, QuestionQuiRaconte } from '../college-francais-a/QuiRaconte';
import { QuestionDieux } from '../college-francais-a/DieuxEtHeros';
import { CoquillagesQuiParle, QuestionQuiParle } from '../college-francais-a/QuiParle';
import { CuvesTri, QuestionTri } from '../college-francais-a/TriDesSubordonnees';
import { QuestionActifPassif, VannesActifPassif } from '../college-francais-a/ActifOuPassif';
import '../college-francais-a/college-francais-a.css';

/**
 * Les scènes du groupe « college-francais-a » — voir `../index.js`.
 * Une scène par jeu, dans l'univers de sa couverture (09/10/2026). Chacune
 * garde la question entière à l'écran, ne montre rien de la réponse avant
 * qu'elle soit donnée, puis l'explique en l'animant.
 */
const SCENES = {
  // Le cabinet du détective : l'étiquette de la classe s'accroche au mot suspect.
  'detective-des-classes': {
    question: (m, termine) => avecVisuel(m, <QuestionDetective m={m} termine={termine} />),
    // Le verdict dit déjà la classe, et l'étiquette pend au mot : pas de réponse répétée.
    apres: () => null,
    choix: (props) => <EtiquettesDetective {...props} />,
  },
  // Le jardin à la fontaine : le massif fleurit, le test qui tranche se joue.
  'cod-ou-coi': {
    question: (m, termine) => avecVisuel(m, <QuestionCodCoi m={m} termine={termine} />),
    objets: 'sc-cod-ou-coi',
  },
  // Le moulin : les réponses sur les godets de la roue qui tourne.
  'roue-des-verbes-college': {
    question: (m, termine) => avecVisuel(m, <QuestionRoue m={m} termine={termine} />),
    // Le godet plein porte la bonne forme : pas de bulle en plus.
    apres: () => null,
    choix: (props) => <RoueDesReponses {...props} />,
  },
  // La ruelle sous la pluie : le décor derrière, l'action devant.
  'decor-ou-action': {
    question: (m, termine) => avecVisuel(m, <QuestionDecorAction m={m} termine={termine} />),
    choix: (props) => <LanternesDecorAction {...props} />,
  },
  // Le village des maisons jumelles : le test du remplacement joué sur la phrase.
  'homophones-college': {
    question: (m, termine) => avecVisuel(m, <QuestionHomophones m={m} termine={termine} />),
    // Le mot entre par sa porte dans la phrase remplie : il est déjà montré.
    apres: () => null,
    choix: (props) => <MaisonsHomophones {...props} />,
  },
  // L'atelier d'horlogerie : le mot qui commande entraîne le participe.
  'participe-passe-college': {
    question: (m, termine) => avecVisuel(m, <QuestionParticipe m={m} termine={termine} />),
    // Le participe est logé dans la phrase remplie : pas de bulle en plus.
    apres: () => null,
    objets: 'sc-participe-passe-college',
  },
  // La ville des canaux : un îlot par proposition, le bon pont entre eux.
  'simple-ou-complexe': {
    question: (m, termine) => avecVisuel(m, <QuestionSimpleComplexe m={m} termine={termine} />),
    objets: 'sc-simple-ou-complexe',
  },
  // La serre : on cueille le mot juste, il fleurit là où il sert.
  'le-mot-juste': {
    question: (m, termine) => avecVisuel(m, <QuestionMotJuste m={m} termine={termine} />),
    choix: (props) => <PotsMotJuste {...props} />,
  },
  // Le chemin du récit : on clique l'étape sur le chemin, le voyageur y marche.
  'schema-narratif': {
    question: (m, termine) => avecVisuel(m, <QuestionSchema m={m} termine={termine} />),
    // L'étape s'allume sur le chemin, son nom écrit : pas de bulle en plus.
    apres: () => null,
    choix: (props) => <ChoixSchema {...props} />,
  },
  // La chambre noire : d'où l'on filme, qui tient l'appareil.
  'qui-raconte-college': {
    question: (m, termine) => avecVisuel(m, <QuestionQuiRaconte m={m} termine={termine} />),
    choix: (props) => <PlaquesQuiRaconte {...props} />,
  },
  // Le temple sous l'orage : le médaillon d'or révèle l'attribut.
  'dieux-et-heros': {
    question: (m, termine) => avecVisuel(m, <QuestionDieux m={m} termine={termine} />),
    // Le médaillon porte déjà le nom : pas de bulle en plus.
    apres: () => null,
    objets: 'sc-dieux-et-heros',
  },
  // L'amphithéâtre : les voix deviennent visibles.
  'qui-parle': {
    question: (m, termine) => avecVisuel(m, <QuestionQuiParle m={m} termine={termine} />),
    choix: (props) => <CoquillagesQuiParle {...props} />,
  },
  // La teinturerie : la subordonnée plongée dans le bon bain.
  'tri-des-subordonnees': {
    question: (m, termine) => avecVisuel(m, <QuestionTri m={m} termine={termine} />),
    // La bande teinte porte son nom, et la légende dit la réponse : pas de bulle en plus.
    apres: () => null,
    choix: (props) => <CuvesTri {...props} />,
  },
  // L'écluse : l'eau coule dans le sens de l'action.
  'actif-ou-passif': {
    question: (m, termine) => avecVisuel(m, <QuestionActifPassif m={m} termine={termine} />),
    choix: (props) => <VannesActifPassif {...props} />,
  },
};

export default SCENES;
