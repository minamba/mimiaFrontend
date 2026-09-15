/**
 * TOUT BLOC DU PROMPT EST INVISIBLE ET MUET — sans exception, et sans oubli.
 *
 * Relevé par Camara le 13/09/2026 : « [EVALUATION_PREVUE] notion: Utiliser la
 * réciproque de Thalès » affiché tel quel dans la bulle du professeur, et lu à
 * voix haute avec ses crochets. Le bloc existait depuis des semaines côté
 * prompt ; il manquait simplement à la liste des blocs masqués, et rien ne le
 * signalait tant qu'un professeur n'en écrivait pas un en séance.
 *
 * Ce test énumère CHAQUE bloc que le prompt peut produire. En ajouter un au
 * prompt sans l'ajouter ici doit casser un test, pas l'écran d'un enfant.
 */

import { decouper, texteParle } from '../lib/storage/ardoise';

const BLOCS = [
  'EVALUATION', 'RAPPORT', 'FICHE',
  'CONTROLE_PROGRAMME', 'CONTROLE_NOTIONS', 'CONTROLE_PRET', 'CONTROLE_RESULTAT', 'COPIE_CONTROLE',
  'EXAMEN_PRET',
  'EVALUATION_PREVUE', 'EVALUATION_CORRIGEE',
  'DICTEE_CORRIGEE', 'COMPREHENSION_ORALE',
  'DICTEE_SUPPRIMEE', 'COMPREHENSION_SUPPRIMEE', 'DICTEE_AU_TABLEAU',
];

const MARQUEURS = [
  'DEBUT_EVALUATION', 'EVALUATION_ABANDONNEE', 'DICTEE_ABANDONNEE',
  'FIN_SEANCE', 'TABLEAU_EFFACE', 'DEMANDE_DOCUMENT',
];

describe.each(BLOCS)('le bloc [%s]', (nom) => {
  const message = `Bonne chance pour ton contrôle ce soir.\n[${nom}]\nnotion: contenu secret\n[/${nom}]`;

  test('ne s’affiche pas', () => {
    const affiche = decouper(message).map((s) => s.contenu).join(' ');
    expect(affiche).not.toMatch(new RegExp(nom));
    expect(affiche).not.toMatch(/contenu secret/);
    expect(affiche).toMatch(/Bonne chance/);
  });

  test('ne se prononce pas', () => {
    const parle = texteParle(message);
    expect(parle).not.toMatch(new RegExp(nom));
    expect(parle).not.toMatch(/contenu secret/);
    expect(parle).toMatch(/Bonne chance/);
  });
});

describe.each(MARQUEURS)('le marqueur [%s]', (nom) => {
  const message = `Bonne chance pour ton contrôle ce soir. [${nom}]`;

  test('ne s’affiche pas et ne se prononce pas', () => {
    const affiche = decouper(message).map((s) => s.contenu).join(' ');
    expect(affiche).not.toMatch(new RegExp(nom));
    expect(texteParle(message)).not.toMatch(new RegExp(nom));
  });
});
