import { supportEcritChoisi } from '../lib/storage/supportEcrit';
import { supportChoisi } from '../lib/storage/supportEvaluation';
import { conversationEnCours } from '../lib/storage/conversationLangue';

/**
 * UNE QUESTION POSÉE ET JAMAIS RÉPONDUE NE RESTE PAS À L'ÉCRAN POUR TOUJOURS.
 *
 * LE DÉFAUT, RELEVÉ PAR CAMARA EN SÉANCE LE 18/09/2026 sur la carte des
 * vitesses : « j'avais demandé une expression orale que j'ai pas faite, je
 * viens de demander un exercice d'expression écrite mais la fenêtre du choix de
 * vitesse pour l'expression orale est toujours là et ne part pas. »
 *
 * IL Y AVAIT TROIS CARTES, ET LES TROIS AVAIENT LE MÊME DÉFAUT. Chacune
 * s'affiche tant que l'élève n'a pas cliqué, et aucune ne se demandait ce qui
 * se passait s'il ne cliquait jamais. Il suffit qu'il tape sa demande au lieu
 * de cliquer — ce qu'un enfant fait tout le temps — pour que la carte survive à
 * l'exercice qu'elle servait.
 *
 * LA RÈGLE COMMUNE : pendant qu'on attend une réponse, le professeur ne peut
 * écrire QUE ses répliques, le tableau et une image. Toute autre balise veut
 * dire qu'on est passé à autre chose, et la question tombe.
 *
 * POURQUOI UNE LISTE BLANCHE. On ne peut pas énumérer tout ce qui n'est pas
 * l'exercice en cours ; on peut énumérer ce qui EN FAIT PARTIE. Un exercice
 * ajouté l'an prochain refermera ces trois fenêtres sans que personne ait à y
 * penser.
 */

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

describe('La carte « cahier ou clavier » d’un texte à écrire', () => {
  test('elle attend tant que l’élève n’a pas répondu', () => {
    expect(supportEcritChoisi([prof('On écrit un texte ? [SUPPORT_ECRIT]')])).toBeNull();
  });

  test('elle tombe si un autre exercice s’ouvre', () => {
    const fil = [
      prof('On écrit un texte ? [SUPPORT_ECRIT]'),
      eleve('En fait je préfère parler.'),
      prof('D’accord, on parle alors. [CONVERSATION]'),
    ];

    expect(supportEcritChoisi(fil)).toBeUndefined();
  });

  test('le tableau ne la fait pas tomber', () => {
    // Le professeur peut montrer un mot pendant qu'il attend : ce n'est pas
    // passer à autre chose.
    const fil = [
      prof('On écrit un texte ? [SUPPORT_ECRIT]'),
      prof('[ARDOISE]week-end[/ARDOISE]'),
    ];

    expect(supportEcritChoisi(fil)).toBeNull();
  });

  test('une réponse déjà donnée reste la réponse', () => {
    const fil = [
      prof('[SUPPORT_ECRIT]'),
      eleve('J’écris au clavier.\n[TEXTE AU CLAVIER : il écrit ici.]'),
      prof('Voici ta consigne. [ARDOISE]…[/ARDOISE]'),
    ];

    expect(supportEcritChoisi(fil)).toBe('clavier');
  });
});

describe('La carte « cahier ou ordinateur » d’une évaluation', () => {
  test('elle attend tant que l’élève n’a pas répondu', () => {
    expect(supportChoisi([prof('Sur quoi tu composes ? [SUPPORT_EVALUATION]')])).toBeNull();
  });

  test('elle tombe si un autre exercice s’ouvre', () => {
    const fil = [
      prof('Sur quoi tu composes ? [SUPPORT_EVALUATION]'),
      eleve('En fait je veux faire une dictée.'),
      prof('Très bien. [SUPPORT_ECRIT]'),
    ];

    expect(supportChoisi(fil)).toBeUndefined();
  });
});

describe('La carte des vitesses d’une conversation', () => {
  test('elle tombe déjà — corrigée le 18/09/2026', () => {
    const fil = [
      prof('[CONVERSATION]'),
      prof('Très bien ! [SUPPORT_ECRIT]'),
    ];

    expect(conversationEnCours(fil)).toBe(false);
  });
});

describe('La carte de l’évaluation, réponse dite à voix haute', () => {
  test('« à l’ordinateur » dit au lieu de cliquer referme la carte', () => {
    const fil = [
      prof('Sur quoi tu composes ? [SUPPORT_EVALUATION]'),
      eleve('À l’ordinateur.'),
    ];

    expect(supportChoisi(fil)).toBe('ordinateur');
  });

  test('« sur mon cahier » aussi', () => {
    const fil = [prof('[SUPPORT_EVALUATION]'), eleve('Sur mon cahier')];

    expect(supportChoisi(fil)).toBe('cahier');
  });

  test('une question en retour laisse la carte ouverte', () => {
    const fil = [prof('[SUPPORT_EVALUATION]'), eleve('Tu me conseilles quoi ?')];

    expect(supportChoisi(fil)).toBeNull();
  });
});
