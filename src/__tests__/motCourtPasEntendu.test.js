/**
 * UN MOT TROP COURT POUR LE MICRO — retest d'Adam, #57 (21/11/2026) : « un » dit seul au micro,
 * transcription vide, et Marine ne répondait rien. Quand la dernière phrase du professeur attend un
 * mot dit à voix haute, un son sans texte reçoit « Je n'ai pas bien entendu. Tu peux le redire ? »
 * (Chat.js, `onSonSansTexte`). Ailleurs, un son sans texte reste un bruit qu'on ignore.
 */
import {
  demandeUnMotDit, demandeSonTenu, MOT_COURT_MIN_S, SON_TENU_MIN_S, PAS_BIEN_ENTENDU,
} from '../lib/storage/tourEleve';
import { decouper } from '../lib/storage/ardoise';

// Ce que l'écran garde de la dernière demande du professeur (Chat.js, `demandeProfRef`).
const demande = (contenu) => decouper(contenu).map((s) => s.contenu).join(' ');

describe('le professeur attend un mot dit à voix haute', () => {
  test.each([
    ['écoute des mots (format du code)', 'Voici le prochain mot.\n\n[EN]One[/EN]\n\nQu’as-tu entendu ?'],
    ['après un refus', 'Ça, c’est le mot en français !\n\nJe te le redis.\n\n[EN]One[/EN]\n\nQu\'as-tu entendu ?'],
    ['syllabes en français', 'Voici la prochaine syllabe.\n\n[FR]ba[/FR]\n\nQu\'as-tu entendu ?'],
    ['répétition', 'Écoute : [EN]One[/EN], ça veut dire un. Tu répètes ?'],
    ['« Tu me le répètes ? »', 'Écoute bien : [EN]Cat[/EN]. Tu me le répètes ?'],
    ['« Répète après moi ! »', 'On dit [EN]Two[/EN]. Répète après moi !'],
    ['« Tu peux le redire ? »', 'Presque ! Tu peux le redire ?'],
    ['« Qu’est-ce que tu as entendu ? »', '[EN]Dog[/EN] Qu’est-ce que tu as entendu ?'],
  ])('%s', (_nom, contenu) => {
    expect(demandeUnMotDit(demande(contenu))).toBe(true);
  });

  test.each([
    ['un calcul', 'Combien font 2 + 3 ?'],
    ['le choix du support', 'Tu préfères écrire sur ton cahier, ou au clavier ? [SUPPORT_SON]'],
    ['un son tenu (autre filet)', 'Fais le son du serpent : sss !'],
    ['une explication', 'Tu peux m’expliquer pourquoi le chat dort ?'],
    ['une question plus haut, puis une consigne', 'Qu’as-tu entendu ? Bravo ! Maintenant, ouvre ton cahier.'],
    ['rien', ''],
  ])('%s : non', (_nom, contenu) => {
    expect(demandeUnMotDit(demande(contenu))).toBe(false);
  });

  test('« un » dit seul passe le seuil, un son tenu garde son propre filet', () => {
    // 0,6 s de traîne + un mot d'une syllabe : au-dessus du seuil du mot, en dessous de celui du son tenu.
    expect(MOT_COURT_MIN_S).toBeLessThan(SON_TENU_MIN_S);
    expect(MOT_COURT_MIN_S).toBeGreaterThan(0.6);
    expect(demandeSonTenu(demande('Voici le prochain mot.\n\n[EN]One[/EN]\n\nQu\'as-tu entendu ?'))).toBe(false);
  });

  test('la phrase dite est une phrase de professeur, sans jargon technique', () => {
    expect(PAS_BIEN_ENTENDU).toMatch(/^Je n.ai pas bien entendu\. Tu peux le redire \?$/);
    expect(PAS_BIEN_ENTENDU).not.toMatch(/micro|transcri/i);
  });
});
