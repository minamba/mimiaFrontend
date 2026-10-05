/**
 * LA PHRASE DITE DEUX FOIS — Camara, le 03/10/2026 : « parfois les
 * professeurs répètent plusieurs fois la même phrase ».
 *
 * Le texte ne s'affichait qu'une fois, et au banc Gemini a redit la phrase
 * exacte 10 fois sur 10 sans jamais la répéter : le doublon ne venait ni de
 * l'écran ni du modèle, mais du repère de lecture — un NOMBRE de caractères,
 * utilisé tantôt sur le tampon du flux, tantôt sur le message enregistré.
 *
 * Ces tests protègent la règle qui l'a remplacé : on compare les TEXTES.
 */

import { suiteADire, resteApres, sansBorneEntamee } from '../lib/storage/suiteADire';

const DEBUT = 'Salut Bilal, contente de te retrouver !';
const SUITE = " On avait deux choses en suspens : la conversation au café, et « drunk ».";
const FIN = " Tu veux reprendre l'une des deux, ou t'as autre chose en tête aujourd'hui ?";

describe('le cas ordinaire : le texte grandit', () => {
  test('rien dit encore : tout est à dire', () => {
    expect(suiteADire('', DEBUT)).toEqual({ aDire: DEBUT, dit: DEBUT, nouveauTour: false });
  });

  test('seule la suite est confiée au lecteur', () => {
    const { aDire, dit } = suiteADire(DEBUT, DEBUT + SUITE);

    expect(aDire).toBe(SUITE);
    expect(dit).toBe(DEBUT + SUITE);
  });

  test('le texte n’a pas bougé : il n’y a rien à dire', () => {
    expect(suiteADire(DEBUT, DEBUT).aDire).toBe('');
  });

  test('la fin du message ne redit jamais le début', () => {
    // Le second chemin : le message est versé au fil, on rattrape la fin.
    const { aDire } = suiteADire(DEBUT + SUITE, DEBUT + SUITE + FIN);

    expect(aDire).toBe(FIN);
    expect(aDire).not.toContain('contente de te retrouver');
  });
});

describe('le texte raccourcit sans rien contredire', () => {
  // Une borne arrive en deux paquets réseau : « [ARDO » est du texte
  // prononçable, et il disparaît quand « ISE] » le complète.
  test('une borne recomposée ne fait pas tout redire', () => {
    const avec = `${DEBUT} [ARDO`;
    const { aDire, dit, nouveauTour } = suiteADire(avec, DEBUT);

    expect(aDire).toBe('');
    expect(nouveauTour).toBe(false);
    expect(dit).toBe(DEBUT);
  });

  test('et la suite qui arrive après se dit, elle, une seule fois', () => {
    const apresRognage = suiteADire(`${DEBUT} [ARDO`, DEBUT).dit;

    expect(suiteADire(apresRognage, DEBUT + SUITE).aDire).toBe(SUITE);
  });
});

describe('un texte vide ne signale rien', () => {
  // L'état entre deux tours de parole. Sans cette borne, le repère retombait
  // à vide à chaque fin de flux, et le message suivant repartait du début.
  test('le repère ne bouge pas', () => {
    expect(suiteADire(DEBUT, '')).toEqual({ aDire: '', dit: DEBUT, nouveauTour: false });
  });
});

describe('un texte qui en contredit un autre', () => {
  test('c’est un nouveau tour, et il est signalé', () => {
    const { aDire, dit, nouveauTour } = suiteADire(DEBUT, 'Très bien ! On reprend la dictée.');

    expect(nouveauTour).toBe(true);
    expect(aDire).toBe('Très bien ! On reprend la dictée.');
    expect(dit).toBe('Très bien ! On reprend la dictée.');
  });

  test('une réponse plus courte que la précédente reste entendue en entier', () => {
    // L'élève coupe la parole : le flux repart de zéro sans que la fin de
    // message ait eu lieu. C'est le défaut que l'ancienne règle de longueur
    // traitait, et qu'il ne faut pas réintroduire.
    expect(suiteADire(DEBUT + SUITE, "D'accord !").aDire).toBe("D'accord !");
  });
});

// ------------------------------------------------------------------------
// LE PASSAGE D'ÉCOUTE JAMAIS LU — Camara, le 04/10/2026 : « dès le début de
// la compréhension orale, la voix de la prof a coupé ». Un paquet du flux
// s'était terminé sur « [E », la moitié de la balise du passage ; le repère
// l'avait avalé comme du texte, et plus rien ne « prolongeait » rien.
// ------------------------------------------------------------------------

describe('une borne coupée entre deux paquets', () => {
  const INTRO = 'Salut Mins ! On reprend l’histoire de Tom, je te la relis.\n\n';
  const PASSAGE = '\u0003Tom had always wanted to travel to Scotland.\u0004';

  test('la fin d’un paquet qui ressemble à un début de balise n’est pas confiée', () => {
    expect(sansBorneEntamee(`${INTRO}[E`)).toBe(INTRO);
    expect(sansBorneEntamee(`${INTRO}[`)).toBe(INTRO);
    expect(sansBorneEntamee(`${INTRO}[/ARDOI`)).toBe(INTRO);
  });

  test('un crochet qui n’ouvre pas une balise reste du texte', () => {
    expect(sansBorneEntamee('Regarde liste[0] et liste[1]')).toBe('Regarde liste[0] et liste[1]');
    expect(sansBorneEntamee('Une balise complète [EN]')).toBe('Une balise complète [EN]');
  });

  test('même si « [E » est entré dans le repère, le passage est dit ensuite', () => {
    // Le cas exact : le repère finit par la demi-balise, le texte final non.
    const { aDire, nouveauTour } = suiteADire(`${INTRO}[E`, INTRO + PASSAGE);

    expect(nouveauTour).toBe(false);
    expect(aDire).toBe(PASSAGE);
  });

  test('et l’introduction, déjà dite, ne l’est pas une seconde fois', () => {
    const { aDire } = suiteADire(`${INTRO}[E`, INTRO + PASSAGE);

    expect(aDire).not.toContain('Salut Mins');
  });
});

describe('en fin de message, il y a toujours une suite à dire', () => {
  const DIT = 'Bonjour Bilal. On reprend la dictée sur Sarah au parc, je te la remets au tableau.';

  test('le texte final a changé plus haut : on reprend après ce qui a été dit', () => {
    // Le serveur a corrigé une tournure au début ; la fin dite est intacte.
    const final = `Bonjour Bilal ! ${DIT.slice(15)} Regarde l’erreur n°3.`;

    expect(resteApres(DIT, final)).toBe(' Regarde l’erreur n°3.');
  });

  test('sans repère retrouvé, on reprend à la même longueur — jamais muet', () => {
    const final = `${'x'.repeat(DIT.length)} et la suite.`;

    expect(resteApres(DIT, final)).toBe(' et la suite.');
  });

  test('rien n’avait été dit : tout le message est à dire', () => {
    expect(resteApres('', 'Au revoir, à demain !')).toBe('Au revoir, à demain !');
  });
});
