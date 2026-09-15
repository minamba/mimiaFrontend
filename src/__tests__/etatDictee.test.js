import {
  carteDeChoixVisible,
  debutDeDictee,
  finDeDictee,
  tableauVerrouille,
} from '../lib/storage/etatDictee';

/**
 * CHAQUE TEST REJOUE UNE RÉGRESSION RÉELLE du 11/09/2026. Elles ont toutes
 * traversé la journée sans qu'aucun test ne bronche, parce que cette logique
 * vivait au milieu d'un composant de trois mille six cents lignes.
 */

const dictee = (modif = {}) => ({
  dicteeCourante: true,
  tourDuMode: null,
  tourEleve: 4,
  copieOuverte: false,
  dicteeOuverte: false,
  ...modif,
});

describe('carteDeChoixVisible', () => {
  test('une dictée qui arrive pose la question', () => {
    expect(carteDeChoixVisible(dictee())).toBe(true);
  });

  test('pas de dictée, pas de question', () => {
    expect(carteDeChoixVisible(dictee({ dicteeCourante: false }))).toBe(false);
  });

  test('le mode déjà choisi pour ce tour ne se redemande pas', () => {
    expect(carteDeChoixVisible(dictee({ tourDuMode: 4 }))).toBe(false);
  });

  test('RÉGRESSION : pendant que l\'élève écrit, la question ne revient pas', () => {
    // Une demande de répétition fait parler l'élève, donc avance son compteur
    // de tours — et rouvrait la carte au milieu de la dictée.
    expect(carteDeChoixVisible(dictee({ copieOuverte: true, tourEleve: 9 })))
      .toBe(false);
  });

  test('RÉGRESSION : rendre sa copie ne termine pas la dictée', () => {
    // Le code croyait la dictée finie dès que la copie partait. Le professeur
    // relisait alors une phrase manquante, et l'écran redemandait le support.
    expect(carteDeChoixVisible(dictee({
      dicteeOuverte: true, copieOuverte: false, tourEleve: 9,
    }))).toBe(false);
  });
});

describe('debutDeDictee', () => {
  test('la dictée arrive encore en flux : elle prendra la place suivante', () => {
    expect(debutDeDictee({
      dicteeDansLeFlux: true, nombreMessages: 12, indexDernierProf: 10,
    })).toBe(12);
  });

  test('la dictée est déjà versée au fil : c\'est ce message-là', () => {
    expect(debutDeDictee({
      dicteeDansLeFlux: false, nombreMessages: 12, indexDernierProf: 11,
    })).toBe(11);
  });

  test('ne descend jamais sous zéro', () => {
    expect(debutDeDictee({
      dicteeDansLeFlux: false, nombreMessages: 0, indexDernierProf: -1,
    })).toBe(0);
  });
});

describe('finDeDictee', () => {
  const base = {
    dicteeOuverte: true,
    correctionArrivee: false,
    passageArrivant: '',
    dejaDicte: '',
    indexDernierProf: 20,
    debutDictee: 10,
    dicteeDansLeFlux: false,
  };

  test('la correction termine la dictée', () => {
    expect(finDeDictee({ ...base, correctionArrivee: true })).toBe('correction');
  });

  test('une dictée déjà close ne se referme pas deux fois', () => {
    expect(finDeDictee({ ...base, dicteeOuverte: false, correctionArrivee: true }))
      .toBeNull();
  });

  test('RÉGRESSION : le message qui OUVRE la dictée ne la ferme pas', () => {
    // Le bug le plus visible : la copie disparaissait dans la seconde suivant
    // le clic, et les lignes de l'élève repartaient dans le fil.
    expect(finDeDictee({
      ...base,
      indexDernierProf: 10,
      debutDictee: 10,
      passageArrivant: 'Le vent soufflait fort sur la plage.',
      dejaDicte: '',
    })).toBeNull();
  });

  test('RÉGRESSION : sans texte antérieur, rien ne se conclut', () => {
    expect(finDeDictee({
      ...base,
      passageArrivant: 'Le vent soufflait fort sur la plage.',
      dejaDicte: '',
    })).toBeNull();
  });

  test('une relecture poursuit la dictée', () => {
    expect(finDeDictee({
      ...base,
      passageArrivant: 'Il ouvrit un oeil.',
      dejaDicte: 'Le chat noir dormait. Il ouvrit un oeil.',
    })).toBeNull();
  });

  test('RÉGRESSION : un texte inédit ferme la dictée jamais corrigée', () => {
    // Cinq dictées dormaient « en attente » : leur état survivait à la
    // suivante, qui héritait d'un cahier que l'élève n'avait pas choisi.
    expect(finDeDictee({
      ...base,
      passageArrivant: 'Le vent soufflait fort sur la plage.',
      dejaDicte: 'Le chat noir dormait. Il ouvrit un oeil.',
    })).toBe('nouvelle');
  });

  test('un message sans passage ne conclut rien', () => {
    expect(finDeDictee({ ...base, dejaDicte: 'Le chat noir dormait.' })).toBeNull();
  });

  test('l\'abandon posé par le serveur referme la dictée', () => {
    // L'élève est parti avant de rendre sa copie : sans cette sortie, la copie
    // gardée deux heures par le navigateur se rouvrait à son retour.
    expect(finDeDictee({ ...base, abandonArrive: true })).toBe('abandon');
  });

  test('l\'abandon referme même sur le message qui a ouvert la dictée', () => {
    expect(finDeDictee({
      ...base, abandonArrive: true, indexDernierProf: 10, debutDictee: 10,
    })).toBe('abandon');
  });
});

describe('tableauVerrouille', () => {
  const repos = {
    carteDeChoix: false,
    dicteeOuverte: false,
    copieClavierOuverte: false,
    cahierEnAttente: false,
  };

  test('hors dictée, le tableau est libre', () => {
    expect(tableauVerrouille(repos)).toBe(false);
  });

  test('pendant la question du support, rien au tableau', () => {
    expect(tableauVerrouille({ ...repos, carteDeChoix: true })).toBe(true);
  });

  test('RÉGRESSION : pendant la copie au clavier, rien au tableau', () => {
    expect(tableauVerrouille({
      ...repos, dicteeOuverte: true, copieClavierOuverte: true,
    })).toBe(true);
  });

  test('tant que la photo du cahier manque, rien au tableau', () => {
    expect(tableauVerrouille({
      ...repos, dicteeOuverte: true, cahierEnAttente: true,
    })).toBe(true);
  });

  test('copie rendue : le tableau se libère pour la correction', () => {
    // C'est là qu'il sert : le texte dicté, et dessous la copie de l'élève.
    expect(tableauVerrouille({ ...repos, dicteeOuverte: true })).toBe(false);
  });
});
