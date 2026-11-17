import { demandeDeChangement, depuisLaDemande } from '../lib/changementDExercice';
import { lectureEnCours, BALISE_LECTURE } from '../lib/lectureAVoixHaute';

// Signalement d'une famille, 14/11/2026 (Adrien, CP) : l'élève demande un nouvel exercice, le professeur revient à
// l'ancien. Les mêmes phrases que le banc du serveur (ChangementDExercice.cs) : les deux listes doivent rester jumelles.

describe('demandeDeChangement', () => {
  test.each([
    'Propose-moi un nouvel exercice.',
    'Je veux un autre exercice',
    'Autre exercice',
    'On change d’exercice ?',
    "Change d'exercice",
    "Tu peux me donner un autre exercice s'il te plaît ?",
    'on change',
    'Je veux changer.',
    'Je veux faire autre chose',
    'On passe à autre chose ?',
    'Autre chose.',
    'Une autre activité',
    'Donne-moi un exercice',
    "L'exercice suivant",
    "J'en ai marre",
    "J'en ai marre des syllabes.",
    'Je veux plus faire ça',
    'Je veux arrêter les syllabes',
    'On arrête cet exercice',
    "J'ai plus envie",
    '[LU_A_VOIX_HAUTE] Je veux un autre exercice',
  ])('« %s » est une demande', (phrase) => {
    expect(demandeDeChangement(phrase)).toBe(true);
  });

  test.each([
    'Une autre syllabe',
    "Un autre mot s'il te plaît",
    'Change de syllabe',
    'On change de mot',
    "T'as encore changé d'exercice",
    "Pourquoi tu changes d'exercice ?",
    "Je veux pas changer d'exercice",
    "Non, pas d'autre exercice",
    "J'ai entendu autre chose",
    "J'ai lu la syllabe jo.",
    "J'ai entendu le mot stop.",
    'stop',
    'Arrête',
    "Je veux plus d'exercices",
    'Le chat dort sur le lit.',
    'Je sais pas',
    '',
    null,
  ])('« %s » n’en est pas une', (phrase) => {
    expect(demandeDeChangement(phrase)).toBe(false);
  });
});

describe('la lecture à voix haute se ferme à sa demande', () => {
  const exercice = [
    { role: 'assistant', contenu: `${BALISE_LECTURE}\n[ARDOISE]Le chat dort.\nLa lune brille.[/ARDOISE]\nLis la première phrase au tableau.` },
    { role: 'user', contenu: '[LU_A_VOIX_HAUTE] Le chat dort.' },
    { role: 'assistant', contenu: 'Bravo ! Lis la phrase suivante.' },
  ];

  test('sans demande, l’exercice est en cours', () => {
    expect(lectureEnCours(exercice)).toBe(true);
    expect(depuisLaDemande(exercice)).toHaveLength(exercice.length);
  });

  test('après « un autre exercice », il ne l’est plus, même si le professeur répond sans rien rouvrir', () => {
    const suite = [
      ...exercice,
      { role: 'user', contenu: 'Je veux un autre exercice' },
      { role: 'assistant', contenu: 'D’accord ! Combien y a-t-il de lettres dans le mot « chat » ?' },
    ];
    expect(lectureEnCours(suite)).toBe(false);
  });

  test('le professeur rouvre une lecture après la demande : elle compte', () => {
    const suite = [
      ...exercice,
      { role: 'user', contenu: 'On change d’exercice' },
      { role: 'assistant', contenu: 'D’accord, un nouveau texte ! [ARDOISE]Le vélo est rouge.[/ARDOISE] Lis la phrase au tableau.' },
    ];
    expect(lectureEnCours(suite)).toBe(true);
  });

  test('une réponse jugée n’est jamais une demande', () => {
    const suite = [...exercice, { role: 'user', contenu: 'on change', sonJuste: false }];
    expect(depuisLaDemande(suite)).toHaveLength(suite.length);
  });
});
