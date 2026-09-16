/**
 * CHANGER DE VITESSE EN PLEIN EXERCICE — voulu par Camara le 16/09/2026.
 *
 * « Un élève peut choisir une vitesse et se rendre compte qu'elle n'est pas
 * adaptée » : il doit pouvoir en changer à tout moment, et réentendre le même
 * passage au nouveau débit. Le professeur le signale par une balise.
 *
 * Ces tests tiennent les deux moitiés, comme pour la gomme du tableau : la
 * balise DIT quelque chose, et elle ne se voit ni ne s'entend.
 */

import {
  VITESSE_CHOIX,
  demandeChoixVitesse,
  vitesseDemandee,
  decouper,
  texteParle,
} from '../lib/storage/ardoise';
import { estVitesseConnue, VITESSES } from '../lib/storage/vitesseEcoute';

describe('la fenêtre se rouvre', () => {
  test('la balise nue demande un nouveau choix', () => {
    expect(demandeChoixVitesse(`D'accord, choisis. ${VITESSE_CHOIX}`)).toBe(true);
  });

  test('un message ordinaire ne rouvre rien', () => {
    expect(demandeChoixVitesse('On reprend l’histoire de Ben.')).toBe(false);
    expect(demandeChoixVitesse('')).toBe(false);
    expect(demandeChoixVitesse(null)).toBe(false);
  });

  test('une balise À CIBLE ne rouvre PAS la fenêtre', () => {
    // L'élève a dit « plus lent » : il a déjà choisi, lui reposer la question
    // serait lui redemander ce qu'il vient de dire.
    expect(demandeChoixVitesse('Je te relis plus lentement. [VITESSE:lent]')).toBe(false);
  });
});

describe('le professeur pose lui-même le cran voisin', () => {
  test('la cible est lue', () => {
    expect(vitesseDemandee('Je ralentis. [VITESSE:tres_lent]')).toBe('tres_lent');
  });

  test('sans balise, rien à appliquer', () => {
    expect(vitesseDemandee('On continue comme ça.')).toBe(null);
    expect(vitesseDemandee(null)).toBe(null);
  });

  test('deux balises : la dernière gagne, c’est celle qu’il va employer', () => {
    expect(vitesseDemandee('[VITESSE:rapide] pardon, plutôt [VITESSE:normal]')).toBe('normal');
  });

  test('les quatre vitesses du produit sont reconnues, une invention ne l’est pas', () => {
    VITESSES.forEach((v) => expect(estVitesseConnue(v.cle)).toBe(true));

    expect(estVitesseConnue('plus_lent')).toBe(false);
    expect(estVitesseConnue('slow')).toBe(false);
    expect(estVitesseConnue(undefined)).toBe(false);
  });
});

describe('ni vue, ni entendue', () => {
  const message = 'D’accord, je te le relis plus lentement. [VITESSE:lent]';

  test('la balise ne s’affiche pas dans la bulle', () => {
    const affiche = decouper(message).map((s) => s.contenu).join(' ');

    expect(affiche).not.toMatch(/VITESSE/);
    expect(affiche).toMatch(/relis plus lentement/);
  });

  test('la balise n’est jamais prononcée', () => {
    expect(texteParle(message)).not.toMatch(/VITESSE/);
    expect(texteParle(message)).toMatch(/relis plus lentement/);
  });

  test('la forme nue non plus', () => {
    const avecFenetre = `Choisis la vitesse que tu préfères. ${VITESSE_CHOIX}`;

    expect(decouper(avecFenetre).map((s) => s.contenu).join(' ')).not.toMatch(/VITESSE/);
    expect(texteParle(avecFenetre)).not.toMatch(/VITESSE/);
    expect(texteParle(avecFenetre)).toMatch(/Choisis la vitesse/);
  });
});
