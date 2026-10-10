import { QuestionPython } from './UsinePython';
import collegeMathsA from './groupes/college-maths-a';
import collegeMathsB from './groupes/college-maths-b';
import collegeFrancaisA from './groupes/college-francais-a';
import collegeFrancaisB from './groupes/college-francais-b';
import lyceeMathsA from './groupes/lycee-maths-a';
import lyceeMathsB from './groupes/lycee-maths-b';
import lyceeFrancais from './groupes/lycee-francais';

/**
 * LES SCÈNES PROPRES À UN JEU — Camara, le 09/10/2026 : « un truc en rapport
 * avec le titre et la couverture, qui donne envie à mort », puis « fais ça
 * pour tous les jeux de toutes les classes ». Un jeu peut remplacer, sur
 * l'écran commun :
 *   - `question(m, termine)` : le dessin de sa question (et, une fois la
 *     réponse donnée, son explication animée) ;
 *   - `apres(m)` : ce qu'il montre sous la question une fois la réponse
 *     donnée (par défaut, la bonne réponse) ;
 *   - `objets` : la forme de ses réponses (voir `OBJETS` dans `JeuDeChoix`) ;
 *   - `choix({ m, choix, fautes, choisir, objet })` : ses réponses jouées
 *     autrement (glisser, attraper…), chacune un bouton à son libellé.
 * Clé : celle du module. Un jeu absent d'ici garde l'écran commun. Les
 * scènes sont rangées par groupe (`groupes/`), une par fichier de jeu.
 */
export const SCENES = {
  ...collegeMathsA,
  ...collegeMathsB,
  ...collegeFrancaisA,
  ...collegeFrancaisB,
  ...lyceeMathsA,
  ...lyceeMathsB,
  ...lyceeFrancais,
  // Le pilote, validé par Camara le 09/10/2026 (« voilà, c'est très bien là »).
  'python-variable': {
    question: (m, termine) => <QuestionPython m={m} termine={termine} />,
    // L'usine en marche montre déjà l'affichage : pas de réponse répétée dessous.
    apres: () => null,
    objets: 'caisse',
  },
};
