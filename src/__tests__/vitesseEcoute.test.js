import {
  VITESSES,
  VITESSE_PAR_DEFAUT,
  facteurNavigateur,
  carteVitesseVisible,
} from '../lib/storage/vitesseEcoute';
import { extraireEcoutes } from '../lib/storage/ardoise';

/**
 * LA VITESSE D'UN EXERCICE D'ÉCOUTE, CHOISIE PAR L'ÉLÈVE.
 *
 * Voulu par Camara le 12/09/2026 : quatre boutons avant chaque compréhension
 * orale, dans toutes les langues. La question se repose à chaque exercice
 * INÉDIT, jamais quand le professeur relit le même passage.
 */

const PASSAGE = 'The cat is sleeping on the table. The dog is in the garden.';

const carte = (modif = {}) => carteVitesseVisible({
  passageEcoute: PASSAGE,
  passageChoisi: '',
  tourDuChoix: null,
  tourEleve: 4,
  ...modif,
});

describe('les quatre vitesses', () => {
  test('quatre boutons, du plus lent au plus rapide', () => {
    expect(VITESSES.map((v) => v.cle))
      .toEqual(['tres_lent', 'lent', 'normal', 'rapide']);

    expect(VITESSES.map((v) => v.libelle))
      .toEqual(['Très lent', 'Lent', 'Normal', 'Rapide']);
  });

  test('la voix de repli suit le choix, et ralentit vraiment', () => {
    expect(facteurNavigateur('tres_lent')).toBeLessThan(facteurNavigateur('lent'));
    expect(facteurNavigateur('lent')).toBeLessThan(facteurNavigateur('normal'));
    expect(facteurNavigateur('normal')).toBeLessThan(facteurNavigateur('rapide'));
    expect(facteurNavigateur(VITESSE_PAR_DEFAUT)).toBe(1);
  });

  test('une vitesse inconnue lit normalement, elle ne casse rien', () => {
    expect(facteurNavigateur('galopant')).toBe(1);
    expect(facteurNavigateur(null)).toBe(1);
  });
});

describe('quand poser la question', () => {
  test('un passage d\'écoute la pose', () => {
    expect(carte()).toBe(true);
  });

  test('pas d\'écoute, pas de question', () => {
    expect(carte({ passageEcoute: '' })).toBe(false);
  });

  test('les tout premiers mots du flux ne la posent pas encore', () => {
    // Le texte arrive fragment par fragment : « The » ne dit pas encore s'il
    // s'agit d'un passage inédit.
    expect(carte({ passageEcoute: 'The' })).toBe(false);
  });

  test('elle ne se repose pas dans le même tour', () => {
    expect(carte({ tourDuChoix: 4 })).toBe(false);
  });

  test('RELECTURE : le même passage garde la vitesse choisie', () => {
    expect(carte({
      passageEcoute: 'The cat is sleeping on the table.',
      passageChoisi: PASSAGE,
      tourDuChoix: 2,
    })).toBe(false);
  });

  test('un passage INÉDIT repose la question', () => {
    expect(carte({
      passageEcoute: 'Yesterday I went to the market with my brother.',
      passageChoisi: PASSAGE,
      tourDuChoix: 2,
    })).toBe(true);
  });
});

describe('extraireEcoutes', () => {
  // Le texte brut du professeur, avec ses balises — c'est lui que l'écran
  // lit, avant que la voix ne les remplace par ses bornes de contrôle.
  const borner = (balise, texte) => `[${balise}]${texte}[/${balise}]`;

  test('lit le passage, quelle que soit la langue', () => {
    expect(extraireEcoutes(`Écoute bien. ${borner('EN', 'The cat sleeps.')}`))
      .toBe('The cat sleeps.');

    expect(extraireEcoutes(borner('ES', 'El gato duerme.'))).toBe('El gato duerme.');
    expect(extraireEcoutes(borner('ZH', '我爱你。'))).toBe('我爱你。');
    expect(extraireEcoutes(borner('FR', 'Le chat dort.'))).toBe('Le chat dort.');
  });

  test('un bloc encore ouvert compte : c\'est AVANT la fin qu\'il faut demander', () => {
    expect(extraireEcoutes('Écoute bien. [EN]The cat is')).toBe('The cat is');
  });

  test('un message sans écoute ne rend rien', () => {
    expect(extraireEcoutes('On reprend les accords du participe passé.')).toBe('');
    expect(extraireEcoutes('')).toBe('');
    expect(extraireEcoutes(null)).toBe('');
  });
});
