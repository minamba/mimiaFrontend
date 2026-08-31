/**
 * LA GOMME DU TABLEAU.
 *
 * Le professeur pouvait REMPLACER le contenu du tableau, jamais l'effacer. Un
 * bloc [ARDOISE] vide est ignoré, et le tableau remonte alors au dernier
 * contenu non vide — c'est-à-dire l'exercice d'avant.
 *
 * Relevé en fin de séance : l'élève demande « mets à jour le tableau ». Le
 * professeur répond « on efface le tableau pour aujourd'hui », puis « Effacé,
 * Bilal, ne t'en fais pas ! ». Le tableau affichait toujours « Sa sœur les a
 * (fermer) ce soir. » Ce n'était pas une consigne ignorée : il n'avait aucun
 * moyen de le faire.
 *
 * Ces tests tiennent les deux moitiés : le marqueur efface, et il ne se voit
 * ni ne s'entend.
 */

import {
  TABLEAU_EFFACE,
  effaceLeTableau,
  extraireArdoises,
  decouper,
  texteParle,
} from '../lib/storage/ardoise';

/**
 * La règle du tableau, telle que Chat.js l'applique : on remonte les messages
 * du plus récent au plus ancien et on s'arrête au PREMIER geste — écriture ou
 * effacement.
 */
const tableauAffiche = (messages) => {
  const lire = (texte) => {
    const trouves = extraireArdoises(texte);
    if (trouves.length > 0) return { valeur: trouves[trouves.length - 1] };
    if (effaceLeTableau(texte)) return { valeur: null };
    return null;
  };

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const geste = lire(messages[i]);
    if (geste) return geste.valeur;
  }

  return null;
};

test('le marqueur efface vraiment, au lieu de laisser remonter l’exercice d’avant', () => {
  const seance = [
    'Vas-y, calcule ça.\n[ARDOISE]\nSa sœur les a (fermer) ce soir.\n[/ARDOISE]',
    'Bien joué. On efface le tableau pour aujourd’hui.\n' + TABLEAU_EFFACE,
  ];

  expect(tableauAffiche(seance)).toBeNull();

  // Et sans le marqueur, c'est exactement la panne constatée : le tableau
  // remonte à l'exercice précédent et l'élève voit une chose fausse.
  const sansGomme = [seance[0], 'Effacé, Bilal, ne t’en fais pas !'];
  expect(tableauAffiche(sansGomme)).toBe('Sa sœur les a (fermer) ce soir.');
});

test('un bloc [ARDOISE] vide n’efface RIEN — c’est pour ça qu’il faut un marqueur', () => {
  const seance = [
    'Regarde.\n[ARDOISE]\n23 × 14 = ?\n[/ARDOISE]',
    'On efface.\n[ARDOISE]\n[/ARDOISE]',
  ];

  expect(tableauAffiche(seance)).toBe('23 × 14 = ?');
});

test('la gomme ne se voit pas et ne s’entend pas', () => {
  const message = 'On efface le tableau pour aujourd’hui.\n' + TABLEAU_EFFACE;

  expect(texteParle(message)).not.toMatch(/TABLEAU_EFFACE/);
  expect(decouper(message).map((s) => s.contenu).join('')).not.toMatch(/TABLEAU_EFFACE/);

  // Ce qui reste est bien la phrase, entière.
  expect(texteParle(message).trim()).toBe('On efface le tableau pour aujourd’hui.');
});

test('une écriture postérieure l’emporte sur un effacement', () => {
  const seance = [
    'Premier.\n[ARDOISE]\n2 + 2 = ?\n[/ARDOISE]',
    'On efface.\n' + TABLEAU_EFFACE,
    'Nouvel exercice.\n[ARDOISE]\n3 × 5 = ?\n[/ARDOISE]',
  ];

  expect(tableauAffiche(seance)).toBe('3 × 5 = ?');
});

test('un message ordinaire ne touche pas au tableau', () => {
  const seance = [
    'Regarde.\n[ARDOISE]\n23 × 14 = ?\n[/ARDOISE]',
    'Prends ton temps.',
    'Alors, tu trouves quoi ?',
  ];

  expect(tableauAffiche(seance)).toBe('23 × 14 = ?');
  expect(effaceLeTableau('Prends ton temps.')).toBe(false);
});
