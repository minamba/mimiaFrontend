/**
 * LA LECTURE À VOIX HAUTE (06/11/2026) — le signalement de Hilda : « pour les phrases suivantes, l'enfant
 * entend la phrase avant de devoir la lire ». Pendant l'exercice, la voix ne souffle jamais une phrase du texte
 * au tableau, sauf celle que l'élève vient de lire.
 */
import {
  estATaire, lectureEnCours, phrasesATaire, sansPhrasesATaire, texteALire, BALISE_LECTURE,
} from '../lib/lectureAVoixHaute';
import { texteParle, decouper } from '../lib/storage/ardoise';

const TEXTE = 'Tom a un vélo.\nLe vélo est rouge.\nIl roule vite.';
const ouverture = {
  role: 'assistant',
  contenu: `${BALISE_LECTURE}\nOn va lire une petite histoire.\n[ARDOISE]\n${TEXTE}\n[/ARDOISE]\nLis la première phrase au tableau.`,
};

describe('l’exercice et son texte', () => {
  it('ouvert par la balise, ou par « lis la phrase »', () => {
    expect(lectureEnCours([ouverture])).toBe(true);
    expect(lectureEnCours([{ role: 'assistant', contenu: 'Lis la deuxième phrase au tableau.' }])).toBe(true);
    expect(lectureEnCours([{ role: 'assistant', contenu: 'Combien font 3 + 4 ?' }])).toBe(false);
  });

  it('le texte à lire est le dernier tableau', () => {
    expect(texteALire([ouverture])).toBe(TEXTE);
  });

  it('la balise n’est ni affichée ni dite', () => {
    expect(texteParle(ouverture.contenu)).not.toContain('EXERCICE_LECTURE');
    expect(JSON.stringify(decouper(ouverture.contenu))).not.toContain('EXERCICE_LECTURE');
  });
});

describe('ce que la voix tait', () => {
  it('avant toute lecture : les trois phrases', () => {
    const aTaire = phrasesATaire([{ role: 'user', contenu: 'Oui je veux lire' }, ouverture]);
    expect(aTaire).toEqual(['tom a un velo', 'le velo est rouge', 'il roule vite']);
  });

  it('LE CAS DE HILDA : la 2e phrase dite dans la bulle ne part pas à la voix', () => {
    const messages = [ouverture, { role: 'user', contenu: 'Tom a un vélo' }];
    const aTaire = phrasesATaire(messages, 'Bravo ! Maintenant lis : « Le vélo est rouge. » Vas-y.');
    expect(estATaire('Maintenant lis : « Le vélo est rouge. »', aTaire)).toBe(true);
    expect(estATaire('Bravo !', aTaire)).toBe(false);
  });

  it('APRÈS SON ESSAI, la phrase qu’il vient de lire peut être relue ; jamais la suivante', () => {
    const messages = [ouverture, { role: 'user', contenu: 'le vélo et rouge' }];
    const aTaire = phrasesATaire(messages);
    expect(estATaire('Écoute : « Le vélo est rouge. »', aTaire)).toBe(false);
    expect(estATaire('La suite : il roule vite.', aTaire)).toBe(true);
  });

  it('hors de l’exercice, rien n’est tu', () => {
    expect(phrasesATaire([{ role: 'assistant', contenu: '[ARDOISE]\n3 + 4 = 7\n[/ARDOISE]\nBien joué.' }])).toEqual([]);
  });

  it('la fin d’un flux sans ponctuation est filtrée aussi', () => {
    expect(sansPhrasesATaire('Super. Lis : il roule vite', ['il roule vite'])).toBe('Super. ');
  });
});

describe('dans le lecteur de la voix', () => {
  // eslint-disable-next-line global-require
  const { voixService } = require('../lib/storage/voixService');

  it('la phrase à lire est sautée, le reste est dit', () => {
    const lecteur = voixService.creerLecteur();
    const dits = [];
    lecteur.enfiler = (texte) => dits.push(texte);
    lecteur.taire(['le velo est rouge']);

    lecteur.alimenter('Bravo, tu as bien lu ! Maintenant lis : « Le vélo est rouge. » Vas-y, je t’écoute. ');
    lecteur.terminer();

    const tout = dits.join(' ');
    expect(tout).toContain('Bravo, tu as bien lu');
    expect(tout).toContain('je t’écoute');
    expect(tout).not.toMatch(/rouge/i);
  });

  it('sans exercice, tout est dit', () => {
    const lecteur = voixService.creerLecteur();
    const dits = [];
    lecteur.enfiler = (texte) => dits.push(texte);
    lecteur.taire([]);

    lecteur.alimenter('Le vélo est rouge. ');
    lecteur.terminer();

    expect(dits.join(' ')).toContain('Le vélo est rouge.');
  });
});

describe('ce que l’enfant lit au micro ne s’écrit pas dans le fil (06/11/2026)', () => {
  // eslint-disable-next-line global-require
  const { marquerLecture, estLectureEntendue, MARQUEUR_LU } = require('../lib/lectureAVoixHaute');

  it('marqué pour le professeur, reconnu pour la bulle', () => {
    const contenu = marquerLecture('La poule picore.');
    expect(contenu).toBe(`${MARQUEUR_LU} La poule picore.`);
    expect(estLectureEntendue(contenu)).toBe(true);
    expect(estLectureEntendue('La poule picore.')).toBe(false);
  });

  it('le marqueur n’est jamais affiché ni dit', () => {
    expect(texteParle(marquerLecture('Le chat dort.'))).not.toContain('LU_A_VOIX_HAUTE');
  });

  it('« Lis-la à voix haute » ouvre aussi l’exercice', () => {
    expect(lectureEnCours([{ role: 'assistant', contenu: 'Voici une nouvelle phrase. Lis-la à voix haute, s’il te plaît.' }])).toBe(true);
  });

  it('la phrase qu’il vient de lire se reconnaît malgré le marqueur', () => {
    const messages = [ouverture, { role: 'user', contenu: marquerLecture('le vélo et rouge') }];
    expect(estATaire('Écoute : « Le vélo est rouge. »', phrasesATaire(messages))).toBe(false);
  });
});

describe('en anglais aussi (06/11/2026)', () => {
  const ouvertureEn = {
    role: 'assistant',
    contenu: `${BALISE_LECTURE}\nOn lit en anglais !\n[ARDOISE]\nThe cat is black.\nI like apples.\n[/ARDOISE]\nRead the first sentence.`,
  };

  it('« read the sentence » ouvre l’exercice', () => {
    expect(lectureEnCours([{ role: 'assistant', contenu: 'Great! Now read the next sentence.' }])).toBe(true);
    expect(lectureEnCours([{ role: 'assistant', contenu: 'Can you read this word aloud?' }])).toBe(true);
  });

  it('une phrase anglaise du tableau, dite par Marine dans [EN], ne part pas à la voix', () => {
    const messages = [ouvertureEn, { role: 'user', contenu: marquerLectureEn('the cat is black') }];
    const aTaire = phrasesATaire(messages);
    expect(estATaire('I like apples.', aTaire)).toBe(true);
    // La phrase qu'il vient de lire peut être relue pour la prononciation.
    expect(estATaire('The cat is black.', aTaire)).toBe(false);
  });

  it('dans le lecteur : le passage [EN] soufflé est sauté', () => {
    // eslint-disable-next-line global-require
    const { voixService } = require('../lib/storage/voixService');
    const lecteur = voixService.creerLecteur();
    const dits = [];
    lecteur.enfiler = (texte) => dits.push(texte);
    lecteur.taire(['i like apples']);
    lecteur.alimenter(texteParle('Bravo ! Maintenant : [EN]I like apples.[/EN] À toi. ', { bornes: true }));
    lecteur.terminer();
    expect(dits.join(' ')).not.toMatch(/apples/i);
    expect(dits.join(' ')).toContain('Bravo');
  });
});

// eslint-disable-next-line global-require
function marquerLectureEn(t) { return require('../lib/lectureAVoixHaute').marquerLecture(t); }
