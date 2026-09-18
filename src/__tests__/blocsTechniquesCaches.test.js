import { decouper, texteParle } from '../lib/storage/ardoise';

/**
 * AUCUN BLOC TECHNIQUE NE SE VOIT NI NE S'ENTEND.
 *
 * LE DÉFAUT QUI A FAIT ÉCRIRE CE FICHIER — Camara, le 18/09/2026 : « je suis
 * rentré en cours et j'ai vu ce gros bloc là ». Le bloc [EXPRESSION_ORALE] tout
 * entier — titre, langue, chaque réplique, la remarque — s'affichait dans la
 * bulle du professeur ET se faisait prononcer à voix haute. Un enfant a entendu
 * « titre deux points commander au restaurant ».
 *
 * LA LEÇON, ET ELLE VAUT POUR TOUT CE QU'ON AJOUTERA : un bloc n'est pas masqué
 * parce que la consigne du professeur dit qu'il ne doit pas l'être. Il est
 * masqué parce qu'il est dans la liste de `retirerMarqueurs`. J'avais écrit
 * « CE BLOC N'EST JAMAIS AFFICHÉ NI PRONONCÉ » dans la consigne, et je ne
 * l'avais ajouté nulle part.
 *
 * DEUX SORTIES À VÉRIFIER, TOUJOURS. `decouper` sert l'AFFICHAGE, `texteParle`
 * sert la VOIX. Deux de mes trois nouveautés étaient nettoyées à l'affichage
 * seulement — chacune avait son propre filtre dans `Chat.js`, qui ne voit pas
 * la synthèse vocale. Le professeur les prononçait.
 */

const affiche = (texte) => decouper(texte)
  .filter((s) => s.type === 'texte')
  .map((s) => s.contenu)
  .join(' ');

const BLOC = [
  'Bravo pour cette conversation !',
  '[EXPRESSION_ORALE]',
  'titre: Commander au restaurant',
  'langue: en',
  'eleve: Hello, I would like a pizza please.',
  'prof: Of course! Which one would you like?',
  'remarque: Il ose des phrases complètes.',
  '[/EXPRESSION_ORALE]',
].join('\n');

describe('Le bloc [EXPRESSION_ORALE]', () => {
  test('ne s’affiche pas', () => {
    const vu = affiche(BLOC);

    expect(vu).toContain('Bravo pour cette conversation');
    expect(vu).not.toMatch(/titre\s*:/i);
    expect(vu).not.toMatch(/EXPRESSION_ORALE/);
    expect(vu).not.toContain('Commander au restaurant');
  });

  test('ne se prononce pas', () => {
    const dit = texteParle(BLOC);

    expect(dit).toContain('Bravo pour cette conversation');
    expect(dit).not.toMatch(/titre\s*:/i);
    expect(dit).not.toMatch(/EXPRESSION_ORALE/);
    expect(dit).not.toContain('Commander au restaurant');
  });
});

describe('Les marqueurs isolés', () => {
  test('[CONVERSATION] ne se voit ni ne s’entend', () => {
    const texte = 'On parle un peu ? [CONVERSATION]';

    expect(affiche(texte)).not.toContain('CONVERSATION');
    expect(texteParle(texte)).not.toContain('CONVERSATION');
    expect(texteParle(texte)).toContain('On parle un peu');
  });

  test('[SUPPORT_EVALUATION] non plus', () => {
    const texte = 'Je te conseille ton cahier. [SUPPORT_EVALUATION]';

    expect(affiche(texte)).not.toContain('SUPPORT_EVALUATION');
    expect(texteParle(texte)).not.toContain('SUPPORT_EVALUATION');
    expect(texteParle(texte)).toContain('Je te conseille ton cahier');
  });
});

/**
 * LE FILET POUR LA SUITE. Cette liste est celle des blocs que le professeur
 * peut écrire ; chacun doit disparaître des deux sorties. Un bloc ajouté au
 * produit sans être ajouté ici se verra dans ce test avant de se voir en
 * séance.
 */
describe('Tous les blocs connus', () => {
  const BLOCS = [
    'EVALUATION', 'RAPPORT', 'FICHE', 'CONTROLE_PROGRAMME', 'CONTROLE_NOTIONS',
    'CONTROLE_PRET', 'EXAMEN_PRET', 'EVALUATION_CORRIGEE', 'CONTROLE_RESULTAT',
    'COPIE_CONTROLE', 'EVALUATION_PREVUE', 'DICTEE_CORRIGEE',
    'COMPREHENSION_ORALE', 'EXPRESSION_ORALE',
  ];

  test.each(BLOCS)('[%s] ne sort ni à l’écran ni à la voix', (nom) => {
    const texte = `Avant. [${nom}]\ncontenu secret\n[/${nom}] Après.`;

    expect(affiche(texte)).not.toContain('contenu secret');
    expect(texteParle(texte)).not.toContain('contenu secret');
    expect(texteParle(texte)).toContain('Avant');
  });
});
