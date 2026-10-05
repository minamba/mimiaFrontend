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

import { decouper } from '../lib/storage/ardoise';
import {
  boutonsCopie, etatCopieControle, lireChoixCopie, lireDemandeCopie, lirePieceControle,
  marquerChoixCopie, marquerPieceControle, retirerMarqueurCopieControle,
  lireStyleCorrection, marquerStyleCorrection, STYLE_AIDE, STYLE_EXPLIQUE,
  lirePiecesControle, marquerPiecesControle,
} from '../lib/storage/copieControle';

const PROF = (contenu) => ({ role: 'assistant', contenu });
const retirerMarqueursAffichage = (texte) => decouper(texte).map((seg) => seg.contenu).join('');
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
    erreur: null, total: null, style: null, termine: false,
  });
  expect(boutonsCopie(etat)).toEqual([]);
});

test('OUI : les mêmes moyens pour les deux feuilles — importer, photographier, scanner', () => {
  const etat = etatCopieControle([DEMANDE], { '0:42': true });

  // Camara, le 26/09/2026 : l'énoncé aussi se scanne, et les deux se prennent
  // en photo avec la caméra de l'ordinateur quand il y en a une.
  expect(boutonsCopie(etat).map((b) => b.libelle))
    .toEqual(['Importer l’énoncé', 'Scanner l’énoncé', 'Importer ma copie', 'Scanner ma copie']);

  expect(boutonsCopie(etat, { photo: true }).map((b) => b.libelle)).toEqual([
    'Importer l’énoncé', 'Photographier l’énoncé', 'Scanner l’énoncé',
    'Importer ma copie', 'Photographier ma copie', 'Scanner ma copie',
  ]);
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
  expect(boutonsCopie(copieDabord).map((b) => b.libelle)).toEqual(['Importer l’énoncé', 'Scanner l’énoncé']);
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

describe('comment corriger la copie — Camara, le 26/09/2026', () => {
  // Remontée d'un parent : sa fille voulait se corriger seule, et le
  // professeur lui a donné les réponses. Une fois la copie reçue, l'enfant
  // choisit ; le marqueur est lu mot pour mot par `LecteurCopieControle.LireStyle`.
  const COMPLETE = [
    DEMANDE,
    ELEVE(marquerPieceControle('', 'copie', 42), PIECE),
  ];

  test('le choix se relit exactement comme il a été écrit', () => {
    expect(lireStyleCorrection(marquerStyleCorrection(STYLE_AIDE, 42)))
      .toEqual({ controleId: 42, style: STYLE_AIDE });
    expect(lireStyleCorrection(marquerStyleCorrection(STYLE_EXPLIQUE, 42)))
      .toEqual({ controleId: 42, style: STYLE_EXPLIQUE });
    expect(lireStyleCorrection('Rien à voir.')).toBeNull();
  });

  test('la bulle dit le choix, sans montrer le marqueur', () => {
    expect(retirerMarqueurCopieControle(marquerStyleCorrection(STYLE_AIDE, 42)))
      .toBe('Aide-moi à me corriger.');
    expect(retirerMarqueurCopieControle(marquerStyleCorrection(STYLE_EXPLIQUE, 42)))
      .toBe('Corrige et explique-moi.');
  });

  test('copie reçue, pas encore de choix : le style est inconnu', () => {
    const etat = etatCopieControle(COMPLETE, { '0:42': false });
    expect(etat.complet).toBe(true);
    expect(etat.style).toBeNull();
  });

  const ERREUR = (n, total = 3) => PROF(`Regardons l’exercice ${n}.\n[ERREUR ${n}/${total}]`);

  test('le dernier choix l’emporte : « Finalement, corrige et explique-moi »', () => {
    const aide = [...COMPLETE, ERREUR(1), ELEVE(marquerStyleCorrection(STYLE_AIDE, 42))];
    expect(etatCopieControle(aide, { '0:42': false }).style).toBe(STYLE_AIDE);

    const change = [...aide, PROF('Qu’en penses-tu ?'), ELEVE(marquerStyleCorrection(STYLE_EXPLIQUE, 42))];
    expect(etatCopieControle(change, { '0:42': false }).style).toBe(STYLE_EXPLIQUE);
  });

  test('ERREUR PAR ERREUR : la suivante repose la question — Camara, le 26/09/2026', () => {
    const seance = [
      ...COMPLETE,
      ERREUR(1),
      ELEVE(marquerStyleCorrection(STYLE_AIDE, 42)),
      PROF('Bravo, tu as trouvé !\nPassons à l’exercice 2.\n[ERREUR 2/3]'),
    ];

    const etat = etatCopieControle(seance, { '0:42': false });
    expect(etat.erreur).toBe(2);
    expect(etat.total).toBe(3);
    // Le choix fait pour l'erreur 1 ne vaut pas pour la 2 : la question revient.
    expect(etat.style).toBeNull();
  });

  test('avant la première erreur, pas de style ; après la dernière, la correction est terminée', () => {
    const avant = etatCopieControle(COMPLETE, { '0:42': false });
    expect(avant.erreur).toBeNull();
    expect(avant.style).toBeNull();

    const fin = etatCopieControle([
      ...COMPLETE,
      ERREUR(1, 1),
      ELEVE(marquerStyleCorrection(STYLE_EXPLIQUE, 42)),
      PROF('Tu as tout compris.\n[CORRECTION_TERMINEE]'),
    ], { '0:42': false });

    expect(fin.termine).toBe(true);
    expect(fin.style).toBeNull();
  });

  test('les balises ne s’affichent ni ne se disent', () => {
    expect(retirerMarqueursAffichage('Regardons l’exercice 2.\n[ERREUR 2/3]')).not.toMatch(/ERREUR/);
    expect(retirerMarqueursAffichage('Bravo !\n[CORRECTION_TERMINEE]')).not.toMatch(/CORRECTION/);
  });

  test('le choix d’un AUTRE contrôle ne compte pas', () => {
    const autre = [...COMPLETE, ERREUR(1), ELEVE(marquerStyleCorrection(STYLE_AIDE, 7))];
    expect(etatCopieControle(autre, { '0:42': false }).style).toBeNull();
  });

  test('une nouvelle demande de copie repose la question', () => {
    const avant = [...COMPLETE, ELEVE(marquerStyleCorrection(STYLE_AIDE, 42)), DEMANDE];
    // La copie d'avant était COMPLÈTE (même feuille, copie reçue) : la nouvelle
    // demande repart de zéro. Une copie incomplète, elle, continuerait.
    expect(etatCopieControle(avant, { '0:42': false }).style).toBeNull();
  });
});

describe('la file de la copie — Camara, le 26/09/2026', () => {
  // Relevé en séance : l'énoncé reçu, le professeur réclamait la copie en
  // réécrivant [COPIE_CONTROLE], et la question « séparés ? » revenait,
  // l'énoncé oublié. Désormais l'énoncé et la copie partent ENSEMBLE.

  test('l’énoncé et la copie dans UN message : les deux comptent, dans l’ordre', () => {
    const ensemble = marquerPiecesControle('', ['enonce', 'copie'], 42);

    expect(lirePiecesControle(ensemble)).toEqual([
      { controleId: 42, role: 'enonce' },
      { controleId: 42, role: 'copie' },
    ]);
    expect(retirerMarqueurCopieControle(ensemble)).toBe('Voici l’énoncé et ma copie.');

    const etat = etatCopieControle(
      [DEMANDE, { role: 'user', contenu: ensemble, piecesJointes: [{ id: 1 }, { id: 2 }] }],
      { '0:42': true },
    );
    expect(etat.complet).toBe(true);
  });

  test('un marqueur sans SON document ne compte pas', () => {
    const ensemble = marquerPiecesControle('', ['enonce', 'copie'], 42);
    const etat = etatCopieControle(
      [DEMANDE, { role: 'user', contenu: ensemble, piecesJointes: [{ id: 1 }] }],
      { '0:42': true },
    );

    expect(etat.enonceRecu).toBe(true);
    expect(etat.copieRecue).toBe(false);
    expect(etat.complet).toBe(false);
  });

  test('UNE DEMANDE RÉPÉTÉE PENDANT L’ATTENTE NE REPOSE PAS LA QUESTION — le cas de la séance', () => {
    const seance = [
      DEMANDE,
      ELEVE(marquerPieceControle('', 'enonce', 42), PIECE),
      PROF('J’ai bien l’énoncé, il me manque ta copie.\n[COPIE_CONTROLE]\ncontrole: 42\n[/COPIE_CONTROLE]'),
    ];

    const etat = etatCopieControle(seance, { '0:42': true });

    // Même demande qu'avant : même clé, la réponse « séparés » est gardée…
    expect(etat.cle).toBe('0:42');
    expect(etat.separee).toBe(true);
    // … et l'énoncé déjà reçu reste reçu.
    expect(etat.enonceRecu).toBe(true);
    expect(boutonsCopie(etat).map((b) => b.cle)).toEqual(['importer-copie', 'scanner-copie']);
  });

  test('une demande d’un AUTRE contrôle, elle, en ouvre bien une nouvelle', () => {
    const seance = [
      DEMANDE,
      ELEVE(marquerPieceControle('', 'enonce', 42), PIECE),
      PROF('[COPIE_CONTROLE] controle: 7 [/COPIE_CONTROLE]'),
    ];

    const etat = etatCopieControle(seance, { '0:42': true });
    expect(etat.controleId).toBe(7);
    expect(etat.separee).toBeNull();
  });
});
