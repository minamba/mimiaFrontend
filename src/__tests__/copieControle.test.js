/**
 * LA COPIE D'UN CONTRÔLE PASSÉ — la mécanique, sans écran.
 *
 * Voulu par Camara le 13/09/2026 : la question « L'énoncé et ta copie
 * sont-ils séparés ? », puis trois boutons si oui, deux si non ; le professeur
 * n'analyse rien avant d'avoir tout reçu ; et la question passe
 * OBLIGATOIREMENT à chaque nouvelle demande.
 *
 * Les marqueurs sont partagés avec `LecteurCopieControle.cs` : si ce test
 * change la forme d'un marqueur, le serveur doit changer avec.
 */

import {
  boutonsCopie, etatCopieControle, lireChoixCopie, lireDemandeCopie, lirePieceControle,
  marquerChoixCopie, marquerPieceControle, retirerMarqueurCopieControle,
} from '../lib/storage/copieControle';

const PROF = (contenu) => ({ role: 'assistant', contenu });
const ELEVE = (contenu, pieceJointe = null) => ({ role: 'user', contenu, pieceJointe });
const PIECE = { id: 7, estImage: true };

const DEMANDE = PROF('On la regarde ensemble ?\n[COPIE_CONTROLE]\ncontrole: 42\n[/COPIE_CONTROLE]');

test('le bloc du professeur donne le numéro du contrôle, écrit sur une ligne ou plusieurs', () => {
  expect(lireDemandeCopie(DEMANDE.contenu)).toBe(42);
  expect(lireDemandeCopie('[COPIE_CONTROLE] controle: 7 [/COPIE_CONTROLE]')).toBe(7);
  expect(lireDemandeCopie('Rien à voir.')).toBeNull();
});

test('les pièces se relisent exactement comme elles ont été écrites', () => {
  expect(lirePieceControle(marquerPieceControle('', 'enonce', 42))).toEqual({ controleId: 42, role: 'enonce' });
  expect(lirePieceControle(marquerPieceControle('', 'copie', 42))).toEqual({ controleId: 42, role: 'copie' });

  // L'ancien choix par message n'est pas une pièce.
  expect(lirePieceControle(marquerChoixCopie(true, 42))).toBeNull();
  expect(lireChoixCopie(marquerChoixCopie(false, 42))).toEqual({ controleId: 42, separee: false });
});

test('la bulle de l’élève dit ce qu’il envoie, sans montrer le marqueur', () => {
  const message = marquerPieceControle('', 'enonce', 42);

  expect(message).toMatch(/Voici l’énoncé de mon contrôle\./);
  expect(retirerMarqueurCopieControle(message)).toBe('Voici l’énoncé de mon contrôle.');
});

test('avant la réponse : la question, aucun bouton d’envoi', () => {
  const etat = etatCopieControle([DEMANDE]);

  expect(etat).toEqual({
    cle: '0:42', controleId: 42, separee: null, enonceRecu: false, copieRecue: false, complet: false,
  });
  expect(boutonsCopie(etat)).toEqual([]);
});

test('OUI : trois boutons — Importer l’énoncé, Importer ma copie, Scanner ma copie', () => {
  const etat = etatCopieControle([DEMANDE], { '0:42': true });

  expect(boutonsCopie(etat).map((b) => b.libelle))
    .toEqual(['Importer l’énoncé', 'Importer ma copie', 'Scanner ma copie']);
});

test('NON : deux boutons seulement — Importer ma copie, Scanner ma copie', () => {
  const etat = etatCopieControle([DEMANDE], { '0:42': false });

  expect(boutonsCopie(etat).map((b) => b.libelle)).toEqual(['Importer ma copie', 'Scanner ma copie']);
});

test('le choix ne demande AUCUN message : la carte avance sans que le professeur ait rien à répondre', () => {
  // Relevé par Camara le 13/09/2026 : « Oui » partait comme un message, et le
  // professeur répondait « J'ai bien reçu » à une pièce inexistante.
  const etat = etatCopieControle([DEMANDE], { '0:42': true });

  expect(etat.separee).toBe(true);
  expect(etat.enonceRecu).toBe(false);
  expect(etat.copieRecue).toBe(false);
});

test('OUI, énoncé reçu : il manque la copie — ce n’est PAS complet, dans un ordre comme dans l’autre', () => {
  const enonceDabord = etatCopieControle(
    [DEMANDE, ELEVE(marquerPieceControle('', 'enonce', 42), PIECE)],
    { '0:42': true },
  );

  expect(enonceDabord.complet).toBe(false);
  expect(boutonsCopie(enonceDabord).map((b) => b.libelle)).toEqual(['Importer ma copie', 'Scanner ma copie']);

  const copieDabord = etatCopieControle(
    [DEMANDE, ELEVE(marquerPieceControle('', 'copie', 42), PIECE)],
    { '0:42': true },
  );

  expect(copieDabord.complet).toBe(false);
  expect(boutonsCopie(copieDabord).map((b) => b.libelle)).toEqual(['Importer l’énoncé']);
});

test('OUI, les deux reçus : complet, plus aucun bouton', () => {
  const etat = etatCopieControle([
    DEMANDE,
    ELEVE(marquerPieceControle('', 'copie', 42), PIECE),
    PROF('J’ai bien ta copie, j’attends l’énoncé.'),
    ELEVE(marquerPieceControle('', 'enonce', 42), PIECE),
  ], { '0:42': true });

  expect(etat.complet).toBe(true);
  expect(boutonsCopie(etat)).toEqual([]);
});

test('NON, la copie reçue suffit', () => {
  const etat = etatCopieControle(
    [DEMANDE, ELEVE(marquerPieceControle('', 'copie', 42), PIECE)],
    { '0:42': false },
  );

  expect(etat.complet).toBe(true);
});

test('un marqueur SANS document ne compte pas comme reçu — même règle que le serveur', () => {
  const etat = etatCopieControle(
    [DEMANDE, ELEVE(marquerPieceControle('', 'copie', 42))],
    { '0:42': false },
  );

  expect(etat.copieRecue).toBe(false);
  expect(etat.complet).toBe(false);
});

test('UNE NOUVELLE DEMANDE REPOSE LA QUESTION, même sur un contrôle déjà regardé', () => {
  // Relevé par Camara le 13/09/2026 : la copie de Thalès avait déjà été
  // regardée ; quand on en reparle, la question doit revenir.
  const messages = [
    DEMANDE,
    ELEVE(marquerPieceControle('', 'copie', 42), PIECE),
    PROF('On en reparle ?\n[COPIE_CONTROLE]\ncontrole: 42\n[/COPIE_CONTROLE]'),
  ];

  const etat = etatCopieControle(messages, { '0:42': false });

  expect(etat.cle).toBe('2:42');
  expect(etat.separee).toBeNull();
  expect(etat.copieRecue).toBe(false);
});

test('une séance close emporte la carte', () => {
  expect(etatCopieControle([DEMANDE, PROF('À demain ! [FIN_SEANCE]')])).toBeNull();
  expect(etatCopieControle([PROF('Bonjour !')])).toBeNull();
});
