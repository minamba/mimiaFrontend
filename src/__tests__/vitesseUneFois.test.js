/**
 * LA VITESSE NE SE DEMANDE QU'UNE FOIS PAR EXERCICE — Camara, le 05/10/2026,
 * en expression orale d'anglais : « à chaque phrase le choix de la vitesse
 * apparaît […] s'il doit apparaître, c'est une fois avant de commencer ».
 *
 * `rangExercice` dit si l'on est toujours dans le même exercice : tant qu'il
 * ne bouge pas, la carte des vitesses ne revient pas.
 */

import { rangExercice } from '../lib/storage/fenetreExercice';

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

describe('le rang de l’exercice en cours', () => {
  test('un échange dans la langue reste le même exercice, réplique après réplique', () => {
    const fil = [
      prof('On discute en anglais ! [EN]Hi! What did you do this weekend?[/EN]'),
      eleve('I went to the park.'),
      prof('[EN]Nice! Who did you go with?[/EN]'),
      eleve('With my brother.'),
      prof('[EN]And what did you play?[/EN]'),
    ];

    expect(rangExercice(fil.slice(0, 1))).toBe(rangExercice(fil));
  });

  test('le tableau, une image ou un réglage de vitesse ne changent pas d’exercice', () => {
    const fil = [
      prof('[EN]Listen to this.[/EN]'),
      prof('Regarde. [ARDOISE]\nweekend\n[/ARDOISE] [VITESSE:lent] [EN]Listen again.[/EN]'),
      prof('[TABLEAU_EFFACE] [CONVERSATION] On continue.'),
    ];

    expect(rangExercice(fil)).toBe(0);
  });

  test('un exercice archivé en ouvre un nouveau : la question pourra se reposer', () => {
    const avant = [prof('[EN]Tom went to Scotland.[/EN]')];
    const apres = [
      ...avant,
      prof('Bravo ! [COMPREHENSION_ORALE]\nlangue: en\n[/COMPREHENSION_ORALE]'),
      prof('Un autre texte. [EN]Sarah lives in London.[/EN]'),
    ];

    expect(rangExercice(apres)).toBe(rangExercice(avant) + 1);
  });

  test('ce que tape l’élève ne compte jamais', () => {
    expect(rangExercice([eleve('[DICTEE] pour rire'), prof('[EN]Hello.[/EN]')])).toBe(0);
  });

  test('un fil vide ou absent vaut zéro', () => {
    expect(rangExercice([])).toBe(0);
    expect(rangExercice(undefined)).toBe(0);
  });
});
